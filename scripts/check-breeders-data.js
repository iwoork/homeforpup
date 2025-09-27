#!/usr/bin/env node

/**
 * Check Breeders Data
 * 
 * This script checks the current state of breeders data in the database,
 * showing country distribution and sample records.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
});

const dynamodb = DynamoDBDocumentClient.from(client);

// Table name
const BREEDERS_TABLE = process.env.BREEDERS_TABLE_NAME || process.env.BREEDERS_TABLE || 'homeforpup-breeders';

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

// Main function
async function checkBreedersData() {
  console.log('🔍 Checking breeders data...\n');
  
  try {
    // Scan all breeders
    const breeders = await scanAllBreeders();
    console.log(`📊 Total breeders: ${breeders.length}\n`);
    
    if (breeders.length === 0) {
      console.log('ℹ️  No breeders found');
      return;
    }
    
    // Analyze country distribution
    const countryStats = {};
    const stateStats = {};
    const breedersWithCountry = breeders.filter(b => b.country);
    const breedersWithoutCountry = breeders.filter(b => !b.country);
    
    breeders.forEach(breeder => {
      // Country stats
      const country = breeder.country || 'Unknown';
      countryStats[country] = (countryStats[country] || 0) + 1;
      
      // State stats
      const state = breeder.state || 'Unknown';
      stateStats[state] = (stateStats[state] || 0) + 1;
    });
    
    console.log('📈 Country Distribution:');
    Object.entries(countryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([country, count]) => {
        const percentage = ((count / breeders.length) * 100).toFixed(1);
        console.log(`   ${country}: ${count} (${percentage}%)`);
      });
    
    console.log('\n📈 Top 10 States/Provinces:');
    Object.entries(stateStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([state, count]) => {
        const percentage = ((count / breeders.length) * 100).toFixed(1);
        console.log(`   ${state}: ${count} (${percentage}%)`);
      });
    
    console.log('\n📋 Sample Records:');
    breeders.slice(0, 5).forEach((breeder, index) => {
      console.log(`\n${index + 1}. ${breeder.business_name || breeder.name}`);
      console.log(`   ID: ${breeder.id}`);
      console.log(`   Location: ${breeder.city}, ${breeder.state}, ${breeder.country || 'No country'}`);
      console.log(`   Active: ${breeder.active}`);
      console.log(`   Verified: ${breeder.verified}`);
    });
    
    console.log(`\n✅ Breeders with country: ${breedersWithCountry.length}`);
    console.log(`❌ Breeders without country: ${breedersWithoutCountry.length}`);
    
    if (breedersWithoutCountry.length > 0) {
      console.log('\n⚠️  Breeders missing country information:');
      breedersWithoutCountry.slice(0, 10).forEach(breeder => {
        console.log(`   - ${breeder.business_name || breeder.name} (${breeder.state})`);
      });
      if (breedersWithoutCountry.length > 10) {
        console.log(`   ... and ${breedersWithoutCountry.length - 10} more`);
      }
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the check
checkBreedersData().catch(console.error);
