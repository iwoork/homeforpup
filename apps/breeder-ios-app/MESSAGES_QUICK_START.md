# Messages Feature - Quick Start Guide

## 🚀 Quick Deployment

### 1. Deploy Backend (5 minutes)

```bash
# Navigate to API directory
cd apps/homeforpup-api

# Install dependencies (if not already done)
npm install

# Deploy to AWS
npm run deploy

# Note the API endpoint URL from output
```

### 2. Configure Mobile App (2 minutes)

The mobile app is already configured, but verify the settings:

```typescript
// apps/breeder-ios-app/src/config/config.ts
export const config = {
  api: {
    baseUrl:
      'https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development',
  },
};
```

### 3. Run Mobile App (3 minutes)

```bash
# Navigate to mobile app
cd apps/breeder-ios-app

# Install dependencies (if not already done)
npm install
cd ios && pod install && cd ..

# Run on iOS
npm run ios

# Or run on Android
npm run android
```

## 📱 Using the Messages Feature

### For Breeders (Mobile App)

1. **View Messages**

   - Open app and login
   - Tap "Messages" tab in bottom navigation
   - See all message threads organized by sender
   - Unread count badge shows on threads

2. **Read Messages**

   - Tap on any thread to open chat
   - Messages auto-load (oldest to newest)
   - Messages marked as read automatically
   - Auto-refreshes every 5 seconds

3. **Reply to Messages**

   - Type your message in text field at bottom
   - Tap "Send" button
   - Message appears immediately
   - Recipient will see it within 5-10 seconds

4. **Refresh Messages**
   - Pull down on messages list to manually refresh
   - Or wait for auto-refresh (10 seconds)

### For Adopters (Web App)

Adopters can send messages from the web app:

1. Browse puppies on adopter-app
2. Click "Contact Breeder"
3. Fill in message form
4. Message delivered to breeder's mobile app

Messages sync across all platforms automatically.

## 🔧 Troubleshooting

### Issue: No messages showing

**Check:**

1. Are you logged in?
2. Is your internet connection working?
3. Are there any messages in the system?

**Solution:**

- Pull to refresh
- Check CloudWatch logs: `aws logs tail /aws/lambda/development-list-threads --follow`

### Issue: Can't send message

**Check:**

1. Is the text field empty?
2. Is the send button disabled?
3. Are you authenticated?

**Solution:**

- Type some text
- Wait for previous message to send
- Re-login if needed

### Issue: Messages not updating in real-time

**Note:** Messages update via polling every 5-10 seconds, not instant.

**To improve:**

- Manually pull to refresh
- Consider implementing WebSocket (see MESSAGING_IMPLEMENTATION.md)

## 🎯 Key Features

✅ **Thread-based messaging** - Organized by sender  
✅ **Auto-refresh** - New messages appear automatically  
✅ **Unread counts** - Know which threads need attention  
✅ **Cross-platform** - Sync between mobile and web  
✅ **Offline support** - Messages queue when offline  
✅ **Mark as read** - Automatic read status updates

## 📊 System Status

**Current Implementation:**

- ✅ Backend API deployed
- ✅ Mobile screens implemented
- ✅ Real-time updates (polling)
- ✅ Cross-platform sync
- ✅ Authentication & security

**Future Enhancements:**

- ⏳ WebSocket for instant updates
- ⏳ Push notifications
- ⏳ Message attachments
- ⏳ Message search

## 📚 Additional Resources

- **Implementation Details:** `MESSAGING_IMPLEMENTATION.md`
- **Deployment Guide:** `MESSAGES_DEPLOYMENT.md`
- **Complete Summary:** `MESSAGES_COMPLETE_SUMMARY.md`

## 🆘 Support

If you encounter issues:

1. **Check logs:**

   ```bash
   # Mobile app logs
   npx react-native log-ios

   # Lambda logs
   aws logs tail /aws/lambda/development-list-threads --follow
   ```

2. **Test API directly:**

   ```bash
   export TOKEN="your-jwt-token"
   curl -H "Authorization: Bearer $TOKEN" \
     "https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development/messages/threads"
   ```

3. **Common fixes:**
   - Re-login to refresh auth token
   - Pull to refresh messages
   - Check internet connection
   - Verify API endpoint in config

## ✅ Success Checklist

Before going live, ensure:

- [ ] Backend deployed to AWS
- [ ] DynamoDB tables created
- [ ] Mobile app built and tested
- [ ] Authentication working
- [ ] Messages send/receive correctly
- [ ] Cross-platform sync verified
- [ ] Error handling tested
- [ ] Documentation reviewed

---

**Quick Start Complete!** 🎉

The messaging feature is ready to use. Start messaging now!
