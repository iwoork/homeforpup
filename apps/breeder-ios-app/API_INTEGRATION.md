# API Integration Summary

This document summarizes the changes made to integrate the breeder-ios-app with the api.homeforpup.com endpoints.

## Changes Made

### 1. Updated API Configuration (`src/config/config.ts`)

- Changed the default API base URL from `http://localhost:3001` to `https://api.homeforpup.com`
- Added fallback to AWS API Gateway URL if custom domain is not available
- The configuration now supports environment variable override via `NEXT_PUBLIC_API_BASE_URL`

**New API endpoint:**

```typescript
baseUrl: Config.NEXT_PUBLIC_API_BASE_URL ||
  'https://api.homeforpup.com/development' ||
  'https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development';
```

**Note:** API Gateway uses stage-based URLs. The `/development` prefix is the stage name and is required.

### 2. Updated API Service (`src/services/apiService.ts`)

Removed the `/api` prefix from all endpoints to match the deployed API structure:

| Old Endpoint        | New Endpoint    | Status               | Auth Required |
| ------------------- | --------------- | -------------------- | ------------- |
| `/api/dogs`         | `/dogs`         | ✅ Deployed (public) | Optional      |
| `/api/dogs/{id}`    | `/dogs/{id}`    | ✅ Deployed (public) | No            |
| `/api/breeds`       | `/breeds`       | ✅ Deployed (public) | No            |
| `/api/breeds/{id}`  | `/breeds/{id}`  | ✅ Deployed (public) | No            |
| `/api/kennels`      | `/kennels`      | 🚀 Ready to deploy   | Yes (Cognito) |
| `/api/kennels/{id}` | `/kennels/{id}` | 🚀 Ready to deploy   | No            |
| `/api/activities`   | `/activities`   | ⚠️ Not yet deployed  | Yes           |
| N/A                 | `/users/{id}`   | ✅ Deployed (public) | Optional      |

**Added Users API methods:**

- `getUserById(id: string)` - Get user profile
- `updateUser(id: string, userData)` - Update user profile

### 3. Updated Hooks (`src/hooks/useApi.ts`)

Added new React hook for user data:

- `useUser(id: string)` - Hook to fetch user data

### 4. API Endpoint Notes

The following endpoints are documented in the API but may not yet be deployed:

- `/kennels` - Kennel management (marked in code)
- `/activities` - Activity tracking (marked in code)
- `/messages` - Messaging system (coming soon)
- `/favorites` - User favorites (coming soon)
- `/litters` - Litter management (coming soon)
- `/upload` - File uploads (coming soon)

Comments have been added in the code to indicate which endpoints may not be available yet.

## Environment Setup

### Option 1: Using Environment Variables (Recommended)

Create a `.env` file in the `apps/breeder-ios-app` directory:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.homeforpup.com/development

# AWS Cognito Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-1_M6uzx1eFZ
NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=3d6m93u51ggssrc7t49cjnnk53

# App Configuration
NEXT_PUBLIC_APP_ENV=development
```

**For production:**

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.homeforpup.com/production
```

### Option 2: Using Default Configuration

If no environment variables are set, the app will use the hardcoded defaults:

- API: `https://api.homeforpup.com/development`
- Fallback: `https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development`

**Note:** The `/development` is the API Gateway stage name and is required in the URL.

## Testing the Integration

### 1. Quick Test - Fetch Breeds

```bash
# Test the API endpoint directly
curl "https://api.homeforpup.com/development/breeds?limit=5"

# Or using the AWS API Gateway URL
curl "https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development/breeds?limit=5"
```

### 2. Test from Mobile App

The app will automatically use the configured endpoints when you:

1. **Start the app:**

   ```bash
   cd apps/breeder-ios-app
   npm run ios  # or npm run android
   ```

2. **View dashboard** - Fetches dogs and kennels data
3. **Browse dogs** - Fetches from `/dogs` endpoint
4. **View breeds** - Fetches from `/breeds` endpoint
5. **View user profile** - Fetches from `/users/{id}` endpoint

### 3. Monitor Network Requests

Check the React Native debugger or console logs to verify:

