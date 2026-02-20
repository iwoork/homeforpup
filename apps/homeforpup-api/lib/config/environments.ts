export interface EnvironmentConfig {
  environment: 'development' | 'staging' | 'production';
  region: string;

  // API Gateway
  apiDomainName?: string;
  certificateArn?: string;

  // Clerk
  clerkSecretKey: string;

  // Supabase PostgreSQL (replaces DynamoDB)
  databaseUrl: string;

  // DynamoDB Tables (kept temporarily for migration reference)
  tables: {
    profiles: string;
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
  const region = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';

  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  const databaseUrl = process.env.DATABASE_URL || '';

  console.log('\nEnvironment Configuration:');
  console.log(`   Region: ${region}`);
  console.log(`   Clerk Secret Key: ${clerkSecretKey ? 'SET' : 'NOT FOUND'}`);
  console.log(`   Database URL: ${databaseUrl ? 'SET' : 'NOT FOUND'}`);

  if (!clerkSecretKey) {
    console.error('\nERROR: Missing required environment variable CLERK_SECRET_KEY');
    throw new Error('Missing required environment variable: CLERK_SECRET_KEY');
  }

  console.log('Configuration loaded successfully.');

  const baseConfig = {
    region,
    clerkSecretKey,
    databaseUrl,
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
