/**
 * Migrate data from homeforpup-users to homeforpup-profiles
 * 
 * This script:
 * 1. Scans all records from homeforpup-users table
 * 2. Removes Cognito-only fields (firstName, lastName, phone, bio, etc.)
 * 3. Writes cleaned records to homeforpup-profiles table
 * 
 * Run: node scripts/migrate-users-to-profiles.js
 */

const { DynamoDBClient, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  BatchWriteCommand,
} = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

const SOURCE_TABLE = 'homeforpup-users';
const TARGET_TABLE = 'homeforpup-profiles';

// Check if a table exists
async function tableExists(tableName) {
  try {
    const command = new DescribeTableCommand({ TableName: tableName });
    await client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

// Fields that should NOT be copied to profiles (managed by Cognito)
const COGNITO_ONLY_FIELDS = [
  'firstName',
  'lastName',
  'username',
  'phone',
  'phoneNumber',
  'phone_number',
  'location',
  'address',
  'profileImage',
  'picture',
  'bio',
  'userType', // Already in Cognito as custom:userType
  'passwordHash', // Should never be in DynamoDB anyway
  'refreshToken', // Should never be in DynamoDB anyway
];

function cleanProfileData(user) {
  const profile = { ...user };
  
  // Remove Cognito-only fields
  COGNITO_ONLY_FIELDS.forEach(field => {
    delete profile[field];
  });
  
  // Ensure required fields exist
  if (!profile.userId) {
    console.warn('⚠️  Profile missing userId:', user);
    return null;
  }
  
  if (!profile.email) {
    console.warn('⚠️  Profile missing email:', profile.userId);
  }
  
  // Set defaults for required fields
  if (!profile.verified) profile.verified = false;
  if (!profile.accountStatus) profile.accountStatus = 'active';
  if (!profile.createdAt) profile.createdAt = new Date().toISOString();
  if (!profile.updatedAt) profile.updatedAt = new Date().toISOString();
  
  return profile;
}

async function scanAllUsers() {
  console.log(`\n📖 Scanning all records from '${SOURCE_TABLE}'...`);
  
  let allItems = [];
  let lastEvaluatedKey = undefined;
  let scanCount = 0;
  
  do {
    const params = {
      TableName: SOURCE_TABLE,
      ExclusiveStartKey: lastEvaluatedKey,
    };
    
    const command = new ScanCommand(params);
    const result = await dynamodb.send(command);
    
    const items = result.Items || [];
    allItems = allItems.concat(items);
    lastEvaluatedKey = result.LastEvaluatedKey;
    scanCount++;
    
    console.log(`   Scan ${scanCount}: Found ${items.length} records (Total: ${allItems.length})`);
  } while (lastEvaluatedKey);
  
  console.log(`✅ Scan complete. Total records: ${allItems.length}`);
  return allItems;
}

async function migrateProfiles(users) {
  console.log(`\n🔄 Migrating ${users.length} users to profiles table...`);
  
  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  // Process in batches of 25 (DynamoDB BatchWrite limit)
  const batchSize = 25;
  
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    const profiles = batch
      .map(cleanProfileData)
      .filter(p => p !== null);
    
    if (profiles.length === 0) {
      skippedCount += batch.length;
      continue;
    }
    
    try {
      // Use BatchWrite for efficiency
      const writeRequests = profiles.map(profile => ({
        PutRequest: {
          Item: profile,
        },
      }));
      
      const batchCommand = new BatchWriteCommand({
        RequestItems: {
          [TARGET_TABLE]: writeRequests,
        },
      });
      
      await dynamodb.send(batchCommand);
      migratedCount += profiles.length;
      skippedCount += (batch.length - profiles.length);
      
      console.log(`   ✓ Batch ${Math.floor(i / batchSize) + 1}: Migrated ${profiles.length} profiles`);
    } catch (error) {
      console.error(`   ✗ Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
      errorCount += batch.length;
      
      // Try individual puts as fallback
      for (const profile of profiles) {
        try {
          const putCommand = new PutCommand({
            TableName: TARGET_TABLE,
            Item: profile,
          });
          await dynamodb.send(putCommand);
          migratedCount++;
          errorCount--;
        } catch (putError) {
          console.error(`   ✗ Failed to migrate profile ${profile.userId}:`, putError.message);
        }
      }
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Migrated: ${migratedCount}`);
  console.log(`   ⏭️  Skipped: ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total: ${users.length}`);
  
  return { migratedCount, skippedCount, errorCount };
}

async function verifyMigration() {
  console.log(`\n🔍 Verifying migration...`);
  
  try {
    // Count records in profiles table
    const scanCommand = new ScanCommand({
      TableName: TARGET_TABLE,
      Select: 'COUNT',
    });
    
    const result = await dynamodb.send(scanCommand);
    const profileCount = result.Count || 0;
    
    console.log(`✅ Profiles table contains ${profileCount} records`);
    
    // Sample a few records to verify data quality
    if (profileCount > 0) {
      const sampleCommand = new ScanCommand({
        TableName: TARGET_TABLE,
        Limit: 3,
      });
      
      const sampleResult = await dynamodb.send(sampleCommand);
      const samples = sampleResult.Items || [];
      
      console.log('\n📋 Sample profiles:');
      samples.forEach((profile, index) => {
        console.log(`\n   Profile ${index + 1}:`);
        console.log(`   - userId: ${profile.userId}`);
        console.log(`   - email: ${profile.email}`);
        console.log(`   - Has Cognito fields: ${!!profile.firstName || !!profile.phone ? '❌ YES (SHOULD BE REMOVED)' : '✅ NO (CORRECT)'}`);
        console.log(`   - Has preferences: ${profile.preferences ? '✅' : '❌'}`);
        console.log(`   - Has breederInfo: ${profile.breederInfo ? '✅' : '➖'}`);
        console.log(`   - Has subscriptionPlan: ${profile.subscriptionPlan ? '✅' : '➖'}`);
      });
    }
    
    return profileCount;
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return 0;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║       Migrate Users to Profiles Table                         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  try {
    // Step 1: Check if target table exists
    const targetExists = await tableExists(TARGET_TABLE);
    if (!targetExists) {
      console.log(`\n❌ Target table '${TARGET_TABLE}' does not exist!`);
      console.log('\n📝 Please run setup script first:');
      console.log('   node scripts/setup-profiles-table.js');
      process.exit(1);
    }
    
    console.log(`✅ Target table '${TARGET_TABLE}' exists`);
    
    // Step 2: Check if source table exists
    const sourceExists = await tableExists(SOURCE_TABLE);
    if (!sourceExists) {
      console.log(`\n❌ Source table '${SOURCE_TABLE}' does not exist!`);
      console.log('   Nothing to migrate.');
      process.exit(1);
    }
    
    console.log(`✅ Source table '${SOURCE_TABLE}' exists`);
    
    // Step 3: Scan all users
    const users = await scanAllUsers();
    
    if (users.length === 0) {
      console.log('\n⚠️  No users found in source table. Nothing to migrate.');
      process.exit(0);
    }
    
    // Step 4: Show preview of what will be removed
    console.log('\n📋 Data Transformation Preview:');
    console.log('   The following fields will be REMOVED (stored in Cognito only):');
    COGNITO_ONLY_FIELDS.forEach(field => {
      console.log(`   - ${field}`);
    });
    
    console.log('\n   The following fields will be KEPT (application data):');
    console.log('   - userId, email, name, displayName');
    console.log('   - coordinates, coverPhoto, galleryPhotos');
    console.log('   - verified, accountStatus');
    console.log('   - isPremium, subscriptionPlan, subscriptionStatus, subscription dates');
    console.log('   - preferences (notifications, privacy)');
    console.log('   - breederInfo, puppyParentInfo');
    console.log('   - socialLinks');
    console.log('   - createdAt, updatedAt, lastActiveAt, profileViews');
    
    // Step 5: Confirm migration
    console.log(`\n⚠️  About to migrate ${users.length} users to profiles table.`);
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 6: Migrate
    const results = await migrateProfiles(users);
    
    // Step 7: Verify
    const profileCount = await verifyMigration();
    
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                Migration Complete!                             ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log(`\n✅ Successfully migrated ${results.migratedCount} profiles`);
    console.log(`✅ Verified ${profileCount} profiles in target table`);
    
    if (results.errorCount > 0) {
      console.log(`\n⚠️  ${results.errorCount} records failed to migrate. Check logs above.`);
    }
    
    console.log('\n📝 Next Steps:');
    console.log('   1. Verify sample profiles in AWS console');
    console.log('   2. Test API endpoints: GET /profiles/:id');
    console.log('   3. Deploy updated API: cd apps/homeforpup-api && cdk deploy');
    console.log('   4. Test mobile app functionality');
    console.log('   5. Monitor for 1-2 weeks');
    console.log('   6. Delete old homeforpup-users table after verification');
    
    console.log('\n⚠️  Old Table Status:');
    console.log(`   - homeforpup-users table is still active`);
    console.log(`   - Keep it as backup for 30 days`);
    console.log(`   - Delete manually after verifying everything works`);
    
    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }
}

main();

