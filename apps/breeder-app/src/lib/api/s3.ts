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
      // Use server-side upload to avoid CORS issues
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', key);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  },

  async getSignedUploadUrl(key: string, contentType: string): Promise<string> {
    try {
      const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET;
      
      if (!bucketName) {
        throw new Error('S3 bucket name is not configured. Please set NEXT_PUBLIC_AWS_S3_BUCKET environment variable.');
      }
      
      const command = new PutObjectCommand({
        Bucket: bucketName,
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
