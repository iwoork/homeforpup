#!/bin/bash
# Get deployed API URL from CloudFormation stack
# Usage: ./scripts/get-api-url.sh [environment]

ENVIRONMENT="${1:-development}"
STACK_NAME="homeforpup-api-${ENVIRONMENT}"

echo "Getting API URL for environment: $ENVIRONMENT"
echo ""

API_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text 2>/dev/null)

if [ -z "$API_URL" ]; then
  echo "❌ Stack not found: $STACK_NAME"
  echo ""
  echo "Available stacks:"
  aws cloudformation list-stacks \
    --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
    --query 'StackSummaries[?contains(StackName, `homeforpup-api`)].StackName' \
    --output table
  exit 1
fi

echo "✅ API URL: $API_URL"
echo ""
echo "Test the API:"
echo "  curl $API_URL/breeds?limit=5"
echo ""
echo "Export to environment:"
echo "  export API_URL='$API_URL'"

