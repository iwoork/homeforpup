# Complete Setup Guide: img.homeforpup.com

This guide will help you set up `img.homeforpup.com` to serve images from AWS S3 through CloudFront.

## Prerequisites

- AWS Account with appropriate permissions
- Domain `homeforpup.com` with DNS management access
- S3 bucket `homeforpup-images` (or as configured in your environment)

## Option 1: Automated Setup (Recommended)

### Step 1: Install Dependencies
```bash
npm install @aws-sdk/client-cloudfront @aws-sdk/client-s3 @aws-sdk/client-acm
```

### Step 2: Configure Environment
Ensure your `.env.local` file has:
```bash
NEXT_PUBLIC_AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
NEXT_PUBLIC_AWS_S3_BUCKET=homeforpup-images
NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN=img.homeforpup.com
```

### Step 3: Create SSL Certificate
**IMPORTANT**: Must be done in `us-east-1` region for CloudFront.

#### Via AWS Console:
1. Go to AWS Certificate Manager (ACM) in `us-east-1`
2. Request certificate for `*.homeforpup.com`
3. Use DNS validation
4. Add validation records to your DNS

#### Via AWS CLI:
```bash
aws acm request-certificate \
  --domain-name "*.homeforpup.com" \
  --subject-alternative-names "homeforpup.com" \
  --validation-method DNS \
  --region us-east-1
```

### Step 4: Run Automated Setup
```bash
node scripts/setup-img-domain.js
```

This script will:
- Find your SSL certificate
- Create Origin Access Control (OAC)
- Create CloudFront distribution
- Update S3 bucket policy
- Provide DNS configuration instructions

## Option 2: Manual Setup

### Step 1: Create SSL Certificate
Follow Step 3 from Option 1 above.

### Step 2: Create CloudFront Distribution

1. **Go to CloudFront Console**
2. **Click "Create Distribution"**
3. **Configure Origin**:
   - Origin Domain: `homeforpup-images.s3.us-east-1.amazonaws.com`
   - Origin Path: (leave empty)
   - Origin Access Control: Create new OAC
     - Name: `homeforpup-images-oac`
     - Signing behavior: `Sign requests`
     - Origin type: `S3`

4. **Configure Default Cache Behavior**:
   - Viewer Protocol Policy: `Redirect HTTP to HTTPS`
   - Allowed HTTP Methods: `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`
   - Cache Policy: `CachingOptimized`
   - Origin Request Policy: `CORS-S3Origin`

5. **Configure Distribution Settings**:
   - Alternate Domain Names (CNAMEs): `img.homeforpup.com`
   - SSL Certificate: Select your `*.homeforpup.com` certificate
   - Default Root Object: (leave empty)

6. **Create Distribution**

### Step 3: Update S3 Bucket Policy

Replace `YOUR_ACCOUNT_ID` and `YOUR_DISTRIBUTION_ID` with actual values:

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
      "Resource": "arn:aws:s3:::homeforpup-images/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

### Step 4: Configure CORS (if needed)

In S3 bucket permissions, add CORS configuration:

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

## Step 5: Configure DNS

### Option A: Route 53
1. Go to Route 53 Console
2. Select your hosted zone (`homeforpup.com`)
3. Create CNAME record:
   - Name: `img`
   - Type: `CNAME`
   - Value: `d1234567890.cloudfront.net` (your CloudFront domain)

### Option B: External DNS Provider
Create CNAME record:
- Name: `img`
- Value: Your CloudFront distribution domain name

## Step 6: Test the Setup

### Wait for Deployment
- CloudFront deployment: 15-20 minutes
- DNS propagation: 5 minutes to 48 hours

### Test Commands
```bash
# Test DNS resolution
nslookup img.homeforpup.com

# Test HTTPS access
curl -I https://img.homeforpup.com/

# Test with a real image (after uploading)
curl -I https://img.homeforpup.com/photos/test-image.jpg
```

### Test in Application
1. Upload an image through your app
2. Verify the returned URL uses `img.homeforpup.com`
3. Check that the image loads correctly

## Troubleshooting

### Common Issues

1. **SSL Certificate Not Found**
   - Ensure certificate is in `us-east-1` region
   - Wait for DNS validation to complete

2. **CloudFront Distribution Creation Fails**
   - Check AWS permissions
   - Verify S3 bucket exists
   - Ensure certificate is validated

3. **DNS Not Resolving**
   - Wait for DNS propagation
   - Check CNAME record is correct
   - Use `dig img.homeforpup.com` to debug

4. **403 Forbidden Errors**
   - Check S3 bucket policy
   - Verify Origin Access Control configuration
   - Ensure CloudFront has permission to access S3

5. **CORS Errors**
   - Update S3 CORS configuration
   - Check allowed origins include your domains

### Debug Commands
```bash
# Check DNS
dig img.homeforpup.com
nslookup img.homeforpup.com

# Check SSL
openssl s_client -connect img.homeforpup.com:443 -servername img.homeforpup.com

# Check CloudFront
curl -I https://img.homeforpup.com/
curl -v https://img.homeforpup.com/
```

## Verification Checklist

- [ ] SSL certificate created and validated in `us-east-1`
- [ ] CloudFront distribution created with custom domain
- [ ] Origin Access Control configured
- [ ] S3 bucket policy updated
- [ ] DNS CNAME record created
- [ ] CloudFront deployment completed
- [ ] DNS propagation completed
- [ ] Test image upload works
- [ ] Images load from `img.homeforpup.com`

## Cost Considerations

- **CloudFront**: ~$0.085/GB for first 10TB/month + requests
- **S3**: ~$0.023/GB/month storage + requests
- **ACM**: Free for AWS services
- **Route 53**: ~$0.50/month per hosted zone

## Security Notes

- S3 bucket is private (no public access)
- All access goes through CloudFront
- HTTPS enforced
- Origin Access Control prevents direct S3 access
- CORS configured for your domains only

## Next Steps

After successful setup:
1. Monitor CloudFront metrics
2. Set up CloudWatch alarms
3. Consider image optimization
4. Implement cache invalidation strategy
5. Set up logging for debugging
