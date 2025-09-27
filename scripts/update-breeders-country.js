#!/usr/bin/env node

/**
 * Update Breeders with Country Information
 * 
 * This script updates existing breeders in the database to include country information
 * based on their state/province. It maps US states to "United States" and Canadian
 * provinces/territories to "Canada".
 * 
 * Prerequisites:
 * 1. AWS CLI configured with proper credentials
 * 2. Node.js installed
 * 3. AWS SDK v3 installed
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  // Use default credential provider chain (AWS CLI, environment variables, IAM roles, etc.)
});

const dynamodb = DynamoDBDocumentClient.from(client);

// Table name
const BREEDERS_TABLE = process.env.BREEDERS_TABLE_NAME || process.env.BREEDERS_TABLE || 'homeforpup-breeders';

// US States mapping
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', // Washington DC
  // Full state names
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia'
];

// Canadian Provinces and Territories mapping
const CANADIAN_PROVINCES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT',
  // Full province names
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
  'Nova Scotia', 'Northwest Territories', 'Nunavut', 'Ontario', 'Prince Edward Island',
  'Quebec', 'Saskatchewan', 'Yukon'
];

// Function to determine country based on state
function getCountryFromState(state) {
  if (!state) return 'Canada'; // Default to Canada
  
  const stateUpper = state.toUpperCase();
  const stateTitle = state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
  
  if (US_STATES.includes(stateUpper) || US_STATES.includes(stateTitle)) {
    return 'United States';
  } else if (CANADIAN_PROVINCES.includes(stateUpper) || CANADIAN_PROVINCES.includes(stateTitle)) {
    return 'Canada';
  }
  
  // Default to Canada for unknown states
  console.log(`⚠️  Unknown state: ${state}, defaulting to Canada`);
  return 'Canada';
}

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

// Function to update a single breeder
async function updateBreeder(breeder) {
  const country = getCountryFromState(breeder.state);
  
  const params = {
    TableName: BREEDERS_TABLE,
    Key: {
      id: breeder.id
    },
    UpdateExpression: 'SET #country = :country',
    ExpressionAttributeNames: {
      '#country': 'country'
    },
    ExpressionAttributeValues: {
      ':country': country
    },
    ReturnValues: 'UPDATED_NEW'
  };
  
  try {
    await dynamodb.send(new UpdateCommand(params));
    return { success: true, country };
  } catch (error) {
    console.error(`❌ Error updating breeder ${breeder.id}:`, error);
    return { success: false, error: error.message };
  }
}

// Main function
async function updateBreedersWithCountry() {
  console.log('🚀 Starting breeders country update process...\n');
  
  try {
    // Scan all breeders
    console.log('📊 Scanning all breeders...');
    const breeders = await scanAllBreeders();
    console.log(`✅ Found ${breeders.length} breeders\n`);
    
    if (breeders.length === 0) {
      console.log('ℹ️  No breeders found to update');
      return;
    }
    
    // Group by current country status
    const breedersWithCountry = breeders.filter(b => b.country);
    const breedersWithoutCountry = breeders.filter(b => !b.country);
    
    console.log(`📈 Current status:`);
    console.log(`   - Breeders with country: ${breedersWithCountry.length}`);
    console.log(`   - Breeders without country: ${breedersWithoutCountry.length}\n`);
    
    if (breedersWithoutCountry.length === 0) {
      console.log('✅ All breeders already have country information');
      return;
    }
    
    // Update breeders without country
    console.log('🔄 Updating breeders without country information...\n');
    
    let successCount = 0;
    let errorCount = 0;
    const countryStats = { 'Canada': 0, 'United States': 0 };
    
    for (let i = 0; i < breedersWithoutCountry.length; i++) {
      const breeder = breedersWithoutCountry[i];
      const progress = `[${i + 1}/${breedersWithoutCountry.length}]`;
      
      console.log(`${progress} Updating ${breeder.business_name || breeder.name} (${breeder.state})...`);
      
      const result = await updateBreeder(breeder);
      
      if (result.success) {
        successCount++;
        countryStats[result.country]++;
        console.log(`   ✅ Set country to: ${result.country}`);
      } else {
        errorCount++;
        console.log(`   ❌ Failed: ${result.error}`);
      }
      
      // Add small delay to avoid throttling
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Update Summary:');
    console.log(`   ✅ Successfully updated: ${successCount}`);
    console.log(`   ❌ Failed updates: ${errorCount}`);
    console.log(`   🇨🇦 Set to Canada: ${countryStats['Canada']}`);
    console.log(`   🇺🇸 Set to United States: ${countryStats['United States']}`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some updates failed. You may want to run the script again.');
    } else {
      console.log('\n🎉 All breeders updated successfully!');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the update
updateBreedersWithCountry().catch(console.error);
