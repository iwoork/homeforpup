# Mobile App Name Change

## Change Summary

Updated the mobile app display name from **"BreederIosApp"** to **"Home For Pup"**

The app will now show **"Home For Pup"** as the name under the icon on your phone.

## Files Modified

### 1. **app.json**

Updated the app configuration:

- `name`: "BreederIosApp" (internal registration name - must stay the same)
- `displayName`: "Home For Pup" (name shown on device) ✅ **CHANGED**

### 2. **iOS - Info.plist**

Path: `ios/BreederIosApp/Info.plist`

- Updated `CFBundleDisplayName` to "Home For Pup" ✅ **CHANGED**

### 3. **Android - strings.xml**

Path: `android/app/src/main/res/values/strings.xml`

- Updated `app_name` to "Home For Pup" ✅ **CHANGED**

## How to Apply the Changes

### Step 1: Restart Metro (IMPORTANT!)

Metro bundler needs to reload the app configuration:

```bash
# Stop Metro if it's running (Ctrl+C)
# Then restart with cache reset:
cd apps/mobile-app
npx react-native start --reset-cache
```

### Step 2: Rebuild the App

**In a NEW terminal window**, rebuild the app:

**For iOS:**

```bash
cd apps/mobile-app
npx react-native run-ios
```

**For Android:**

```bash
cd apps/mobile-app
npx react-native run-android
```

### Alternative: Full Clean Rebuild

If you still see issues, do a full clean:

**For iOS:**

```bash
cd apps/mobile-app
rm -rf ios/build
cd ios && pod install && cd ..
npx react-native start --reset-cache
# Then in another terminal:
npx react-native run-ios
```

**For Android:**

```bash
cd apps/mobile-app
cd android && ./gradlew clean && cd ..
npx react-native start --reset-cache
# Then in another terminal:
npx react-native run-android
```

## Troubleshooting

### Error: "BreederIosApp has not been registered"

**Solution:** This means Metro didn't pick up the app.json changes.

1. Stop Metro (Ctrl+C)
2. Start with cache reset: `npx react-native start --reset-cache`
3. Rebuild the app

### Why keep "BreederIosApp" as the internal name?

The `name` field in `app.json` is used by React Native's `AppRegistry.registerComponent()`. This must match what the native iOS and Android projects expect. Changing this would require updating multiple native project files.

The `displayName` is what users see on their home screen - this is what we changed to "Home For Pup".

## Verification

After rebuilding, verify the name change:

### iOS:

- Check the app name under the icon on your device/simulator
- Should display: **"Home For Pup"** ✅

### Android:

- Check the app name under the icon on your device/emulator
- Should display: **"Home For Pup"** ✅

## Important Notes

1. ✅ **Display Name Changed**: "Home For Pup" will appear under the app icon
2. ✅ **Internal Name Unchanged**: "BreederIosApp" remains for internal registration
3. ✅ **Bundle Identifier Unchanged**: No impact on app identity
4. ✅ **Functionality Unchanged**: All features work exactly the same
5. ⚠️ **Metro Restart Required**: Must restart Metro bundler with cache reset
6. ⚠️ **Rebuild Required**: Must rebuild (not just reload) to see changes

## What Changed vs What Stayed the Same

### Changed:

- ✅ App name shown on phone home screen
- ✅ iOS Info.plist display name
- ✅ Android strings.xml app name

### Unchanged:

- ✅ Internal app registration name
- ✅ Bundle identifier
- ✅ Folder structure
- ✅ Package name in package.json
- ✅ All app functionality

## Status

✅ **COMPLETE** - Metro restart and rebuild required to see changes on device.

## Current Status

Metro bundler is now running with cache reset. When you rebuild the app, it will show "Home For Pup" as the display name.
