#!/usr/bin/env node

/**
 * Setup script for homeforpup-litters DynamoDB table
 * 
 * This creates the litters table for managing breeding litters
 */

require('dotenv').config();

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const TABLE_NAME = 'homeforpup-litters';

const tableDefinition = {
  TableName: TABLE_NAME,
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'breederId', AttributeType: 'S' },
    { AttributeName: 'status', AttributeType: 'S' },
    { AttributeName: 'expectedDate', AttributeType: 'S' }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'BreederIndex',
      KeySchema: [
        { AttributeName: 'breederId', KeyType: 'HASH' },
        { AttributeName: 'expectedDate', KeyType: 'RANGE' }
      ],
      Projection: { ProjectionType: 'ALL' },
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    },
    {
      IndexName: 'StatusIndex',
      KeySchema: [
        { AttributeName: 'status', KeyType: 'HASH' },
        { AttributeName: 'expectedDate', KeyType: 'RANGE' }
      ],
      Projection: { ProjectionType: 'ALL' },
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    }
  ],
  BillingMode: 'PROVISIONED',
  ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
};

async function checkTableExists() {
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    return true;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

async function createTable() {
  try {
    console.log(`\n🔍 Checking if table ${TABLE_NAME} exists...`);
    const exists = await checkTableExists();
    
    if (exists) {
      console.log(`✅ Table ${TABLE_NAME} already exists!`);
      console.log('\nYou can verify the table in AWS Console:');
      console.log(`https://console.aws.amazon.com/dynamodbv2/home?region=us-east-1#table?name=${TABLE_NAME}`);
      return;
    }

    console.log(`\n🚀 Creating table ${TABLE_NAME}...`);
    await client.send(new CreateTableCommand(tableDefinition));
    
    console.log(`✅ Table ${TABLE_NAME} created successfully!`);
    console.log('\n📋 Table Details:');
    console.log(`   - Primary Key: id (String)`);
    console.log(`   - GSI 1: BreederIndex (breederId, expectedDate)`);
    console.log(`   - GSI 2: StatusIndex (status, expectedDate)`);
    console.log(`   - Billing Mode: Provisioned (5 RCU, 5 WCU)`);
    console.log('\n⏳ Note: It may take a minute for the table to become active.');
    console.log('\nVerify in AWS Console:');
    console.log(`https://console.aws.amazon.com/dynamodbv2/home?region=us-east-1#table?name=${TABLE_NAME}`);
  } catch (error) {
    console.error(`\n❌ Error creating table ${TABLE_NAME}:`, error.message);
    console.error('\nCommon issues:');
    console.error('1. AWS credentials not configured');
    console.error('2. Insufficient permissions');
    console.error('3. Region mismatch');
    console.error('\nRun: aws configure');
    process.exit(1);
  }
}

// Run the setup
console.log('🏠 Home for Pup - Litters Table Setup');
console.log('=====================================');
createTable().catch(console.error);

