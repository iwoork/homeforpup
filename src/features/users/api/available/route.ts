// src/app/api/users/available/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Configure AWS SDK v3
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);
const USERS_TABLE = process.env.USERS_TABLE_NAME || 'puppy-platform-dev-users';

export async function GET(request: NextRequest) {
  try {
    // Get and verify JWT token
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = (session.user as any).id;
    console.log('Fetching available users for:', currentUserId.substring(0, 10) + '...');

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType'); // 'breeder', 'adopter', 'both'
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const limit = parseInt(searchParams.get('limit') || '50');
    const startKeyParam = searchParams.get('startKey');

    // Build scan parameters
    const scanParams: any = {
      TableName: USERS_TABLE,
      FilterExpression: 'accountStatus = :activeStatus AND userId <> :currentUserId',
      ExpressionAttributeValues: {
        ':activeStatus': 'active',
        ':currentUserId': currentUserId
      },
      Limit: Math.min(limit, 100) // Cap at 100 for performance
    };

    // Only add ExpressionAttributeNames if we actually need it
    const attributeNames: Record<string, string> = {};

    // Add user type filter if specified
    if (userType && ['breeder', 'adopter', 'both'].includes(userType)) {
      scanParams.FilterExpression += ' AND userType = :userType';
      scanParams.ExpressionAttributeValues[':userType'] = userType;
    }

    // Add search filter if specified (search in name, displayName, email)
    if (search && search.trim()) {
      scanParams.FilterExpression += ' AND (contains(#name, :search) OR contains(displayName, :search) OR contains(email, :search))';
      attributeNames['#name'] = 'name';
      scanParams.ExpressionAttributeValues[':search'] = search.trim();
    }

    // Add location filter if specified
    if (location && location.trim()) {
      scanParams.FilterExpression += ' AND contains(#location, :location)';
      attributeNames['#location'] = 'location';
      scanParams.ExpressionAttributeValues[':location'] = location.trim();
    }

    // Only add ExpressionAttributeNames if we have attributes to map
    if (Object.keys(attributeNames).length > 0) {
      scanParams.ExpressionAttributeNames = attributeNames;
    }

    console.log('Scanning users with params:', {
      userType,
      search,
      location,
      limit
    });

    // Execute scan
    if (startKeyParam) {
      try {
        const decoded = Buffer.from(startKeyParam, 'base64').toString('utf-8');
        const exclusiveStartKey = JSON.parse(decoded);
        if (exclusiveStartKey && typeof exclusiveStartKey === 'object') {
          (scanParams as any).ExclusiveStartKey = exclusiveStartKey;
        }
      } catch {
        console.warn('Invalid startKey provided, ignoring.');
      }
    }

    const result = await dynamodb.send(new ScanCommand(scanParams));
    const users = result.Items || [];

    console.log(`Found ${users.length} available users`);

    // Transform users for frontend consumption
    const availableUsers = users.map(user => ({
      userId: user.userId,
      name: user.displayName || user.name || 'Unknown User',
      displayName: user.displayName,
      email: user.preferences?.privacy?.showEmail ? user.email : undefined,
      userType: user.userType,
      location: user.preferences?.privacy?.showLocation ? user.location : undefined,
      profileImage: user.profileImage,
      verified: user.verified,
      // Include additional info that might be useful for messaging
      bio: user.bio,
      breederInfo: user.userType === 'breeder' || user.userType === 'both' ? {
        kennelName: user.breederInfo?.kennelName,
        specialties: user.breederInfo?.specialties,
        experience: user.breederInfo?.experience
      } : undefined
    })).sort((a, b) => {
      // Sort by name alphabetically
      return a.name.localeCompare(b.name);
    });

    const nextKey = result.LastEvaluatedKey 
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey), 'utf-8').toString('base64')
      : null;

    return NextResponse.json({ 
      users: availableUsers,
      total: availableUsers.length,
      hasMore: Boolean(result.LastEvaluatedKey),
      nextKey
    });

  } catch (error) {
    console.error('Error fetching available users:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch available users',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    );
  }
}