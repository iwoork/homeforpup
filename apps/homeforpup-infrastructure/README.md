# HomeForPup Infrastructure

AWS CDK infrastructure as code for HomeForPup AWS services.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your AWS account details

# Bootstrap CDK (first time only)
npm run bootstrap

# Deploy all infrastructure
npm run deploy:all
```

## Documentation

**All documentation is located in the `docs/infrastructure/` folder:**

- [Infrastructure README](../../docs/infrastructure/README.md) - Overview and architecture
- [Deployment Guide](../../docs/infrastructure/DEPLOYMENT_GUIDE.md) - Step-by-step deployment instructions

## Stacks

This project contains CDK stacks for:

- **DynamoDB** - All database tables
- **S3** - Storage buckets
- **Cognito** - User authentication
- **IAM** - Roles and policies

## Scripts

- `npm run build` - Compile TypeScript
- `npm run synth` - Synthesize CloudFormation templates
- `npm run deploy` - Deploy all stacks
- `npm run deploy:dynamodb` - Deploy DynamoDB stack only
- `npm run deploy:s3` - Deploy S3 stack only
- `npm run deploy:cognito` - Deploy Cognito stack only
- `npm run deploy:iam` - Deploy IAM stack only
- `npm run diff` - Show differences with deployed stacks
- `npm run destroy` - Destroy all stacks

## Manual Setup Scripts

For manual setup without CDK, see `scripts/setup-dynamodb-tables.js`

**Note:** CDK is the recommended approach for infrastructure management.

## Environment Variables

See `.env.example` for required environment variables.

## Support

For detailed documentation, see: `docs/infrastructure/`


