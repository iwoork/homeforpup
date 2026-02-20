import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { auth } from '@clerk/nextjs/server';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

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

const GROUP_MEMBERS_TABLE = process.env.GROUP_MEMBERS_TABLE_NAME || 'homeforpup-group-members';

let membersTableVerified = false;

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

// GET /api/groups/[id]/members - Get members of a group
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await context.params;

    await ensureMembersTableExists();

    const result = await dynamodb.send(
      new QueryCommand({
        TableName: GROUP_MEMBERS_TABLE,
        KeyConditionExpression: 'groupId = :groupId',
        ExpressionAttributeValues: {
          ':groupId': groupId,
        },
        ScanIndexForward: true,
      })
    );

    const members = (result.Items || []).map((item) => ({
      groupId: item.groupId,
      userId: item.userId,
      userName: item.userName,
      role: item.role,
      joinedAt: item.joinedAt,
    }));

    return NextResponse.json({
      members,
      count: members.length,
    });
  } catch (error) {
    console.error('Error fetching group members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group members' },
      { status: 500 }
    );
  }
}

// POST /api/groups/[id]/members - Add a member to a group (requires admin role)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId } = await context.params;

    await ensureMembersTableExists();

    // Check if the current user is an admin of this group
    const callerMembership = await dynamodb.send(
      new GetCommand({
        TableName: GROUP_MEMBERS_TABLE,
        Key: { groupId, userId: userId },
      })
    );

    if (!callerMembership.Item || callerMembership.Item.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only group admins can add members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId: memberUserId, userName, role } = body;

    if (!memberUserId || typeof memberUserId !== 'string') {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const validRoles = ['admin', 'member'] as const;
    const memberRole = validRoles.includes(role) ? role : 'member';

    const memberItem = {
      groupId,
      userId: memberUserId,
      userName: userName || 'Anonymous',
      role: memberRole,
      joinedAt: new Date().toISOString(),
    };

    await dynamodb.send(
      new PutCommand({
        TableName: GROUP_MEMBERS_TABLE,
        Item: memberItem,
      })
    );

    return NextResponse.json({
      message: 'Member added successfully',
      member: memberItem,
    });
  } catch (error) {
    console.error('Error adding group member:', error);
    return NextResponse.json(
      { error: 'Failed to add group member' },
      { status: 500 }
    );
  }
}
