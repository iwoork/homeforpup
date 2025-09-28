// utils/jwt-debug.ts
import jwt from 'jsonwebtoken';

export function debugJWTToken(token: string) {
  try {
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded) {
      console.log('❌ Failed to decode token');
      return;
    }

    console.log('🔍 JWT Token Debug Information:');
    console.log('=====================================');
    
    // Header information
    console.log('📋 Header:', JSON.stringify(decoded.header, null, 2));
    
    // Payload information
    const payload = decoded.payload as any;
    console.log('📝 Payload:');
    console.log('  - Token Type (token_use):', payload.token_use);
    console.log('  - Subject (sub):', payload.sub);
    console.log('  - Audience (aud):', payload.aud);
    console.log('  - Client ID (client_id):', payload.client_id);
    console.log('  - Issuer (iss):', payload.iss);
    console.log('  - Issued At:', new Date(payload.iat * 1000).toISOString());
    console.log('  - Expires At:', new Date(payload.exp * 1000).toISOString());
    console.log('  - Email:', payload.email);
    console.log('  - Name:', payload.name);
    console.log('  - Username:', payload.username);
    console.log('  - Cognito Username:', payload['cognito:username']);
    console.log('  - Scope:', payload.scope);
    
    // All available fields
    console.log('🗂️  All Available Fields:');
    Object.keys(payload).forEach(key => {
      console.log(`  - ${key}:`, payload[key]);
    });
    
    // Token validation status
    console.log('⏰ Token Status:');
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < now;
    const timeUntilExpiry = payload.exp - now;
    
    console.log(`  - Expired: ${isExpired ? '❌ YES' : '✅ NO'}`);
    if (!isExpired) {
      console.log(`  - Time until expiry: ${Math.floor(timeUntilExpiry / 60)} minutes`);
    }
    
    // Recommendations
    console.log('💡 Recommendations:');
    if (payload.token_use === 'access') {
      console.log('  - This is an ACCESS token. For user info, you might need an ID token.');
      console.log('  - Access tokens typically don\'t contain email/name info.');
      console.log('  - Consider using the ID token for user profile information.');
    }
    
    if (!payload.email && !payload.username) {
      console.log('  - No email or username found. This token may not have profile scope.');
      console.log('  - Check your Cognito app client settings for included scopes.');
    }
    
    if (!payload.aud && !payload.client_id) {
      console.log('  - No audience or client_id found. This is unusual for Cognito tokens.');
    }
    
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Error debugging JWT token:', error);
  }
}

// Add this to your auth callback or wherever you want to debug tokens
export function debugUserTokens(oidcUser: any) {
  console.log('🔐 User Token Debug:');
  console.log('==================');
  
  if (oidcUser.access_token) {
    console.log('\n📱 ACCESS TOKEN:');
    debugJWTToken(oidcUser.access_token);
  }
  
  if (oidcUser.id_token) {
    console.log('\n🆔 ID TOKEN:');
    debugJWTToken(oidcUser.id_token);
  }
  
  if (!oidcUser.access_token && !oidcUser.id_token) {
    console.log('❌ No tokens found in user object');
  }
}