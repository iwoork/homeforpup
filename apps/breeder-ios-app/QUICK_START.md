# iOS App Quick Start 📱

## Status

✅ Metro bundler is running successfully
✅ Babel is isolated to this app only
✅ All dependencies installed locally

## Run the App

### Option 1: Start Metro and iOS Together

```bash
cd /Users/Efren/repos/homeforpup/apps/breeder-ios-app
npm run ios
```

### Option 2: Start Metro First (Recommended)

```bash
# Terminal 1 - Start Metro bundler
cd /Users/Efren/repos/homeforpup/apps/breeder-ios-app
npm start

# Terminal 2 - Launch iOS simulator
cd /Users/Efren/repos/homeforpup/apps/breeder-ios-app
npm run ios
```

### For Android

```bash
cd /Users/Efren/repos/homeforpup/apps/breeder-ios-app
npm run android
```

## First Time Setup

### Install iOS Dependencies (CocoaPods)

```bash
cd /Users/Efren/repos/homeforpup/apps/breeder-ios-app/ios
pod install
cd ..
```

## Key Points

1. **This app is NOT part of the workspace** - it has its own dependencies
2. **Babel is installed locally** - not shared with web apps
3. **Metro bundler** runs on port 8081 by default
4. **All commands** should be run from `apps/breeder-ios-app/` directory

## Troubleshooting

### Clear Cache

```bash
npm start -- --reset-cache
```

### Clean Build (iOS)

```bash
cd ios
rm -rf build/
pod install
cd ..
npm run ios
```

### Reinstall Dependencies

```bash
rm -rf node_modules
npm install
```

## Dependencies

- **React Native**: 0.73.6
- **React**: 18.2.0
- **Babel**: Isolated to this app only ✅
- **Node**: >= 20

## Project Structure

```
apps/breeder-ios-app/
├── node_modules/          # Local dependencies (includes Babel)
├── ios/                   # iOS native code
├── android/              # Android native code
├── src/                  # React Native source code
├── App.tsx              # Root component
├── index.js             # Entry point
├── babel.config.js      # Babel configuration
├── metro.config.js      # Metro bundler config
└── package.json         # Dependencies (standalone)
```

## Metro Bundler is Running

You can now run `npm run ios` in a new terminal to launch the iOS app!
