#!/usr/bin/env node

/**
 * Update Canadian Breeders with Available Puppies
 * 
 * This script updates Canadian breeders to have available puppies
 * so we can test the country filter functionality.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
});

const dynamodb = DynamoDBDocumentClient.from(client);

// Table name
const BREEDERS_TABLE = process.env.BREEDERS_TABLE_NAME || process.env.BREEDERS_TABLE || 'homeforpup-breeders';

// Function to scan Canadian breeders
async function scanCanadianBreeders() {
  const breeders = [];
  let lastEvaluatedKey = undefined;
  
  do {
    const params = {
      TableName: BREEDERS_TABLE,
      FilterExpression: '#country = :country AND #active = :active',
      ExpressionAttributeNames: {
        '#country': 'country',
        '#active': 'active'
      },
      ExpressionAttributeValues: {
        ':country': 'Canada',
        ':active': 'True'
      },
      ExclusiveStartKey: lastEvaluatedKey,
    };
    
    try {
      const result = await dynamodb.send(new ScanCommand(params));
      breeders.push(...result.Items);
      lastEvaluatedKey = result.LastEvaluatedKey;
    } catch (error) {
      console.error('❌ Error scanning Canadian breeders:', error);
      throw error;
    }
  } while (lastEvaluatedKey);
  
  return breeders;
}

// Function to update a breeder with available puppies
async function updateBreederWithPuppies(breeder) {
  // Generate random number of available puppies (1-8)
  const availablePuppies = Math.floor(Math.random() * 8) + 1;
  
  const params = {
    TableName: BREEDERS_TABLE,
    Key: {
      id: breeder.id
    },
    UpdateExpression: 'SET available_puppies = :availablePuppies, current_litters = :currentLitters',
    ExpressionAttributeValues: {
      ':availablePuppies': availablePuppies,
      ':currentLitters': Math.ceil(availablePuppies / 4) // Rough estimate: 4 puppies per litter
    },
    ReturnValues: 'UPDATED_NEW'
  };
  
  try {
    await dynamodb.send(new UpdateCommand(params));
    return { success: true, availablePuppies };
  } catch (error) {
    console.error(`❌ Error updating breeder ${breeder.id}:`, error);
    return { success: false, error: error.message };
  }
}

// Main function
async function updateCanadianPuppies() {
  console.log('🐕 Updating Canadian breeders with available puppies...\n');
  
  try {
    // Get all Canadian breeders
    const breeders = await scanCanadianBreeders();
    console.log(`📊 Found ${breeders.length} Canadian breeders\n`);
    
    if (breeders.length === 0) {
      console.log('ℹ️  No Canadian breeders found');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    const totalPuppies = { added: 0, breeders: 0 };
    
    for (let i = 0; i < breeders.length; i++) {
      const breeder = breeders[i];
      const progress = `[${i + 1}/${breeders.length}]`;
      
      console.log(`${progress} Updating ${breeder.business_name || breeder.name}...`);
      
      const result = await updateBreederWithPuppies(breeder);
      
      if (result.success) {
        successCount++;
        totalPuppies.added += result.availablePuppies;
        totalPuppies.breeders++;
        console.log(`   ✅ Added ${result.availablePuppies} available puppies`);
      } else {
        errorCount++;
        console.log(`   ❌ Failed: ${result.error}`);
      }
      
      // Add small delay to avoid throttling
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Update Summary:');
    console.log(`   ✅ Successfully updated: ${successCount} breeders`);
    console.log(`   ❌ Failed updates: ${errorCount}`);
    console.log(`   🐕 Total puppies added: ${totalPuppies.added}`);
    console.log(`   📈 Average puppies per breeder: ${Math.round(totalPuppies.added / totalPuppies.breeders)}`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some updates failed. You may want to run the script again.');
    } else {
      console.log('\n🎉 All Canadian breeders updated with available puppies!');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the update
updateCanadianPuppies().catch(console.error);
