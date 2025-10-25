import Config from 'react-native-config';

// Configuration for the Breeder iOS App
export const config = {
  // AWS Configuration - Use environment variables for security
  aws: {
    region: Config.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    userPoolId: Config.NEXT_PUBLIC_AWS_USER_POOL_ID || '',
    userPoolWebClientId: Config.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID || '',
  },

  // API Configuration
  api: {
    // Use direct API Gateway URL (custom domain has signature validation issues)
    // TODO: Fix custom domain configuration to support Bearer tokens
    baseUrl:
      Config.NEXT_PUBLIC_API_BASE_URL ||
      'https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development',
    timeout: 30000, // 30 seconds
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
