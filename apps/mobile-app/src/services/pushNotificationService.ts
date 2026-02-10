import { Platform, Alert, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './apiService';

const DEVICE_TOKEN_KEY = '@homeforpup:deviceToken';
const PUSH_PERMISSION_ASKED_KEY = '@homeforpup:pushPermissionAsked';

// Check if the native push notification module is available
const hasNativeModule = !!NativeModules.PushNotificationManager;

// Lazy-load PushNotificationIOS only if native module exists
let PushNotificationIOS: any = null;
if (hasNativeModule) {
  try {
    PushNotificationIOS = require('react-native').PushNotificationIOS;
  } catch {
    // Native module not available
  }
}

export interface PushNotificationPermissions {
  alert?: boolean;
  badge?: boolean;
  sound?: boolean;
}

class PushNotificationService {
  private deviceToken: string | null = null;
  private initialized = false;
  private available = false;

  /**
   * Initialize push notification listeners.
   * Call this early in the app lifecycle (e.g., App.tsx useEffect).
   */
  initialize(): void {
    if (this.initialized || Platform.OS !== 'ios') return;
    this.initialized = true;

    if (!PushNotificationIOS || !hasNativeModule) {
      console.log('📱 Push notifications: native module not available, skipping initialization');
      this.loadStoredToken();
      return;
    }

    this.available = true;

    // Listen for device token registration
    PushNotificationIOS.addEventListener('register', (token: string) => {
      console.log('📱 Push notification token received:', token.substring(0, 20) + '...');
      this.deviceToken = token;
      this.storeToken(token);
    });

    // Listen for registration errors
    PushNotificationIOS.addEventListener(
      'registrationError',
      (error: { message: string; code: number; details: any }) => {
        console.warn('📱 Push notification registration error:', error.message);
      },
    );

    // Handle foreground notifications with in-app banner
    PushNotificationIOS.addEventListener('notification', (notification: any) => {
      const message = notification.getMessage();
      const title = typeof message === 'string' ? message : message?.title || 'New Notification';
      const body = typeof message === 'string' ? message : message?.body || '';

      Alert.alert(title, body, [{ text: 'OK' }]);
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    });

    // Load stored token
    this.loadStoredToken();
  }

  /**
   * Request push notification permissions from the user.
   * Returns the granted permissions.
   */
  async requestPermissions(): Promise<PushNotificationPermissions> {
    if (Platform.OS !== 'ios' || !this.available) {
      return { alert: false, badge: false, sound: false };
    }

    try {
      const permissions = await PushNotificationIOS.requestPermissions({
        alert: true,
        badge: true,
        sound: true,
      });

      await AsyncStorage.setItem(PUSH_PERMISSION_ASKED_KEY, 'true');

      return permissions;
    } catch (error) {
      console.error('Error requesting push permissions:', error);
      return { alert: false, badge: false, sound: false };
    }
  }

  /**
   * Check current push notification permissions.
   */
  checkPermissions(): Promise<PushNotificationPermissions> {
    return new Promise((resolve) => {
      if (Platform.OS !== 'ios' || !this.available) {
        resolve({ alert: false, badge: false, sound: false });
        return;
      }
      PushNotificationIOS.checkPermissions((permissions: PushNotificationPermissions) => {
        resolve(permissions);
      });
    });
  }

  /**
   * Check if we've already asked for push permissions.
   */
  async hasAskedForPermissions(): Promise<boolean> {
    const asked = await AsyncStorage.getItem(PUSH_PERMISSION_ASKED_KEY);
    return asked === 'true';
  }

  /**
   * Register the device token with the backend.
   * Should be called after login when a token is available.
   */
  async registerWithBackend(): Promise<boolean> {
    const token = this.deviceToken || (await this.loadStoredToken());
    if (!token) {
      console.log('📱 No device token available to register');
      return false;
    }

    try {
      const response = await apiService.registerDeviceToken(token, 'ios');
      if (response.success) {
        console.log('📱 Device token registered with backend');
        return true;
      } else {
        console.warn('📱 Failed to register device token:', response.error);
        return false;
      }
    } catch (error) {
      console.error('📱 Error registering device token with backend:', error);
      return false;
    }
  }

  /**
   * Unregister the device token from the backend.
   * Should be called on logout.
   */
  async unregisterFromBackend(): Promise<void> {
    const token = this.deviceToken || (await this.loadStoredToken());
    if (!token) return;

    try {
      await apiService.unregisterDeviceToken(token);
      console.log('📱 Device token unregistered from backend');
    } catch (error) {
      console.error('📱 Error unregistering device token:', error);
    }
  }

  /**
   * Get the current device token.
   */
  getDeviceToken(): string | null {
    return this.deviceToken;
  }

  /**
   * Get the stored device token from AsyncStorage.
   */
  async getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem(DEVICE_TOKEN_KEY);
  }

  /**
   * Set the app icon badge number.
   */
  setBadgeCount(count: number): void {
    if (Platform.OS === 'ios' && this.available) {
      PushNotificationIOS.setApplicationIconBadgeNumber(count);
    }
  }

  /**
   * Clear the app icon badge.
   */
  clearBadge(): void {
    this.setBadgeCount(0);
  }

  private async storeToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(DEVICE_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing device token:', error);
    }
  }

  private async loadStoredToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(DEVICE_TOKEN_KEY);
      if (token) {
        this.deviceToken = token;
      }
      return token;
    } catch (error) {
      console.error('Error loading device token:', error);
      return null;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
