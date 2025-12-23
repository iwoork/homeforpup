# Infrastructure Architecture

This document describes the architecture of the HomeForPup AWS infrastructure.

## Overview

The infrastructure is organized into separate CDK stacks, each managing a specific set of AWS resources. This separation allows for:

- Independent deployment and updates
- Clear resource ownership
- Easier troubleshooting
- Cost tracking per service

## Stack Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CDK Application                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  DynamoDB    │  │     S3       │  │   Cognito    │    │
│  │    Stack     │  │    Stack     │  │    Stack    │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │            │
│         └──────────────────┼──────────────────┘            │
│                            │                               │
│                   ┌────────▼────────┐                      │
│                   │   IAM Stack     │                      │
│                   │  (depends on    │                      │
│                   │   all others)   │                      │
│                   └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## Stack Details

### DynamoDB Stack

**Purpose**: Manage all database tables

**Resources Created**:
- 12 DynamoDB tables with appropriate indexes
- Point-in-time recovery (production)
- Streams (profiles table)
- Global Secondary Indexes (GSIs) for efficient queries

**Tables**:
1. `profiles` - User profile data (application-specific)
2. `dogs` - Dog listings
3. `kennels` - Kennel management
4. `litters` - Litter management
5. `messages` - Messaging system
6. `message-threads` - Message thread organization
7. `favorites` - User favorites
8. `activities` - User activity feed
9. `breeds` - Dog breed information
10. `breeds-simple` - Simplified breed data
11. `vet-visits` - Veterinary visit records
12. `veterinarians` - Veterinarian information

**Features**:
- On-demand billing (PAY_PER_REQUEST)
- Automatic scaling
- Global Secondary Indexes for query optimization
- Streams for real-time data processing

### S3 Stack

**Purpose**: Manage file storage

**Resources Created**:
- Image bucket (public read access)
- Upload bucket (private, temporary)

**Image Bucket**:
- Public read access for serving images
- CORS enabled for web uploads
- Versioning (production)
- Lifecycle rules for cost optimization
- Custom domain support ready

**Upload Bucket**:
- Private access only
- Auto-delete after 7 days
- For temporary file uploads before processing

### Cognito Stack

**Purpose**: User authentication and management

**Resources Created**:
- User Pool (or imports existing)
- User Pool Client
- User Pool Domain

**Features**:
- Email-based authentication
- Custom attributes (userType)
- Password policy enforcement
- Optional MFA
- OAuth configuration
- Custom domain support

**Note**: Can import existing User Pool if already created.

### IAM Stack

**Purpose**: Manage access permissions

**Resources Created**:
- Application role for Lambda/EC2 services
- Policies with least-privilege permissions

**Permissions**:
- DynamoDB: Read/write access to all tables
- S3: Read/write access to buckets
- Cognito: Read access to User Pool
- SES: Email sending permissions
- CloudWatch: Log writing permissions

**Principle**: Least-privilege access - only what's needed, nothing more.

## Data Flow

```
┌─────────────┐
│   Users     │
│ (Mobile/Web)│
└──────┬──────┘
       │
       │ Authenticate
       ▼
┌─────────────┐
│   Cognito   │
│  User Pool  │
└──────┬──────┘
       │
       │ Authorized Requests
       ▼
┌─────────────┐      ┌─────────────┐
│ API Gateway │──────▶│   Lambda    │
│  (API App)  │      │  Functions  │
└──────┬──────┘      └──────┬──────┘
       │                     │
       │                     │ IAM Role
       │                     ▼
       │              ┌─────────────┐
       │              │   DynamoDB │
       │              │   Tables    │
       │              └─────────────┘
       │
       │ Upload Files
       ▼
┌─────────────┐
│  S3 Buckets │
│  (Images)   │
└─────────────┘
```

## Environment Strategy

### Development

- **Purpose**: Local development and testing
- **Retention**: Resources can be destroyed
- **Features**: Minimal cost, fast iteration
- **Naming**: No environment suffix

### Staging

- **Purpose**: Pre-production testing
- **Retention**: Similar to production
- **Features**: Production-like setup
- **Naming**: `-staging` suffix

### Production

- **Purpose**: Live production environment
- **Retention**: Resources retained (RETAIN policy)
- **Features**: Full backups, versioning, monitoring
- **Naming**: `-prod` suffix

## Security Considerations

1. **IAM Roles**: Least-privilege access
2. **S3 Buckets**: Public access only where needed
3. **DynamoDB**: Encryption at rest enabled
4. **Cognito**: Secure password policies
5. **Network**: VPC configuration (if needed in future)

## Cost Optimization

1. **DynamoDB**: On-demand billing (pay per request)
2. **S3**: Lifecycle rules for old objects
3. **Development**: Auto-delete enabled
4. **Production**: Versioning and backups only where needed

## Scalability

All resources are designed to scale automatically:

- **DynamoDB**: On-demand mode scales automatically
- **S3**: Unlimited storage, scales automatically
- **Cognito**: Handles millions of users
- **IAM**: No scaling concerns

## Monitoring

Recommended CloudWatch setup:

- DynamoDB: Table metrics, throttling alerts
- S3: Bucket metrics, access logs
- Cognito: Sign-in metrics, error rates
- IAM: Access denied alerts

## Disaster Recovery

### Backup Strategy

- **DynamoDB**: Point-in-time recovery (production)
- **S3**: Versioning enabled (production)
- **Cognito**: Managed by AWS (automatic backups)

### Recovery Procedures

1. Restore DynamoDB from point-in-time backup
2. Restore S3 objects from versions
3. Cognito users are automatically backed up

## Future Enhancements

Potential additions:

- **CloudFront**: CDN for S3 assets
- **Route 53**: DNS management
- **ACM**: SSL certificate management
- **VPC**: Network isolation
- **CloudWatch**: Enhanced monitoring
- **Backup**: Automated backup policies

## Related Documentation

- [Infrastructure README](./README.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)


