import Config from 'react-native-config';

// Debug: Log what environment variables are being read
console.log('Environment variables:', {
  AWS_REGION: Config.NEXT_PUBLIC_AWS_REGION,
  USER_POOL_ID: Config.NEXT_PUBLIC_AWS_USER_POOL_ID,
  USER_POOL_CLIENT_ID: Config.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
  ALL_CONFIG: Config,
});

// Configuration for the Breeder iOS App
export const config = {
  // AWS Configuration - Temporarily hardcoded for testing
  aws: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_M6uzx1eFZ',
    userPoolWebClientId: '3d6m93u51ggssrc7t49cjnnk53',
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
