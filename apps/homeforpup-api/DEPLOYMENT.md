# Deployment Guide

## Quick Start

### Development Deployment

```bash
cd apps/homeforpup-api

# Install dependencies
npm install

# Configure environment
cp .env.example .env.development
# Edit .env.development with your values

# Bootstrap CDK (first time only)
cdk bootstrap aws://ACCOUNT-ID/us-east-1

# Deploy
npm run deploy -- --context environment=development
```

### Production Deployment

```bash
# Configure production environment
cp .env.example .env.production
# Edit .env.production with production values

# Review changes
npm run diff -- --context environment=production

# Deploy to production
npm run deploy -- --context environment=production
```

## Prerequisites

### AWS Account Setup

1. **IAM Permissions**
   - AdministratorAccess (or equivalent CDK permissions)
   - Permissions to create: Lambda, API Gateway, IAM roles, CloudWatch

2. **AWS CLI**
   ```bash
   # Install AWS CLI
   brew install awscli  # macOS
   
   # Configure credentials
   aws configure
   ```

3. **AWS CDK CLI**
   ```bash
   npm install -g aws-cdk
   cdk --version
   ```

### Required Resources (Must Exist)

Before deploying, ensure these resources exist:

- ✅ Cognito User Pool
- ✅ DynamoDB Tables
- ✅ S3 Buckets
- ✅ ACM Certificate (for custom domain, optional)

## Environment Configuration

### Development Environment

```bash
# .env.development
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_USER_POOL_ARN=arn:aws:cognito-idp:us-east-1:ACCOUNT_ID:userpool/us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=your-client-id

# DynamoDB Tables
DYNAMODB_PROFILES_TABLE=homeforpup-profiles-dev
DYNAMODB_DOGS_TABLE=homeforpup-dogs-dev
DYNAMODB_KENNELS_TABLE=homeforpup-kennels-dev
DYNAMODB_MESSAGES_TABLE=homeforpup-messages-dev
DYNAMODB_FAVORITES_TABLE=homeforpup-favorites-dev
DYNAMODB_ACTIVITIES_TABLE=homeforpup-activities-dev
DYNAMODB_BREEDS_TABLE=homeforpup-breeds-dev

# S3 Buckets
S3_UPLOAD_BUCKET=homeforpup-uploads-dev
S3_IMAGE_BUCKET=homeforpup-images-dev
```

### Production Environment

```bash
# .env.production
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_PROD_ID
COGNITO_USER_POOL_ARN=arn:aws:cognito-idp:us-east-1:ACCOUNT_ID:userpool/us-east-1_PROD_ID
COGNITO_CLIENT_ID=prod-client-id

# Production tables
DYNAMODB_PROFILES_TABLE=homeforpup-profiles-prod
DYNAMODB_DOGS_TABLE=homeforpup-dogs-prod
# ... etc

# Custom domain
API_DOMAIN_NAME=api.homeforpup.com
ACM_CERTIFICATE_ARN=arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID
```

## Deployment Commands

### Synth (Generate CloudFormation)

```bash
# Development
npm run synth -- --context environment=development

# Production
npm run synth -- --context environment=production
```

Output is in `cdk.out/` directory.

### Diff (Show Changes)

```bash
# Development
npm run diff -- --context environment=development

# Production
npm run diff -- --context environment=production
```

### Deploy

```bash
# Development
npm run deploy -- --context environment=development

# Production (requires approval for IAM changes)
npm run deploy -- --context environment=production --require-approval any-change
```

### Destroy

```bash
# ⚠️ CAUTION: This deletes all resources
npm run destroy -- --context environment=development
```

## Deployment Process

### 1. Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Code reviewed and tested locally
- [ ] Database migrations applied (if any)
- [ ] Dependencies updated
- [ ] No linting errors

### 2. Build and Test

```bash
# Build TypeScript
npm run build

# Run tests
npm test

# Type check
tsc --noEmit
```

### 3. Synth and Review

```bash
npm run synth -- --context environment=production
```

Review the generated CloudFormation in `cdk.out/`.

### 4. Diff Against Live

```bash
npm run diff -- --context environment=production
```

Carefully review all changes.

### 5. Deploy

```bash
npm run deploy -- --context environment=production
```

Monitor the deployment progress.

### 6. Verify Deployment

```bash
# Get API URL
aws cloudformation describe-stacks \
  --stack-name homeforpup-api-production \
  --query 'Stacks[0].Outputs'

# Test endpoint
curl https://API_URL/production/dogs?limit=5
```

