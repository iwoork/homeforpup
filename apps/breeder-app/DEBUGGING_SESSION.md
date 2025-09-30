# Debugging Session Issues on Vercel

## Current Status

✅ Environment variables are set correctly:
- `NEXTAUTH_SECRET`: ✅ Present
- `NEXTAUTH_URL`: ✅ Present
- Node Environment: `production`

❌ Session is not being retrieved:
- `hasSession: false`
- `hasUser: false`
- `userId: undefined`

## Next Debugging Steps

### Step 1: Use the Debug Endpoint

Visit this URL on your Vercel deployment:
```
https://your-domain.vercel.app/api/debug/session
```

This will show:
- **Session data** (if any)
- **Cookie information** (what cookies are being sent)
- **Environment variables** (what's configured)
- **Request headers** (host, forwarding info)

### Step 2: Check What the Debug Endpoint Shows

#### If you see cookies like:
```json
"cookies": [
  { "name": "__Secure-next-auth.session-token", "hasValue": true },
  { "name": "next-auth.csrf-token", "hasValue": true }
]
```
✅ **Good!** Cookies are being sent, but session is not being decoded.

**Possible causes:**
1. `NEXTAUTH_SECRET` on Vercel doesn't match what was used to sign the cookie
2. `NEXTAUTH_URL` doesn't match the domain exactly

**Solution:**
- Logout completely
- Clear all cookies
- Login again
- Test the API

#### If you see empty cookies:
```json
"cookies": []
```
❌ **Problem:** No cookies are being sent to API routes.

**Possible causes:**
1. User is not logged in
2. Cookies are not being set correctly
3. Cookie domain mismatch

**Solution:**
1. Check `/api/auth/session` - should show your session
2. Login through the UI
3. Check browser DevTools → Application → Cookies
4. Verify cookies exist with names like `__Secure-next-auth.session-token`

### Step 3: Check NEXTAUTH_URL Matches Exactly

The `NEXTAUTH_URL` must match the domain **exactly**:

```bash
# ✅ Correct
NEXTAUTH_URL=https://breeder.homeforpup.com

# ❌ Wrong - has trailing slash
NEXTAUTH_URL=https://breeder.homeforpup.com/

# ❌ Wrong - wrong protocol
NEXTAUTH_URL=http://breeder.homeforpup.com

# ❌ Wrong - different subdomain
NEXTAUTH_URL=https://www.breeder.homeforpup.com
```

Check the debug endpoint output for `nextAuthUrl` and compare with the actual URL in your browser.

### Step 4: Add NEXTAUTH_TRUST_HOST Environment Variable

On Vercel, add:
```bash
NEXTAUTH_TRUST_HOST=true
```

This is required when deploying behind proxies/load balancers (which Vercel uses).

### Step 5: Check Cookie Settings in Browser

1. Open DevTools (F12)
2. Go to **Application** → **Cookies**
3. Look for cookies starting with:
   - `__Secure-next-auth.session-token` (production)
   - `next-auth.session-token` (development)

If cookies don't exist:
- User is not logged in
- Login flow is not completing
- Check `/auth/callback` for errors

### Step 6: Test the Session Endpoint

Visit:
```
https://your-domain.vercel.app/api/auth/session
```

**Expected responses:**

#### If logged in successfully:
```json
{
  "user": {
    "id": "cognito-user-id",
    "name": "User Name",
    "email": "user@example.com",
    "userType": "breeder"
  },
  "expires": "2025-10-01T..."
}
```

#### If not logged in:
```json
{}
```

#### If error:
Check Vercel function logs for the error details.

## Common Solutions

### Solution 1: NEXTAUTH_URL Mismatch

**Symptom:** Cookies exist in browser but not sent to API routes.

**Fix:**
1. Verify `NEXTAUTH_URL` exactly matches your domain
2. No `www` if your domain doesn't use it
3. No trailing slash
4. Use `https://` in production

### Solution 2: Cookie Domain Issues

**Symptom:** Cookies are set but not accessible.

**Fix:**
1. Clear all cookies
2. Logout completely
3. Login again
4. The cookie settings in `lib/auth.ts` will handle this automatically

### Solution 3: NEXTAUTH_SECRET Changed

**Symptom:** Cookies exist but session returns null.

**Fix:**
1. The secret on Vercel must stay the same once set
2. If you changed it, all users need to re-login
3. Clear cookies and login again

### Solution 4: Missing NEXTAUTH_TRUST_HOST

**Symptom:** Session works on direct domain but not through Vercel proxy.

**Fix:**
Add to Vercel environment variables:
```bash
NEXTAUTH_TRUST_HOST=true
```

## Quick Diagnostic Checklist

Run through these checks on your Vercel deployment:

- [ ] Visit `/api/auth/session` - Does it show your session?
- [ ] Visit `/api/debug/session` - What cookies are being sent?
- [ ] Check browser cookies - Do you see `__Secure-next-auth.session-token`?
- [ ] Verify `NEXTAUTH_URL` matches browser URL exactly
- [ ] Verify `NEXTAUTH_SECRET` is set and not empty
- [ ] Add `NEXTAUTH_TRUST_HOST=true` to Vercel
- [ ] Redeploy after adding environment variables
- [ ] Logout, clear cookies, login again

## What to Send for Further Help

If still not working, provide the output from:
1. `/api/debug/session` - Full JSON response
2. `/api/auth/session` - What it returns
3. Browser cookies screenshot
4. Vercel environment variables list (without values)

