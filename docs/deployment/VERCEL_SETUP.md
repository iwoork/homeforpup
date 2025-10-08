# Vercel Deployment Setup for Breeder App

## Environment Variables Required on Vercel

The following environment variables must be configured in your Vercel project settings to fix the 401 Unauthorized errors:

### NextAuth Configuration (CRITICAL)

```bash
# NextAuth Secret - MUST be set for production
NEXTAUTH_SECRET=<generate-a-random-secret-string>

# NextAuth URL - Set to your production domain
NEXTAUTH_URL=https://your-breeder-app-domain.vercel.app
```

**To generate a NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### AWS Configuration

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
```

### AWS Cognito Configuration

```bash
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=<your-cognito-client-id>
NEXT_PUBLIC_COGNITO_AUTHORITY=https://cognito-idp.us-east-1.amazonaws.com/<your-user-pool-id>
NEXT_PUBLIC_COGNITO_DOMAIN=https://<your-cognito-domain>.auth.us-east-1.amazoncognito.com
```

### DynamoDB Table Names

```bash
ACTIVITIES_TABLE_NAME=homeforpup-activities
KENNELS_TABLE_NAME=homeforpup-kennels
DOGS_TABLE_NAME=homeforpup-dogs
LITTERS_TABLE_NAME=homeforpup-litters
USERS_TABLE_NAME=homeforpup-users
```

### Node Environment

```bash
NODE_ENV=production
```

## Common Issues and Solutions

### 401 Unauthorized on API Routes

**Symptom:** All API routes return 401 Unauthorized in production but work locally.

**Causes:**
1. `NEXTAUTH_SECRET` is not set on Vercel
2. `NEXTAUTH_URL` is not set correctly
3. Cookie settings are incompatible with production environment

**Solution:**
1. Ensure `NEXTAUTH_SECRET` is set in Vercel environment variables
2. Set `NEXTAUTH_URL` to your production domain (e.g., `https://breeder.homeforpup.com`)
3. Ensure secure cookies are enabled (already configured in `lib/auth.ts`)

### Session Not Persisting

**Symptom:** User gets logged out immediately or session is not maintained.

**Causes:**
1. Cookie domain mismatch
2. `NEXTAUTH_URL` doesn't match the actual domain

**Solution:**
1. Verify `NEXTAUTH_URL` exactly matches your production domain
2. Check browser console for cookie-related errors

### Cognito Authentication Errors

**Symptom:** Cognito redirect fails or authentication loop.

**Causes:**
1. Cognito callback URL not configured correctly
2. `NEXT_PUBLIC_COGNITO_DOMAIN` incorrect

**Solution:**
1. In AWS Cognito Console, add your production URL to allowed callback URLs:
   - `https://your-domain.vercel.app/api/auth/callback/cognito`
   - `https://your-domain.vercel.app/auth/callback`
2. Add logout URLs:
   - `https://your-domain.vercel.app/`

## Deployment Checklist

- [ ] Set all environment variables in Vercel project settings
- [ ] Generate and set `NEXTAUTH_SECRET`
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Configure Cognito callback URLs in AWS Console
- [ ] Test authentication flow in production
- [ ] Verify API routes work after login
- [ ] Check browser console for errors
- [ ] Check Vercel function logs for server-side errors

## Debugging on Vercel

1. **Check Function Logs:**
   - Go to Vercel Dashboard → Your Project → Functions
   - View logs for API routes to see authentication errors

2. **Enable Debug Mode:**
   - The app already has `debug: true` in development mode
   - Check console logs for session information

3. **Test Session Endpoint:**
   - Visit `/api/auth/session` to see if session is being created
   - Should return session data if authenticated

## Additional Notes

- The app uses JWT strategy for sessions (stateless)
- Sessions are valid for 24 hours
- Secure cookies are automatically enabled in production
- PKCE flow is enabled for additional security with Cognito
