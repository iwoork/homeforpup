const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ACTIVITIES_TABLE_NAME = process.env.ACTIVITIES_TABLE_NAME || 'homeforpup-activities';

async function createActivitiesTable() {
  try {
    console.log('Creating activities table...');

    // Check if table already exists
    try {
      await dynamoClient.send(new DescribeTableCommand({
        TableName: ACTIVITIES_TABLE_NAME
      }));
      console.log(`Table ${ACTIVITIES_TABLE_NAME} already exists.`);
      return;
    } catch (error) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
    }

    // Create the table
    const createTableCommand = new CreateTableCommand({
      TableName: ACTIVITIES_TABLE_NAME,
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH' // Partition key
        }
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S'
        },
        {
          AttributeName: 'userId',
          AttributeType: 'S'
        },
        {
          AttributeName: 'timestamp',
          AttributeType: 'S'
        },
        {
          AttributeName: 'type',
          AttributeType: 'S'
        },
        {
          AttributeName: 'category',
          AttributeType: 'S'
        }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'userId-timestamp-index',
          KeySchema: [
            {
              AttributeName: 'userId',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'timestamp',
              KeyType: 'RANGE'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        },
        {
          IndexName: 'userId-type-index',
          KeySchema: [
            {
              AttributeName: 'userId',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'type',
              KeyType: 'RANGE'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        },
        {
          IndexName: 'userId-category-index',
          KeySchema: [
            {
              AttributeName: 'userId',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'category',
              KeyType: 'RANGE'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    });

    await dynamoClient.send(createTableCommand);
    console.log(`Table ${ACTIVITIES_TABLE_NAME} created successfully!`);

  } catch (error) {
    console.error('Error creating activities table:', error);
    process.exit(1);
  }
}

// Run the script
createActivitiesTable();
