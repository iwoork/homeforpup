# Messaging Implementation Guide

## Overview

The messaging system has been fully implemented for the mobile-app, allowing breeders to communicate with potential dog-parents in real-time. Messages are organized by sender (message threads) for easy information retrieval.

## Architecture

### Backend (AWS Lambda + DynamoDB)

#### API Endpoints

All endpoints are available at: `https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development`

1. **GET /messages/threads**

   - Lists all message threads for authenticated user
   - Returns threads organized by sender
   - Includes unread counts and last message preview

2. **GET /messages/threads/{threadId}/messages**

   - Gets all messages in a specific thread
   - Query params: `limit` (default: 50)
   - Returns messages sorted by timestamp

3. **POST /messages/send**

   - Creates a new message thread
   - Body: `{ recipientId, recipientName, subject, content, messageType }`
   - Returns created thread and message

4. **POST /messages/reply**

   - Replies to an existing thread
   - Body: `{ threadId, content, receiverId, receiverName, subject }`
   - Returns created message

5. **PATCH /messages/threads/{threadId}/read**
   - Marks all messages in thread as read
   - Updates unread counts

#### DynamoDB Tables

**Messages Table**: `homeforpup-messages`

- PK: threadId
- SK: messageId
- GSI1: senderId + timestamp
- GSI2: receiverId + timestamp

**Threads Table**: `homeforpup-message-threads`

- PK: threadId (main record) or threadId#participantId (participant records)
- GSI1: userId + timestamp (for querying user's threads)

### Frontend (React Native)

#### Service Layer

**messageService.ts**

- Handles all API communication
- Manages authentication tokens
- Provides typed interfaces for messages and threads

#### Screens

1. **MessagesScreen** (`/screens/main/MessagesScreen.tsx`)

   - Lists all message threads
   - Shows unread counts per thread
   - Displays sender name and last message preview
   - Pull-to-refresh support

2. **MessageDetailScreen** (`/screens/details/MessageDetailScreen.tsx`)
   - Chat-style interface for message conversations
   - Send and receive messages
   - Auto-scrolls to latest message
   - Marks messages as read automatically
   - Keyboard-aware design

## Features

### Current Implementation

✅ **Thread-based messaging** - Messages organized by conversation
✅ **Real-time API calls** - Fetch latest messages on demand
✅ **Unread counts** - Track unread messages per thread
✅ **Mark as read** - Automatically mark messages when viewed
✅ **Pull-to-refresh** - Manually refresh message list
✅ **Authentication** - Cognito JWT token authentication
✅ **Error handling** - User-friendly error messages

### Message Organization

Messages are organized by sender to make it easy to find information:

- Each thread represents a conversation with a specific person
- Threads show the sender's name prominently
- Last message preview helps identify conversation context
- Subject line preserved throughout conversation

### Data Consistency

The messaging system uses the same DynamoDB tables as the web apps (breeder-app and dog-parent-app):

- `homeforpup-messages` - Stores all messages
- `homeforpup-message-threads` - Stores thread metadata

This ensures:

- Breeders can respond on mobile or web
- Dog Parents can message from any platform
- All conversations are synchronized

## WebSocket Support (Optional)

WebSocket API can be added for real-time message notifications without polling:

### Setup AWS WebSocket API

1. Create WebSocket API in API Gateway
2. Add routes: `$connect`, `$disconnect`, `sendMessage`
3. Store connection IDs in DynamoDB
4. Send notifications when new messages arrive

### Mobile Integration

The `useWebSocket` hook in the messageService can be used to:

- Establish WebSocket connection on mount
- Listen for incoming messages
- Auto-refresh message list
- Show real-time typing indicators

## Usage

### Sending a Message

```typescript
import { messageService } from '../services/messageService';

await messageService.sendMessage({
  recipientId: 'user123',
  recipientName: 'John Doe',
  subject: 'About your Golden Retriever',
  content: 'I am interested in your puppies...',
  messageType: 'inquiry',
});
```

### Getting Threads

```typescript
const threads = await messageService.getThreads();
```

### Getting Messages

```typescript
const messages = await messageService.getMessages(threadId);
```

### Sending a Reply

```typescript
await messageService.sendReply({
  threadId: thread.id,
  content: 'Thank you for your interest...',
  receiverId: otherUserId,
  receiverName: otherUserName,
  subject: thread.subject,
});
```

## Deployment

### Backend Deployment

```bash
cd apps/homeforpup-api
npm run deploy
```

This will:

- Deploy Lambda functions for message endpoints
- Create/update API Gateway routes
- Set up DynamoDB table permissions

### Mobile App

The messaging feature is ready to use in the mobile app. Simply:

1. Navigate to Messages tab
2. View message threads
3. Tap a thread to view and reply to messages

## Testing

### Test Message API

```bash
# Get your JWT token from Cognito
export TOKEN="your-jwt-token"
export API_URL="https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development"

# List threads
curl -H "Authorization: Bearer $TOKEN" "$API_URL/messages/threads"

# Get messages in thread
curl -H "Authorization: Bearer $TOKEN" "$API_URL/messages/threads/{threadId}/messages"

# Send message
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipientId":"user123","subject":"Test","content":"Hello"}' \
  "$API_URL/messages/send"
```

### Test in App

1. Build and run the mobile-app
2. Log in with your credentials
3. Navigate to Messages tab
4. Threads should load from API
5. Tap a thread to view messages
6. Send a test reply

## Troubleshooting

### Messages Not Loading

- Check authentication token is valid
- Verify API endpoint in config.ts
- Check CloudWatch logs for Lambda errors
- Ensure DynamoDB tables exist

### Cannot Send Messages

- Verify recipient ID is valid
- Check user has permission to send messages
- Ensure message content is not empty
- Check network connectivity

### Unread Counts Not Updating

- Ensure mark-as-read API is called
- Verify thread participant records exist
- Check GSI1 index on threads table

## Future Enhancements

- [ ] WebSocket for real-time updates
- [ ] Push notifications for new messages
- [ ] Message attachments (images, PDFs)
- [ ] Message search functionality
- [ ] Archive/delete threads
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Message reactions
- [ ] Group messaging

## Support

For issues or questions:

1. Check CloudWatch logs for API errors
2. Verify DynamoDB table structure
3. Test API endpoints directly
4. Review authentication flow
