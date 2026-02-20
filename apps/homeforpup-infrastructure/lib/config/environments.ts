export interface EnvironmentConfig {
  environment: 'development' | 'staging' | 'production';
  region: string;
  
  // DynamoDB Tables
  tables: {
    profiles: string;
    dogs: string;
    kennels: string;
    litters: string;
    vetVisits: string;
    veterinarians: string;
    messages: string;
    messageThreads: string;
    favorites: string;
    activities: string;
    breeds: string;
    breedsSimple: string;
  };
  
  // S3 Buckets
  imageBucket: string;
  uploadBucket: string;
  
  // Clerk
  clerkSecretKey?: string;
}

export function getEnvironmentConfig(environment: string): EnvironmentConfig {
  const region = process.env.AWS_REGION || 'us-east-1';
  const env = environment as 'development' | 'staging' | 'production';
  
  const baseConfig = {
    region,
    environment: env,
  };

  switch (env) {
    case 'production':
      return {
        ...baseConfig,
        tables: {
          profiles: 'homeforpup-profiles-prod',
          dogs: 'homeforpup-dogs-prod',
          kennels: 'homeforpup-kennels-prod',
          litters: 'homeforpup-litters-prod',
          vetVisits: 'homeforpup-vet-visits-prod',
          veterinarians: 'homeforpup-veterinarians-prod',
          messages: 'homeforpup-messages-prod',
          messageThreads: 'homeforpup-message-threads-prod',
          favorites: 'homeforpup-favorites-prod',
          activities: 'homeforpup-activities-prod',
          breeds: 'homeforpup-breeds-prod',
          breedsSimple: 'homeforpup-breeds-simple-prod',
        },
        imageBucket: process.env.S3_IMAGE_BUCKET || 'homeforpup-images-prod',
        uploadBucket: process.env.S3_UPLOAD_BUCKET || 'homeforpup-uploads-prod',
        clerkSecretKey: process.env.CLERK_SECRET_KEY,
      };

    case 'staging':
      return {
        ...baseConfig,
        tables: {
          profiles: 'homeforpup-profiles-staging',
          dogs: 'homeforpup-dogs-staging',
          kennels: 'homeforpup-kennels-staging',
          litters: 'homeforpup-litters-staging',
          vetVisits: 'homeforpup-vet-visits-staging',
          veterinarians: 'homeforpup-veterinarians-staging',
          messages: 'homeforpup-messages-staging',
          messageThreads: 'homeforpup-message-threads-staging',
          favorites: 'homeforpup-favorites-staging',
          activities: 'homeforpup-activities-staging',
          breeds: 'homeforpup-breeds-staging',
          breedsSimple: 'homeforpup-breeds-simple-staging',
        },
        imageBucket: process.env.S3_IMAGE_BUCKET || 'homeforpup-images-staging',
        uploadBucket: process.env.S3_UPLOAD_BUCKET || 'homeforpup-uploads-staging',
        clerkSecretKey: process.env.CLERK_SECRET_KEY,
      };

    case 'development':
    default:
      return {
        ...baseConfig,
        tables: {
          profiles: 'homeforpup-profiles',
          dogs: 'homeforpup-dogs',
          kennels: 'homeforpup-kennels',
          litters: 'homeforpup-litters',
          vetVisits: 'homeforpup-vet-visits',
          veterinarians: 'homeforpup-veterinarians',
          messages: 'homeforpup-messages',
          messageThreads: 'homeforpup-message-threads',
          favorites: 'homeforpup-favorites',
          activities: 'homeforpup-activities',
          breeds: 'homeforpup-breeds',
          breedsSimple: 'homeforpup-breeds-simple',
        },
        imageBucket: process.env.S3_IMAGE_BUCKET || 'homeforpup-images',
        uploadBucket: process.env.S3_UPLOAD_BUCKET || 'homeforpup-uploads',
        clerkSecretKey: process.env.CLERK_SECRET_KEY,
      };
  }
}


