# HomeForPup API Infrastructure

This package contains the AWS CDK infrastructure code for the HomeForPup API Gateway and Lambda functions.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway (REST)                      │
│                  api.homeforpup.com                          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│   Dogs API   │      │  Users API   │     │Messages API  │
│   Lambda     │      │   Lambda     │     │   Lambda     │
└──────────────┘      └──────────────┘     └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
        ┌──────────────┐          ┌──────────────┐
        │   DynamoDB   │          │      S3      │
        │    Tables    │          │   Buckets    │
        └──────────────┘          └──────────────┘
```

## Project Structure

```
apps/homeforpup-api/
├── bin/
│   └── api.ts                 # CDK app entry point
├── lib/
│   ├── stacks/
│   │   ├── api-stack.ts       # Main API Gateway stack
│   │   ├── dogs-stack.ts      # Dogs API resources
│   │   ├── users-stack.ts     # Users API resources
│   │   ├── messaging-stack.ts # Messaging API resources
│   │   └── shared-stack.ts    # Shared resources (auth, etc.)
│   ├── constructs/
│   │   ├── lambda-api.ts      # Reusable Lambda API construct
│   │   └── auth-layer.ts      # Cognito authorization
│   └── config/
│       └── environments.ts    # Environment configurations
├── src/
│   ├── functions/
│   │   ├── dogs/              # Dog-related Lambda handlers
│   │   ├── users/             # User-related Lambda handlers
│   │   ├── kennels/           # Kennel-related Lambda handlers
│   │   ├── messages/          # Message-related Lambda handlers
│   │   ├── favorites/         # Favorites Lambda handlers
│   │   ├── activities/        # Activities Lambda handlers
│   │   └── shared/            # Shared utilities
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication middleware
│   │   ├── error-handler.ts  # Global error handling
│   │   └── cors.ts            # CORS configuration
│   └── types/
│       └── lambda.ts          # Lambda-specific types
├── cdk.json
├── tsconfig.json
└── package.json
```

## Lambda Functions

### Current API Endpoints to Migrate

#### Dog Parent App APIs
- `/api/auth/*` - NextAuth authentication
- `/api/dogs/*` - Dog listings and details
- `/api/users/*` - User profiles and management
- `/api/favorites/*` - User favorites
- `/api/messages/*` - Messaging system
- `/api/activities/*` - Activity tracking
- `/api/breeders/*` - Breeder information
- `/api/breeds/*` - Breed information
- `/api/puppies/*` - Available puppies
- `/api/contact/*` - Contact forms
- `/api/newsletter/*` - Newsletter subscriptions

#### Breeder App APIs
- `/api/auth/*` - NextAuth authentication
- `/api/dogs/*` - Dog CRUD operations
- `/api/kennels/*` - Kennel management
- `/api/litters/*` - Litter management
- `/api/messages/*` - Messaging system
- `/api/activities/*` - Activity tracking
- `/api/breeds/*` - Breed information
- `/api/upload/*` - File uploads
- `/api/users/*` - User management

## Getting Started

### Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI configured with credentials
3. Node.js 18+ installed
4. AWS CDK CLI installed globally:
   ```bash
   npm install -g aws-cdk
   ```

### Installation

```bash
cd apps/homeforpup-api
npm install
```

### Bootstrap CDK (First time only)

```bash
npm run bootstrap
```

### Configuration

Create environment-specific configuration files:

```bash
# Copy example environment file
cp .env.example .env.development
cp .env.example .env.production
```

Configure the following environment variables:
- `AWS_REGION` - AWS region (e.g., us-east-1)
- `COGNITO_USER_POOL_ID` - Existing Cognito User Pool ID
- `COGNITO_CLIENT_ID` - Existing Cognito Client ID
- `DYNAMODB_TABLES_PREFIX` - Prefix for DynamoDB tables
- `S3_BUCKET_NAME` - S3 bucket for uploads
- `API_DOMAIN_NAME` - Custom domain (e.g., api.homeforpup.com)

### Development

```bash
# Build TypeScript
npm run build

# Watch mode
npm run watch

# Synthesize CloudFormation template
npm run synth

# Show differences with deployed stack
npm run diff
```

### Deployment

```bash
# Deploy to development
npm run deploy -- --context environment=development

# Deploy to production
npm run deploy -- --context environment=production

# Deploy all stacks
npm run deploy:all
```

## Migration Strategy

### Phase 1: Infrastructure Setup ✓
- [x] Set up CDK project structure
- [x] Create base stack configurations
- [ ] Deploy initial API Gateway
- [ ] Set up Lambda layer for shared dependencies

### Phase 2: Core APIs (Week 1-2)
- [ ] Migrate authentication endpoints
- [ ] Migrate dogs API
- [ ] Migrate users API
- [ ] Set up monitoring and logging

### Phase 3: Feature APIs (Week 3-4)
- [ ] Migrate messaging API
- [ ] Migrate favorites API
- [ ] Migrate kennels API
- [ ] Migrate litters API

### Phase 4: Specialized APIs (Week 5)
- [ ] Migrate upload/S3 API
- [ ] Migrate activities API
- [ ] Migrate contact forms
- [ ] Migrate newsletter subscriptions

### Phase 5: Testing & Cutover (Week 6)
- [ ] Load testing
- [ ] Security audit
- [ ] Update frontend apps to use new API endpoints
- [ ] Monitor and optimize

## API Gateway Features

- **Custom Domain**: api.homeforpup.com
- **SSL/TLS**: AWS Certificate Manager
- **Authorization**: AWS Cognito authorizer
- **Rate Limiting**: Per-user throttling
- **CORS**: Configured for dog-parent and breeder apps
- **Logging**: CloudWatch Logs with request/response logging
- **Metrics**: CloudWatch Metrics and alarms
- **Caching**: API Gateway caching for read operations

## Lambda Configuration

- **Runtime**: Node.js 18.x
- **Memory**: 512 MB - 1024 MB (varies by function)
- **Timeout**: 10-30 seconds (varies by function)
- **Bundling**: esbuild for fast, optimized bundles
- **Layers**: Shared dependencies layer
- **Environment**: Injected via CDK
- **VPC**: Optional VPC configuration for private resources

## Monitoring & Observability

- **CloudWatch Logs**: All Lambda functions log to CloudWatch
- **CloudWatch Metrics**: Custom metrics for business logic
- **X-Ray**: Distributed tracing enabled
- **Alarms**: CloudWatch alarms for errors and latency
- **Dashboard**: CloudWatch dashboard for API health

## Cost Optimization

- **Lambda**: Pay-per-use pricing
- **API Gateway**: REST API with caching
- **DynamoDB**: On-demand billing mode
- **S3**: Lifecycle policies for old uploads
- **CloudWatch**: Log retention policies

## Security

- **IAM Roles**: Least privilege principle
- **Cognito**: JWT token validation
- **VPC**: Optional private subnet deployment
- **Secrets**: AWS Secrets Manager for sensitive data
- **WAF**: Optional AWS WAF for DDoS protection

## Development Workflow

1. **Local Development**: Test Lambda functions locally
2. **Feature Branch**: Create feature branch for changes
3. **Deploy Dev**: Deploy to development environment
4. **Test**: Run integration tests
5. **Deploy Prod**: Deploy to production after approval

## Useful Commands

```bash
# List all stacks
cdk list

# Synthesize stack
cdk synth ApiStack

# Deploy specific stack
cdk deploy DogsApiStack

# Destroy stack (careful!)
cdk destroy ApiStack

# View stack outputs
aws cloudformation describe-stacks --stack-name ApiStack
```

## Troubleshooting

### Lambda Timeouts
- Check CloudWatch Logs for the specific function
- Increase timeout in stack configuration
- Optimize database queries

### CORS Issues
- Verify CORS configuration in API Gateway
- Check allowed origins match your domains
- Ensure preflight OPTIONS requests are handled

### Authentication Failures
- Verify Cognito User Pool configuration
- Check JWT token expiration
- Validate authorizer configuration

## Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [Cognito Documentation](https://docs.aws.amazon.com/cognito/)

