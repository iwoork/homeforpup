// DynamoDB utilities
export { createDynamoClient, createDocClient, getTableNames } from './lib/dynamodb';

// S3 utilities
export { createS3Client, getS3Url, uploadFileToS3, getSignedUploadUrl } from './lib/s3';
