# Fix for Breeds Table Access Error

## Problem
The application is getting an `AccessDeniedException` when trying to access the `homeforpup-breeds-simple` DynamoDB table because the IAM policy doesn't include permissions for this table.

Error message:
```
AccessDeniedException: User: arn:aws:iam::249730500554:user/homeforpup is not authorized to perform: dynamodb:Scan on resource: arn:aws:dynamodb:us-east-1:249730500554:table/homeforpup-breeds-simple because no identity-based policy allows the dynamodb:Scan action
```

## Solution
The IAM policy (`aws-iam-policy.json`) has been updated to include the missing table permissions.

### To Apply the Fix:

1. **Update the IAM Policy in AWS Console:**
   - Go to the AWS Console → IAM → Policies
   - Find the policy `HomeForPupApplicationPolicy` (or whatever you named it)
   - Click on the policy name
   - Click "Edit policy"
   - Switch to the JSON tab
   - Copy and paste the entire contents of the updated `aws-iam-policy.json` file
   - Click "Next: Review"
   - Click "Save changes"

2. **Alternative: Using AWS CLI:**
   ```bash
   # Get the policy ARN (replace with your actual policy name if different)
   aws iam list-policies --query 'Policies[?PolicyName==`HomeForPupApplicationPolicy`].Arn' --output text
   
   # Update the policy (replace POLICY_ARN with the actual ARN from above)
   aws iam create-policy-version \
     --policy-arn POLICY_ARN \
     --policy-document file://aws-iam-policy.json \
     --set-as-default
   ```

### What Was Added:
- Permission for `homeforpup-breeds-simple` table
- Index permissions for both breeds tables
- Maintained all existing permissions

### Verify the Fix:
After updating the policy, the breeds API should work correctly. You can test by:
1. Accessing any page with a BreedSelector component
2. Checking the browser console for successful API calls
3. Verifying breeds are loaded in the dropdown

### Tables Now Covered:
- ✅ `homeforpup-breeds` (original)
- ✅ `homeforpup-breeds-simple` (newly added)
- ✅ All other existing tables remain unchanged