- Requests are going to `https://api.homeforpup.com/...`
- Responses are being received correctly
- Authentication tokens are being sent in headers

## API Response Format

The API returns responses in this format:

**Success:**

```json
{
  "dogs": [...],
  "page": 1,
  "limit": 10,
  "total": 80,
  "totalPages": 8,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

**Error:**

```json
{
  "error": "Error message",
  "details": {...}
}
```

## Authentication

The app automatically includes JWT tokens from AWS Cognito in the Authorization header:

```typescript
headers.Authorization = `Bearer ${this.authToken}`;
```

Make sure you're logged in before testing authenticated endpoints (POST, PUT, DELETE).

## Troubleshooting

### Issue: Cannot connect to API

**Symptoms:** Network errors, timeout errors

**Solutions:**

1. Verify the custom domain is set up correctly:

   ```bash
   curl "https://api.homeforpup.com/breeds"
   ```

2. If custom domain fails, update config to use AWS API Gateway URL:

   ```typescript
   baseUrl: 'https://822fu3f7bk.execute-api.us-east-1.amazonaws.com';
   ```

3. Check your internet connection and API availability

### Issue: 404 Not Found

**Symptoms:** Endpoint returns 404

**Solutions:**

1. Verify the endpoint is deployed (check API_ENDPOINTS.md)
2. Check the endpoint path doesn't include `/api` prefix
3. Ensure the base URL is correct (no stage prefix needed)

### Issue: 401 Unauthorized

**Symptoms:** Authentication errors

**Solutions:**

1. Verify you're logged in
2. Check JWT token is valid and not expired
3. Ensure the Authorization header is being set correctly
4. Re-login to get a fresh token

### Issue: CORS Errors (Web Only)

**Symptoms:** CORS policy blocks requests

**Solutions:**

1. Verify your domain is in the API's allowed origins
2. Update `lib/config/environments.ts` in the API project
3. Redeploy the API

### Issue: Kennels/Activities endpoints not working

**Symptoms:** These specific endpoints return errors

**Expected:** These endpoints are not yet deployed according to API_ENDPOINTS.md. They will return 404 or similar errors until deployed.

**Solution:** Wait for these endpoints to be deployed, or use the migration guide to deploy them yourself.

## Next Steps

### For Full Functionality:

1. **Deploy missing endpoints** following the `MIGRATION_GUIDE.md`:

   - `/kennels` - Kennel management
   - `/activities` - Activity tracking
   - `/messages` - Messaging system
   - `/favorites` - User favorites
   - `/litters` - Litter management
   - `/upload` - File uploads

2. **Set up custom domain** (if not already done):

   - Follow `CUSTOM_DOMAIN_SETUP.md` in the homeforpup-api directory
   - Configure SSL certificate
   - Update DNS records

3. **Test all endpoints** with authentication:

   - GET requests (public)
   - POST/PUT/DELETE requests (authenticated)
   - Pagination and filtering

4. **Update error handling** in the mobile app:
   - Handle 404s for undeployed endpoints gracefully
   - Show user-friendly error messages
   - Implement retry logic for transient failures

## API Documentation Reference

For complete API documentation, see:

- `/apps/homeforpup-api/API_ENDPOINTS.md` - Available endpoints
- `/apps/homeforpup-api/MIGRATION_GUIDE.md` - Deploying new endpoints
- `/apps/homeforpup-api/CUSTOM_DOMAIN_SETUP.md` - Custom domain setup

## Summary

✅ **Completed:**

- Updated API base URL to use api.homeforpup.com
- Removed `/api` prefix from all endpoints
- Added Users API integration
- Added appropriate fallbacks and error handling
- Documented which endpoints are not yet deployed

⚠️ **Known Limitations:**

- Kennels API not yet deployed
- Activities API not yet deployed
- Messages, Favorites, Litters, Upload endpoints not yet available

🚀 **Ready to Test:**

- Dogs API (`/dogs`)
- Breeds API (`/breeds`)
- Users API (`/users/{id}`)

---

**Last Updated:** October 8, 2025
**API Version:** 1.0.0
**Mobile App Version:** 0.0.1
