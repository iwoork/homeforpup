import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib';
import { Activity, ActivityFilter, ActivityResponse, ActivityStats, CreateActivityRequest } from '@homeforpup/shared-types';

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);
const ACTIVITIES_TABLE = process.env.ACTIVITIES_TABLE_NAME || 'homeforpup-activities';

// GET /api/activities - Fetch user activities
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters: ActivityFilter = {
      userId: session.user.id,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Parse filters from query params
    if (searchParams.get('types')) {
      filters.types = searchParams.get('types')!.split(',') as any[];
    }
    if (searchParams.get('categories')) {
      filters.categories = searchParams.get('categories')!.split(',') as any[];
    }
    if (searchParams.get('priority')) {
      filters.priority = searchParams.get('priority')!.split(',') as any[];
    }
    if (searchParams.get('read') !== null) {
      filters.read = searchParams.get('read') === 'true';
    }
    if (searchParams.get('start') && searchParams.get('end')) {
      filters.dateRange = {
        start: searchParams.get('start')!,
        end: searchParams.get('end')!,
      };
    }

    // Build query parameters
    const queryParams: any = {
      TableName: ACTIVITIES_TABLE,
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': filters.userId,
      },
    };

    // Add type filter
    if (filters.types?.length) {
      queryParams.FilterExpression += ' AND #type IN (:types)';
      queryParams.ExpressionAttributeNames = {
        ...queryParams.ExpressionAttributeNames,
        '#type': 'type',
      };
      queryParams.ExpressionAttributeValues[':types'] = filters.types;
    }

    // Add category filter
    if (filters.categories?.length) {
      queryParams.FilterExpression += ' AND category IN (:categories)';
      queryParams.ExpressionAttributeValues[':categories'] = filters.categories;
    }

    // Add priority filter
    if (filters.priority?.length) {
      queryParams.FilterExpression += ' AND priority IN (:priorities)';
      queryParams.ExpressionAttributeValues[':priorities'] = filters.priority;
    }

    // Add read status filter
    if (filters.read !== undefined) {
      queryParams.FilterExpression += ' AND #read = :read';
      queryParams.ExpressionAttributeNames = {
        ...queryParams.ExpressionAttributeNames,
        '#read': 'read',
      };
      queryParams.ExpressionAttributeValues[':read'] = filters.read;
    }

    // Add date range filter
    if (filters.dateRange) {
      queryParams.FilterExpression += ' AND #timestamp BETWEEN :startDate AND :endDate';
      queryParams.ExpressionAttributeNames = {
        ...queryParams.ExpressionAttributeNames,
        '#timestamp': 'timestamp',
      };
      queryParams.ExpressionAttributeValues[':startDate'] = filters.dateRange.start;
      queryParams.ExpressionAttributeValues[':endDate'] = filters.dateRange.end;
    }

    // Execute query
    const command = new ScanCommand(queryParams);
    const result = await docClient.send(command);

    const activities = (result.Items || []) as Activity[];
    
    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const startIndex = filters.offset || 0;
    const endIndex = startIndex + (filters.limit || 20);
    const paginatedActivities = activities.slice(startIndex, endIndex);

    // Calculate stats
    const stats: ActivityStats = {
      total: activities.length,
      unread: activities.filter(a => !a.read).length,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byPriority: { low: 0, medium: 0, high: 0 },
      recent: activities.slice(0, 5),
    };

    // Count by type
    activities.forEach(activity => {
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
      stats.byCategory[activity.category] = (stats.byCategory[activity.category] || 0) + 1;
      stats.byPriority[activity.priority]++;
    });

    const response: ActivityResponse = {
      activities: paginatedActivities,
      total: activities.length,
      hasMore: endIndex < activities.length,
      stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST /api/activities - Create new activity
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateActivityRequest = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.type || !body.title || !body.description || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure the activity belongs to the authenticated user
    if (body.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to create activity for this user' },
        { status: 403 }
      );
    }

    const activity: Activity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: body.userId,
      type: body.type,
      title: body.title,
      description: body.description,
      metadata: body.metadata,
      timestamp: new Date().toISOString(),
      read: false,
      priority: body.priority || 'medium',
      category: body.category,
    };

    const command = new PutCommand({
      TableName: ACTIVITIES_TABLE,
      Item: activity,
    });

    await docClient.send(command);

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
