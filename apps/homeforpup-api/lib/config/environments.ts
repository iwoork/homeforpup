export interface EnvironmentConfig {
  environment: 'development' | 'staging' | 'production';
  region: string;
  
  // API Gateway
  apiDomainName?: string;
  certificateArn?: string;
  
  // Cognito
  cognitoUserPoolId: string;
  cognitoUserPoolArn: string;
  cognitoClientId: string;
  
  // DynamoDB Tables
  tables: {
    profiles: string; // Renamed from users - contains application profile data only
    dogs: string;
    kennels: string;
    litters: string;
    messages: string;
    favorites: string;
    activities: string;
    breeds: string;
  };
  
  // S3
  uploadBucket: string;
  imageBucket?: string;
  photosBucket?: string;
  
  // Lambda
  lambda: {
    memorySize: number;
    timeout: number;
    runtime: string;
  };
  
  // CORS
  allowedOrigins: string[];
  
  // Feature flags
  features: {
    caching: boolean;
    xrayTracing: boolean;
    wafEnabled: boolean;
  };
}

export function getEnvironmentConfig(environment: string): EnvironmentConfig {
  // Validate required environment variables
  const requiredVars = {
    COGNITO_USER_POOL_ARN: process.env.COGNITO_USER_POOL_ARN,
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
  };

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error('\n❌ ERROR: Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n📝 To fix this:');
    console.error('   1. Copy the example: cp .env.example .env.development');
    console.error('   2. Edit .env.development with your AWS values');
    console.error('   3. Find your Cognito User Pool:');
    console.error('      aws cognito-idp list-user-pools --max-results 10\n');
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const baseConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID!,
    cognitoUserPoolArn: process.env.COGNITO_USER_POOL_ARN!,
    cognitoClientId: process.env.COGNITO_CLIENT_ID!,
    uploadBucket: process.env.S3_UPLOAD_BUCKET || '',
    imageBucket: process.env.S3_IMAGE_BUCKET,
    photosBucket: process.env.S3_PHOTOS_BUCKET || 'homeforpup-images',
  };

  switch (environment) {
    case 'production':
      return {
        ...baseConfig,
        environment: 'production',
        apiDomainName: 'api.homeforpup.com',
        certificateArn: process.env.ACM_CERTIFICATE_ARN,
        tables: {
          profiles: 'homeforpup-profiles-prod',
          dogs: 'homeforpup-dogs-prod',
          kennels: 'homeforpup-kennels-prod',
          litters: 'homeforpup-litters-prod',
          messages: 'homeforpup-messages-prod',
          favorites: 'homeforpup-favorites-prod',
          activities: 'homeforpup-activities-prod',
          breeds: 'homeforpup-breeds-prod',
        },
        lambda: {
          memorySize: 1024,
          timeout: 30,
          runtime: 'nodejs18.x',
        },
        allowedOrigins: [
          'https://homeforpup.com',
          'https://www.homeforpup.com',
          'https://breeder.homeforpup.com',
        ],
        features: {
          caching: true,
          xrayTracing: true,
          wafEnabled: true,
        },
      };

    case 'staging':
      return {
        ...baseConfig,
        environment: 'staging',
        apiDomainName: 'api-staging.homeforpup.com',
        certificateArn: process.env.ACM_CERTIFICATE_ARN,
        tables: {
          profiles: 'homeforpup-profiles-staging',
          dogs: 'homeforpup-dogs-staging',
          kennels: 'homeforpup-kennels-staging',
          litters: 'homeforpup-litters-staging',
          messages: 'homeforpup-messages-staging',
          favorites: 'homeforpup-favorites-staging',
          activities: 'homeforpup-activities-staging',
          breeds: 'homeforpup-breeds-staging',
        },
        lambda: {
          memorySize: 512,
          timeout: 20,
          runtime: 'nodejs18.x',
        },
        allowedOrigins: [
          'https://staging.homeforpup.com',
          'https://breeder-staging.homeforpup.com',
        ],
        features: {
          caching: false,
          xrayTracing: true,
          wafEnabled: false,
        },
      };

    case 'development':
    default:
      return {
        ...baseConfig,
        environment: 'development',
        tables: {
          profiles: 'homeforpup-profiles',
          dogs: 'homeforpup-dogs',
          kennels: 'homeforpup-kennels',
          litters: 'homeforpup-litters',
          messages: 'homeforpup-messages',
          favorites: 'homeforpup-favorites',
          activities: 'homeforpup-activities',
          breeds: 'homeforpup-breeds-simple',
        },
        lambda: {
          memorySize: 512,
          timeout: 20,
          runtime: 'nodejs18.x',
        },
        allowedOrigins: [
          'http://localhost:3000',
          'http://localhost:3001',
          'https://*.vercel.app',
        ],
        features: {
          caching: false,
          xrayTracing: false,
          wafEnabled: false,
        },
      };
  }
}

