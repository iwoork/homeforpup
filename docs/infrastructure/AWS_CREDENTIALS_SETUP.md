# AWS Credentials Setup

This guide helps you configure AWS credentials for deploying the HomeForPup infrastructure.

## Error: InvalidClientTokenId

If you see this error:
```
InvalidClientTokenId: The security token included in the request is invalid.
```

It means your AWS credentials are either:
1. Not configured
2. Invalid or expired
3. Missing required permissions

## Solution 1: Configure AWS CLI

### Step 1: Install AWS CLI

If you don't have AWS CLI installed:

**macOS:**
```bash
brew install awscli
```

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**Windows:**
Download and install from: https://aws.amazon.com/cli/

### Step 2: Configure Credentials

Run the AWS CLI configuration command:

```bash
aws configure
```

You'll be prompted for:
1. **AWS Access Key ID**: Your AWS access key
2. **AWS Secret Access Key**: Your AWS secret key
3. **Default region name**: `us-east-1` (or your preferred region)
4. **Default output format**: `json` (recommended)

### Step 3: Verify Configuration

Test your credentials:

```bash
aws sts get-caller-identity
```

You should see output like:
```json
{
    "UserId": "AIDAXXXXXXXXXXXXXXXXX",
    "Account": "249730500554",
    "Arn": "arn:aws:iam::249730500554:user/your-username"
}
```

## Solution 2: Use Environment Variables

If you prefer to use environment variables instead of `aws configure`:

### Set Environment Variables

**macOS/Linux:**
```bash
export AWS_ACCESS_KEY_ID=your_access_key_here
export AWS_SECRET_ACCESS_KEY=your_secret_key_here
export AWS_DEFAULT_REGION=us-east-1
```

**Windows (PowerShell):**
```powershell
$env:AWS_ACCESS_KEY_ID="your_access_key_here"
$env:AWS_SECRET_ACCESS_KEY="your_secret_key_here"
$env:AWS_DEFAULT_REGION="us-east-1"
```

**Windows (CMD):**
```cmd
set AWS_ACCESS_KEY_ID=your_access_key_here
set AWS_SECRET_ACCESS_KEY=your_secret_key_here
set AWS_DEFAULT_REGION=us-east-1
```

### Using .env File

You can also add credentials to the `.env` file in the infrastructure directory:

```bash
cd apps/homeforpup-infrastructure
```

Create or edit `.env`:
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=249730500554
```

**Note**: Make sure `.env` is in `.gitignore` (it should be by default).

## Solution 3: Use AWS Profiles

If you have multiple AWS accounts, use profiles:

### Create a Profile

```bash
aws configure --profile homeforpup
```

### Use the Profile

Set the profile as an environment variable:

```bash
export AWS_PROFILE=homeforpup
```

Or use it in CDK commands:

```bash
cdk bootstrap --profile homeforpup
```

## Getting AWS Credentials

If you don't have AWS credentials yet:

### Option 1: IAM User (Recommended for Development)

1. Go to AWS Console → IAM → Users
2. Click "Add users"
3. Enter username (e.g., `homeforpup-dev`)
4. Select "Access key - Programmatic access"
5. Attach policies:
   - `AdministratorAccess` (for full access)
   - Or create a custom policy with CDK permissions
6. Download the credentials CSV file
7. Use the Access Key ID and Secret Access Key

### Option 2: IAM Role (For EC2/ECS)

If deploying from EC2 or ECS, use IAM roles instead of access keys.

### Option 3: AWS SSO

If your organization uses AWS SSO:

```bash
aws sso login --profile your-profile
```

## Required Permissions

For CDK bootstrap and deployment, you need:

- **CloudFormation**: Full access
- **S3**: Create/read/write buckets
- **IAM**: Create roles and policies
- **STS**: Get caller identity
- **DynamoDB**: Create/read/write tables (for deployment)
- **Cognito**: Create/read user pools (if creating new)
- **SSM**: Read parameters (for CDK bootstrap)

Minimum policy for CDK bootstrap:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "s3:*",
        "iam:*",
        "sts:GetCallerIdentity",
        "ssm:GetParameter"
      ],
      "Resource": "*"
    }
  ]
}
```

## Troubleshooting

### Check Current Credentials

```bash
aws sts get-caller-identity
```

### Check Configuration Files

**macOS/Linux:**
```bash
cat ~/.aws/credentials
cat ~/.aws/config
```

**Windows:**
```bash
type %USERPROFILE%\.aws\credentials
type %USERPROFILE%\.aws\config
```

### Clear and Reconfigure

If credentials are still not working:

```bash
# Remove old credentials
rm ~/.aws/credentials
rm ~/.aws/config

# Reconfigure
aws configure
```

### Check Region

Make sure your region is correct:

```bash
aws configure get region
```

If it's wrong:
```bash
aws configure set region us-east-1
```

### Check for Multiple Credential Sources

AWS CLI checks credentials in this order:
1. Environment variables
2. AWS credentials file (`~/.aws/credentials`)
3. AWS config file (`~/.aws/config`)
4. IAM role (if on EC2/ECS)

Make sure you're not mixing different credential sources.

## Security Best Practices

1. **Never commit credentials** to git
2. **Use IAM roles** when possible (instead of access keys)
3. **Rotate credentials** regularly
4. **Use least-privilege** IAM policies
5. **Enable MFA** for production accounts
6. **Use separate accounts** for dev/staging/production

## Next Steps

After configuring credentials:

1. Verify credentials work:
   ```bash
   aws sts get-caller-identity
   ```

2. Bootstrap CDK:
   ```bash
   cd apps/homeforpup-infrastructure
   npm run bootstrap
   ```

3. Deploy infrastructure:
   ```bash
   npm run deploy:all
   ```

## Related Documentation

- [Infrastructure Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [CDK Bootstrap Documentation](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html)