### 7. Monitor

```bash
# Watch Lambda logs
aws logs tail /aws/lambda/list-dogs-production --follow

# Check for errors
aws logs filter-pattern \
  --log-group-name /aws/lambda/list-dogs-production \
  --filter-pattern "ERROR"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/deploy-api.yml
name: Deploy API

on:
  push:
    branches:
      - main
    paths:
      - 'apps/homeforpup-api/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd apps/homeforpup-api
          npm install
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to production
        run: |
          cd apps/homeforpup-api
          npm run deploy -- --context environment=production --require-approval never
```

## Monitoring & Debugging

### CloudWatch Logs

```bash
# Tail logs
aws logs tail /aws/lambda/FUNCTION_NAME --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/FUNCTION_NAME \
  --filter-pattern "ERROR" \
  --start-time $(date -u -d '1 hour ago' +%s)000
```

### CloudWatch Metrics

```bash
# Lambda errors
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value=list-dogs-production \
  --start-time $(date -u -d '1 hour ago' --iso-8601) \
  --end-time $(date -u --iso-8601) \
  --period 300 \
  --statistics Sum
```

### X-Ray Tracing

Enable X-Ray in production for distributed tracing:

```typescript
// In environments.ts
features: {
  xrayTracing: true,
}
```

View traces in AWS X-Ray console.

## Rollback

### Option 1: Redeploy Previous Version

```bash
# Checkout previous version
git checkout <previous-commit>

# Deploy
cd apps/homeforpup-api
npm run deploy -- --context environment=production
```

### Option 2: Use CloudFormation Rollback

```bash
# Rollback stack
aws cloudformation rollback-stack \
  --stack-name homeforpup-api-production
```

### Option 3: Manual Rollback

1. Identify the issue in CloudWatch Logs
2. Fix the code
3. Deploy hotfix immediately

## Troubleshooting

### Issue: CDK Bootstrap Required

```
Error: This stack uses assets, so the toolkit stack must be deployed to the environment
```

**Solution:**
```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
```

### Issue: Insufficient Permissions

```
Error: User: arn:aws:iam::ACCOUNT:user/USER is not authorized to perform: iam:CreateRole
```

**Solution:** Ensure IAM user has required permissions.

### Issue: Lambda Deployment Package Too Large

```
Error: Unzipped size must be smaller than 262144000 bytes
```

**Solution:**
- Use Lambda Layers for dependencies
- Exclude unnecessary files
- Optimize node_modules

### Issue: API Gateway Timeout

```
Error: Endpoint request timed out
```

**Solution:** Increase Lambda timeout:
```typescript
timeout: cdk.Duration.seconds(60)
```

## Performance Optimization

### Lambda Cold Starts

```typescript
// Add provisioned concurrency for critical functions
const alias = lambdaFunction.addAlias('live', {
  provisionedConcurrentExecutions: 5,
});
```

### API Gateway Caching

```typescript
// Enable caching for read endpoints
deployOptions: {
  cacheClusterEnabled: true,
  cacheClusterSize: '0.5',
  cacheTtl: cdk.Duration.minutes(5),
}
```

### DynamoDB Optimization

- Use indexes for common queries
- Enable point-in-time recovery for production
- Set up auto-scaling

## Security Best Practices

1. **Secrets Management**
   - Use AWS Secrets Manager for sensitive data
   - Never commit credentials to git
   - Rotate secrets regularly

2. **IAM Least Privilege**
   - Grant only necessary permissions
   - Use separate roles per Lambda
   - Review policies regularly

3. **API Security**
   - Always use HTTPS
   - Enable AWS WAF for production
   - Implement rate limiting
   - Validate all inputs

4. **Monitoring**
   - Set up CloudWatch Alarms
   - Enable CloudTrail logging
   - Review security findings regularly

## Cost Management

### Monitor Costs

```bash
# Get cost and usage
aws ce get-cost-and-usage \
  --time-period Start=2023-01-01,End=2023-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --filter file://filter.json
```

### Set Budget Alerts

Create CloudWatch billing alarms:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name api-cost-alert \
  --alarm-description "Alert when API costs exceed $100" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold
```

## Support & Resources

- AWS CDK Documentation: https://docs.aws.amazon.com/cdk/
- Lambda Documentation: https://docs.aws.amazon.com/lambda/
- API Gateway Documentation: https://docs.aws.amazon.com/apigateway/
- HomeForPup Internal Wiki: [Link to your wiki]

