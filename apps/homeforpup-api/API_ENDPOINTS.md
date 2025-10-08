# API Endpoints Reference

## 🌐 Base URL

**Development:**
```
https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development
```

## 📋 Available Endpoints

### Dogs API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dogs` | Optional | List all dogs with pagination |
| GET | `/dogs/{id}` | Optional | Get dog by ID |
| POST | `/dogs` | Required | Create new dog |
| PUT | `/dogs/{id}` | Required | Update dog |
| DELETE | `/dogs/{id}` | Required | Delete dog |

**Example:**
```bash
# List dogs
curl "https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development/dogs?limit=10"

# Get specific dog
curl "https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development/dogs/DOG_ID"

# Create dog (with auth)
curl -X POST "https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development/dogs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Max","breed":"Golden Retriever","kennelId":"KENNEL_ID"}'
```

### Users API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/{id}` | Optional | Get user profile |
| PUT | `/users/{id}` | Required | Update user profile |

**Example:**
```bash
# Get user
curl "https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development/users/USER_ID"

# Update user (with auth)
curl -X PUT "https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development/users/USER_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","location":"New York"}'
```

### Breeds API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/breeds` | None | List dog breeds |

**Example:**
```bash
# List all breeds
curl "https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development/breeds"

# Filter breeds
curl "https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development/breeds?search=golden&size=large&limit=10"
```

**Query Parameters:**
- `search` - Filter by name
- `category` - Filter by breed group
- `size` - Filter by size (small/medium/large)
- `breedType` - Filter by type (purebred/designer)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50)
- `sortBy` - Sort field (default: name)

## 🔒 Authentication

### Getting a JWT Token

**Option 1: Via Cognito CLI**
```bash
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id 3d6m93u51ggssrc7t49cjnnk53 \
  --auth-parameters USERNAME=user@example.com,PASSWORD=YourPassword
```

**Option 2: Via Frontend (recommended)**
Your frontend apps already handle authentication - just pass the JWT token from the session.

### Using the Token

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development/dogs"
```

## 📋 Response Format

### Success Response
```json
{
  "breeds": [...],
  "page": 1,
  "limit": 10,
  "total": 80,
  "totalPages": 8,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": {...}
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🚀 Quick Tests

```bash
# Set your API URL
export API_URL="https://822fu3f7bk.execute-api.us-east-1.amazonaws.com/development"

# Test breeds (public)
curl "$API_URL/breeds?limit=5"

# Test dogs (public)
curl "$API_URL/dogs?limit=5"

# Test with filters
curl "$API_URL/breeds?search=golden&size=large"

# Test specific resource
curl "$API_URL/dogs/YOUR_DOG_ID"
```

## 📊 Coming Soon (Not Yet Deployed)

- `/kennels` - Kennel management
- `/messages` - Messaging system
- `/favorites` - User favorites
- `/activities` - Activity tracking
- `/litters` - Litter management
- `/upload` - File uploads

Follow `MIGRATION_GUIDE.md` to add these!

## 🔧 Troubleshooting

**401 Unauthorized**
- Endpoint requires authentication
- Get JWT token from Cognito
- Include in Authorization header

**404 Not Found**
- Check endpoint URL is correct
- Ensure base URL ends with `/development`

**500 Internal Server Error**
- Check CloudWatch logs
- Verify table names are correct
- Test Lambda function directly

**CORS Error**
- Frontend domain must be in allowedOrigins
- Update `lib/config/environments.ts`
- Redeploy: `npm run deploy`

---

**API Status:** 🟢 LIVE  
**Last Updated:** October 8, 2025  
**Version:** 1.0.0
