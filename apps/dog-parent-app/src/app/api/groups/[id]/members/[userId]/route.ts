import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../../lib/auth';

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

// DELETE /api/groups/[id]/members/[userId] - Remove a member from a group (requires admin role)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId, userId } = await context.params;

    await ensureMembersTableExists();

    // Check if the current user is an admin of this group
    const callerMembership = await dynamodb.send(
      new GetCommand({
        TableName: GROUP_MEMBERS_TABLE,
        Key: { groupId, userId: session.user.id },
      })
    );

    if (!callerMembership.Item || callerMembership.Item.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only group admins can remove members' },
        { status: 403 }
      );
    }

    // Delete the member
    await dynamodb.send(
      new DeleteCommand({
        TableName: GROUP_MEMBERS_TABLE,
        Key: { groupId, userId },
      })
    );

    return NextResponse.json({
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Error removing group member:', error);
    return NextResponse.json(
      { error: 'Failed to remove group member' },
      { status: 500 }
    );
  }
}
