# Setup SSL Certificate for img.homeforpup.com

## Step 1: Create SSL Certificate in AWS Certificate Manager

**IMPORTANT**: This MUST be done in the `us-east-1` region for CloudFront compatibility.

### Via AWS Console:
1. Go to AWS Certificate Manager (ACM) in `us-east-1` region
2. Click "Request a certificate"
3. Choose "Request a public certificate"
4. Add domain names:
   - `*.homeforpup.com` (wildcard certificate)
   - `homeforpup.com` (root domain)
5. Choose "DNS validation"
6. Click "Request"

### Via AWS CLI:
```bash
aws acm request-certificate \
  --domain-name "*.homeforpup.com" \
  --subject-alternative-names "homeforpup.com" \
  --validation-method DNS \
  --region us-east-1
```

## Step 2: Validate the Certificate

1. In ACM console, click on the certificate
2. Click "Create records in Route 53" (if using Route 53)
3. Or manually add the CNAME validation records to your DNS provider
4. Wait for validation (5-30 minutes)

## Step 3: Note the Certificate ARN

Once validated, copy the certificate ARN - you'll need it for CloudFront setup.
Format: `arn:aws:acm:us-east-1:ACCOUNT-ID:certificate/CERTIFICATE-ID`

## Next Steps

After SSL certificate is ready, proceed to CloudFront distribution setup.
