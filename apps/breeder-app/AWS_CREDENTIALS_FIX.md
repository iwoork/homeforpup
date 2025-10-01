# Fixing AWS Credentials Error on Vercel

## ✅ Authentication Status: WORKING!

Your NextAuth authentication is now working correctly:
- ✅ Session is being retrieved
- ✅ User ID is present
- ✅ Cookies are being sent properly

## ❌ Current Issue: Invalid AWS Credentials

**Error:**
```
UnrecognizedClientException: The security token included in the request is invalid.
```

**This means:** The AWS credentials on Vercel are either:
1. Incorrect (wrong access key or secret)
2. Expired (temporary credentials that expired)
3. Missing required permissions
4. From a different AWS account

## How to Fix

### Step 1: Verify AWS Credentials Locally

Run this command locally to verify your credentials work:
```bash
aws sts get-caller-identity
```

This should show your AWS account ID and user ARN. If it fails, your local credentials are also wrong.

### Step 2: Get Correct AWS Credentials

#### Option A: Use IAM User Credentials (Recommended for Development)

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → Select your user (or create a new one)
3. Go to **Security credentials** tab
4. Click **Create access key**
5. Choose **Application running outside AWS**
6. Download and save the credentials

#### Option B: Verify Existing Credentials

If you already have credentials:
1. Find your `.env.local` file locally
2. Copy the values for:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
3. These should work on Vercel too

### Step 3: Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your breeder-app project
3. Go to **Settings** → **Environment Variables**
4. Update or add these variables:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-valid-access-key>
AWS_SECRET_ACCESS_KEY=<your-valid-secret-key>
```

**Important:** 
- Remove any old/expired credentials first
- Add the new credentials
- Make sure to select **Production**, **Preview**, and **Development** environments

### Step 4: Verify IAM Permissions

Your AWS IAM user needs these permissions:
- `dynamodb:GetItem`
- `dynamodb:PutItem`
- `dynamodb:UpdateItem`
- `dynamodb:DeleteItem`
- `dynamodb:Scan`
- `dynamodb:Query`

For the following DynamoDB tables:
- `homeforpup-kennels`
- `homeforpup-dogs`
- `homeforpup-litters`
- `homeforpup-activities`
- `homeforpup-users`

### Step 5: Redeploy on Vercel

After updating the environment variables:
1. Go to **Deployments** tab
2. Click **...** on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

## Testing After Fix

### 1. Check API Endpoint
```bash
curl https://breeder.homeforpup.com/api/kennels
```

Should return:
- ✅ List of kennels (if you have any)
- ✅ `{"kennels": [], "total": 0}` (if no kennels yet)

Should NOT return:
- ❌ `{"error": "Unauthorized"}`
- ❌ `UnrecognizedClientException`

### 2. Check Vercel Logs

The logs should now show:
```
Kennels API - Session: {
  hasSession: true,
  hasUser: true,
  userId: 'c4e84488-a0c1-70ac-8376-ee8b6151167b',
  ...
}
```

And then successfully query DynamoDB without errors.

## Common AWS Credential Issues

### Issue 1: Temporary Credentials Expired

**Symptom:** Credentials worked before but now fail

**Solution:** 
- Create permanent IAM user credentials
- Don't use AWS SSO or temporary credentials for production

### Issue 2: Wrong Region

**Symptom:** `ResourceNotFoundException`

**Solution:**
- Verify `AWS_REGION=us-east-1` matches your DynamoDB table region
- Check in AWS Console which region your tables are in

### Issue 3: Insufficient Permissions

**Symptom:** `AccessDeniedException`

**Solution:**
- Add DynamoDB full access policy to your IAM user
- Or create a custom policy with the required permissions listed above

## Environment Variables Checklist

Make sure ALL these are set on Vercel:

```bash
# NextAuth (Already Working ✅)
NEXTAUTH_SECRET=<set>
NEXTAUTH_URL=https://breeder.homeforpup.com
NEXTAUTH_TRUST_HOST=true

# AWS Credentials (NEEDS TO BE FIXED ❌)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<valid-access-key>
AWS_SECRET_ACCESS_KEY=<valid-secret-key>

# Cognito (Already Working ✅)
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=3d6m93u51ggssrc7t49cjnnk53
NEXT_PUBLIC_COGNITO_AUTHORITY=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_M6uzx1eFZ
NEXT_PUBLIC_COGNITO_DOMAIN=<your-domain>

# DynamoDB Tables
ACTIVITIES_TABLE_NAME=homeforpup-activities
KENNELS_TABLE_NAME=homeforpup-kennels
DOGS_TABLE_NAME=homeforpup-dogs
LITTERS_TABLE_NAME=homeforpup-litters
USERS_TABLE_NAME=homeforpup-users
```

## Quick Fix

The fastest way to fix this:
1. Copy `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from your local `.env.local`
2. Paste them into Vercel environment variables
3. Redeploy
4. Test `/api/kennels` - should work!

