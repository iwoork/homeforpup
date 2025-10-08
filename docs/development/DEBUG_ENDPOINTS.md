# Debug and Testing Endpoints

## Available Debug Endpoints

### 1. Session Debug API
**URL:** `/api/debug/session`

**Method:** GET

**Purpose:** Check session status, cookies, and environment configuration

**Response:**
```json
{
  "session": { ... },
  "hasSession": true/false,
  "hasUser": true/false,
  "userId": "...",
  "userEmail": "...",
  "cookies": [...],
  "environment": {
    "hasNextAuthSecret": true/false,
    "nextAuthSecretLength": 44,
    "hasNextAuthUrl": true/false,
    "nextAuthUrl": "https://...",
    "nodeEnv": "production",
    "hasTrustHost": true/false
  },
  "headers": {...},
  "url": "...",
  "timestamp": "..."
}
```

### 2. NextAuth Session API
**URL:** `/api/auth/session`

**Method:** GET

**Purpose:** Check current NextAuth session

**Response (if authenticated):**
```json
{
  "user": {
    "id": "cognito-user-id",
    "name": "User Name",
    "email": "user@example.com",
    "userType": "breeder",
    "isVerified": true
  },
  "expires": "2025-10-02T..."
}
```

**Response (if not authenticated):**
```json
{}
```

## Debug Pages

### 1. Auth Debug Page
**URL:** `/auth/debug`

**Purpose:** Visual debug interface for authentication status

**Shows:**
- Current session data
- Authentication status
- Environment variables (client-side visible ones)

### 2. Auth Test Page
**URL:** `/auth/test`

**Purpose:** Test authentication flow

## Common Errors

### Error: "This action with HTTP GET is not supported by NextAuth.js"

**Cause:** Trying to access an invalid NextAuth route

**Invalid routes:**
- `/api/auth/debug` ❌ (conflicts with NextAuth catch-all)
- `/api/auth/test` ❌ (conflicts with NextAuth catch-all)
- `/api/auth/custom` ❌ (conflicts with NextAuth catch-all)

**Valid routes:**
- `/api/debug/session` ✅ (outside NextAuth namespace)
- `/api/debug/auth` ✅ (outside NextAuth namespace)
- `/auth/debug` ✅ (page route, not API)
- `/api/auth/session` ✅ (built-in NextAuth endpoint)
- `/api/auth/signin` ✅ (built-in NextAuth endpoint)
- `/api/auth/signout` ✅ (built-in NextAuth endpoint)
- `/api/auth/callback/*` ✅ (built-in NextAuth endpoint)

## NextAuth Built-in Endpoints

These are automatically available:

- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - Get CSRF token
- `GET /api/auth/providers` - List auth providers
- `GET /api/auth/signin` - Sign in page (or redirect)
- `POST /api/auth/signin/:provider` - Sign in with provider
- `GET /api/auth/signout` - Sign out page
- `POST /api/auth/signout` - Sign out action
- `GET /api/auth/callback/:provider` - OAuth callback

## Debugging Session Issues

### Step 1: Check Session
```bash
curl https://your-domain.vercel.app/api/auth/session
```

### Step 2: Check Debug Endpoint
```bash
curl https://your-domain.vercel.app/api/debug/session
```

### Step 3: Compare Results
- If `/api/auth/session` is empty but you're logged in → Cookie issue
- If `/api/debug/session` shows no cookies → Cookies not being sent
- If environment vars are missing → Add them to Vercel

## Important Notes

1. **Never add custom routes under `/api/auth/`** - This namespace is reserved for NextAuth
2. **Use `/api/debug/` or similar** for custom debug endpoints
3. **Page routes like `/auth/debug`** are fine (they're not API routes)

