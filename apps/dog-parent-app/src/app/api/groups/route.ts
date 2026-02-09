import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  BatchGetCommand,
} from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

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

const GROUPS_TABLE = process.env.GROUPS_TABLE_NAME || 'homeforpup-groups';
const GROUP_MEMBERS_TABLE = process.env.GROUP_MEMBERS_TABLE_NAME || 'homeforpup-group-members';

const VALID_GROUP_TYPES = ['litter', 'custom'] as const;
type GroupType = typeof VALID_GROUP_TYPES[number];

interface GroupItem {
  id: string;
  name: string;
  description: string;
  groupType: GroupType;
  litterId?: string;
  breederId: string;
  coverPhoto: string;
  createdAt: string;
  createdBy: string;
}

interface GroupMemberItem {
  groupId: string;
  userId: string;
  userName: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

let groupsTableVerified = false;
let membersTableVerified = false;

async function ensureGroupsTableExists(): Promise<void> {
  if (groupsTableVerified) return;

  try {
    await client.send(new DescribeTableCommand({ TableName: GROUPS_TABLE }));
    groupsTableVerified = true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ResourceNotFoundException') {
      await client.send(
        new CreateTableCommand({
          TableName: GROUPS_TABLE,
          KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' },
          ],
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'breederId', AttributeType: 'S' },
            { AttributeName: 'createdAt', AttributeType: 'S' },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'breederId-createdAt-index',
              KeySchema: [
                { AttributeName: 'breederId', KeyType: 'HASH' },
                { AttributeName: 'createdAt', KeyType: 'RANGE' },
              ],
              Projection: { ProjectionType: 'ALL' },
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        })
      );
      console.log(`Table ${GROUPS_TABLE} created successfully`);
      groupsTableVerified = true;
    } else {
      throw error;
    }
  }
}

async function ensureMembersTableExists(): Promise<void> {
  if (membersTableVerified) return;

  try {
    await client.send(new DescribeTableCommand({ TableName: GROUP_MEMBERS_TABLE }));
    membersTableVerified = true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ResourceNotFoundException') {
      await client.send(
        new CreateTableCommand({
          TableName: GROUP_MEMBERS_TABLE,
          KeySchema: [
            { AttributeName: 'groupId', KeyType: 'HASH' },
            { AttributeName: 'userId', KeyType: 'RANGE' },
          ],
          AttributeDefinitions: [
            { AttributeName: 'groupId', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'userId-index',
              KeySchema: [
                { AttributeName: 'userId', KeyType: 'HASH' },
              ],
              Projection: { ProjectionType: 'ALL' },
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        })
      );
      console.log(`Table ${GROUP_MEMBERS_TABLE} created successfully`);
      membersTableVerified = true;
    } else {
      throw error;
    }
  }
}

// GET /api/groups?userId=[id] - Get groups the user belongs to
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    await ensureGroupsTableExists();
    await ensureMembersTableExists();

    // Query group-members by userId to find which groups they belong to
    const membershipsResult = await dynamodb.send(
      new QueryCommand({
        TableName: GROUP_MEMBERS_TABLE,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
    );

    const memberships = membershipsResult.Items || [];

    if (memberships.length === 0) {
      return NextResponse.json({ groups: [], count: 0 });
    }

    // Batch get the group details
    const keys = memberships.map((m) => ({ id: m.groupId }));
    const batchResult = await dynamodb.send(
      new BatchGetCommand({
        RequestItems: {
          [GROUPS_TABLE]: {
            Keys: keys,
          },
        },
      })
    );

    const groups = batchResult.Responses?.[GROUPS_TABLE] || [];

    // Enrich with member's role and member count
    const groupsWithDetails = await Promise.all(
      groups.map(async (g) => {
        const membership = memberships.find((m) => m.groupId === g.id);
        // Get member count for this group
        const countResult = await dynamodb.send(
          new QueryCommand({
            TableName: GROUP_MEMBERS_TABLE,
            KeyConditionExpression: 'groupId = :groupId',
            ExpressionAttributeValues: {
              ':groupId': g.id as string,
            },
            Select: 'COUNT',
          })
        );
        return {
          ...g,
          memberRole: membership?.role || 'member',
          memberCount: countResult.Count || 0,
        };
      })
    );

    // Sort by createdAt descending
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groupsWithDetails.sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    return NextResponse.json({
      groups: groupsWithDetails,
      count: groupsWithDetails.length,
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a new group
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, groupType, litterId, breederId, coverPhoto } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    if (!groupType || !VALID_GROUP_TYPES.includes(groupType)) {
      return NextResponse.json(
        { error: `groupType is required and must be one of: ${VALID_GROUP_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    await ensureGroupsTableExists();
    await ensureMembersTableExists();

    const now = new Date().toISOString();
    const groupItem: GroupItem = {
      id: `group-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      description: (description || '').trim(),
      groupType: groupType as GroupType,
      litterId: litterId || undefined,
      breederId: String(breederId || session.user.id),
      coverPhoto: coverPhoto || '',
      createdAt: now,
      createdBy: session.user.id,
    };

    // Create the group
    await dynamodb.send(
      new PutCommand({
        TableName: GROUPS_TABLE,
        Item: groupItem,
      })
    );

    // Add the creator as admin member
    const memberItem: GroupMemberItem = {
      groupId: groupItem.id,
      userId: session.user.id,
      userName:
        (session.user as Record<string, unknown>).displayName as string ||
        session.user.name ||
        'Anonymous',
      role: 'admin',
      joinedAt: now,
    };

    await dynamodb.send(
      new PutCommand({
        TableName: GROUP_MEMBERS_TABLE,
        Item: memberItem,
      })
    );

    return NextResponse.json({
      message: 'Group created successfully',
      group: groupItem,
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
