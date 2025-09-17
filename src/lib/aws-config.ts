import { Amplify } from 'aws-amplify';

// Validate that required environment variables are present
const requiredEnvVars = {
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  userPoolId: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
  userPoolClientId: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
  s3Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const awsConfig = {
  Auth: {
    Cognito: {
      region: requiredEnvVars.region!,
      userPoolId: requiredEnvVars.userPoolId!,
      userPoolClientId: requiredEnvVars.userPoolClientId!,
      // Add these additional settings for better compatibility
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: 'code', // 'code' | 'link'
      userAttributes: {
        email: {
          required: true,
        },
      },
      allowGuestAccess: true,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
  Storage: {
    S3: {
      bucket: requiredEnvVars.s3Bucket!,
      region: requiredEnvVars.region!,
    },
  },
};

// Configure Amplify
try {
  Amplify.configure(awsConfig, { ssr: true });
  console.log('Amplify configured successfully');
} catch (error) {
  console.error('Error configuring Amplify:', error);
}

export default awsConfig;