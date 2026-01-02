import Config from 'react-native-config';

// Fallback values from root .env file (used if react-native-config fails)
const FALLBACK_CONFIG = {
  NEXT_PUBLIC_AWS_REGION: 'us-east-1',
  NEXT_PUBLIC_AWS_USER_POOL_ID: 'us-east-1_VEufvIU7M',
  NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID: '6a52j7sfc63ps0i8g6rr9fmlum',
};

// Get config value with fallback
const getConfigValue = (key: keyof typeof FALLBACK_CONFIG): string => {
  const reactNativeValue = Config[key as keyof typeof Config] as string | undefined;
  const fallbackValue = FALLBACK_CONFIG[key];
  const value = reactNativeValue || fallbackValue;
  
  if (!reactNativeValue && fallbackValue) {
    console.warn(`⚠️  react-native-config failed for ${key}, using fallback value`);
  }
  
  return value;
};

// Debug: Log what react-native-config is reading
const region = getConfigValue('NEXT_PUBLIC_AWS_REGION');
const userPoolId = getConfigValue('NEXT_PUBLIC_AWS_USER_POOL_ID');
const userPoolClientId = getConfigValue('NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID');

console.log('🔧 Configuration loaded:', {
  region,
  userPoolId: userPoolId ? `${userPoolId.substring(0, 15)}...` : 'MISSING',
  userPoolClientId: userPoolClientId ? `${userPoolClientId.substring(0, 10)}...` : 'MISSING',
  source: Config.NEXT_PUBLIC_AWS_USER_POOL_ID ? 'react-native-config' : 'fallback',
});

// Configuration for the Breeder iOS App
export const config = {
  // AWS Configuration - Use environment variables for security
  aws: {
    region: region || 'us-east-1',
    userPoolId: userPoolId || '',
    userPoolWebClientId: userPoolClientId || '',
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
