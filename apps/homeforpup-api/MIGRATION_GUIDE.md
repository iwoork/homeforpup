# API Migration Guide

This guide walks you through migrating your Next.js API routes to AWS API Gateway with Lambda functions.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Phase 1: Infrastructure Setup](#phase-1-infrastructure-setup)
4. [Phase 2: Migrate Core APIs](#phase-2-migrate-core-apis)
5. [Phase 3: Frontend Integration](#phase-3-frontend-integration)
6. [Phase 4: Testing & Validation](#phase-4-testing--validation)
7. [Phase 5: Production Deployment](#phase-5-production-deployment)
8. [Rollback Plan](#rollback-plan)

## Prerequisites

### AWS Setup
- [ ] AWS account with administrative access
- [ ] AWS CLI installed and configured
- [ ] AWS CDK CLI installed globally (`npm install -g aws-cdk`)
- [ ] Existing Cognito User Pool ID and ARN
- [ ] Existing DynamoDB tables
- [ ] Existing S3 buckets

### Development Environment
- [ ] Node.js 18+ installed
- [ ] TypeScript knowledge
- [ ] Familiarity with Lambda and API Gateway

## Initial Setup

### 1. Install Dependencies

```bash
cd apps/homeforpup-api
npm install
```

### 2. Configure Environment

```bash
# Create environment file
cp .env.example .env.development

# Edit .env.development with your actual values
vim .env.development
```

Required environment variables:
- `AWS_REGION`: Your AWS region (e.g., us-east-1)
- `COGNITO_USER_POOL_ID`: From AWS Cognito console
- `COGNITO_USER_POOL_ARN`: From AWS Cognito console
- `COGNITO_CLIENT_ID`: Your app client ID
- `S3_UPLOAD_BUCKET`: Existing S3 bucket name
- All DynamoDB table names

### 3. Bootstrap CDK

First-time CDK setup in your AWS account:

```bash
npm run bootstrap
```

This creates the necessary CDK staging resources in your AWS account.

## Phase 1: Infrastructure Setup

### 1. Review Configuration

Check the environment configuration in `lib/config/environments.ts`:

```typescript
// Verify these match your actual resources
tables: {
  users: 'homeforpup-users-dev',
  dogs: 'homeforpup-dogs-dev',
  // ... etc
}
```

### 2. Synthesize Stack

Generate CloudFormation template to review what will be created:

```bash
npm run synth
```

Review the output in `cdk.out/` directory.

### 3. Deploy Infrastructure

Deploy to development:

```bash
npm run deploy -- --context environment=development
```

This creates:
- API Gateway REST API
- Cognito Authorizer
- Lambda functions for Dogs API
- Lambda functions for Users API
- Lambda functions for Breeds API
- IAM roles and policies
- CloudWatch Log Groups

### 4. Verify Deployment

```bash
# Get API Gateway URL
aws cloudformation describe-stacks \
  --stack-name homeforpup-api-development \
  --query 'Stacks[0].Outputs'
```

Save the API URL - you'll need it for testing.

## Phase 2: Migrate Core APIs

### Dogs API Migration

#### 1. Current Next.js Endpoint
```typescript
// apps/dog-parent-app/src/app/api/dogs/route.ts
export async function GET(request: NextRequest) {
  // ... logic
}
```

#### 2. New Lambda Handler
```typescript
// apps/homeforpup-api/src/functions/dogs/list/index.ts
export async function handler(event: APIGatewayProxyEvent) {
  // ... migrated logic
}
```

#### 3. Key Differences

| Next.js | Lambda |
|---------|--------|
| `request.json()` | `JSON.parse(event.body)` |
| `request.nextUrl.searchParams` | `event.queryStringParameters` |
| `NextResponse.json(data)` | `successResponse(data)` |
| `getServerSession()` | `getUserIdFromEvent(event)` |

#### 4. Testing

```bash
# Test GET /dogs
curl -X GET "https://YOUR_API_URL/development/dogs?limit=10"

# Test GET /dogs/{id}
curl -X GET "https://YOUR_API_URL/development/dogs/DOG_ID"

# Test POST /dogs (requires auth token)
curl -X POST "https://YOUR_API_URL/development/dogs" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Max","breed":"Golden Retriever","kennelId":"KENNEL_ID"}'
```

### Users API Migration

Similar process to Dogs API:

1. Copy logic from `apps/dog-parent-app/src/app/api/users/[id]/route.ts`
2. Adapt to Lambda handler format
3. Update authentication to use Cognito
4. Test endpoints

### Additional APIs to Migrate

For each API endpoint, follow this pattern:

1. **Create Lambda function directory**
   ```bash
   mkdir -p src/functions/{api-name}/{action}
   ```

2. **Create handler**
   ```typescript
   // src/functions/{api-name}/{action}/index.ts
   import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
   // ... your handler code
   ```

3. **Update CDK Stack**
   Add the Lambda function and API Gateway route in `lib/stacks/api-stack.ts`

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Test**
   Use curl or Postman to verify functionality

## Phase 3: Frontend Integration

### 1. Create API Client

Create a centralized API client in your frontend apps:

```typescript
// packages/shared-api/src/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const session = await getSession();
  const token = session?.accessToken;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}
```

### 2. Update Environment Variables

```bash
# apps/dog-parent-app/.env.local
NEXT_PUBLIC_API_URL=https://YOUR_API_URL/development

# apps/breeder-app/.env.local
NEXT_PUBLIC_API_URL=https://YOUR_API_URL/development
```

### 3. Update API Calls

**Before:**
```typescript
const response = await fetch('/api/dogs');
```

**After:**
```typescript
import { fetchWithAuth } from '@homeforpup/shared-api';
const data = await fetchWithAuth('/dogs');
```

### 4. Gradual Migration Strategy

Use feature flags to gradually switch endpoints:

```typescript
const USE_NEW_API = process.env.NEXT_PUBLIC_USE_NEW_API === 'true';

const apiUrl = USE_NEW_API 
  ? `${process.env.NEXT_PUBLIC_API_URL}/dogs`
  : '/api/dogs';
```

## Phase 4: Testing & Validation

### 1. Unit Tests

Create tests for Lambda functions:

```typescript
// src/functions/dogs/list/index.test.ts
import { handler } from './index';

describe('List Dogs Handler', () => {
  it('should return list of dogs', async () => {
    const event = {
      queryStringParameters: { limit: '10' },
    };
    
    const result = await handler(event as any);
    expect(result.statusCode).toBe(200);
  });
});
```

### 2. Integration Tests

Test full request flow:

```bash
# Test script
./test/integration/test-dogs-api.sh
```

### 3. Load Testing

Use tools like Artillery or k6:

```yaml
# artillery-config.yml
config:
  target: 'https://YOUR_API_URL'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'List Dogs'
    flow:
      - get:
          url: '/development/dogs'
```

### 4. Monitor CloudWatch

Watch for errors and performance issues:

```bash
# View Lambda logs
aws logs tail /aws/lambda/list-dogs-development --follow

# View API Gateway logs
aws logs tail API-Gateway-Execution-Logs_XXXXX/development --follow
```

## Phase 5: Production Deployment

### 1. Production Environment Setup

```bash
# Create production env file
cp .env.example .env.production

# Update with production values
vim .env.production
```

### 2. Deploy to Production

```bash
# Synthesize and review
npm run synth -- --context environment=production

# Show diff
npm run diff -- --context environment=production

# Deploy
npm run deploy -- --context environment=production
```

### 3. Custom Domain Setup

If using a custom domain (api.homeforpup.com):

```bash
# Ensure you have ACM certificate in us-east-1
aws acm list-certificates --region us-east-1

# Update environment config with certificate ARN
# Deploy again
npm run deploy -- --context environment=production
```

### 4. DNS Configuration

Update Route53 or your DNS provider:

```
api.homeforpup.com -> API Gateway custom domain
```

### 5. Update Frontend Production Environment

```bash
# Vercel environment variables
NEXT_PUBLIC_API_URL=https://api.homeforpup.com
```

## Rollback Plan

### If Issues Occur

#### Option 1: Route53 Failover
Keep old Next.js API routes and switch DNS back

#### Option 2: Environment Variable Toggle
```bash
# Disable new API in frontend
NEXT_PUBLIC_USE_NEW_API=false
```

#### Option 3: CDK Rollback
```bash
# Destroy the stack
cdk destroy homeforpup-api-production

# Or deploy previous version
git checkout <previous-commit>
npm run deploy
```

## API Migration Checklist

### Core APIs (Required)
- [x] Dogs API (list, get, create, update, delete)
- [x] Users API (get, update)
- [x] Breeds API (list)
- [ ] Kennels API
- [ ] Messages API
- [ ] Favorites API
- [ ] Activities API

### Specialized APIs
- [ ] Upload/S3 API
- [ ] Contact Forms
- [ ] Newsletter Subscriptions
- [ ] Litters API
- [ ] Training Records API
- [ ] Vet Visits API

### Auth & Security
- [ ] Cognito integration
- [ ] JWT validation
- [ ] Permission checks
- [ ] Rate limiting

### Monitoring
- [ ] CloudWatch dashboards
- [ ] Error alarms
- [ ] Performance metrics
- [ ] Cost alerts

### Documentation
- [ ] API documentation
- [ ] Deployment runbook
- [ ] Troubleshooting guide
- [ ] Team training

## Common Issues & Solutions

### Issue: Lambda Timeout

**Problem:** Function exceeds 30 second timeout

**Solution:**
```typescript
// In lambda-api.ts construct
timeout: cdk.Duration.seconds(60)
```

### Issue: CORS Errors

**Problem:** Browser blocking requests

**Solution:** Check CORS configuration in API Gateway:
```typescript
defaultCorsPreflightOptions: {
  allowOrigins: ['https://homeforpup.com'],
  allowMethods: apigateway.Cors.ALL_METHODS,
  allowCredentials: true,
}
```

### Issue: DynamoDB Access Denied

**Problem:** Lambda can't access DynamoDB

**Solution:** Grant permissions in CDK:
```typescript
lambdaFunction.grantDynamoDBAccess(['table-name']);
```

### Issue: Large Response Size

**Problem:** API Gateway 10MB limit

**Solution:** Use pagination or S3 presigned URLs for large data

## Cost Optimization

### Lambda
- Right-size memory allocation
- Reduce cold starts with provisioned concurrency (production only)
- Use Lambda layers for shared dependencies

### API Gateway
- Enable caching for read-heavy endpoints
- Use HTTP API instead of REST API (cheaper, but fewer features)

### DynamoDB
- Use on-demand billing for unpredictable workloads
- Configure TTL for temporary data
- Use DAX for caching (if needed)

## Next Steps

1. Complete migration of remaining APIs
2. Set up monitoring and alerting
3. Implement API versioning strategy
4. Add rate limiting and throttling
5. Create API documentation with OpenAPI/Swagger
6. Set up CI/CD pipeline for automated deployments

## Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

