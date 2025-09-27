#!/usr/bin/env node

/**
 * Test Country Filter
 * 
 * This script tests the country filter functionality by making API calls
 * and verifying the results.
 */

const https = require('https');
const http = require('http');

// Test function
async function testCountryFilter() {
  console.log('🧪 Testing country filter functionality...\n');
  
  const baseUrl = 'http://localhost:3002';
  
  try {
    // Test Canada filter
    console.log('🇨🇦 Testing Canada filter...');
    const canadaResponse = await makeRequest(`${baseUrl}/api/breeders?country=Canada&limit=10`);
    const canadaData = JSON.parse(canadaResponse);
    
    console.log(`   Found ${canadaData.breeders.length} Canadian breeders`);
    console.log(`   Total available: ${canadaData.total}`);
    console.log(`   Available states: ${canadaData.filters.availableStates.slice(0, 5).join(', ')}...`);
    
    // Test USA filter
    console.log('\n🇺🇸 Testing USA filter...');
    const usaResponse = await makeRequest(`${baseUrl}/api/breeders?country=USA&limit=10`);
    const usaData = JSON.parse(usaResponse);
    
    console.log(`   Found ${usaData.breeders.length} US breeders`);
    console.log(`   Total available: ${usaData.total}`);
    console.log(`   Available states: ${usaData.filters.availableStates.slice(0, 5).join(', ')}...`);
    
    // Test no country filter (should show all)
    console.log('\n🌍 Testing no country filter...');
    const allResponse = await makeRequest(`${baseUrl}/api/breeders?limit=10`);
    const allData = JSON.parse(allResponse);
    
    console.log(`   Found ${allData.breeders.length} breeders (all countries)`);
    console.log(`   Total available: ${allData.total}`);
    
    // Verify country distribution
    console.log('\n📊 Country distribution in results:');
    const canadaCount = canadaData.breeders.filter(b => b.country === 'Canada').length;
    const usaCount = usaData.breeders.filter(b => b.country === 'USA').length;
    
    console.log(`   Canada filter: ${canadaCount}/${canadaData.breeders.length} are Canadian`);
    console.log(`   USA filter: ${usaCount}/${usaData.breeders.length} are US`);
    
    // Test state filtering
    console.log('\n🗺️  State filtering test:');
    const canadaStates = [...new Set(canadaData.breeders.map(b => b.state))];
    const usaStates = [...new Set(usaData.breeders.map(b => b.state))];
    
    console.log(`   Canadian provinces: ${canadaStates.slice(0, 5).join(', ')}...`);
    console.log(`   US states: ${usaStates.slice(0, 5).join(', ')}...`);
    
    // Summary
    console.log('\n✅ Test Summary:');
    console.log(`   Canada: ${canadaData.total} breeders`);
    console.log(`   USA: ${usaData.total} breeders`);
    console.log(`   Total: ${allData.total} breeders`);
    console.log(`   Filter accuracy: ${canadaCount === canadaData.breeders.length && usaCount === usaData.breeders.length ? 'PASS' : 'FAIL'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        resolve(data);
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Run the test
testCountryFilter().catch(console.error);
