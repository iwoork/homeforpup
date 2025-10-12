/**
 * Script to fix dogs that are missing the ownerId field
 * 
 * This script:
 * 1. Scans all dogs in the DynamoDB table
 * 2. Identifies dogs that don't have an ownerId
 * 3. Updates them with ownerId from the kennelId's owner
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

// Configuration
const REGION = process.env.AWS_REGION || 'us-east-1';
const DOGS_TABLE = process.env.DOGS_TABLE || 'homeforpup-dogs';
const KENNELS_TABLE = process.env.KENNELS_TABLE || 'homeforpup-kennels';

const client = new DynamoDBClient({ region: REGION });
const dynamodb = DynamoDBDocumentClient.from(client);

async function getKennelOwner(kennelId) {
  if (!kennelId) return null;
  
  try {
    const command = new GetCommand({
      TableName: KENNELS_TABLE,
      Key: { id: kennelId }
    });
    
    const result = await dynamodb.send(command);
    return result.Item?.ownerId || null;
  } catch (error) {
    console.error(`Error getting kennel ${kennelId}:`, error.message);
    return null;
  }
}

async function fixDogsWithMissingOwnerId() {
  console.log('🔍 Scanning for dogs without ownerId...\n');
  
  let dogsToFix = [];
  let dogsChecked = 0;
  let dogsWithOwner = 0;
  let lastEvaluatedKey = undefined;
  
  // Scan all dogs
  do {
    const scanCommand = new ScanCommand({
      TableName: DOGS_TABLE,
      ExclusiveStartKey: lastEvaluatedKey
    });
    
    const result = await dynamodb.send(scanCommand);
    
    if (result.Items) {
      for (const dog of result.Items) {
        dogsChecked++;
        
        if (dog.ownerId) {
          dogsWithOwner++;
          continue;
        }
        
        console.log(`❌ Dog missing ownerId:`, {
          id: dog.id,
          name: dog.name,
          breed: dog.breed,
          kennelId: dog.kennelId,
          createdAt: dog.createdAt
        });
        
        dogsToFix.push(dog);
      }
    }
    
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  
  console.log(`\n📊 Scan Results:`);
  console.log(`  Total dogs checked: ${dogsChecked}`);
  console.log(`  Dogs with ownerId: ${dogsWithOwner}`);
  console.log(`  Dogs missing ownerId: ${dogsToFix.length}\n`);
  
  if (dogsToFix.length === 0) {
    console.log('✅ All dogs have ownerId set!');
    return;
  }
  
  // Fix the dogs
  console.log(`🔧 Attempting to fix ${dogsToFix.length} dogs...\n`);
  
  let fixed = 0;
  let failed = 0;
  let noKennelInfo = 0;
  
  for (const dog of dogsToFix) {
    try {
      if (!dog.kennelId) {
        console.log(`⚠️  Dog ${dog.name} (${dog.id}) has no kennelId - cannot determine owner`);
        noKennelInfo++;
        continue;
      }
      
      // Get the kennel's owner
      const ownerId = await getKennelOwner(dog.kennelId);
      
      if (!ownerId) {
        console.log(`⚠️  Could not find owner for kennel ${dog.kennelId} (dog: ${dog.name})`);
        noKennelInfo++;
        continue;
      }
      
      // Update the dog
      const updateCommand = new UpdateCommand({
        TableName: DOGS_TABLE,
        Key: { id: dog.id },
        UpdateExpression: 'SET ownerId = :ownerId, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':ownerId': ownerId,
          ':updatedAt': new Date().toISOString()
        }
      });
      
      await dynamodb.send(updateCommand);
      
      console.log(`✅ Fixed dog ${dog.name} (${dog.id}) - set ownerId to ${ownerId.substring(0, 8)}...`);
      fixed++;
      
      // Add a small delay to avoid throttling
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Failed to fix dog ${dog.name} (${dog.id}):`, error.message);
      failed++;
    }
  }
  
  console.log(`\n📊 Fix Results:`);
  console.log(`  ✅ Fixed: ${fixed}`);
  console.log(`  ⚠️  No kennel info: ${noKennelInfo}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`\n${fixed > 0 ? '🎉 ' : ''}Script complete!`);
}

// Run the script
fixDogsWithMissingOwnerId()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

