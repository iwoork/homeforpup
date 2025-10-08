import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../../../shared/s3';
import { successResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';
import { requireAuth } from '../../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const PHOTOS_BUCKET = process.env.PHOTOS_BUCKET || 'homeforpup-images';
const CLOUDFRONT_DOMAIN = 'img.homeforpup.com';

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event);

  if (!event.body) {
    throw new ApiError('Request body is required', 400);
  }

  try {
    const { fileName, contentType, uploadPath = 'dog-photos' } = JSON.parse(event.body);

    if (!fileName || !contentType) {
      throw new ApiError('fileName and contentType are required', 400);
    }

    // Validate content type
    if (!contentType.startsWith('image/')) {
      throw new ApiError('Only image files are allowed', 400);
    }

    // Generate unique file key
    const fileExtension = fileName.split('.').pop() || 'jpg';
    const key = `${uploadPath}/${uuidv4()}.${fileExtension}`;

    // Generate presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: PHOTOS_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

    // Return presigned URL and the CloudFront URL that will be used after upload
    const cloudFrontUrl = `https://${CLOUDFRONT_DOMAIN}/${key}`;

    return successResponse({
      uploadUrl,
      photoUrl: cloudFrontUrl,
      key,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid JSON in request body', 400);
    }
    console.error('Error generating presigned URL:', error);
    throw new ApiError('Failed to generate upload URL', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);
