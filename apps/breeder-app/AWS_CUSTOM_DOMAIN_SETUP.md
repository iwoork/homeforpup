# AWS Custom Domain Setup for img.homeforpup.com

This guide walks you through setting up a custom domain for your S3 bucket using CloudFront.

## Prerequisites

- AWS Account with appropriate permissions
- Domain name (homeforpup.com) with DNS access
- S3 bucket already created (`homeforpup-photos`)

## Step 1: Create SSL Certificate

1. **Go to AWS Certificate Manager (ACM)**:
   - Navigate to AWS Certificate Manager in your AWS Console
   - Make sure you're in the `us-east-1` region (required for CloudFront)

2. **Request Certificate**:
   - Click "Request a certificate"
   - Choose "Request a public certificate"
   - Domain name: `*.homeforpup.com` (wildcard certificate)
   - Validation method: DNS validation
   - Click "Request"

3. **Validate Certificate**:
   - Click on the certificate in the list
   - Go to "Domains" tab
   - Click "Create record in Route 53" (if using Route 53) or manually add CNAME record
   - Wait for validation (usually 5-10 minutes)

## Step 2: Create CloudFront Distribution

1. **Go to CloudFront Console**:
   - Navigate to AWS CloudFront in your AWS Console
   - Click "Create Distribution"

2. **Configure Origin**:
   - **Origin Domain**: Select your S3 bucket (`homeforpup-photos.s3.us-east-1.amazonaws.com`)
   - **Origin Access Control**: Create new OAC
     - Name: `homeforpup-photos-oac`
     - Description: `OAC for homeforpup-photos S3 bucket`
     - Signing behavior: `Sign requests (recommended)`
     - Origin type: `S3`
   - **Origin Path**: Leave empty
   - **Origin ID**: `homeforpup-photos`

3. **Configure Default Cache Behavior**:
   - **Viewer Protocol Policy**: `Redirect HTTP to HTTPS`
   - **Allowed HTTP Methods**: `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`
   - **Cache Policy**: `CachingOptimized`
   - **Origin Request Policy**: `CORS-S3Origin`
   - **Response Headers Policy**: `CORS-with-preflight-and-SecurityHeaders`

4. **Configure Distribution Settings**:
   - **Alternate Domain Names (CNAMEs)**: `img.homeforpup.com`
   - **SSL Certificate**: Select the certificate created in Step 1
   - **Default Root Object**: Leave empty
   - **Logging**: Optional (enable for debugging)
   - **Price Class**: Choose based on your needs

5. **Create Distribution**:
   - Click "Create Distribution"
   - Note the Distribution Domain Name (e.g., `d1234567890.cloudfront.net`)

## Step 3: Update S3 Bucket Policy

1. **Go to S3 Console**:
   - Navigate to your S3 bucket (`homeforpup-photos`)
   - Go to "Permissions" tab
   - Click "Bucket Policy"

2. **Add Policy**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "AllowCloudFrontServicePrincipal",
         "Effect": "Allow",
         "Principal": {
           "Service": "cloudfront.amazonaws.com"
         },
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::homeforpup-photos/*",
         "Condition": {
           "StringEquals": {
             "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
           }
         }
       }
     ]
   }
   ```
   - Replace `YOUR_ACCOUNT_ID` and `YOUR_DISTRIBUTION_ID` with actual values

3. **Update CORS Configuration**:
   - Go to "Permissions" tab
   - Scroll to "Cross-origin resource sharing (CORS)"
   - Click "Edit" and add:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "AllowedOrigins": [
         "https://img.homeforpup.com",
         "https://homeforpup.com",
         "http://localhost:3000",
         "http://localhost:3001"
       ],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

## Step 4: Configure DNS

### Option A: Using Route 53

1. **Go to Route 53 Console**:
   - Navigate to Route 53 in your AWS Console
   - Go to "Hosted zones"
   - Select your domain (`homeforpup.com`)

2. **Create CNAME Record**:
   - Click "Create record"
   - **Record name**: `img`
   - **Record type**: `CNAME`
   - **Value**: `your-cloudfront-domain.cloudfront.net`
   - **TTL**: 300
   - Click "Create records"

### Option B: Using External DNS Provider

1. **Log into your DNS provider** (Cloudflare, GoDaddy, etc.)
2. **Create CNAME Record**:
   - **Name**: `img`
   - **Value**: `your-cloudfront-domain.cloudfront.net`
   - **TTL**: 300 (5 minutes)

## Step 5: Update Application Configuration

1. **Update Environment Variables**:
   Add to your `.env.local` file:
   ```bash
   NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN=img.homeforpup.com
   ```

2. **Test the Configuration**:
   - Wait for DNS propagation (5-30 minutes)
   - Test: `https://img.homeforpup.com/your-image-key`
   - Check that images load correctly

## Step 6: Verify Setup

1. **Test Custom Domain**:
   ```bash
   curl -I https://img.homeforpup.com/test-image.jpg
   ```
   Should return 200 OK or 404 (if image doesn't exist)

2. **Check SSL Certificate**:
   - Visit `https://img.homeforpup.com` in browser
   - Verify SSL certificate is valid

3. **Test from Application**:
   - Upload a photo through your application
   - Verify the URL uses the custom domain

## Troubleshooting

### Common Issues

1. **SSL Certificate Not Working**:
   - Ensure certificate is in `us-east-1` region
   - Check that domain validation is complete
   - Verify CNAME record is correct

2. **DNS Not Resolving**:
   - Wait for DNS propagation (up to 48 hours)
   - Check CNAME record is correct
   - Use `nslookup img.homeforpup.com` to test

3. **CloudFront Not Serving Content**:
   - Check S3 bucket policy allows CloudFront
   - Verify Origin Access Control is configured
   - Check CloudFront distribution status

4. **CORS Issues**:
   - Update S3 CORS configuration
   - Check CloudFront response headers policy
   - Verify allowed origins include your domain

### Useful Commands

```bash
# Test DNS resolution
nslookup img.homeforpup.com

# Test SSL certificate
openssl s_client -connect img.homeforpup.com:443 -servername img.homeforpup.com

# Test CloudFront distribution
curl -I https://img.homeforpup.com/
```

## Cost Considerations

- **CloudFront**: Pay per request and data transfer
- **S3**: Pay for storage and requests
- **ACM**: Free for AWS services
- **Route 53**: Pay per hosted zone and queries

## Security Best Practices

1. **Use Origin Access Control (OAC)** instead of OAI
2. **Restrict S3 bucket access** to CloudFront only
3. **Use HTTPS only** for all requests
4. **Implement proper CORS** configuration
5. **Monitor CloudFront logs** for suspicious activity

## Next Steps

After setup is complete:
1. Update your application to use the custom domain
2. Test photo uploads and displays
3. Monitor CloudFront metrics and logs
4. Consider implementing image optimization
5. Set up CloudFront caching rules for better performance
