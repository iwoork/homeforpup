import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const BREEDERS_TABLE = process.env.BREEDERS_TABLE_NAME || 'homeforpup-breeders';
const REVIEWS_TABLE = process.env.REVIEWS_TABLE_NAME || 'homeforpup-reviews';

// GET /api/breeders/[id]/trust-score - Calculate and return trust score
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const breederId = parseInt(params.id);

    if (isNaN(breederId)) {
      return NextResponse.json(
        { error: 'Invalid breeder ID' },
        { status: 400 }
      );
    }

    // Fetch breeder data
    const breederResult = await dynamodb.send(
      new GetCommand({
        TableName: BREEDERS_TABLE,
        Key: { id: breederId },
      })
    );

    if (!breederResult.Item) {
      return NextResponse.json(
        { error: 'Breeder not found' },
        { status: 404 }
      );
    }

    const breeder = breederResult.Item;

    // Fetch reviews for this breeder to calculate average rating
    const reviewsResult = await dynamodb.send(
      new QueryCommand({
        TableName: REVIEWS_TABLE,
        KeyConditionExpression: 'breederId = :breederId',
        ExpressionAttributeValues: {
          ':breederId': String(breederId),
        },
      })
    );

    const reviews = reviewsResult.Items || [];
    const reviewCount = reviews.length;

    // Calculate average rating from actual reviews, fall back to breeder.rating
    let avgRating: number;
    if (reviewCount > 0) {
      const sum = reviews.reduce((acc, r) => acc + (r.rating as number), 0);
      avgRating = sum / reviewCount;
    } else {
      avgRating = (breeder.rating as number) || 0;
    }

    // --- Trust Score Calculation ---
    // Verified status: 30 points
    const isVerified = breeder.verified === 'True' || breeder.verified === true;
    const verifiedScore = isVerified ? 30 : 0;

    // Average review rating: 25 points (scaled from 1-5 to 0-25)
    const ratingScore = avgRating > 0 ? Math.round(((avgRating - 1) / 4) * 25) : 0;

    // Number of reviews: 15 points (max at 10+ reviews)
    const effectiveReviewCount = reviewCount > 0 ? reviewCount : (breeder.review_count as number) || 0;
    const reviewsScore = Math.round(Math.min(effectiveReviewCount / 10, 1) * 15);

    // Response rate: 15 points
    const responseRate = (breeder.response_rate as number) || 0;
    const responseScore = Math.round(responseRate * 15);

    // Years of experience: 15 points (max at 10+ years)
    const experience = (breeder.experience as number) || 0;
    const experienceScore = Math.round(Math.min(experience / 10, 1) * 15);

    const total = verifiedScore + ratingScore + reviewsScore + responseScore + experienceScore;

    return NextResponse.json({
      total,
      breakdown: {
        verified: { score: verifiedScore, max: 30, value: isVerified },
        rating: { score: ratingScore, max: 25, value: Number(avgRating.toFixed(1)) },
        reviews: { score: reviewsScore, max: 15, value: effectiveReviewCount },
        responseRate: { score: responseScore, max: 15, value: Math.round(responseRate * 100) },
        experience: { score: experienceScore, max: 15, value: experience },
      },
    });
  } catch (error) {
    console.error('Error calculating trust score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate trust score' },
      { status: 500 }
    );
  }
}
