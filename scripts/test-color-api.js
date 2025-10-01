#!/usr/bin/env node

/**
 * Test script for the dog-colors API endpoint
 * 
 * Usage:
 *   node scripts/test-color-api.js [port]
 * 
 * Examples:
 *   node scripts/test-color-api.js 3001  # Test adopter-app
 *   node scripts/test-color-api.js 3002  # Test breeder-app
 */

const http = require('http');

const PORT = process.argv[2] || 3001;
const BASE_URL = `http://localhost:${PORT}`;

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data, error: e.message });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function testEndpoint(name, path, validator) {
  log(`\n${name}`, 'bright');
  log(`  GET ${path}`, 'cyan');
  
  try {
    const result = await makeRequest(path);
    
    if (result.status === 200) {
      log(`  ✓ Status: ${result.status}`, 'green');
      
      if (validator) {
        const validation = validator(result.data);
        if (validation.success) {
          log(`  ✓ ${validation.message}`, 'green');
        } else {
          log(`  ✗ ${validation.message}`, 'red');
        }
      }
      
      return true;
    } else {
      log(`  ✗ Status: ${result.status}`, 'red');
      log(`  Error: ${JSON.stringify(result.data)}`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ✗ Request failed: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('='.repeat(60), 'bright');
  log('  Dog Colors API Test Suite', 'bright');
  log(`  Testing: ${BASE_URL}`, 'bright');
  log('='.repeat(60), 'bright');

  const results = [];

  // Test 1: Get all colors
  results.push(await testEndpoint(
    'Test 1: Get All Colors',
    '/api/dog-colors',
    (data) => {
      if (!data.colors || !Array.isArray(data.colors)) {
        return { success: false, message: 'Missing or invalid colors array' };
      }
      if (!data.total || typeof data.total !== 'number') {
        return { success: false, message: 'Missing or invalid total count' };
      }
      if (!data.categories || typeof data.categories !== 'object') {
        return { success: false, message: 'Missing or invalid categories' };
      }
      return { 
        success: true, 
        message: `Found ${data.total} colors (${data.categories.solid} solid, ${data.categories.pattern} pattern, ${data.categories['multi-color']} multi-color)` 
      };
    }
  ));

  // Test 2: Filter by solid category
  results.push(await testEndpoint(
    'Test 2: Filter by Solid Colors',
    '/api/dog-colors?category=solid',
    (data) => {
      if (!data.colors || !Array.isArray(data.colors)) {
        return { success: false, message: 'Missing or invalid colors array' };
      }
      const allSolid = data.colors.every(c => c.category === 'solid');
      if (!allSolid) {
        return { success: false, message: 'Not all colors are solid' };
      }
      return { success: true, message: `Found ${data.colors.length} solid colors` };
    }
  ));

  // Test 3: Filter by pattern category
  results.push(await testEndpoint(
    'Test 3: Filter by Pattern Colors',
    '/api/dog-colors?category=pattern',
    (data) => {
      if (!data.colors || !Array.isArray(data.colors)) {
        return { success: false, message: 'Missing or invalid colors array' };
      }
      const allPattern = data.colors.every(c => c.category === 'pattern');
      if (!allPattern) {
        return { success: false, message: 'Not all colors are pattern' };
      }
      return { success: true, message: `Found ${data.colors.length} pattern colors` };
    }
  ));

  // Test 4: Filter by multi-color category
  results.push(await testEndpoint(
    'Test 4: Filter by Multi-Color',
    '/api/dog-colors?category=multi-color',
    (data) => {
      if (!data.colors || !Array.isArray(data.colors)) {
        return { success: false, message: 'Missing or invalid colors array' };
      }
      const allMultiColor = data.colors.every(c => c.category === 'multi-color');
      if (!allMultiColor) {
        return { success: false, message: 'Not all colors are multi-color' };
      }
      return { success: true, message: `Found ${data.colors.length} multi-color options` };
    }
  ));

  // Test 5: Search for "black"
  results.push(await testEndpoint(
    'Test 5: Search for "black"',
    '/api/dog-colors?search=black',
    (data) => {
      if (!data.colors || !Array.isArray(data.colors)) {
        return { success: false, message: 'Missing or invalid colors array' };
      }
      const hasBlack = data.colors.some(c => c.name.toLowerCase().includes('black'));
      if (!hasBlack) {
        return { success: false, message: 'No black colors found in search' };
      }
      return { success: true, message: `Found ${data.colors.length} colors matching "black"` };
    }
  ));

  // Test 6: Limit results
  results.push(await testEndpoint(
    'Test 6: Limit Results to 5',
    '/api/dog-colors?limit=5',
    (data) => {
      if (!data.colors || !Array.isArray(data.colors)) {
        return { success: false, message: 'Missing or invalid colors array' };
      }
      if (data.colors.length > 5) {
        return { success: false, message: `Expected max 5 colors, got ${data.colors.length}` };
      }
      return { success: true, message: `Correctly limited to ${data.colors.length} colors` };
    }
  ));

  // Test 7: Verify color structure
  results.push(await testEndpoint(
    'Test 7: Verify Color Data Structure',
    '/api/dog-colors?limit=1',
    (data) => {
      if (!data.colors || data.colors.length === 0) {
        return { success: false, message: 'No colors returned' };
      }
      const color = data.colors[0];
      const requiredFields = ['id', 'name', 'category'];
      const missingFields = requiredFields.filter(field => !color[field]);
      if (missingFields.length > 0) {
        return { success: false, message: `Missing required fields: ${missingFields.join(', ')}` };
      }
      return { success: true, message: `Color structure valid (${color.name})` };
    }
  ));

  // Print summary
  log('\n' + '='.repeat(60), 'bright');
  log('  Test Summary', 'bright');
  log('='.repeat(60), 'bright');
  
  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;
  const total = results.length;
  
  log(`\n  Total Tests: ${total}`, 'bright');
  log(`  Passed: ${passed}`, passed === total ? 'green' : 'yellow');
  log(`  Failed: ${failed}`, failed === 0 ? 'green' : 'red');
  
  if (passed === total) {
    log('\n  ✓ All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n  ✗ Some tests failed', 'red');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(err => {
  log(`\n✗ Test suite failed: ${err.message}`, 'red');
  process.exit(1);
});

