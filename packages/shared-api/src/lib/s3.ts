import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 client configuration
export const createS3Client = () => {
  return new S3Client({
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    } : undefined,
  });
};

// Helper function to generate URLs with custom domain
export const getS3Url = (key: string): string => {
  const customDomain = process.env.NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN;
  const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET;
  
  if (customDomain) {
    return `https://${customDomain}/${key}`;
  }
  
  if (bucketName) {
    return `https://${bucketName}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }
  
  throw new Error('S3 configuration not found');
};

// Upload file to S3
export const uploadFileToS3 = async (file: File, key: string): Promise<string> => {
  const s3Client = createS3Client();
  const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET;
  
  if (!bucketName) {
    throw new Error('S3 bucket name not configured');
  }
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: file.type,
  });
  
  await s3Client.send(command);
  return getS3Url(key);
};

// Get signed upload URL
export const getSignedUploadUrl = async (key: string, contentType: string): Promise<string> => {
  const s3Client = createS3Client();
  const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET;
  
  if (!bucketName) {
    throw new Error('S3 bucket name not configured');
  }
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });
  
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};
