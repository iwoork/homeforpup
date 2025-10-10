# HomeForPup Monorepo

A comprehensive dog adoption and breeding platform built as a monorepo with separate applications for dog-parents and breeders.

## 🏗️ Architecture

This monorepo is organized into two main applications and shared packages:

### Applications

- **`apps/dog-parent-app`** - Main application for dog lovers and dog-parents
  - Browse available puppies
  - Search and filter by breed, location, etc.
  - Contact breeders
  - Manage favorites
  - User profiles and preferences

- **`apps/breeder-app`** - Dedicated application for breeders
  - Kennel management
  - Dog/puppy management
  - Announcement creation
  - Message management
  - Business analytics

### Shared Packages

- **`packages/shared-types`** - TypeScript type definitions
- **`packages/shared-components`** - Reusable UI components
- **`packages/shared-hooks`** - Custom React hooks
- **`packages/shared-lib`** - Utility functions and API clients
- **`packages/shared-auth`** - Authentication logic

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS account (for DynamoDB, S3, SES)

### Installation

```bash
# Install dependencies
npm install

# Install turbo globally (if not already installed)
npm install -g turbo

# Build all packages
npm run build

# Start development servers
npm run dev
```

### Development Commands

```bash
# Start all apps in development mode
npm run dev

# Start specific app
npm run dev:dog-parent    # Dog Parent app on port 3000
npm run dev:breeder    # Breeder app on port 3001

# Build all packages and apps
npm run build

# Build specific app
npm run build:dog-parent
npm run build:breeder

# Lint all packages
npm run lint

# Type check all packages
npm run type-check

# Clean all build artifacts
npm run clean
```

## 📁 Project Structure

```
homeforpup/
├── apps/
│   ├── dog-parent-app/          # Main dog-parent application
│   │   ├── src/
│   │   │   ├── app/          # Next.js app directory
│   │   │   ├── components/   # App-specific components
│   │   │   ├── features/     # Feature modules
│   │   │   ├── hooks/        # App-specific hooks
│   │   │   └── lib/          # App-specific utilities
│   │   ├── package.json
│   │   └── next.config.js
│   └── breeder-app/          # Breeder application
│       ├── src/
│       │   ├── app/          # Next.js app directory
│       │   ├── components/   # App-specific components
│       │   ├── features/     # Feature modules
│       │   ├── hooks/        # App-specific hooks
│       │   └── lib/          # App-specific utilities
│       ├── package.json
│       └── next.config.js
├── packages/
│   ├── shared-types/         # TypeScript definitions
│   ├── shared-components/    # Reusable UI components
│   ├── shared-hooks/         # Custom React hooks
│   ├── shared-lib/           # Utility functions
│   └── shared-auth/          # Authentication logic
├── package.json              # Root package.json
├── turbo.json               # Turbo configuration
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` files in each app directory:

```bash
# apps/dog-parent-app/.env.local
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID=your_client_id
NEXT_PUBLIC_AWS_S3_BUCKET=your_s3_bucket
# ... other AWS config

# apps/breeder-app/.env.local
# Same configuration as dog-parent app
```

### Subdomain Configuration

- **Dog Parent App**: `homeforpup.com` (main domain)
- **Breeder App**: `breeders.homeforpup.com` (subdomain)

## 🎯 Key Features

### Dog Parent App Features
- 🐕 Browse available puppies
- 🔍 Advanced search and filtering
- ❤️ Favorites management
- 💬 Direct messaging with breeders
- 👤 User profiles and preferences
- 📱 Mobile-responsive design

### Breeder App Features
- 🏠 Kennel management
- 🐕 Dog and puppy management
- 📢 Announcement creation
- 💬 Message management
- 📊 Business analytics
- 📸 Photo and document uploads

### Shared Features
- 🔐 Authentication (NextAuth.js + AWS Cognito)
- 💬 Real-time messaging
- 🎨 Consistent UI components
- 📱 Responsive design
- 🔍 Breed selection and filtering

## 🛠️ Technology Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **UI Library**: Ant Design
- **State Management**: SWR + React Query
- **Authentication**: NextAuth.js + AWS Cognito
- **Database**: AWS DynamoDB
- **Storage**: AWS S3
- **Email**: AWS SES
- **Monorepo**: Turbo
- **Deployment**: Vercel (recommended)

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables for each app
3. Set up custom domains:
   - Dog Parent app: `homeforpup.com`
   - Breeder app: `breeders.homeforpup.com`

### Environment Setup

Each app needs its own environment configuration:

```bash
# Dog Parent app environment
NEXT_PUBLIC_APP_URL=https://homeforpup.com
NEXT_PUBLIC_BREEDER_APP_URL=https://breeders.homeforpup.com

# Breeder app environment  
NEXT_PUBLIC_APP_URL=https://breeders.homeforpup.com
NEXT_PUBLIC_ADOPTER_APP_URL=https://homeforpup.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.
