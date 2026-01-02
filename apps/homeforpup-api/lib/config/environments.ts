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
    vetVisits: string;
    veterinarians: string;
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
  // Read Cognito config from root .env file (supports both NEXT_PUBLIC_ and COGNITO_ prefixes)
  const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
  
  // Try multiple environment variable names (in order of preference)
  const userPoolId = 
    process.env.COGNITO_USER_POOL_ID || 
    process.env.NEXT_PUBLIC_AWS_USER_POOL_ID || 
    process.env.AWS_USER_POOL_ID;
  
  const clientId = 
    process.env.COGNITO_CLIENT_ID || 
    process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;
  
  const userPoolArn = process.env.COGNITO_USER_POOL_ARN;
  
  // Debug logging to see what values we're getting
  console.log('\n🔍 Environment Configuration Debug:');
  console.log(`   Region: ${region}`);
  console.log(`   User Pool ID: ${userPoolId || '❌ NOT FOUND'}`);
  console.log(`   User Pool ARN: ${userPoolArn || '❌ NOT FOUND (will construct from ID)'}`);
  console.log(`   Client ID: ${clientId || '❌ NOT FOUND'}`);
  console.log(`   Environment variables checked:`);
  console.log(`     - COGNITO_USER_POOL_ID: ${process.env.COGNITO_USER_POOL_ID || 'undefined'}`);
  console.log(`     - NEXT_PUBLIC_AWS_USER_POOL_ID: ${process.env.NEXT_PUBLIC_AWS_USER_POOL_ID || 'undefined'}`);
  console.log(`     - AWS_USER_POOL_ID: ${process.env.AWS_USER_POOL_ID || 'undefined'}`);
  console.log(`     - COGNITO_USER_POOL_ARN: ${process.env.COGNITO_USER_POOL_ARN || 'undefined'}`);
  console.log(`     - COGNITO_CLIENT_ID: ${process.env.COGNITO_CLIENT_ID || 'undefined'}`);
  console.log(`     - NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID: ${process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID || 'undefined'}\n`);
  
  // Construct ARN from user pool ID if not provided
  // Format: arn:aws:cognito-idp:{region}:{account-id}:userpool/{user-pool-id}
  const awsAccountId = process.env.AWS_ACCOUNT_ID || process.env.CDK_DEFAULT_ACCOUNT || '249730500554';
  const constructedArn = userPoolId 
    ? `arn:aws:cognito-idp:${region}:${awsAccountId}:userpool/${userPoolId}`
    : null;
  
  const finalUserPoolArn = userPoolArn || constructedArn;

  // Validate required environment variables
  const missing: string[] = [];
  if (!userPoolId) missing.push('COGNITO_USER_POOL_ID or NEXT_PUBLIC_AWS_USER_POOL_ID');
  if (!finalUserPoolArn) missing.push('COGNITO_USER_POOL_ARN (or user pool ID to construct ARN)');
  if (!clientId) missing.push('COGNITO_CLIENT_ID or NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID');

  if (missing.length > 0) {
    console.error('\n❌ ERROR: Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n📝 To fix this:');
    console.error('   1. Ensure root .env file contains:');
    console.error('      NEXT_PUBLIC_AWS_USER_POOL_ID=us-east-1_xxxxx');
    console.error('      NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=xxxxx');
    console.error('   2. Or set:');
    console.error('      COGNITO_USER_POOL_ID=us-east-1_xxxxx');
    console.error('      COGNITO_USER_POOL_ARN=arn:aws:cognito-idp:...');
    console.error('      COGNITO_CLIENT_ID=xxxxx');
    console.error('   3. Find your Cognito User Pool:');
    console.error('      aws cognito-idp list-user-pools --max-results 10\n');
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log('✅ Cognito configuration loaded:', {
    userPoolId: userPoolId?.substring(0, 20) + '...',
    userPoolArn: finalUserPoolArn?.substring(0, 50) + '...',
    clientId: clientId?.substring(0, 10) + '...',
    arnSource: userPoolArn ? 'from env' : 'constructed',
  });

  const baseConfig = {
    region,
    cognitoUserPoolId: userPoolId!,
    cognitoUserPoolArn: finalUserPoolArn!,
    cognitoClientId: clientId!,
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
          vetVisits: 'homeforpup-vet-visits-prod',
          veterinarians: 'homeforpup-veterinarians-prod',
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
          vetVisits: 'homeforpup-vet-visits-staging',
          veterinarians: 'homeforpup-veterinarians-staging',
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
          vetVisits: 'homeforpup-vet-visits',
          veterinarians: 'homeforpup-veterinarians',
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

