/**
 * Setup homeforpup-profiles table
 * 
 * This creates a new profiles table to replace the old users table.
 * Identity fields (firstName, lastName, phone, picture, bio, etc.) 
 * are now managed by Cognito only and not stored in this table.
 * 
 * Run: node scripts/setup-profiles-table.js
 */

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

// Initialize DynamoDB client
const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });

const TABLE_NAME = 'homeforpup-profiles';

async function tableExists(tableName) {
  try {
    const command = new DescribeTableCommand({ TableName: tableName });
    await dynamodb.send(command);
    return true;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

async function createProfilesTable() {
  console.log(`\n🔍 Checking if table '${TABLE_NAME}' exists...`);

  if (await tableExists(TABLE_NAME)) {
    console.log(`✅ Table '${TABLE_NAME}' already exists. No action needed.`);
    return;
  }

  console.log(`\n📝 Creating table '${TABLE_NAME}'...`);

  const createTableParams = {
    TableName: TABLE_NAME,
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST', // On-demand pricing
    StreamSpecification: {
      StreamEnabled: true,
      StreamViewType: 'NEW_AND_OLD_IMAGES',
    },
    Tags: [
      { Key: 'Environment', Value: process.env.ENVIRONMENT || 'development' },
      { Key: 'Application', Value: 'HomeForPup' },
      { Key: 'Purpose', Value: 'User-profiles-application-data-only' },
      { Key: 'DataSource', Value: 'Application-and-Cognito' },
    ],
  };

  try {
    const command = new CreateTableCommand(createTableParams);
    await dynamodb.send(command);

    console.log(`✅ Table '${TABLE_NAME}' created successfully!`);
    console.log('\n📋 Table Schema:');
    console.log('   - Primary Key: userId (String)');
    console.log('   - Billing Mode: PAY_PER_REQUEST');
    console.log('   - Streams: Enabled (NEW_AND_OLD_IMAGES)');
    console.log('\n📝 Note: Identity fields are stored in Cognito only:');
    console.log('   - firstName, lastName, username');
    console.log('   - phone, address/location');
    console.log('   - picture/profileImage');
    console.log('   - bio/profile description');
    console.log('   - userType (custom:userType)');
    console.log('\n✨ Profile table stores only application-specific data:');
    console.log('   - Subscription info (isPremium, subscriptionPlan, etc.)');
    console.log('   - Preferences (notifications, privacy)');
    console.log('   - Role-specific info (breederInfo, puppyParentInfo)');
    console.log('   - Social links, cover photo, gallery photos');
    console.log('   - Metadata (createdAt, updatedAt, lastActiveAt, profileViews)');
    console.log('\n⏰ Waiting for table to become active...');

    // Wait for table to be active
    let tableStatus = 'CREATING';
    while (tableStatus === 'CREATING') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const describeCommand = new DescribeTableCommand({ TableName: TABLE_NAME });
      const result = await dynamodb.send(describeCommand);
      tableStatus = result.Table.TableStatus;
      console.log(`   Status: ${tableStatus}`);
    }

    console.log('\n✅ Table is now ACTIVE and ready to use!');
    console.log('\n📌 Next Steps:');
    console.log('   1. (Optional) Run migration script to copy data from homeforpup-users');
    console.log('   2. Deploy API with: cd apps/homeforpup-api && cdk deploy');
    console.log('   3. Test endpoints: /profiles/:id');
    console.log('   4. Mobile app will continue working with backward compatibility');
    console.log('\n⚠️  The old homeforpup-users table is still active.');
    console.log('   Keep it for backup during transition, delete after verification.');
  } catch (error) {
    console.error('\n❌ Error creating table:', error.message);
    throw error;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         HomeForPup Profiles Table Setup                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  try {
    await createProfilesTable();
    console.log('\n✨ Setup complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Setup failed:', error);
    process.exit(1);
  }
}

main();

