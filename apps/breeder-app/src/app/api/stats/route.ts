import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib';
import { ActivityStats, Activity } from '@homeforpup/shared-types';

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);
const ACTIVITIES_TABLE = process.env.ACTIVITIES_TABLE_NAME || 'homeforpup-activities';

// GET /api/activities/stats - Get activity statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';
    const userId = session.user.id;

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Query activities for the user within the date range
    const scanCommand = new ScanCommand({
      TableName: ACTIVITIES_TABLE,
      FilterExpression: 'userId = :userId AND #timestamp >= :startDate',
      ExpressionAttributeNames: {
        '#timestamp': 'timestamp',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':startDate': startDate.toISOString(),
      },
    });

    const result = await docClient.send(scanCommand);
    const activities = (result.Items || []) as Activity[];

    // Calculate statistics
    const stats: ActivityStats = {
      total: activities.length,
      unread: activities.filter(a => !a.read).length,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byPriority: { low: 0, medium: 0, high: 0 },
      recent: activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5),
    };

    // Count by type and category
    activities.forEach(activity => {
      // Count by type
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
      
      // Count by category
      stats.byCategory[activity.category] = (stats.byCategory[activity.category] || 0) + 1;
      
      // Count by priority
      stats.byPriority[activity.priority]++;
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity stats' },
      { status: 500 }
    );
  }
}
