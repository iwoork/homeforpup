# Message Threads IAM Policy Fix

## Issue
The breeder-app is getting `AccessDeniedException` when trying to access the message threads table:

```
Error: AccessDeniedException: User: arn:aws:iam::249730500554:user/homeforpup is not authorized to perform: dynamodb:Query on resource: arn:aws:dynamodb:us-east-1:249730500554:table/puppy-platform-dev-message-threads/index/GSI1
```

## Root Cause
The IAM policy was missing permissions for the `puppy-platform-dev-message-threads` table and its indexes.

## Solution
Updated the `aws-iam-policy.json` file to include:

### New Table Permissions Added:
- `puppy-platform-dev-messages`
- `puppy-platform-dev-message-threads`

### New Index Permissions Added:
- `puppy-platform-dev-messages/index/*`
- `puppy-platform-dev-message-threads/index/*`

## How to Apply the Fix

### Option 1: AWS Console
1. Go to AWS IAM Console
2. Navigate to Users → homeforpup
3. Go to Permissions tab
4. Find the existing policy and click "Edit"
5. Replace the policy JSON with the updated content from `aws-iam-policy.json`
6. Save the changes

### Option 2: AWS CLI
```bash
# Update the policy using AWS CLI
aws iam put-user-policy \
  --user-name homeforpup \
  --policy-name HomeForPupDynamoDBAccess \
  --policy-document file://aws-iam-policy.json
```

## Verification
After applying the fix, the message threads API should work without access denied errors:
- `/api/messages/threads` should return successfully
- Message functionality in the breeder-app dashboard should work

## Tables Now Covered
The policy now includes permissions for both naming conventions:
- `homeforpup-*` tables (original naming)
- `puppy-platform-dev-*` tables (development naming)

This ensures compatibility with different deployment environments.
