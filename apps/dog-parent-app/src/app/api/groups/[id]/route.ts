import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
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

const GROUPS_TABLE = process.env.GROUPS_TABLE_NAME || 'homeforpup-groups';
const GROUP_MEMBERS_TABLE = process.env.GROUP_MEMBERS_TABLE_NAME || 'homeforpup-group-members';

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

// GET /api/groups/[id] - Get group details including member count
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await ensureGroupsTableExists();
    await ensureMembersTableExists();

    // Get group details
    const groupResult = await dynamodb.send(
      new GetCommand({
        TableName: GROUPS_TABLE,
        Key: { id },
      })
    );

    if (!groupResult.Item) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Get member count
    const membersResult = await dynamodb.send(
      new QueryCommand({
        TableName: GROUP_MEMBERS_TABLE,
        KeyConditionExpression: 'groupId = :groupId',
        ExpressionAttributeValues: {
          ':groupId': id,
        },
        Select: 'COUNT',
      })
    );

    return NextResponse.json({
      group: {
        ...groupResult.Item,
        memberCount: membersResult.Count || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}
