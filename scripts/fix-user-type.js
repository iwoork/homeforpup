#!/usr/bin/env node

/**
 * Script to update a user's userType in DynamoDB
 * Usage: node scripts/fix-user-type.js <email> <userType>
 * Example: node scripts/fix-user-type.js efren@iwoork.com dog-parent
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const USERS_TABLE = process.env.USERS_TABLE || 'homeforpup-users';

const client = new DynamoDBClient({ region: AWS_REGION });
const dynamodb = DynamoDBDocumentClient.from(client);

async function findUserByEmail(email) {
  console.log(`Searching for user with email: ${email}`);
  
  const command = new ScanCommand({
    TableName: USERS_TABLE,
    FilterExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
  });

  const result = await dynamodb.send(command);
  
  if (!result.Items || result.Items.length === 0) {
    return null;
  }
  
  return result.Items[0];
}

async function updateUserType(userId, userType) {
  console.log(`Updating user ${userId} to userType: ${userType}`);
  
  const command = new UpdateCommand({
    TableName: USERS_TABLE,
    Key: { userId },
    UpdateExpression: 'SET userType = :userType, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':userType': userType,
      ':updatedAt': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  });

  const result = await dynamodb.send(command);
  return result.Attributes;
}

async function main() {
  const [,, email, userType] = process.argv;

  if (!email || !userType) {
    console.error('Usage: node scripts/fix-user-type.js <email> <userType>');
    console.error('Example: node scripts/fix-user-type.js efren@iwoork.com dog-parent');
    console.error('\nValid userTypes: breeder, dog-parent');
    process.exit(1);
  }

  if (userType !== 'breeder' && userType !== 'dog-parent') {
    console.error('Error: userType must be either "breeder" or "dog-parent"');
    process.exit(1);
  }

  try {
    // Find user by email
    const user = await findUserByEmail(email);
    
    if (!user) {
      console.error(`Error: User with email "${email}" not found`);
      process.exit(1);
    }

    console.log('\nFound user:');
    console.log(`  User ID: ${user.userId}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Current userType: ${user.userType || '(not set)'}`);

    // Update the user type
    const updatedUser = await updateUserType(user.userId, userType);
    
    console.log('\n✅ User type updated successfully!');
    console.log(`  New userType: ${updatedUser.userType}`);
    console.log(`  Updated at: ${updatedUser.updatedAt}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.name === 'ResourceNotFoundException') {
      console.error(`\nTable "${USERS_TABLE}" not found. Make sure the USERS_TABLE environment variable is set correctly.`);
    }
    process.exit(1);
  }
}

main();

