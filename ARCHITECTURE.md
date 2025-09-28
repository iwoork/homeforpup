# HomeForPup Monorepo Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        HomeForPup Monorepo                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   Adopter App   │    │   Breeder App   │                    │
│  │  (Port 3000)    │    │  (Port 3001)    │                    │
│  │                 │    │                 │                    │
│  │ • Browse Dogs   │    │ • Kennel Mgmt   │                    │
│  │ • Search/Filter │    │ • Dog Mgmt      │                    │
│  │ • Favorites     │    │ • Announcements │                    │
│  │ • Messaging     │    │ • Analytics     │                    │
│  │ • User Profiles │    │ • Message Mgmt  │                    │
│  └─────────────────┘    └─────────────────┘                    │
│           │                       │                            │
│           └───────────┬───────────┘                            │
│                       │                                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                Shared Packages                              │ │
│  │                                                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │shared-types │ │shared-hooks │ │shared-lib   │          │ │
│  │  │             │ │             │ │             │          │ │
│  │  │• User       │ │• useAuth    │ │• DynamoDB   │          │ │
│  │  │• Message    │ │• useMessages│ │• S3 Client  │          │ │
│  │  │• Dog        │ │• useBreeds  │ │• Email      │          │ │
│  │  │• Kennel     │ │• useWebSocket│ │• Auth      │          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  │                                                             │ │
│  │  ┌─────────────┐ ┌─────────────┐                          │ │
│  │  │shared-      │ │shared-      │                          │ │
│  │  │components   │ │auth         │                          │ │
│  │  │             │ │             │                          │ │
│  │  │• BreedSelector│ │• NextAuth   │                          │ │
│  │  │• PuppyList  │ │• Cognito    │                          │ │
│  │  │• Messaging  │ │• JWT        │                          │ │
│  │  │• Forms      │ │             │                          │ │
│  │  └─────────────┘ └─────────────┘                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🌐 Domain Structure

```
homeforpup.com (Adopter App)
├── /browse          - Browse available puppies
├── /favorites       - User's favorite puppies
├── /messages        - Messaging with breeders
├── /profile         - User profile management
├── /breeds          - Breed information
└── /about           - About page

breeders.homeforpup.com (Breeder App)
├── /dashboard       - Breeder dashboard
├── /kennels         - Kennel management
├── /dogs            - Dog/puppy management
├── /announcements   - Create announcements
├── /messages        - Message management
└── /analytics       - Business analytics
```

## 📦 Package Dependencies

```
┌─────────────────┐    ┌─────────────────┐
│   Adopter App   │    │   Breeder App   │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼────┐    ┌─────▼─────┐    ┌─────▼─────┐
│shared- │    │shared-    │    │shared-    │
│types   │    │components │    │hooks      │
└────────┘    └───────────┘    └───────────┘
    │                │                │
    └────────────────┼────────────────┘
                     │
              ┌─────▼─────┐
              │shared-lib │
              └───────────┘
```

## 🔄 Data Flow

### Authentication Flow
```
User Login → NextAuth → AWS Cognito → JWT Token → Shared Auth Package
```

### Messaging Flow
```
Adopter App → Shared Messaging Hook → API Route → DynamoDB
Breeder App → Shared Messaging Hook → API Route → DynamoDB
```

### Component Sharing
```
Shared Components → Both Apps
├── BreedSelector (used in search/filter)
├── ContactBreederModal (adopter app)
├── MessageThread (both apps)
└── UserProfile (both apps)
```

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Deployment                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │   Adopter App   │              │   Breeder App   │      │
│  │                 │              │                 │      │
│  │ homeforpup.com  │              │breeders.homeforpup.com │
│  │                 │              │                 │      │
│  │ • Static Pages  │              │ • Static Pages  │      │
│  │ • API Routes    │              │ • API Routes    │      │
│  │ • Serverless    │              │ • Serverless    │      │
│  └─────────────────┘              └─────────────────┘      │
│           │                               │                │
│           └───────────────┬───────────────┘                │
│                           │                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Shared Infrastructure                      │ │
│  │                                                         │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │ │
│  │  │   DynamoDB  │ │     S3      │ │     SES     │      │ │
│  │  │             │ │             │ │             │      │ │
│  │  │• Users      │ │• Images     │ │• Emails     │      │ │
│  │  │• Messages   │ │• Documents  │ │• Notifications│     │ │
│  │  │• Dogs       │ │• Avatars    │ │             │      │ │
│  │  │• Kennels    │ │             │ │             │      │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘      │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Development Workflow

### Local Development
```bash
# Terminal 1: Start shared packages
npm run dev --filter=shared-*

# Terminal 2: Start adopter app
npm run dev:adopter

# Terminal 3: Start breeder app  
npm run dev:breeder
```

### Build Process
```bash
# Build all packages first
npm run build --filter=shared-*

# Then build apps
npm run build:adopter
npm run build:breeder
```

## 📊 Benefits of This Architecture

### 1. **Separation of Concerns**
- Adopter and breeder features are completely separate
- Shared functionality is centralized
- Easy to maintain and scale

### 2. **Code Reusability**
- Common components shared between apps
- Shared business logic and utilities
- Consistent UI/UX across both apps

### 3. **Independent Deployment**
- Each app can be deployed independently
- Different release cycles if needed
- Isolated testing and rollbacks

### 4. **Scalability**
- Easy to add new features to specific apps
- Shared packages can be versioned independently
- Team members can work on different apps

### 5. **Developer Experience**
- Clear separation of responsibilities
- Easy to find and modify code
- Consistent development patterns

## 🔐 Security Considerations

### Authentication
- Shared auth package ensures consistent security
- JWT tokens work across both apps
- Role-based access control

### Data Isolation
- Apps share the same database but with proper access controls
- User data is properly segmented
- API routes are app-specific

### CORS and Subdomains
- Proper CORS configuration for subdomain communication
- Secure cookie sharing between apps
- CSRF protection

## 📈 Future Enhancements

### Potential Additions
- Mobile app (React Native) using shared packages
- Admin dashboard app
- API-only package for third-party integrations
- Shared testing utilities package

### Scaling Considerations
- Microservices architecture if needed
- CDN for shared assets
- Database sharding strategies
- Caching layers
