# Messages Feature Deployment Guide

## Prerequisites

Before deploying the messaging feature, ensure you have:

1. AWS CLI configured with proper credentials
2. Node.js 18.x or later installed
3. Access to AWS Cognito User Pool
4. DynamoDB tables created
5. API Gateway deployed

## Step 1: Verify DynamoDB Tables

Ensure these tables exist in your AWS account:

### Messages Table

```bash
aws dynamodb describe-table --table-name homeforpup-messages --region us-east-1
```

If not exists, create it:

```bash
aws dynamodb create-table \
  --table-name homeforpup-messages \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
    AttributeName=GSI2PK,AttributeType=S \
    AttributeName=GSI2SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    "[
      {
        \"IndexName\": \"GSI1\",
        \"KeySchema\": [{\"AttributeName\":\"GSI1PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI1SK\",\"KeyType\":\"RANGE\"}],
        \"Projection\":{\"ProjectionType\":\"ALL\"},
        \"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}
      },
      {
        \"IndexName\": \"GSI2\",
        \"KeySchema\": [{\"AttributeName\":\"GSI2PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI2SK\",\"KeyType\":\"RANGE\"}],
        \"Projection\":{\"ProjectionType\":\"ALL\"},
        \"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}
      }
    ]" \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

### Threads Table

```bash
aws dynamodb describe-table --table-name homeforpup-message-threads --region us-east-1
```

If not exists, create it:

```bash
aws dynamodb create-table \
  --table-name homeforpup-message-threads \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
  --global-secondary-indexes \
    "[
      {
        \"IndexName\": \"GSI1\",
        \"KeySchema\": [{\"AttributeName\":\"GSI1PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI1SK\",\"KeyType\":\"RANGE\"}],
        \"Projection\":{\"ProjectionType\":\"ALL\"},
        \"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}
      }
    ]" \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

## Step 2: Deploy Lambda Functions

Navigate to the API directory and deploy:

```bash
cd apps/homeforpup-api

# Install dependencies
npm install

# Deploy the stack
npm run deploy

# Or deploy to production
npm run deploy -- --stage production
```

This will create/update:

- Lambda functions for message endpoints
- API Gateway routes
- IAM roles and permissions
- CloudWatch log groups

## Step 3: Verify API Endpoints

Test the deployed endpoints:

```bash
# Set your variables
export API_URL="https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development"
export TOKEN="your-jwt-token-here"

# Test list threads
curl -H "Authorization: Bearer $TOKEN" "$API_URL/messages/threads"

# Should return: {"threads": []}
```

## Step 4: Update Mobile App Configuration

Ensure the mobile app points to the correct API:

```typescript
// apps/mobile-app/src/config/config.ts
export const config = {
  api: {
    baseUrl:
      'https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development',
  },
  // ... other config
};
```

## Step 5: Build and Test Mobile App

### iOS

```bash
cd apps/mobile-app

# Install dependencies
npm install

# Install iOS dependencies
cd ios && pod install && cd ..

# Run on iOS simulator
npm run ios

# Or run on device
npm run ios -- --device
```

### Android

```bash
cd apps/mobile-app

# Install dependencies
npm install

# Run on Android emulator
npm run android
```

## Step 6: Test Messaging Flow

1. **Login to the app**

   - Use valid Cognito credentials
   - Verify authentication token is generated

2. **Navigate to Messages tab**

   - Should see empty state or existing threads
   - Pull to refresh should work

3. **Send a test message**

   - You can use the web app (breeder-app or adopter-app) to send a message
   - Should appear in mobile app within 10 seconds (polling interval)

4. **Open a message thread**

   - Tap on a thread
   - Should load all messages
   - Messages should be marked as read

5. **Send a reply**
   - Type a message
   - Tap Send
   - Message should appear in chat
   - Should sync across devices

## Monitoring

### CloudWatch Logs

View Lambda function logs:

```bash
# List threads function
aws logs tail /aws/lambda/development-list-threads --follow --region us-east-1

# Get messages function
aws logs tail /aws/lambda/development-get-thread-messages --follow --region us-east-1

# Send message function
aws logs tail /aws/lambda/development-send-message --follow --region us-east-1
```

### DynamoDB Metrics

Monitor table performance:

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=homeforpup-messages \
  --start-time 2025-10-08T00:00:00Z \
  --end-time 2025-10-08T23:59:59Z \
  --period 3600 \
  --statistics Sum \
  --region us-east-1
```

## Troubleshooting

### Issue: "Unauthorized" error

**Cause**: JWT token is invalid or expired

**Solution**:

```bash
# Refresh the session in the app
# Or get a new token from Cognito
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id 3d6m93u51ggssrc7t49cjnnk53 \
  --auth-parameters USERNAME=user@example.com,PASSWORD=YourPassword
```

### Issue: "Thread not found" error

**Cause**: User doesn't have access to thread

**Solution**:

- Verify participant record exists: `threadId#userId`
- Check GSI1 index has correct userId
- Ensure user is in participants array

### Issue: Messages not loading

**Cause**: API endpoint or authentication issue

**Solution**:

1. Check mobile app logs: `npx react-native log-ios` or `npx react-native log-android`
2. Verify API URL in config.ts
3. Test API endpoint directly with curl
4. Check Lambda function logs in CloudWatch

### Issue: Polling not working

**Cause**: Interval not set up correctly

**Solution**:

- Verify polling interval in useEffect
- Check cleanup function clears interval
- Ensure loading/refreshing states don't block polling

## Performance Optimization

### Reduce Polling Frequency

For production, consider:

- Increase poll interval to 30-60 seconds
- Only poll when app is in foreground
- Implement WebSocket for real-time updates

```typescript
// Reduce polling to 30 seconds
const pollInterval = setInterval(() => {
  if (!loading && !refreshing) {
    fetchMessageThreads();
  }
}, 30000); // 30 seconds
```

### Enable DynamoDB Auto Scaling

```bash
aws application-autoscaling register-scalable-target \
  --service-namespace dynamodb \
  --resource-id "table/homeforpup-messages" \
  --scalable-dimension "dynamodb:table:ReadCapacityUnits" \
  --min-capacity 5 \
  --max-capacity 40 \
  --region us-east-1
```

### Add API Caching

Update API Gateway to cache responses:

```bash
aws apigateway update-stage \
  --rest-api-id YOUR_API_ID \
  --stage-name development \
  --patch-operations op=replace,path=/cacheClusterEnabled,value=true
```

## Security Considerations

1. **Authentication**: All endpoints require valid Cognito JWT token
2. **Authorization**: Users can only access their own threads
3. **Data Validation**: Input is validated in Lambda functions
4. **Rate Limiting**: Consider adding rate limits in API Gateway
5. **Encryption**: DynamoDB uses encryption at rest

## Rollback

If issues occur, rollback to previous version:

```bash
cd apps/homeforpup-api

# List previous deployments
aws cloudformation list-stacks --stack-status-filter UPDATE_COMPLETE

# Rollback to previous stack
aws cloudformation update-stack \
  --stack-name homeforpup-api-dev \
  --use-previous-template
```

## Next Steps

1. ✅ Basic messaging is working
2. ⏳ Consider adding WebSocket for real-time updates
3. ⏳ Add push notifications
4. ⏳ Implement message attachments
5. ⏳ Add message search

## Support

For deployment issues:

1. Check AWS Console for errors
2. Review CloudWatch logs
3. Verify IAM permissions
4. Test API endpoints directly
5. Check mobile app configuration
