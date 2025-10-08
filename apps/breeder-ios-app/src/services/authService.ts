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
  token?: string;
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
        
        // Create user object with proper name from attributes
        const userData: User = {
          userId: currentUser.username,
          email: userAttributes?.email as string || currentUser.signInDetails?.loginId || email,
          name: userName,
          firstName: firstName,
          lastName: lastName,
          userType: 'breeder',
          verified: true,
          accountStatus: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log('User data created:', { name: userData.name, email: userData.email });

        // Store user data and token
        // Use ID token for API authentication (not access token)
        // The backend expects ID token for user identity verification
        const tokenObj = session.tokens?.idToken;
        const token = tokenObj ? String(tokenObj) : '';
        
        console.log('Token extracted:', { 
          hasToken: !!token, 
          tokenLength: token.length,
          tokenType: 'idToken'
        });
        
        this.currentUser = userData;
        this.authToken = token;
        await this.storeAuthData(userData, token);
        
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
  }): Promise<AuthResult> {
    try {
      const result = await signUp({
        username: userData.email,
        password: userData.password,
        options: {
          userAttributes: {
            email: userData.email,
            name: userData.name,
            phone_number: userData.phone,
          },
        },
      });

      if (result.isSignUpComplete) {
        // User is already confirmed, sign them in
        return await this.login(userData.email, userData.password);
      } else {
        return {
          success: true,
          error: 'Please check your email for verification code',
        };
      }
    } catch (error: any) {
      console.error('Signup error:', error);
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

        const currentUser: User = {
          userId: user.username,
          email: userAttributes?.email as string || user.signInDetails?.loginId || '',
          name: userName,
          firstName: firstName,
          lastName: lastName,
          userType: 'breeder',
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
        const tokenObj = session.tokens.idToken;
        const token = String(tokenObj);
        
        console.log('getAuthToken: Token extracted:', { 
          hasToken: !!token, 
          tokenLength: token.length,
          tokenType: 'idToken',
          startsWithBearer: token.startsWith('Bearer')
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
      await fetchAuthSession();
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
      this.currentUser = user;
      this.authToken = token;
    } catch (error) {
      console.error('Store auth data error:', error);
    }
  }

  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
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
}

export default AuthService.getInstance();
