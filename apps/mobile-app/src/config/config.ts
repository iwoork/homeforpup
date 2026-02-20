import Config from 'react-native-config';

// Configuration for the Breeder iOS App
export const config = {
  // Clerk Configuration
  clerk: {
    publishableKey: Config.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  },

  // API Configuration
  api: {
    baseUrl:
      Config.NEXT_PUBLIC_API_BASE_URL ||
      'https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development',
    timeout: 30000,
  },

  // App Configuration
  app: {
    name: 'HomeForPup Breeder',
    version: '1.0.0',
    buildNumber: '1',
  },

  // Feature Flags
  features: {
    enablePushNotifications: true,
    enableBiometricAuth: false,
    enableOfflineMode: true,
  },

  // UI Configuration
  ui: {
    enableDarkMode: false,
    defaultLanguage: 'en',
    animationDuration: 300,
  },
};

export default config;
