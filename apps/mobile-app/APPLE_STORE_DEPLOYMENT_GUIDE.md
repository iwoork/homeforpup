# Apple App Store Deployment Guide

## Prerequisites

Before deploying to the Apple App Store, ensure you have:

1. **Apple Developer Account** ($99/year)

   - Sign up at [developer.apple.com](https://developer.apple.com)
   - Complete enrollment process

2. **Development Environment**

   - macOS (required for iOS development)
   - Xcode (latest version from Mac App Store)
   - React Native development environment set up

3. **Required Tools**
   - Xcode Command Line Tools
   - CocoaPods (for iOS dependencies)
   - Node.js and npm/yarn

## Step 1: Configure App Information

### Update app.json

```json
{
  "name": "HomeForPup",
  "displayName": "Home For Pup",
  "version": "1.0.0",
  "buildNumber": "1"
}
```

### Update package.json version

```json
{
  "version": "1.0.0"
}
```

### Configure iOS Project Settings

1. **Open Xcode Project**

   ```bash
   cd apps/mobile-app/ios
   open BreederIosApp.xcworkspace
   ```

2. **Set Bundle Identifier**

   - Select your project in Xcode
   - Go to "Signing & Capabilities"
   - Set Bundle Identifier (e.g., `com.yourcompany.homeforpup`)
   - Enable "Automatically manage signing"
   - Select your Apple Developer Team

3. **Configure App Information**
   - Set Display Name: "Home For Pup"
   - Set Version: "1.0.0"
   - Set Build: "1"
   - Set Deployment Target: iOS 13.0 or higher

## Step 2: Prepare App Assets

### App Icons

Create app icons in the following sizes and add them to `ios/BreederIosApp/Images.xcassets/AppIcon.appiconset/`:

- 1024x1024 (App Store)
- 180x180 (iPhone)
- 167x167 (iPad Pro)
- 152x152 (iPad)
- 120x120 (iPhone)
- 87x87 (iPhone)
- 80x80 (iPad)
- 76x76 (iPad)
- 60x60 (iPhone)
- 58x58 (iPhone)
- 40x40 (iPhone)
- 29x29 (iPhone)

### Launch Screen

Ensure your launch screen is properly configured in `LaunchScreen.storyboard`.

### Screenshots (for App Store)

Prepare screenshots for:

- iPhone 6.7" (iPhone 14 Pro Max): 1290x2796
- iPhone 6.5" (iPhone 11 Pro Max): 1242x2688
- iPhone 5.5" (iPhone 8 Plus): 1242x2208
- iPad Pro (6th gen): 2048x2732
- iPad Pro (5th gen): 2048x2732

## Step 3: Configure App Permissions

Update `ios/BreederIosApp/Info.plist` with proper permission descriptions:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app uses location to help you find nearby breeders and puppies.</string>

<key>NSCameraUsageDescription</key>
<string>This app needs camera access to take photos of puppies and your profile.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to select and upload puppy photos.</string>

<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access for video recording features.</string>
```

## Step 4: Build and Archive

### Clean and Install Dependencies

```bash
cd apps/mobile-app

# Clean everything
rm -rf node_modules
npm install

# Clean iOS
cd ios
rm -rf Pods
rm Podfile.lock
pod install
cd ..
```

### Build for Release

```bash
# Build iOS app
npx react-native run-ios --configuration Release

# Or build directly in Xcode
# Open ios/BreederIosApp.xcworkspace in Xcode
# Select "Any iOS Device (arm64)" as target
# Product → Archive
```

## Step 5: Create App Store Connect Record

1. **Go to App Store Connect**

   - Visit [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Sign in with your Apple Developer account

2. **Create New App**
   - Click "My Apps" → "+" → "New App"
   - Fill in app information:
     - Platform: iOS
     - Name: "Home For Pup"
     - Primary Language: English
     - Bundle ID: Your configured bundle ID
     - SKU: Unique identifier (e.g., "homeforpup-ios")

## Step 6: Configure App Store Information

### App Information

- **Name**: Home For Pup
- **Subtitle**: Connect with ethical breeders
- **Category**: Lifestyle or Social Networking
- **Content Rights**: Your content rights declaration

### App Description

```
Home For Pup is the premier platform connecting families with ethical dog breeders. Whether you're looking for your first puppy or expanding your furry family, we make it easy to find responsible breeders who prioritize the health and well-being of their dogs.

Features:
• Browse puppies from verified breeders
• Connect directly with breeders
• View detailed puppy profiles and photos
• Track your puppy's health and development
• Access educational resources about dog ownership
• Manage your breeding business (for breeders)

Join thousands of families who have found their perfect companion through Home For Pup.
```

### Keywords

```
dog, puppy, breeder, pet, adoption, family, ethical, responsible, health, wellness
```

### App Review Information

- **Contact Information**: Your contact details
- **Demo Account**: Test account credentials (if required)
- **Notes**: Any special instructions for reviewers

## Step 7: Upload Build

### Using Xcode

1. Open your project in Xcode
2. Select "Any iOS Device (arm64)" as target
3. Go to Product → Archive
4. In Organizer, click "Distribute App"
5. Choose "App Store Connect"
6. Follow the upload wizard

### Using Application Loader (Alternative)

1. Build your app
2. Create .ipa file
3. Upload via Application Loader

## Step 8: Submit for Review

1. **Complete App Information**

   - Fill in all required fields in App Store Connect
   - Upload screenshots and app preview videos
   - Set pricing and availability

2. **Submit for Review**
   - Click "Submit for Review"
   - Wait for Apple's review (typically 24-48 hours)

## Step 9: Release Management

### TestFlight (Beta Testing)

- Upload build to TestFlight for internal/external testing
- Invite testers before public release
- Gather feedback and iterate

### Production Release

- After approval, release immediately or schedule release
- Monitor app performance and user feedback
- Prepare for updates and maintenance

## Troubleshooting Common Issues

### Build Issues

```bash
# Clean and rebuild
cd ios
rm -rf build
rm -rf Pods
pod install
cd ..
npx react-native run-ios --configuration Release
```

### Signing Issues

- Ensure Apple Developer account is active
- Check bundle identifier matches App Store Connect
- Verify certificates and provisioning profiles

### Upload Issues

- Check app size limits (4GB max)
- Ensure all required assets are included
- Verify app meets App Store guidelines

## App Store Guidelines Compliance

### Required Compliance

- **Privacy Policy**: Must be accessible within the app
- **Terms of Service**: Required for user agreements
- **Data Collection**: Disclose all data collection practices
- **Content Guidelines**: Ensure appropriate content
- **Functionality**: App must work as described

### Home For Pup Specific Requirements

- **User Authentication**: Secure login system
- **Payment Processing**: If applicable, use approved payment methods
- **User Generated Content**: Moderate photos and messages
- **Location Services**: Proper permission handling
- **Photo Sharing**: Respect privacy and safety

## Post-Launch Maintenance

### Monitoring

- App Store Connect Analytics
- Crash reporting (Firebase, Sentry)
- User feedback and reviews
- Performance metrics

### Updates

- Regular bug fixes and improvements
- New feature releases
- iOS version compatibility updates
- Security patches

## Resources

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [React Native iOS Deployment](https://reactnative.dev/docs/running-on-device#building-your-app-for-production)

## Support

For technical issues:

- Apple Developer Support
- React Native Community
- Stack Overflow
- Your development team

---

**Note**: This guide assumes you have a complete, tested React Native app ready for production deployment. Ensure all features work correctly and the app has been thoroughly tested before submitting to the App Store.
