// S3 utilities (kept — still using AWS S3)
export { createS3Client, getS3Url, uploadFileToS3, getSignedUploadUrl } from './lib/s3';

// Database access: import directly from '@homeforpup/database' in server-side code
// Do NOT re-export database/postgres here — it pulls Node.js built-ins into client bundles
