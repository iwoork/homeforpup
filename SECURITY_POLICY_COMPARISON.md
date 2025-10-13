# IAM Policy Security Improvements

## 🔒 Least Privilege Policy Changes

### Key Security Improvements

| Service | Before | After | Improvement |
|---------|--------|-------|-------------|
| **DynamoDB** | Wildcard ARNs (`*`) | Specific account ID | ✅ Limited to your tables only |
| **S3** | Full CDK bucket access | Read-only for deployments | ✅ Reduced write permissions |
| **SES** | Full admin access | Send-only permissions | ✅ Can't modify SES config |
| **Cognito** | Admin operations | Read-only user info | ✅ Can't modify user pool |
| **CloudWatch** | All Lambda logs | Only your function logs | ✅ Limited log access |
| **Lambda** | All functions (`*`) | Only your function patterns | ✅ Can't modify other Lambdas |
| **IAM** | All roles (`*`) | Only HomeForPup/CDK roles | ✅ Can't create arbitrary roles |
| **CloudFormation** | All stacks (`*`) | Only your stack names | ✅ Can't modify other stacks |
| **API Gateway** | Full admin (`apigateway:*`) | Specific operations only | ✅ No policy wildcards |

---

## 📋 What Each Permission Does

### ✅ Required for Application Runtime

**DynamoDB Data Access** (Read/Write)
- Get, Put, Update, Delete items in your tables
- Query and Scan for searches
- BatchGet/Write for bulk operations

**S3 Image Bucket**
- Upload user photos (PutObject)
- Retrieve photos (GetObject)
- Delete old photos (DeleteObject)

**SES Email Sending**
- Send contact form emails
- Send notification emails
- NO access to modify email identities or settings

**Cognito Read-Only**
- Get user info from Cognito
- List users for admin features
- NO ability to create/delete users or modify pool

---

### ✅ Required for CDK Deployment

**CloudFormation**
- Create/update your API stack
- View stack status and events
- Limited to stacks named `homeforpup-api-*` or `HomeForPupApiStack-*`

**Lambda Functions**
- Create/update your API functions
- Limited to functions matching your naming pattern
- NO access to other AWS Lambda functions

**API Gateway**
- Create/update REST APIs
- Configure endpoints and methods
- Deploy API stages

**IAM Roles**
- Create execution roles for your Lambda functions
- Limited to roles starting with `HomeForPupApiStack-` or `homeforpup-api-`
- NO ability to create arbitrary IAM policies

**CloudWatch Logs**
- Create log groups for Lambda functions
- Write logs during execution
- Read logs for debugging
- Limited to your function log groups only

---

## 🚫 Removed Permissions

These were in the old policy but **NOT needed**:

❌ **DynamoDB CreateTable/DeleteTable globally** - Added table management only for homeforpup-* tables  
❌ **SES GetSendQuota/GetSendStatistics** - Not needed for sending emails  
❌ **Cognito AdminListGroupsForUser** - Not used by the app  
❌ **Cognito DescribeUserPoolDomain** - Not used by the app  
❌ **Lambda CreateAlias/UpdateAlias** - Not used in deployment  
❌ **S3 CreateBucket/DeleteBucket** - CDK bootstrap bucket exists  
❌ **S3 Full lifecycle management** - Not needed  
❌ **SSM PutParameter/DeleteParameter** - Only reading CDK params  
❌ **ECR Repository creation** - Only need to pull images  
❌ **STS AssumeRole** - Not needed for this app  

---

## 📊 Security Impact

### Before (Original Policy)
- **Risk Level:** 🔴 HIGH
- **Blast Radius:** Could affect other AWS resources
- **Resource Access:** Wildcards allow access to unrelated resources
- **Admin Actions:** Can modify AWS service configurations

### After (Least Privilege Policy)
- **Risk Level:** 🟢 LOW
- **Blast Radius:** Limited to HomeForPup resources only
- **Resource Access:** Explicitly scoped ARNs with account ID
- **Admin Actions:** Removed unnecessary admin permissions

---

## 🎯 What This Means

✅ **Compromised credentials can ONLY:**
- Access HomeForPup DynamoDB tables
- Upload/read from homeforpup-images S3 bucket
- Send emails via SES
- Read user info from your Cognito pool
- Deploy/update your API stack

❌ **Compromised credentials CANNOT:**
- Access other AWS accounts' resources
- Delete your Cognito user pool
- Modify SES sending limits or identities
- Create arbitrary IAM roles
- Access other Lambda functions
- Modify other CloudFormation stacks
- Create/delete S3 buckets

---

## 📝 How to Apply

### Option 1: AWS Console (Recommended)

1. Go to IAM Console: https://console.aws.amazon.com/iam/home?region=us-east-1#/users/homeforpup
2. Click **"Permissions"** tab
3. Find your current inline policy → **"Edit"**
4. Replace with contents from: `aws-iam-policy-least-privilege.json`
5. Click **"Review policy"** → **"Save changes"**

### Option 2: AWS CLI

```bash
aws iam put-user-policy \
  --user-name homeforpup \
  --policy-name HomeForPupApplicationPolicy \
  --policy-document file://aws-iam-policy-least-privilege.json
```

---

## ✅ Testing After Applying

```bash
# Test DynamoDB access
aws dynamodb describe-table --table-name homeforpup-users

# Test S3 access
aws s3 ls s3://homeforpup-images/

# Test CDK deployment
cd apps/homeforpup-api
npx cdk deploy

# Should all work! ✅
```

---

## 🔐 Best Practices Followed

✅ **Principle of Least Privilege** - Only permissions needed  
✅ **Resource-Specific ARNs** - No wildcards where possible  
✅ **Account ID Scoping** - Limited to your AWS account  
✅ **Service-Specific Actions** - No broad `*` permissions  
✅ **Read-Only Where Possible** - SES, Cognito limited to reads  
✅ **Pattern-Based Restrictions** - Lambda/CloudWatch limited to your naming patterns  

---

## 💡 Future Improvements

For even tighter security, consider:

1. **Separate Policies by Environment**
   - Development policy (more permissive)
   - Production policy (read-only for most resources)

2. **Condition Keys**
   - Add IP restrictions: Only from your office/VPN
   - Add time restrictions: Only during business hours
   - Add MFA requirement: Only with MFA authenticated

3. **Service Control Policies (SCPs)**
   - Use AWS Organizations to add another layer
   - Prevent certain actions even with broad IAM permissions

---

**File:** `aws-iam-policy-least-privilege.json`  
**Status:** ✅ Ready to apply  
**Security Level:** 🟢 Production-Ready

