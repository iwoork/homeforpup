# Custom Domain Setup Guide

Set up `api.homeforpup.com` (or any custom domain) for your API Gateway.

## Prerequisites

- ✅ Domain registered (homeforpup.com)
- ✅ Route53 hosted zone OR access to DNS provider
- ⏳ ACM Certificate in us-east-1

## Step 1: Create/Verify ACM Certificate

### Option A: Check if you have one

```bash
# List certificates in us-east-1 (required region for API Gateway)
aws acm list-certificates --region us-east-1
```

### Option B: Create new certificate

**Via AWS Console:**

1. Go to [AWS Certificate Manager](https://console.aws.amazon.com/acm/home?region=us-east-1)
2. Click **Request certificate**
3. Choose **Request a public certificate**
4. Enter domain names:
   - `api.homeforpup.com`
   - Or use wildcard: `*.homeforpup.com`
5. Choose **DNS validation** (recommended)
6. Click **Request**
7. Click **View certificate** → **Create records in Route53** (if using Route53)
8. Wait for validation (~5-30 minutes)

**Via AWS CLI:**

```bash
# Request certificate
CERT_ARN=$(aws acm request-certificate \
  --domain-name api.homeforpup.com \
  --validation-method DNS \
  --region us-east-1 \
  --query 'CertificateArn' \
  --output text)

echo "Certificate ARN: $CERT_ARN"

# Get DNS validation record
aws acm describe-certificate \
  --certificate-arn $CERT_ARN \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[0].ResourceRecord'
```

### Option C: Use existing wildcard certificate

If you have `*.homeforpup.com`, it covers `api.homeforpup.com`:

```bash
# Find it
aws acm list-certificates --region us-east-1 \
  --query 'CertificateSummaryList[?DomainName==`*.homeforpup.com`]'
```

## Step 2: Update CDK Configuration

Add the custom domain configuration to your stack:

<function_calls>
<invoke name="search_replace">
<parameter name="file_path">/Users/Efren/repos/homeforpup/apps/homeforpup-api/lib/stacks/api-stack.ts

Copy validation record to your DNS:
- Name: _xxx.api.homeforpup.com
- Type: CNAME
- Value: _xxx.acm-validations.aws

Wait for validation to complete:
```bash
aws acm describe-certificate \
  --certificate-arn $CERT_ARN \
  --region us-east-1 \
  --query 'Certificate.Status'
```

When it shows `"ISSUED"`, you're ready!

## Step 2: Update Environment Configuration

```bash
cd apps/homeforpup-api

# Edit .env file
vim .env
```

Add these lines:
```bash
API_DOMAIN_NAME=api.homeforpup.com
ACM_CERTIFICATE_ARN=arn:aws:acm:us-east-1:249730500554:certificate/YOUR-CERT-ID
```

**Or for production:**
```bash
# .env.production
API_DOMAIN_NAME=api.homeforpup.com
ACM_CERTIFICATE_ARN=arn:aws:acm:us-east-1:249730500554:certificate/YOUR-CERT-ID
```

## Step 3: Deploy with Custom Domain

```bash
# Redeploy
npm run deploy

# Or for production
npm run deploy -- --context environment=production
```

After deployment, you'll see new outputs:
```
Outputs:
HomeForPupApiStack-development.CustomDomainName = api.homeforpup.com
HomeForPupApiStack-development.CustomDomainTarget = d-abc123xyz.execute-api.us-east-1.amazonaws.com
```

**Save the `CustomDomainTarget` value - you'll need it for DNS!**

## Step 4: Configure DNS

### Option A: Using Route53 (Recommended)

**Via AWS Console:**
1. Go to [Route53](https://console.aws.amazon.com/route53/)
2. Click on your hosted zone: `homeforpup.com`
3. Click **Create record**
4. Record details:
   - **Record name:** `api`
   - **Record type:** `A - IPv4 address`
   - **Alias:** Yes
   - **Route traffic to:** 
     - Choose: "Alias to API Gateway API"
     - Region: us-east-1
     - API: Select your API from dropdown
   - Or use the target domain from Step 3
5. Click **Create records**

**Via AWS CLI:**
```bash
# Get your hosted zone ID
ZONE_ID=$(aws route53 list-hosted-zones-by-name \
  --dns-name homeforpup.com \
  --query 'HostedZones[0].Id' \
  --output text)

# Get the custom domain target from your deployment
TARGET=$(aws cloudformation describe-stacks \
  --stack-name homeforpup-api-development \
  --query 'Stacks[0].Outputs[?OutputKey==`CustomDomainTarget`].OutputValue' \
  --output text)

# Create A record
aws route53 change-resource-record-sets \
  --hosted-zone-id $ZONE_ID \
  --change-batch file://route53-change.json
```

Create `route53-change.json`:
```json
{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "api.homeforpup.com",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "Z1UJRXOUMOOFQ8",
        "DNSName": "d-abc123xyz.execute-api.us-east-1.amazonaws.com",
        "EvaluateTargetHealth": false
      }
    }
  }]
}
```

### Option B: Using Other DNS Providers (Cloudflare, Namecheap, etc.)

Create a **CNAME record:**
- **Name:** `api` (or `api.homeforpup.com`)
- **Type:** `CNAME`
- **Value:** `d-abc123xyz.execute-api.us-east-1.amazonaws.com` (from deployment output)
- **TTL:** 300 (or default)

## Step 5: Verify Custom Domain

### Wait for DNS propagation (5-30 minutes)

```bash
# Check DNS propagation
dig api.homeforpup.com

# Or
nslookup api.homeforpup.com
```

### Test your custom domain

```bash
# Should work!
curl "https://api.homeforpup.com/development/breeds?limit=3"
```

## Step 6: Update Frontend Configuration

```bash
# Development
# apps/dog-parent-app/.env.local
NEXT_PUBLIC_API_URL=https://api.homeforpup.com/development

# Production (when ready)
NEXT_PUBLIC_API_URL=https://api.homeforpup.com/production
```

## Complete Example

Let me create a complete example for you:

```bash
# 1. Request certificate
aws acm request-certificate \
  --domain-name api.homeforpup.com \
  --validation-method DNS \
  --region us-east-1

# Note the CertificateArn from output

# 2. Validate certificate (via Route53 or DNS provider)
# See ACM console for validation record

# 3. Wait for certificate to be issued
aws acm wait certificate-validated \
  --certificate-arn arn:aws:acm:us-east-1:249730500554:certificate/YOUR-CERT-ID \
  --region us-east-1

# 4. Update .env file
echo "API_DOMAIN_NAME=api.homeforpup.com" >> .env
echo "ACM_CERTIFICATE_ARN=arn:aws:acm:us-east-1:249730500554:certificate/YOUR-CERT-ID" >> .env

# 5. Deploy
npm run deploy

# 6. Get the target domain from output
# Example: d-abc123xyz.execute-api.us-east-1.amazonaws.com

# 7. Create Route53 A record pointing to that target

# 8. Wait for DNS propagation
# 9. Test!
curl "https://api.homeforpup.com/development/breeds"
```

## Troubleshooting

### Issue: Certificate not found

**Error:** `Certificate arn:aws:acm:... not found`

**Fix:** Ensure certificate is in **us-east-1** region (API Gateway requirement)

```bash
# Check certificate region
aws acm describe-certificate \
  --certificate-arn YOUR_ARN \
  --region us-east-1
```

### Issue: DNS not resolving

**Error:** `Could not resolve host: api.homeforpup.com`

**Fix:** Wait for DNS propagation (can take 5-30 minutes)

```bash
# Check DNS status
dig api.homeforpup.com +short

# Or use online tool
# https://dnschecker.org
```

### Issue: SSL certificate error

**Error:** `SSL certificate problem`

**Fix:** Ensure:
1. Certificate covers your domain
2. Certificate status is "ISSUED"
3. DNS points to correct target

### Issue: 403 Forbidden on custom domain

**Error:** HTTP 403 when accessing custom domain

**Fix:** Ensure BasePathMapping is created:
```bash
aws apigateway get-base-path-mappings \
  --domain-name api.homeforpup.com
```

## Alternative: Use API Gateway's Regional Endpoint

Instead of custom domain, you can use API Gateway's built-in URL with better naming:

**Current:**
```
https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development/
```

**With Custom Domain:**
```
https://api.homeforpup.com/development/
```

Or remove the stage from the path:
```
https://api.homeforpup.com/
```

## Cost

- **ACM Certificate:** FREE ✅
- **Custom Domain Name:** $0.025 per month ($0.30/year)
- **DNS Queries (Route53):** $0.50 per million queries

**Total added cost: ~$1/month**

## Security Benefits

- ✅ Branded domain (api.homeforpup.com)
- ✅ SSL/TLS certificate (HTTPS)
- ✅ Professional appearance
- ✅ Easier to remember
- ✅ Can change backend without breaking clients

## Quick Command Reference

```bash
# List certificates
aws acm list-certificates --region us-east-1

# Describe certificate
aws acm describe-certificate --certificate-arn YOUR_ARN --region us-east-1

# Check DNS
dig api.homeforpup.com

# Test custom domain
curl "https://api.homeforpup.com/development/breeds"

# View stack outputs
aws cloudformation describe-stacks \
  --stack-name homeforpup-api-development \
  --query 'Stacks[0].Outputs'
```

## Summary

**Time to set up:** 30-60 minutes (mostly waiting for certificate validation)  
**Cost:** ~$1/month  
**Benefit:** Professional branded API URL  
**Required:** ACM certificate + DNS access  

Your API will be accessible at:
```
https://api.homeforpup.com/development/breeds
https://api.homeforpup.com/production/dogs
```

Much better than:
```
https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development/breeds
```

Ready to set it up? Start with Step 1! 🚀
