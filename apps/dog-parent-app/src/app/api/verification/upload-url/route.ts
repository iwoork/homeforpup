import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

const getS3Url = (key: string): string => {
  const customDomain = process.env.NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN;
  return customDomain
    ? `https://${customDomain}/${key}`
    : `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
};

const ALLOWED_FILE_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

const ALLOWED_DOCUMENT_TYPES = ['license', 'certification', 'health_clearance', 'insurance', 'reference'];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const fileType = searchParams.get('fileType');
    const documentType = searchParams.get('documentType');

    if (!fileName || !fileType || !documentType) {
      return NextResponse.json(
        { error: 'Missing required params: fileName, fileType, documentType' },
        { status: 400 }
      );
    }

    const normalizedFileType = fileType.toLowerCase();
    if (!ALLOWED_FILE_TYPES[normalizedFileType]) {
      return NextResponse.json(
        { error: `Invalid fileType. Allowed: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}` },
        { status: 400 }
      );
    }

    if (!ALLOWED_DOCUMENT_TYPES.includes(documentType)) {
      return NextResponse.json(
        { error: `Invalid documentType. Allowed: ${ALLOWED_DOCUMENT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const breederId = session.user.id;
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `verification/${breederId}/${documentType}/${timestamp}-${sanitizedFileName}`;

    const contentType = ALLOWED_FILE_TYPES[normalizedFileType];
    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET || '',
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const documentUrl = getS3Url(key);

    return NextResponse.json({ uploadUrl, documentUrl });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
