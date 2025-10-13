# Debug Token Issue - Action Plan

## Current Situation

You're seeing 403 errors with tokens that have length 1226 (JWT size), but API Gateway is receiving them as hashes.

## 🔍 Critical Debugging Steps

### Step 1: Add Immediate Debug Logging

Add this temporary code to see the actual token value:

```typescript
// In apps/mobile-app/src/contexts/AuthContext.tsx
// After line where freshToken is retrieved (around line 71-75)

const freshToken = await authService.getAuthToken();
console.log('🔍 DEBUG TOKEN:', {
  hasToken: !!freshToken,
  tokenLength: freshToken?.length,
  tokenPreview: freshToken?.substring(0, 100), // First 100 chars
  isJWT: freshToken?.split('.').length === 3,
  firstChar: freshToken?.charAt(0),
  containsDots: freshToken?.includes('.'),
  dotCount: freshToken?.split('.').length,
});

// Also log what we're sending to API
apiService.setAuthToken(freshToken);
console.log('🔍 Token set in API service');
```

### Step 2: Rebuild and Check Logs

After adding the debug code:

```bash
# Reload the app
r  # Press 'r' in Metro terminal

# Or full rebuild
npx react-native start --reset-cache
```

### Step 3: Analyze the Output

You should see:

```
🔍 DEBUG TOKEN: {
  hasToken: true,
  tokenLength: 1226,
  tokenPreview: "??????????????????...",  ← WHAT IS THIS?
  isJWT: true/false,  ← IS THIS TRUE?
  firstChar: "?",  ← WHAT CHARACTER?
  containsDots: true/false,  ← SHOULD BE TRUE
  dotCount: 3  ← SHOULD BE 3
}
```

## Possible Root Causes

### Cause 1: Token is NOT a JWT (despite length)

**Symptom**: `isJWT: false` or `dotCount: 1`  
**Issue**: The token object isn't being converted to string correctly  
**Fix**: Need to check what `session.tokens.idToken` actually is

### Cause 2: Token has Extra Encoding

**Symptom**: Token starts with weird characters, not "eyJ"  
**Issue**: Token is being base64 encoded twice or transformed  
**Fix**: Remove extra encoding step

### Cause 3: Amplify v6 Returns Different Format

**Symptom**: Token exists but wrong format  
**Issue**: Amplify v6 token object structure different  
**Fix**: Access token differently

## Alternative Token Extraction

Try this in `authService.ts`:

```typescript
// Current (may not work):
const token = session.tokens.idToken.toString();

// Alternative 1: Direct string access
const token = session.tokens.idToken;

// Alternative 2: Explicit property
const token = session.tokens.idToken.jwtToken;

// Alternative 3: From payload
const token = session.tokens.idToken?.toString?.() || session.tokens.idToken;

// Add logging to see what we get:
console.log('🔍 Token object type:', typeof session.tokens.idToken);
console.log('🔍 Token object:', session.tokens.idToken);
console.log('🔍 Has toString:', typeof session.tokens.idToken.toString);
console.log('🔍 Has jwtToken:', 'jwtToken' in session.tokens.idToken);
```

## Quick Test: Check Amplify Token Structure

Add this temporary code to see the token structure:

```typescript
// In authService.ts login method, after getting session:
const session = await fetchAuthSession();
console.log('🔍 SESSION STRUCTURE:', {
  hasSession: !!session,
  hasTokens: !!session.tokens,
  hasIdToken: !!session.tokens?.idToken,
  idTokenType: typeof session.tokens?.idToken,
  idTokenKeys: session.tokens?.idToken
    ? Object.keys(session.tokens.idToken)
    : [],
  idTokenConstructor: session.tokens?.idToken?.constructor?.name,
});

// Try different extraction methods:
const method1 = session.tokens?.idToken?.toString();
const method2 = String(session.tokens?.idToken);
const method3 = session.tokens?.idToken;
const method4 = session.tokens?.idToken?.jwtToken;

console.log('🔍 EXTRACTION METHODS:', {
  method1_preview: method1?.substring(0, 30),
  method1_isJWT: method1?.split('.').length === 3,
  method2_preview: method2?.substring(0, 30),
  method2_isJWT: method2?.split('.').length === 3,
  method3_preview: String(method3)?.substring(0, 30),
  method4_preview: method4?.substring(0, 30),
});
```

## What to Look For

### Good JWT Token:

```
tokenPreview: "eyJraWQiOiJZT1wvXC9cL0lRdz09IiwiYWxnIjoi..."
isJWT: true
dotCount: 3
startsWithEyJ: true
```

### Bad Token:

```
tokenPreview: "HqgCXNnU0zjYKLScUwWQ1TIrQECQA+NVWAMnAdWcNEM="
isJWT: false
dotCount: 1
startsWithEyJ: false
```

## If Token is Actually a JWT

If the debug logs show it IS a JWT (dotCount: 3, starts with "eyJ"), but API Gateway still rejects it:

### Possible Issues:

1. **Header Format Problem**: Check if "Bearer " prefix is correct (note the space!)
2. **Token Encoding**: JWT might have special characters that need encoding
3. **Duplicate Bearer**: Check if token already has "Bearer " in it
4. **API Gateway Config**: Cognito authorizer might be misconfigured

### Debug the Header:

```typescript
// In apiService.ts, log the actual header:
console.log('🔍 AUTHORIZATION HEADER:', {
  header: headers.Authorization,
  startsWithBearer: headers.Authorization?.startsWith('Bearer '),
  headerLength: headers.Authorization?.length,
  afterBearer: headers.Authorization?.substring(7, 50), // Skip "Bearer "
});
```

## Quick Fix: Try Without String() Wrapper

Since you have `tokenLength: 1226`, the token might already be a string. Try this:

```typescript
// In apiService.ts makeRequest method:
if (this.authToken) {
  // Remove the String() wrapper - token might already be a string
  const tokenStr = this.authToken.trim();

  console.log('🔍 TOKEN DEBUG:', {
    tokenType: typeof tokenStr,
    tokenLength: tokenStr.length,
    tokenPreview: tokenStr.substring(0, 50),
    isJWT: tokenStr.split('.').length === 3,
  });

  headers.Authorization = `Bearer ${tokenStr}`;
}
```

## Emergency Workaround: Check Current Token

Run this in your app right now to see what the token looks like:

```javascript
// Add to AuthContext or any screen
import { fetchAuthSession } from 'aws-amplify/auth';

const session = await fetchAuthSession();
const token = session.tokens?.idToken;

console.log('EMERGENCY DEBUG:', {
  tokenType: typeof token,
  tokenValue: String(token).substring(0, 100),
  tokenToString: token?.toString?.().substring(0, 100),
  hasToString: typeof token?.toString === 'function',
});
```

---

## 🎯 Action Plan

1. **Add debug logging** (code above)
2. **Rebuild app** with debug code
3. **Login** and check logs
4. **Share the debug output** - especially:
   - Token preview (first 50 chars)
   - isJWT value
   - dotCount value
5. **Based on output**, we'll know exact fix needed

The issue is that despite having the right length (1226), the token format is still wrong. We need to see what it actually looks like to fix it properly.

**Can you add the debug logging and share what you see?**
