# Breeder iOS App

A React Native iOS application for breeders to manage their kennels, dogs, and communicate with potential puppy families.

## Features

- **Authentication**: Secure login/signup using AWS Cognito
- **Profile Management**: Edit personal and breeder information
- **Kennel Management**: Create and manage multiple kennels
- **Dog Management**: Register and track breeding dogs and puppies
- **Messaging**: Communicate with potential families
- **Consistent UI/UX**: Matches the web breeder-app design

## Tech Stack

- **React Native**: Cross-platform mobile development
- **TypeScript**: Type-safe development
- **React Navigation**: Navigation between screens
- **Shared Packages**: Reuses existing business logic from the monorepo
- **AWS Amplify**: Authentication and backend services
- **React Native Paper**: UI components for consistent design

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── navigation/         # Navigation configuration
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   ├── main/          # Main app screens
│   ├── details/       # Detail view screens
│   └── forms/         # Form screens
├── services/           # API and external services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and constants
```

## Getting Started

### Prerequisites

- Node.js (>=20)
- React Native CLI
- Xcode (for iOS development)
- CocoaPods

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install iOS dependencies:
```bash
cd ios && pod install && cd ..
```

3. Start Metro bundler:
```bash
npm start
```

4. Run on iOS simulator:
```bash
npm run ios
```

### Environment Setup

Create a `.env` file in the root directory with the necessary environment variables:

```env
AWS_REGION=us-east-1
AWS_USER_POOL_ID=your-user-pool-id
AWS_USER_POOL_WEB_CLIENT_ID=your-client-id
API_BASE_URL=https://your-api-url.com
```

## Shared Packages

This app leverages the existing shared packages from the monorepo:

- `@homeforpup/shared-types`: Type definitions
- `@homeforpup/shared-auth`: Authentication logic
- `@homeforpup/shared-messaging`: Messaging functionality
- `@homeforpup/shared-dogs`: Dog management
- `@homeforpup/shared-photo-upload`: Photo upload utilities
- `@homeforpup/shared-api`: API client
- `@homeforpup/shared-lib`: Common utilities

## Development

### Adding New Screens

1. Create the screen component in the appropriate directory under `src/screens/`
2. Add the route to `src/navigation/AppNavigator.tsx`
3. Update the navigation types if needed

### Styling

The app uses a consistent theme defined in `src/utils/theme.ts`. Use the theme constants for colors, spacing, and other design tokens.

### State Management

The app uses React Context for global state management. The main contexts are:

- `AuthContext`: User authentication state
- Additional contexts can be added as needed

## Building for Production

### iOS

1. Build the app:
```bash
npm run build:ios
```

2. Archive in Xcode for App Store submission

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for all new code
3. Follow the established naming conventions
4. Test on both iOS simulator and device

## Troubleshooting

### Metro bundler issues

If you encounter issues with Metro bundler not recognizing shared packages:

1. Clear Metro cache:
```bash
npx react-native start --reset-cache
```

2. Clean and rebuild:
```bash
cd ios && xcodebuild clean && cd ..
npm run ios
```

### iOS build issues

1. Clean build folder in Xcode
2. Delete `node_modules` and reinstall:
```bash
rm -rf node_modules
npm install
cd ios && pod install && cd ..
```

## License

This project is part of the HomeForPup platform.