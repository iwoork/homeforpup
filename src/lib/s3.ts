import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

// Debug S3 configuration
console.log('S3 Configuration:', {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET || '',
  hasCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
});

export const s3Operations = {
  async uploadFile(file: File, key: string): Promise<string> {
    try {
      console.log('S3 upload starting:', { key, fileType: file.type, fileSize: file.size });
      
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
      const url = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
      console.log('S3 upload successful:', url);
      return url;
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