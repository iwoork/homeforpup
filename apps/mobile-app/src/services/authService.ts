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

// Configure Amplify (this should be called in App.tsx)
export const configureAmplify = () => {
  try {
    console.log('Configuring Amplify with:', {
      userPoolId: config.aws.userPoolId,
      userPoolWebClientId: config.aws.userPoolWebClientId,
      region: config.aws.region,
    });
    
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: config.aws.userPoolId,
          userPoolClientId: config.aws.userPoolWebClientId,
          loginWith: {
            email: true,
          },
        },
      },
    });
    console.log('Amplify configured successfully');
  } catch (error) {
    console.error('Error configuring Amplify:', error);
  }
};

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
      console.log('Attempting login with:', { email, passwordLength: password.length });
      console.log('Amplify config check:', {
        region: config.aws.region,
        userPoolId: config.aws.userPoolId,
        userPoolWebClientId: config.aws.userPoolWebClientId,
      });
      
      const result = await signIn({
        username: email,
        password: password,
      });
      
      console.log('SignIn result:', result);
      
      if (result.isSignedIn) {
        // Get current user after successful sign in
        const currentUser = await getCurrentUser();
        const session = await fetchAuthSession();
        
        // Get user attributes to extract the actual name
        const userAttributes = session.tokens?.idToken?.payload;
        const userName = userAttributes?.name as string || userAttributes?.email as string || currentUser.username;
        const firstName = userAttributes?.given_name as string || userName.split(' ')[0];
        const lastName = userAttributes?.family_name as string || userName.split(' ').slice(1).join(' ');
        
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
        
        // Create user object with proper name from attributes
        const userData: User = {
          userId: currentUser.username,
          email: userAttributes?.email as string || currentUser.signInDetails?.loginId || email,
          name: userName,
          firstName: firstName,
          lastName: lastName,
          userType: userType,
          verified: true,
          accountStatus: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log('User data created:', { name: userData.name, email: userData.email });

        // Store user data and token
        // Use ID token for API authentication (not access token)
        // The backend expects ID token for user identity verification
        // In Amplify v6, the token is accessed via toString() method
        const token = session.tokens?.idToken?.toString() || '';
        
        console.log('Token extracted:', { 
          hasToken: !!token, 
          tokenLength: token.length,
          tokenType: 'idToken'
        });
        
        this.currentUser = userData;
        this.authToken = token;
        await this.storeAuthData(userData, token);
        
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
        // Get user attributes from session to extract the actual name
        const session = await fetchAuthSession();
        const userAttributes = session.tokens?.idToken?.payload;
        const userName = userAttributes?.name as string || userAttributes?.email as string || user.username;
        const firstName = userAttributes?.given_name as string || userName.split(' ')[0];
        const lastName = userAttributes?.family_name as string || userName.split(' ').slice(1).join(' ');
        
        // Try to get userType from multiple sources (same as login)
        let userType = userAttributes?.['custom:userType'] as 'breeder' | 'dog-parent' | undefined;
        if (!userType) {
          const storedUserType = await AsyncStorage.getItem('user_type') as 'breeder' | 'dog-parent' | null;
          userType = storedUserType || 'dog-parent';
        }

        const currentUser: User = {
          userId: user.username,
          email: userAttributes?.email as string || user.signInDetails?.loginId || '',
          name: userName,
          firstName: firstName,
          lastName: lastName,
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
      if (session && session.tokens?.idToken) {
        // Use ID token for API authentication (not access token)
        // The backend expects ID token for user identity verification
        // Amplify v6 JWT tokens need to be extracted correctly
        const idToken = session.tokens.idToken;
        
        // Debug: Check what we're working with
        console.log('🔍 idToken object:', {
          type: typeof idToken,
          constructor: idToken?.constructor?.name,
          hasToString: typeof idToken?.toString === 'function',
          keys: idToken ? Object.keys(idToken).slice(0, 5) : [],
        });
        
        // Try to get the JWT string - Amplify v6 returns a JWT object
        // that should have a toString() method or direct string access
        let token: string;
        if (typeof idToken === 'string') {
          token = idToken;
        } else if (typeof idToken.toString === 'function') {
          token = idToken.toString();
        } else {
          // Fallback: convert to string
          token = String(idToken);
        }
        
        console.log('getAuthToken: Token extracted:', { 
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
      const session = await fetchAuthSession({ forceRefresh: true });
      
      // Update stored token if refresh succeeded
      if (session && session.tokens?.idToken) {
        // In Amplify v6, the token is accessed via toString() method
        const token = session.tokens.idToken.toString();
        this.authToken = token;
        
        // Update stored token
        await AsyncStorage.setItem('auth_token', token);
        
        console.log('Session refreshed successfully, new token length:', token.length);
      }
      
      return true;
    } catch (error) {
      console.error('Refresh session error:', error);
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
      
      // Temporarily set token in API service for this check
      const apiService = require('./apiService').default;
      const previousToken = apiService.authToken;
      apiService.setAuthToken(token);
      
      // Try to get existing profile
      const response = await apiService.getProfileById(user.userId);
      
      if (response.success && response.data?.profile) {
        console.log('✅ Profile exists for user:', user.userId);
      } else {
        // Profile doesn't exist, create it
        console.log('📝 Profile not found, creating new profile for user:', user.userId);
        
        const newProfile = {
          userId: user.userId,
          email: user.email,
          name: user.name,
          displayName: user.displayName,
          verified: false,
          accountStatus: 'active' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Create the profile using a direct API call
        // We can't use updateProfile since it requires the profile to exist
        const createResponse = await fetch(`${apiService.baseUrl}/profiles/${user.userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(newProfile),
        });
        
        if (createResponse.ok) {
          console.log('✅ Profile created successfully for user:', user.userId);
        } else {
          const errorData = await createResponse.json();
          console.warn('⚠️ Failed to create profile:', errorData);
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
}

export default AuthService.getInstance();
