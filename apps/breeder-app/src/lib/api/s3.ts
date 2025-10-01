import { createS3Client, getS3Url, uploadFileToS3, getSignedUploadUrl } from '@homeforpup/shared-api';

const s3Client = createS3Client();


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
    return getSignedUploadUrl(key, contentType);
  },
};
