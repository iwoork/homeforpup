import AsyncStorage from '@react-native-async-storage/async-storage';
import { Amplify } from 'aws-amplify';
import { 
  signIn, 
  signUp, 
  signOut, 
  confirmSignUp, 
  resetPassword, 
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession
} from 'aws-amplify/auth';
import { User, ApiResponse } from '../types';
import config from '../config/config';

// Track if Amplify has been configured
let amplifyConfigured = false;

// Configure Amplify (this should be called in App.tsx)
export const configureAmplify = () => {
  try {
    // Prevent double configuration
    if (amplifyConfigured) {
      console.log('⚠️  Amplify already configured, skipping...');
      return;
    }

    console.log('🔧 Configuring Amplify with:', {
      userPoolId: config.aws.userPoolId,
      userPoolWebClientId: config.aws.userPoolWebClientId,
      region: config.aws.region,
    });
    
    // Validate configuration before setting up Amplify
    if (!config.aws.userPoolId || !config.aws.userPoolWebClientId) {
      const errorMsg = `❌ Missing Cognito configuration!
      
userPoolId: ${config.aws.userPoolId || 'MISSING'}
userPoolClientId: ${config.aws.userPoolWebClientId || 'MISSING'}
region: ${config.aws.region || 'MISSING'}

Please ensure:
1. The root .env file contains NEXT_PUBLIC_AWS_USER_POOL_ID and NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID
2. The apps/mobile-app/.env file exists and contains the Cognito configuration
3. The app has been rebuilt after updating .env files
4. Metro bundler has been restarted with --reset-cache`;
      
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Configure Amplify with the correct format for v6
    const amplifyConfig = {
      Auth: {
        Cognito: {
          userPoolId: config.aws.userPoolId.trim(),
          userPoolClientId: config.aws.userPoolWebClientId.trim(),
          loginWith: {
            email: true,
          },
        },
      },
    };

    console.log('🔧 Amplify config object:', JSON.stringify(amplifyConfig, null, 2));
    
    Amplify.configure(amplifyConfig);
    
    // Verify the configuration was set
    try {
      const currentConfig = Amplify.getConfig();
      console.log('✅ Amplify current config:', JSON.stringify(currentConfig, null, 2));
    } catch (configError) {
      console.warn('⚠️  Could not retrieve Amplify config (this is normal in some cases):', configError);
    }
    
    amplifyConfigured = true;
    console.log('✅ Amplify configured successfully');
  } catch (error) {
    console.error('❌ Error configuring Amplify:', error);
    amplifyConfigured = false;
    throw error; // Re-throw to prevent silent failures
  }
};

// Export function to check if Amplify is configured
export const isAmplifyConfigured = () => amplifyConfigured;

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
  token?: string;
  requiresVerification?: boolean;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private authToken: string | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Ensure Amplify is configured before attempting login
      if (!amplifyConfigured) {
        console.log('⚠️  Amplify not configured, attempting to configure now...');
        configureAmplify();
      }

      console.log('Attempting login with:', { email, passwordLength: password.length });
      console.log('Amplify config check:', {
        region: config.aws.region,
        userPoolId: config.aws.userPoolId,
        userPoolWebClientId: config.aws.userPoolWebClientId,
        amplifyConfigured,
      });
      
      // Double-check configuration values
      if (!config.aws.userPoolId || !config.aws.userPoolWebClientId) {
        throw new Error('Cognito configuration is missing. Please check your .env file.');
      }
      
      const result = await signIn({
        username: email,
        password: password,
      });
      
      console.log('SignIn result:', result);
      
      if (result.isSignedIn) {
        // Get current user after successful sign in
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        
        // Get user attributes to extract the actual name and profile data
        const userAttributes = session.tokens?.idToken?.payload;
        
        // IMPORTANT: Use 'sub' claim as userId (not username)
        // The 'sub' claim is the unique user identifier that API Gateway uses for authorization
        // This must match the userId in API requests, otherwise Lambda will return 403
        const userId = (userAttributes?.sub as string) || currentUser.username;
        
        const userName = userAttributes?.name as string || userAttributes?.email as string || currentUser.username;
        const firstName = userAttributes?.given_name as string || userName.split(' ')[0];
        const lastName = userAttributes?.family_name as string || userName.split(' ').slice(1).join(' ');
        
        // Extract additional profile fields from Cognito
        const location = userAttributes?.address as string || undefined;
        const bio = userAttributes?.profile as string || undefined;
        const phone = userAttributes?.phone_number as string || undefined;
        const profileImage = userAttributes?.picture as string || undefined;
        
        // Try to get userType from multiple sources:
        // 1. From Cognito custom attribute (if configured)
        // 2. From stored local data (fallback)
        // 3. Default to 'dog-parent' (most users are looking for puppies)
        let userType = userAttributes?.['custom:userType'] as 'breeder' | 'dog-parent' | undefined;
        
        if (!userType) {
          // Check if we have it stored locally from previous session
          const storedUserType = await AsyncStorage.getItem('user_type') as 'breeder' | 'dog-parent' | null;
          userType = storedUserType || 'dog-parent';
          console.log('⚠️ userType not in Cognito token, using stored value:', userType);
        } else {
          console.log('✅ userType from Cognito:', userType);
        }
        
        console.log('🔑 User ID from token sub claim:', {
          sub: userAttributes?.sub,
          username: currentUser.username,
          usingSub: userAttributes?.sub || 'fallback to username',
          userId: userId,
          warning: !userAttributes?.sub ? '⚠️ No sub claim in token - using username fallback' : null,
        });
        
        // Create user object with proper name and profile data from Cognito attributes
        const userData: User = {
          userId: userId, // Use 'sub' claim, not username - MUST match token.sub for API calls
          email: userAttributes?.email as string || currentUser.signInDetails?.loginId || email,
          name: userName,
          firstName: firstName,
          lastName: lastName,
          location: location,
          bio: bio,
          phone: phone,
          profileImage: profileImage,
          userType: userType,
          verified: true,
          accountStatus: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log('User data created:', { name: userData.name, email: userData.email });

        // Store user data and token
        // API Gateway Cognito User Pool Authorizer expects ID tokens (not access tokens)
        // ID tokens contain user identity claims (sub, email, etc.) that the authorizer validates
        const idToken = session.tokens?.idToken;
        let token: string = '';
        
        if (idToken) {
          if (typeof idToken === 'string') {
            token = idToken;
          } else if (typeof idToken.toString === 'function') {
            token = idToken.toString();
          } else {
            token = String(idToken);
          }
          
          // Decode token to verify sub claim matches userId
          let tokenSub: string | null = null;
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payload = parts[1];
              const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
              if (typeof Buffer !== 'undefined') {
                const decodedPayload = JSON.parse(Buffer.from(paddedPayload, 'base64').toString('utf8'));
                tokenSub = decodedPayload.sub;
              }
            }
          } catch (e) {
            console.warn('Could not decode token to verify sub:', e);
          }
          
          console.log('Token extracted (ID token):', { 
            hasToken: !!token, 
            tokenLength: token.length,
            tokenType: 'idToken',
            isJWT: token.split('.').length === 3,
            startsWithEyJ: token.startsWith('eyJ'),
            tokenPreview: token.substring(0, 50) + '...',
            tokenSub: tokenSub,
            userId: userId,
            subMatches: tokenSub === userId ? '✅ MATCH' : `❌ MISMATCH (token.sub=${tokenSub}, userId=${userId})`,
          });
          
          // CRITICAL: Verify token sub matches userId
          if (tokenSub && tokenSub !== userId) {
            console.error('❌ CRITICAL: Token sub does not match userId!', {
              tokenSub,
              userId,
              warning: 'This will cause 403 errors in API calls',
            });
            // Use token sub as the source of truth
            userData.userId = tokenSub;
            console.log('✅ Updated userId to match token sub:', tokenSub);
          }
        }
        
        if (!token) {
          console.error('❌ No ID token extracted from session!');
          throw new Error('Failed to extract authentication token');
        }
        
        this.currentUser = userData;
        this.authToken = token;
        await this.storeAuthData(userData, token);
        
        // Set token in API service immediately after login
        const apiService = require('./apiService').default;
        apiService.setAuthToken(token);
        console.log('✅ Token set in API service after login');
        
        // Ensure profile exists in database (create if doesn't exist)
        await this.ensureProfileExists(userData, token);
        
        return {
          success: true,
          user: userData,
          token: token,
        };
      } else {
        return {
          success: false,
          error: 'Login failed',
        };
      }
    } catch (error: any) {
      console.error('Login error details:', {
        message: error?.message || 'Unknown error',
        name: error?.name || 'Unknown error type',
        code: error?.code || 'No error code',
        stack: error?.stack || 'No stack trace',
        toString: error?.toString() || 'Cannot stringify error',
      });
      return {
        success: false,
        error: error?.message || 'Login failed',
      };
    }
  }

  async signup(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    location?: string;
    userType?: 'breeder' | 'dog-parent';
  }): Promise<AuthResult> {
    try {
      // Format phone number for Cognito (E.164 format required)
      let formattedPhone = userData.phone;
      if (formattedPhone && !formattedPhone.startsWith('+')) {
        // Remove any non-digit characters
        const digitsOnly = formattedPhone.replace(/\D/g, '');
        // Assume US number if 10 digits
        if (digitsOnly.length === 10) {
          formattedPhone = `+1${digitsOnly}`;
        } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
          formattedPhone = `+${digitsOnly}`;
        } else {
          // For other formats, add + at the beginning
          formattedPhone = `+${digitsOnly}`;
        }
      }

      const userAttributes: any = {
        email: userData.email,
        name: userData.name,
        'custom:userType': userData.userType || 'dog-parent',
      };

      // Only add phone if it's provided and properly formatted
      if (formattedPhone) {
        userAttributes.phone_number = formattedPhone;
      }

      const result = await signUp({
        username: userData.email,
        password: userData.password,
        options: {
          userAttributes,
        },
      });

      if (result.isSignUpComplete) {
        // User is already confirmed, sign them in
        return await this.login(userData.email, userData.password);
      } else {
        // Signup successful, but email verification is required
        return {
          success: true,
          requiresVerification: true,
          message: 'Please check your email for verification code',
        };
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle case where user already exists but may not be verified
      if (error.name === 'UsernameExistsException' || error.message?.includes('User already exists')) {
        // User already signed up, they just need to verify their email
        // Resend the verification code
        try {
          const { resendSignUpCode } = await import('aws-amplify/auth');
          await resendSignUpCode({ username: userData.email });
          
          return {
            success: true,
            requiresVerification: true,
            message: 'This email is already registered. We\'ve resent the verification code to your email.',
          };
        } catch (resendError: any) {
          console.error('Error resending verification code:', resendError);
          return {
            success: false,
            error: 'This email is already registered. Please try logging in or contact support if you need help.',
          };
        }
      }
      
      return {
        success: false,
        error: error.message || 'Signup failed',
      };
    }
  }

  async confirmSignup(email: string, code: string): Promise<AuthResult> {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });
      return { success: true };
    } catch (error: any) {
      console.error('Confirm signup error:', error);
      return {
        success: false,
        error: error.message || 'Verification failed',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut();
      await this.clearAuthData();
      this.currentUser = null;
      this.authToken = null;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local data even if server logout fails
      await this.clearAuthData();
      this.currentUser = null;
      this.authToken = null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      if (this.currentUser) {
        return this.currentUser;
      }

      const user = await getCurrentUser();
      if (user) {
        // Get user attributes from session to extract the actual name and profile data
        const session = await fetchAuthSession();
        const userAttributes = session.tokens?.idToken?.payload;
        
        // IMPORTANT: Use 'sub' claim as userId (not username)
        // The 'sub' claim is the unique user identifier that API Gateway uses for authorization
        const userId = (userAttributes?.sub as string) || user.username;
        
        const userName = userAttributes?.name as string || userAttributes?.email as string || user.username;
        const firstName = userAttributes?.given_name as string || userName.split(' ')[0];
        const lastName = userAttributes?.family_name as string || userName.split(' ').slice(1).join(' ');
        
        // Extract additional profile fields from Cognito
        const location = userAttributes?.address as string || undefined;
        const bio = userAttributes?.profile as string || undefined;
        const phone = userAttributes?.phone_number as string || undefined;
        const profileImage = userAttributes?.picture as string || undefined;
        
        // Try to get userType from multiple sources (same as login)
        let userType = userAttributes?.['custom:userType'] as 'breeder' | 'dog-parent' | undefined;
        if (!userType) {
          const storedUserType = await AsyncStorage.getItem('user_type') as 'breeder' | 'dog-parent' | null;
          userType = storedUserType || 'dog-parent';
        }

        const currentUser: User = {
          userId: userId, // Use 'sub' claim, not username
          email: userAttributes?.email as string || user.signInDetails?.loginId || '',
          name: userName,
          firstName: firstName,
          lastName: lastName,
          location: location,
          bio: bio,
          phone: phone,
          profileImage: profileImage,
          userType: userType,
          verified: true,
          accountStatus: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        this.currentUser = currentUser;
        return currentUser;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      if (this.authToken) {
        return this.authToken;
      }

      const session = await fetchAuthSession();
      
      // API Gateway Cognito User Pool Authorizer expects ID tokens (not access tokens)
      // ID tokens contain user identity claims (sub, email, etc.) that the authorizer validates
      if (session && session.tokens?.idToken) {
        const idToken = session.tokens.idToken;
        
        let token: string;
        if (typeof idToken === 'string') {
          token = idToken;
        } else if (typeof idToken.toString === 'function') {
          token = idToken.toString();
        } else {
          token = String(idToken);
        }
        
        console.log('getAuthToken: ID token extracted:', { 
          hasToken: !!token, 
          tokenLength: token.length,
          tokenType: 'idToken',
          isJWT: token.split('.').length === 3,
          startsWithEyJ: token.startsWith('eyJ'),
          tokenPreview: token.substring(0, 50) + '...'
        });
        
        this.authToken = token;
        return token;
      }
      
      return null;
    } catch (error) {
      console.error('Get auth token error:', error);
      return null;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      if (session && session.tokens?.accessToken) {
        const accessToken = session.tokens.accessToken;
        
        // Try to get the JWT string - Amplify v6 returns a JWT object
        let token: string;
        if (typeof accessToken === 'string') {
          token = accessToken;
        } else if (typeof accessToken.toString === 'function') {
          token = accessToken.toString();
        } else {
          // Fallback: convert to string
          token = String(accessToken);
        }
        
        console.log('getAccessToken: Token extracted:', { 
          hasToken: !!token, 
          tokenLength: token.length,
          tokenType: 'accessToken',
          isJWT: token.split('.').length === 3,
          startsWithEyJ: token.startsWith('eyJ'),
          tokenPreview: token.substring(0, 50) + '...'
        });
        
        return token;
      }
      return null;
    } catch (error) {
      console.error('Get access token error:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  async refreshSession(): Promise<boolean> {
    try {
      console.log('🔄 Attempting to refresh session...');
      
      const session = await fetchAuthSession({ forceRefresh: true });
      
      console.log('🔍 Session tokens available:', {
        hasIdToken: !!session.tokens?.idToken,
        hasAccessToken: !!session.tokens?.accessToken,
        hasRefreshToken: !!session.tokens?.refreshToken,
      });
      
      // Update stored token if refresh succeeded
      // API Gateway Cognito User Pool Authorizer expects ID tokens (not access tokens)
      // ID tokens contain user identity claims (sub, email, etc.) that the authorizer validates
      let token: string | null = null;
      let tokenType = 'unknown';
      
      if (session && session.tokens?.idToken) {
        const idToken = session.tokens.idToken;
        if (typeof idToken === 'string') {
          token = idToken;
        } else if (typeof idToken.toString === 'function') {
          token = idToken.toString();
        } else {
          token = String(idToken);
        }
        tokenType = 'idToken';
        console.log('✅ Using ID token from refreshed session (required for API Gateway Cognito authorizer)');
      }
      
      if (token) {
        this.authToken = token;
        
        // Update stored token
        await AsyncStorage.setItem('auth_token', token);
        
        console.log('✅ Session refreshed successfully, new token length:', token.length);
        console.log('🔍 Token details:', {
          tokenType,
          tokenLength: token.length,
          tokenPreview: token.substring(0, 50),
          isJWT: token.split('.').length === 3,
        });
        
        return true;
      }
      
      console.warn('⚠️ Session refresh returned no token');
      return false;
    } catch (error: any) {
      console.error('❌ Refresh session error:', {
        message: error?.message,
        name: error?.name,
        code: error?.code,
      });
      
      // If refresh token expired or invalid, clear auth data
      // User will need to log in again
      if (
        error?.message?.includes('expired') ||
        error?.message?.includes('invalid') ||
        error?.name === 'NotAuthorizedException' ||
        error?.code === 'NotAuthorizedException'
      ) {
        console.log('🔓 Refresh token expired, clearing auth data - user needs to login again');
        await this.clearAuthData();
        this.currentUser = null;
        this.authToken = null;
      }
      
      return false;
    }
  }

  async resetPassword(email: string): Promise<AuthResult> {
    try {
      await resetPassword({
        username: email,
      });
      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message || 'Password reset failed',
      };
    }
  }

  async confirmResetPassword(email: string, code: string, newPassword: string): Promise<AuthResult> {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: newPassword,
      });
      return { success: true };
    } catch (error: any) {
      console.error('Confirm reset password error:', error);
      return {
        success: false,
        error: error.message || 'Password reset confirmation failed',
      };
    }
  }

  private async storeAuthData(user: User, token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      // Store userType separately as a backup
      if (user.userType) {
        await AsyncStorage.setItem('user_type', user.userType);
      }
      this.currentUser = user;
      this.authToken = token;
      console.log('✅ Stored auth data with userType:', user.userType);
    } catch (error) {
      console.error('Store auth data error:', error);
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      await AsyncStorage.removeItem('user_type');
    } catch (error) {
      console.error('Clear auth data error:', error);
    }
  }

  async loadStoredAuthData(): Promise<{ user: User | null; token: string | null }> {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('user_data'),
      ]);

      if (token && userData) {
        const user = JSON.parse(userData);
        
        // CRITICAL: Verify cached userId matches token's sub claim
        // If they don't match, update userId to use token's sub
        let tokenSub: string | null = null;
        try {
          const parts = String(token).split('.');
          if (parts.length === 3) {
            const payload = parts[1];
            const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
            if (typeof Buffer !== 'undefined') {
              const decodedPayload = JSON.parse(Buffer.from(paddedPayload, 'base64').toString('utf8'));
              tokenSub = decodedPayload.sub;
            }
          }
        } catch (e) {
          console.warn('Could not decode token to verify sub:', e);
        }
        
        if (tokenSub && tokenSub !== user.userId) {
          console.warn('⚠️ Cached userId does not match token sub, updating...', {
            cachedUserId: user.userId,
            tokenSub: tokenSub,
          });
          user.userId = tokenSub; // Update to use token's sub claim
          // Save updated user data
          await AsyncStorage.setItem('user_data', JSON.stringify(user));
          console.log('✅ Updated cached userId to match token sub:', tokenSub);
        }
        
        this.currentUser = user;
        this.authToken = token;
        return { user, token };
      }

      return { user: null, token: null };
    } catch (error) {
      console.error('Load stored auth data error:', error);
      return { user: null, token: null };
    }
  }

  /**
   * Ensures a profile exists in the database for this Cognito user
   * Creates a basic profile record if it doesn't exist
   */
  private async ensureProfileExists(user: User, token: string): Promise<void> {
    try {
      console.log('🔍 Checking if profile exists for user:', user.userId);
      
      // Import API service and set token
      const apiService = require('./apiService').default;
      const previousToken = apiService.authToken;
      apiService.setAuthToken(token);
      
      console.log('🔑 Token set in API service:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPreview: token?.substring(0, 30) + '...',
      });
      
      // Try to get existing profile
      const response = await apiService.getProfileById(user.userId);
      
      if (response.success && response.data?.profile) {
        console.log('✅ Profile exists for user:', user.userId);
      } else {
        // Profile doesn't exist, create it using updateProfile (which does upsert)
        console.log('📝 Profile not found, creating new profile for user:', user.userId);
        
        const newProfile = {
          userId: user.userId,
          email: user.email,
          name: user.name,
          displayName: user.displayName || user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType || 'dog-parent',
          verified: false,
          accountStatus: 'active' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        console.log('📤 Creating profile with data:', {
          userId: newProfile.userId,
          email: newProfile.email,
          name: newProfile.name,
          userType: newProfile.userType,
        });
        
        // Use updateProfile which does upsert (create or update)
        const createResponse = await apiService.updateProfile(user.userId, newProfile);
        
        if (createResponse.success) {
          console.log('✅ Profile created successfully for user:', user.userId);
        } else {
          console.warn('⚠️ Failed to create profile:', createResponse.error || createResponse.message);
        }
      }
      
      // Restore previous token
      apiService.setAuthToken(previousToken);
    } catch (error) {
      console.error('❌ Error ensuring profile exists:', error);
      // Don't fail login if profile creation fails
      // User can still use the app, profile will be created on first update
    }
  }

  // Method to manually update userType (useful for existing users)
  async updateUserType(userType: 'breeder' | 'dog-parent'): Promise<boolean> {
    try {
      console.log('📝 Manually updating userType to:', userType);
      
      // Store in AsyncStorage
      await AsyncStorage.setItem('user_type', userType);
      
      // Update current user object
      if (this.currentUser) {
        this.currentUser.userType = userType;
        await AsyncStorage.setItem('user_data', JSON.stringify(this.currentUser));
        console.log('✅ UserType updated successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating userType:', error);
      return false;
    }
  }

  /**
   * Updates Cognito user attributes (profile fields)
   * This should be called whenever profile data is updated to keep Cognito in sync
   */
  async updateUserAttributes(attributes: {
    name?: string;
    given_name?: string;
    family_name?: string;
    address?: string;  // location
    profile?: string;  // bio
    phone_number?: string;
    picture?: string;  // profileImage
  }): Promise<boolean> {
    try {
      console.log('📝 Updating Cognito user attributes:', Object.keys(attributes));
      
      const { updateUserAttributes } = await import('aws-amplify/auth');
      
      // Filter out undefined values
      const filteredAttributes: any = {};
      Object.entries(attributes).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          filteredAttributes[key] = value;
        }
      });
      
      if (Object.keys(filteredAttributes).length === 0) {
        console.log('⚠️ No attributes to update');
        return true;
      }
      
      await updateUserAttributes({
        userAttributes: filteredAttributes,
      });
      
      console.log('✅ Cognito user attributes updated successfully');
      
      // Update local user object with the new attributes
      if (this.currentUser) {
        if (attributes.name) this.currentUser.name = attributes.name;
        if (attributes.given_name) this.currentUser.firstName = attributes.given_name;
        if (attributes.family_name) this.currentUser.lastName = attributes.family_name;
        if (attributes.address) this.currentUser.location = attributes.address;
        if (attributes.profile) this.currentUser.bio = attributes.profile;
        if (attributes.phone_number) this.currentUser.phone = attributes.phone_number;
        if (attributes.picture) this.currentUser.profileImage = attributes.picture;
        
        // Update stored user data
        await AsyncStorage.setItem('user_data', JSON.stringify(this.currentUser));
      }
      
      return true;
    } catch (error) {
      console.error('Error updating Cognito user attributes:', error);
      return false;
    }
  }
}

export default AuthService.getInstance();
