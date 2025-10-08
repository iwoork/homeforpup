# API Architecture

## Overview

This document describes the architecture of the HomeForPup API infrastructure built with AWS CDK, API Gateway, and Lambda.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CloudFront (Optional)                     │
│                   Custom Domain: api.homeforpup.com             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Gateway (REST API)                     │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │  Cognito         │  │  Request         │                   │
│  │  Authorizer      │  │  Validation      │                   │
│  └──────────────────┘  └──────────────────┘                   │
│                                                                  │
│  Routes:                                                        │
│    /dogs/*         → Dogs Lambda Functions                     │
│    /users/*        → Users Lambda Functions                    │
│    /kennels/*      → Kennels Lambda Functions                  │
│    /messages/*     → Messages Lambda Functions                 │
│    /favorites/*    → Favorites Lambda Functions                │
│    /activities/*   → Activities Lambda Functions               │
│    /breeds/*       → Breeds Lambda Functions                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
  │   Lambda    │   │   Lambda    │   │   Lambda    │
  │  Functions  │   │  Functions  │   │  Functions  │
  │             │   │             │   │             │
  │  - List     │   │  - Get      │   │  - Create   │
  │  - Get      │   │  - Update   │   │  - Update   │
  │  - Create   │   │             │   │  - Delete   │
  │  - Update   │   │             │   │             │
  │  - Delete   │   │             │   │             │
  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │  DynamoDB    │  │      S3      │  │   Cognito    │
  │   Tables     │  │   Buckets    │  │  User Pool   │
  │              │  │              │  │              │
  │ - Users      │  │ - Uploads    │  │ - Auth       │
  │ - Dogs       │  │ - Images     │  │ - Users      │
  │ - Kennels    │  │              │  │              │
  │ - Messages   │  │              │  │              │
  │ - Favorites  │  │              │  │              │
  │ - Activities │  │              │  │              │
  └──────────────┘  └──────────────┘  └──────────────┘
         │
         ▼
  ┌──────────────┐
  │  CloudWatch  │
  │              │
  │ - Logs       │
  │ - Metrics    │
  │ - Alarms     │
  │ - X-Ray      │
  └──────────────┘
```

## Components

### 1. API Gateway

**Purpose:** HTTP interface for the API

**Configuration:**
- Type: REST API (can be changed to HTTP API for lower cost)
- Stage: `development`, `staging`, `production`
- Authorizer: Cognito User Pools
- CORS: Configured for frontend domains
- Throttling: 1000 RPS, 2000 burst
- Caching: Enabled for production (optional)

**Endpoints:**

| Path | Method | Auth | Description |
|------|--------|------|-------------|
| `/dogs` | GET | Optional | List dogs with filters |
| `/dogs` | POST | Required | Create new dog |
| `/dogs/{id}` | GET | Optional | Get dog details |
| `/dogs/{id}` | PUT | Required | Update dog |
| `/dogs/{id}` | DELETE | Required | Delete dog |
| `/users/{id}` | GET | Optional | Get user profile |
| `/users/{id}` | PUT | Required | Update user profile |
| `/breeds` | GET | None | List breeds |
| `/kennels` | GET | Required | List user kennels |
| `/messages/threads` | GET | Required | List message threads |
| `/favorites` | GET | Required | List user favorites |

### 2. Lambda Functions

**Purpose:** Business logic execution

**Configuration:**
- Runtime: Node.js 18.x
- Memory: 512 MB (configurable per function)
- Timeout: 20-30 seconds (configurable)
- Bundling: esbuild for fast, optimized bundles
- Layers: Shared dependencies (optional)
- VPC: None (can be added for private resources)

**Function Pattern:**
```
src/functions/{resource}/{action}/index.ts
```

**Example Functions:**
- `list-dogs`: Query dogs with pagination and filters
- `get-dog`: Get single dog by ID
- `create-dog`: Create new dog with validation
- `update-dog`: Update dog with permission check
- `delete-dog`: Delete dog with permission check

**Shared Code:**
- `src/shared/dynamodb.ts`: DynamoDB client
- `src/shared/s3.ts`: S3 client
- `src/middleware/auth.ts`: Authentication helpers
- `src/middleware/error-handler.ts`: Error handling
- `src/middleware/cors.ts`: CORS configuration

### 3. Cognito Authorizer

**Purpose:** JWT token validation

**How it works:**
1. Client sends request with `Authorization: Bearer <token>` header
2. API Gateway validates token with Cognito
3. If valid, forwards request to Lambda with user context
4. Lambda can access user ID from `event.requestContext.authorizer.claims`

**Token Claims:**
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "cognito:username": "username"
}
```

### 4. DynamoDB

**Purpose:** Data persistence

**Tables:**
- `homeforpup-users-{env}`
- `homeforpup-dogs-{env}`
- `homeforpup-kennels-{env}`
- `homeforpup-messages-{env}`
- `homeforpup-favorites-{env}`
- `homeforpup-activities-{env}`
- `homeforpup-breeds-{env}`

**Access Pattern:**
- Lambda functions granted least-privilege IAM permissions
- Single-table design considered for future optimization

### 5. S3

**Purpose:** File storage (images, uploads)

**Buckets:**
- `homeforpup-uploads-{env}`: User uploads
- `homeforpup-images-{env}`: Processed images

**Access:**
- Lambda generates presigned URLs for secure access
- CloudFront for CDN (optional)

### 6. CloudWatch

**Purpose:** Monitoring and observability

**Components:**
- **Logs**: All Lambda function logs
- **Metrics**: Request count, errors, latency
- **Alarms**: Error rate, latency thresholds
- **X-Ray**: Distributed tracing (production)

## Request Flow

### Unauthenticated Request (Public Endpoint)

```
1. Client → API Gateway
   GET /breeds?limit=10

2. API Gateway → Lambda
   Event: {
     queryStringParameters: { limit: '10' }
   }

3. Lambda → DynamoDB
   Scan/Query breeds table

4. DynamoDB → Lambda
   Return breeds data

5. Lambda → API Gateway
   Response: {
     statusCode: 200,
     body: JSON.stringify({ breeds: [...] })
   }

6. API Gateway → Client
   HTTP 200 with breeds data
```

### Authenticated Request

```
1. Client → API Gateway
   POST /dogs
   Authorization: Bearer <JWT>
   Body: { name: 'Max', breed: 'Golden Retriever', ... }

2. API Gateway → Cognito
   Validate JWT token

3. Cognito → API Gateway
   Token valid, user claims: { sub: 'user-123', ... }

4. API Gateway → Lambda
   Event: {
     body: '{"name":"Max",...}',
     requestContext: {
       authorizer: {
         claims: { sub: 'user-123', email: 'user@example.com' }
       }
     }
   }

5. Lambda
   - Extract user ID from claims
   - Parse and validate body
   - Check permissions

6. Lambda → DynamoDB
   PutItem: Create dog record

7. DynamoDB → Lambda
   Success

8. Lambda → API Gateway
   Response: {
     statusCode: 201,
     body: JSON.stringify({ dog: {...} })
   }

9. API Gateway → Client
   HTTP 201 with created dog data
```

## Security

### Authentication & Authorization

1. **API Gateway Level:**
   - Cognito Authorizer validates JWT tokens
   - Invalid/expired tokens rejected before reaching Lambda

2. **Lambda Level:**
   - Extract user context from event
   - Verify permissions for the requested action
   - Check resource ownership

### IAM Permissions

Lambda execution roles follow least privilege:

```typescript
// Example: Dogs Lambda
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:GetItem",
    "dynamodb:PutItem",
    "dynamodb:UpdateItem",
    "dynamodb:Query"
  ],
  "Resource": "arn:aws:dynamodb:*:*:table/homeforpup-dogs-*"
}
```

### Network Security

- API Gateway: HTTPS only
- Lambda: Can be deployed in VPC for private resources
- S3: Bucket policies restrict access
- Secrets: AWS Secrets Manager for sensitive data

### Input Validation

- API Gateway: Request validation (optional)
- Lambda: Business logic validation
- DynamoDB: Schema validation

## Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "details": {
    "field": "validation error details"
  }
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (auth required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

### Error Propagation

```
Lambda Error → Error Handler → API Gateway → Client
```

### CloudWatch Alarms

- Error rate > 5%
- p99 latency > 1000ms
- Throttling events

## Performance

### Lambda Optimization

1. **Memory Allocation:**
   - Start with 512 MB
   - Monitor and adjust based on usage
   - More memory = more CPU

2. **Cold Starts:**
   - Keep functions warm with reserved concurrency
   - Use Lambda layers for shared dependencies
   - Minimize bundle size with esbuild

3. **Connection Reuse:**
   - Reuse DynamoDB client across invocations
   - Enable HTTP keep-alive

### API Gateway Caching

```typescript
// Production only
deployOptions: {
  cacheClusterEnabled: true,
  cacheClusterSize: '0.5',  // 0.5 GB
  cacheTtl: cdk.Duration.minutes(5),
}
```

Cache key: URL + query parameters

### DynamoDB Optimization

- Use indexes for common queries
- Batch operations when possible
- Implement pagination for large result sets
- Consider DynamoDB Accelerator (DAX) for read-heavy workloads

## Scalability

### Automatic Scaling

- **Lambda**: Auto-scales to handle load (up to account limit)
- **API Gateway**: Handles up to 10,000 RPS per account
- **DynamoDB**: On-demand billing scales automatically

### Limits

| Resource | Limit | Adjustable |
|----------|-------|------------|
| Lambda Concurrent Executions | 1000 | Yes |
| API Gateway Requests | 10,000 RPS | Yes |
| Lambda Timeout | 900s | No |
| API Gateway Timeout | 29s | No |

### Multi-Region (Future)

For global scale:
- Deploy stacks to multiple regions
- Route53 geolocation routing
- DynamoDB global tables
- S3 cross-region replication

## Cost

### Estimated Monthly Cost (Development)

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 1M requests, 512 MB, 1s avg | $0.42 |
| API Gateway | 1M requests | $3.50 |
| DynamoDB | 100K reads, 50K writes | $1.25 |
| CloudWatch Logs | 10 GB | $5.00 |
| **Total** | | **~$10/month** |

### Production Cost Optimization

1. **Use HTTP API** instead of REST API (70% cheaper)
2. **Enable API Gateway caching** (reduce Lambda invocations)
3. **Optimize Lambda memory** (pay for what you use)
4. **Set log retention** (avoid storing logs forever)
5. **Use reserved concurrency** carefully (pay for idle capacity)

## Deployment

### Infrastructure as Code (CDK)

All infrastructure defined in code:
- Version controlled
- Reproducible
- Reviewable
- Testable

### Environments

- **Development**: Individual developer environments
- **Staging**: Pre-production testing
- **Production**: Live customer-facing API

### CI/CD

```
GitHub → GitHub Actions → CDK Deploy → AWS
```

## Monitoring

### Key Metrics

1. **Requests:**
   - Total requests
   - Requests by endpoint
   - Requests by status code

2. **Latency:**
   - p50, p90, p99 latency
   - Lambda duration
   - DynamoDB latency

3. **Errors:**
   - 4xx client errors
   - 5xx server errors
   - Lambda errors

4. **Costs:**
   - Lambda invocations
   - API Gateway requests
   - DynamoDB capacity units

### Dashboards

Create CloudWatch dashboard with:
- Request rate graph
- Error rate graph
- Latency distribution
- Lambda concurrent executions
- DynamoDB throttling

### Alerting

Set up alarms for:
- Error rate > 5%
- p99 latency > 1000ms
- Lambda throttling
- API Gateway 5xx errors

## Future Enhancements

1. **API Versioning:** `/v1/dogs`, `/v2/dogs`
2. **GraphQL:** Unified API with AppSync
3. **WebSocket:** Real-time updates with API Gateway WebSocket
4. **Event-Driven:** EventBridge for async processing
5. **Caching Layer:** ElastiCache for session data
6. **Rate Limiting:** Advanced throttling per user
7. **API Analytics:** Detailed usage tracking
8. **Documentation:** Auto-generated OpenAPI/Swagger docs

## References

- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [AWS CDK Developer Guide](https://docs.aws.amazon.com/cdk/latest/guide/)

