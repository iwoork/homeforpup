// S3 operations for photo uploads
export interface S3Operations {
  uploadFile(file: File, key: string): Promise<string>;
  getSignedUploadUrl(key: string, contentType: string): Promise<string>;
}

// This will be provided by the consuming application
let s3Operations: S3Operations | null = null;

export const setS3Operations = (operations: S3Operations) => {
  s3Operations = operations;
};

export const getS3Operations = (): S3Operations => {
  if (!s3Operations) {
    throw new Error('S3 operations not configured. Call setS3Operations() first.');
  }
  return s3Operations;
};
