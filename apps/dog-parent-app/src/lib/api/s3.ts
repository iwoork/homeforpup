import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

// Helper function to generate URLs with custom domain
export const getS3Url = (key: string): string => {
  const customDomain = process.env.NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN;
  return customDomain 
    ? `https://${customDomain}/${key}`
    : `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
};


export const s3Operations = {
  async uploadFile(file: File, key: string): Promise<string> {
    try {
      
      // Convert File to Uint8Array to avoid stream issues
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const command = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET || '',
        Key: key,
        Body: uint8Array,
        ContentType: file.type,
      });

      await s3Client.send(command);
      
      return getS3Url(key);
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  },

  async getSignedUploadUrl(key: string, contentType: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET || '',
        Key: key,
        ContentType: contentType,
      });

      return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (error) {
      console.error('Error getting signed upload URL:', error);
      throw error;
    }
  },
};