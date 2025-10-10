# iOS Deployment Guide - Home For Pup

## Deploy to Your iPhone

### Prerequisites

- Mac with Xcode installed (version 15+ recommended)
- Apple Developer Account (free or paid)
- iPhone with USB cable
- CocoaPods installed

### Step 1: Enable Developer Mode on iPhone

1. Connect your iPhone to your Mac
2. On iPhone, go to **Settings > Privacy & Security**
3. Scroll down and enable **Developer Mode**
4. Restart your iPhone when prompted
5. After restart, confirm you want to enable Developer Mode

### Step 2: Trust Your Computer

1. Connect iPhone to Mac via USB
2. Unlock your iPhone
3. Tap **Trust** when prompted "Trust This Computer?"
4. Enter your iPhone passcode if asked

### Step 3: Install Dependencies

Open Terminal and navigate to the mobile app directory:

```bash
cd /Users/Efren/repos/homeforpup/apps/mobile-app
```

Install npm dependencies:

```bash
npm install
```

Install iOS dependencies (CocoaPods):

```bash
cd ios
pod install
cd ..
```

### Step 4: Open Project in Xcode

Open the workspace (NOT the project file):

```bash
open ios/BreederIosApp.xcworkspace
```

### Step 5: Configure Code Signing in Xcode

1. In Xcode, select **BreederIosApp** in the left navigator
2. Select the **BreederIosApp** target
3. Go to **Signing & Capabilities** tab
4. Check **"Automatically manage signing"**
5. Select your **Team** (your Apple ID)
   - If you don't see a team, click "Add Account" to add your Apple ID
6. Xcode will automatically generate a provisioning profile
7. Change the **Bundle Identifier** if needed (e.g., `com.yourname.homeforpup`)
   - Must be unique if you haven't registered this bundle ID

### Step 6: Select Your iPhone as Target

1. At the top of Xcode, next to the Play button, click the device dropdown
2. Select your iPhone from the list (it should show your iPhone's name)
3. If your iPhone doesn't appear:
   - Make sure it's unlocked and connected
   - Try unplugging and reconnecting
   - Check if Developer Mode is enabled

### Step 7: Build and Run

**Option A: Using Xcode**

1. Click the **Play (▶️)** button in Xcode
2. Wait for the build to complete (first build may take several minutes)
3. If prompted, unlock your iPhone and tap "Trust" again

**Option B: Using React Native CLI**

```bash
npm run ios -- --device
```

Or specify your device:

```bash
npx react-native run-ios --device "Your iPhone Name"
```

### Step 8: Trust Developer Certificate on iPhone

First time running the app, you'll see "Untrusted Developer":

1. On iPhone, go to **Settings > General > VPN & Device Management**
2. Tap on your Apple ID under "Developer App"
3. Tap **Trust "[Your Apple ID]"**
4. Tap **Trust** in the popup

### Step 9: Launch the App

- The app should now launch automatically
- You can open it from your iPhone home screen

## Troubleshooting

### "Could not launch [app]"

- Check Developer Mode is enabled
- Restart Xcode and try again
- Clean build: In Xcode, **Product > Clean Build Folder** (Shift+Cmd+K)

### "Code signing error"

- Make sure you selected your team in Signing & Capabilities
- Try changing the Bundle Identifier to something unique
- Free Apple IDs can only have 3 apps signed at once

### "iPhone is not available"

- Make sure iPhone is unlocked during build
- Check iPhone is running iOS 13+ (this app requires iOS 13 minimum)
- Try restarting both iPhone and Xcode

### App crashes on launch

- Check if you have `.env` file configured properly
- Look at Xcode console for error messages
- Make sure all API endpoints are accessible

### "No devices found"

```bash
# Check connected devices
xcrun xctrace list devices

# Or use React Native CLI
npx react-native run-ios --udid
```

## Alternative: TestFlight (For Distribution)

For a more polished deployment or sharing with others:

1. **Archive the app** in Xcode:
   - Select "Any iOS Device" as target
   - **Product > Archive**
2. **Upload to App Store Connect**:

   - Once archived, Organizer opens
   - Click **Distribute App**
   - Choose **TestFlight**
   - Follow the wizard

3. **Invite testers** via TestFlight app

## Quick Commands Reference

```bash
# Navigate to mobile app
cd /Users/Efren/repos/homeforpup/apps/mobile-app

# Install dependencies
npm install
cd ios && pod install && cd ..

# Run on connected device
npm run ios -- --device

# List available devices
xcrun xctrace list devices

# Clean and rebuild
cd ios
rm -rf build
pod install
cd ..
npm run ios -- --device

# Open in Xcode
open ios/BreederIosApp.xcworkspace
```

## Environment Variables

Make sure you have the necessary environment variables configured. Check if you need a `.env` file in the mobile-app directory with API endpoints and credentials.

## Production Build

For a release build:

```bash
npm run build:ios
```

This creates an optimized production build.

## Notes

- **First build** takes 10-15 minutes typically
- **Free Apple ID** certificates expire after 7 days (need to rebuild)
- **Paid Developer Account** ($99/year) has 1-year certificates
- App stays installed after cable is disconnected
- Check the app logs in Xcode console if issues occur

## Support

If you encounter issues:

1. Check Xcode console for detailed error messages
2. Ensure all dependencies are installed
3. Try cleaning the build folder and rebuilding
4. Make sure your iPhone iOS version is compatible
