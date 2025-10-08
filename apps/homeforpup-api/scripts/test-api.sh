#!/bin/bash
# Test API endpoints after deployment
# Usage: ./scripts/test-api.sh <API_URL>

set -e

API_URL="${1}"

if [ -z "$API_URL" ]; then
  echo "Usage: ./scripts/test-api.sh <API_URL>"
  echo "Example: ./scripts/test-api.sh https://abc123.execute-api.us-east-1.amazonaws.com/development"
  exit 1
fi

echo "🧪 Testing API endpoints at: $API_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

test_endpoint() {
  local method=$1
  local path=$2
  local expected_status=$3
  local description=$4
  local data=$5
  
  echo -n "Testing $description... "
  
  if [ -n "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$path" \
      -H "Content-Type: application/json" \
      -d "$data")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$path")
  fi
  
  status_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status_code" == "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
  else
    echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
    echo "Response: $body"
  fi
}

echo "📋 Testing Public Endpoints (No Auth)"
echo "─────────────────────────────────────"
test_endpoint "GET" "/breeds?limit=5" "200" "GET /breeds"
test_endpoint "GET" "/dogs?limit=5" "200" "GET /dogs"
echo ""

echo "🔒 Testing Authenticated Endpoints (Should require auth)"
echo "──────────────────────────────────────────────────────"
test_endpoint "POST" "/dogs" "401" "POST /dogs (no auth)" '{"name":"Test"}'
test_endpoint "PUT" "/users/test-id" "401" "PUT /users/{id} (no auth)" '{"name":"Test"}'
echo ""

echo "📊 Summary"
echo "──────────"
echo "API URL: $API_URL"
echo "Tests completed!"
echo ""
echo "To test authenticated endpoints, get a JWT token and add:"
echo '  -H "Authorization: Bearer YOUR_TOKEN"'

