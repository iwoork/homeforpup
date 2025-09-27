#!/usr/bin/env node

/**
 * Convert Some US Breeders to Canadian
 * 
 * This script converts some existing US breeders to Canadian breeders
 * to provide a better mix for testing the country filter.
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

// US to Canadian state/province mapping
const stateMapping = {
  'WA': 'BC', // Washington -> British Columbia
  'OR': 'BC', // Oregon -> British Columbia  
  'CA': 'BC', // California -> British Columbia
  'NV': 'BC', // Nevada -> British Columbia
  'MT': 'AB', // Montana -> Alberta
  'ND': 'SK', // North Dakota -> Saskatchewan
  'MN': 'MB', // Minnesota -> Manitoba
  'WI': 'ON', // Wisconsin -> Ontario
  'MI': 'ON', // Michigan -> Ontario
  'NY': 'ON', // New York -> Ontario
  'VT': 'QC', // Vermont -> Quebec
  'NH': 'QC', // New Hampshire -> Quebec
  'ME': 'NB', // Maine -> New Brunswick
};

// City mapping for better Canadian cities
const cityMapping = {
  'Seattle': 'Vancouver',
  'Portland': 'Victoria', 
  'San Francisco': 'Vancouver',
  'Los Angeles': 'Vancouver',
  'Las Vegas': 'Vancouver',
  'Billings': 'Calgary',
  'Fargo': 'Saskatoon',
  'Minneapolis': 'Winnipeg',
  'Milwaukee': 'Toronto',
  'Detroit': 'Toronto',
  'Buffalo': 'Toronto',
  'Burlington': 'Montreal',
  'Manchester': 'Quebec City',
  'Portland': 'Saint John'
};

// Function to scan all breeders
async function scanAllBreeders() {
  const breeders = [];
  let lastEvaluatedKey = undefined;
  
  do {
    const params = {
      TableName: BREEDERS_TABLE,
      ExclusiveStartKey: lastEvaluatedKey,
    };
    
    try {
      const result = await dynamodb.send(new ScanCommand(params));
      breeders.push(...result.Items);
      lastEvaluatedKey = result.LastEvaluatedKey;
    } catch (error) {
      console.error('❌ Error scanning breeders:', error);
      throw error;
    }
  } while (lastEvaluatedKey);
  
  return breeders;
}

// Function to update a breeder to Canadian
async function convertToCanadian(breeder) {
  const newState = stateMapping[breeder.state] || 'ON'; // Default to Ontario
  const newCity = cityMapping[breeder.city] || breeder.city;
  
  const params = {
    TableName: BREEDERS_TABLE,
    Key: {
      id: breeder.id
    },
    UpdateExpression: 'SET #country = :country, #state = :state, #city = :city, #location = :location',
    ExpressionAttributeNames: {
      '#country': 'country',
      '#state': 'state', 
      '#city': 'city',
      '#location': 'location'
    },
    ExpressionAttributeValues: {
      ':country': 'Canada',
      ':state': newState,
      ':city': newCity,
      ':location': `${newCity}, ${newState}, Canada`
    },
    ReturnValues: 'UPDATED_NEW'
  };
  
  try {
    await dynamodb.send(new UpdateCommand(params));
    return { success: true, newState, newCity };
  } catch (error) {
    console.error(`❌ Error converting breeder ${breeder.id}:`, error);
    return { success: false, error: error.message };
  }
}

// Main function
async function convertSomeToCanadian() {
  console.log('🔄 Converting some US breeders to Canadian...\n');
  
  try {
    // Get all breeders
    const breeders = await scanAllBreeders();
    console.log(`📊 Found ${breeders.length} total breeders\n`);
    
    // Filter US breeders that can be converted
    const usBreeders = breeders.filter(b => b.country === 'USA' && stateMapping[b.state]);
    console.log(`🇺🇸 Found ${usBreeders.length} US breeders that can be converted\n`);
    
    if (usBreeders.length === 0) {
      console.log('ℹ️  No US breeders found that can be converted');
      return;
    }
    
    // Convert up to 20 breeders (about 13% of 150)
    const breedersToConvert = usBreeders.slice(0, 20);
    console.log(`🔄 Converting ${breedersToConvert.length} breeders to Canadian...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const conversionStats = {};
    
    for (let i = 0; i < breedersToConvert.length; i++) {
      const breeder = breedersToConvert[i];
      const progress = `[${i + 1}/${breedersToConvert.length}]`;
      
      console.log(`${progress} Converting ${breeder.business_name || breeder.name} (${breeder.city}, ${breeder.state})...`);
      
      const result = await convertToCanadian(breeder);
      
      if (result.success) {
        successCount++;
        const newLocation = `${result.newCity}, ${result.newState}`;
        conversionStats[newLocation] = (conversionStats[newLocation] || 0) + 1;
        console.log(`   ✅ Converted to: ${newLocation}, Canada`);
      } else {
        errorCount++;
        console.log(`   ❌ Failed: ${result.error}`);
      }
      
      // Add small delay to avoid throttling
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Conversion Summary:');
    console.log(`   ✅ Successfully converted: ${successCount}`);
    console.log(`   ❌ Failed conversions: ${errorCount}`);
    
    console.log('\n📍 New Canadian Locations:');
    Object.entries(conversionStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([location, count]) => {
        console.log(`   ${location}: ${count} breeders`);
      });
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some conversions failed. You may want to run the script again.');
    } else {
      console.log('\n🎉 All conversions completed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the conversion
convertSomeToCanadian().catch(console.error);
