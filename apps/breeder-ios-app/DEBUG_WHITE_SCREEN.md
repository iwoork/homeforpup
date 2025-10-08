# Debugging White Screen Issue 🔍

## What I Just Fixed

1. **Added Error Boundary** - The app will now show error details instead of a white screen
2. **Added Logging** - Console logs will show where the app is failing
3. **Made Auth Non-Blocking** - Auth errors won't prevent the app from loading
4. **Fixed Babel Config** - Added reanimated plugin

## Steps to Debug

### 1. Kill All Running Processes

```bash
# Kill metro bundler
lsof -ti:8081 | xargs kill -9

# Kill any running iOS simulators (optional)
killall Simulator
```

### 2. Clear All Caches

```bash
cd /Users/Efren/repos/homeforpup/apps/breeder-ios-app

# Clear metro cache
rm -rf /tmp/metro-*

# Clear watchman
watchman watch-del-all

# Clear iOS build
rm -rf ios/build

# Clear node modules cache (if needed)
npm cache clean --force
```

### 3. Rebuild the App

```bash
cd /Users/Efren/repos/homeforpup/apps/breeder-ios-app

# Clean install
rm -rf node_modules
npm install

# For iOS, reinstall pods
cd ios
pod install
cd ..
```

### 4. Start Fresh

```bash
# Terminal 1 - Start metro with reset cache
npx react-native start --reset-cache
```

```bash
# Terminal 2 - Run the app
npx react-native run-ios
```

### 5. Check Console Logs

You should now see detailed logs:

```
App.tsx: Starting app initialization
App.tsx: Amplify configured successfully
App.tsx: Rendering app
App.tsx: App component mounted
AuthContext: Initializing auth...
AuthContext: Loaded stored auth data: { hasUser: false, hasToken: false }
AuthContext: Auth initialization complete
```

## If You Still See White Screen

The ErrorBoundary should now catch the error and show:

- 😵 Error emoji
- Error message
- Stack trace
- "Try Again" button

**Take a screenshot** of the error screen and share it!

## Common Causes & Fixes

### 1. File Watcher Limit (EMFILE Error)

```bash
# Increase file limit
ulimit -n 10240

# Or install watchman
brew install watchman
```

### 2. Metro Cache Issues

```bash
# Reset everything
npx react-native start --reset-cache
```

### 3. iOS Build Cache

```bash
cd ios
xcodebuild clean
pod deintegrate
pod install
cd ..
```

### 4. React Native CLI Version

```bash
# Update to latest
npx react-native@latest
```

## Enable Chrome DevTools

To see all console logs:

1. While app is running, press `Cmd+D` in iOS Simulator
2. Select "Debug"
3. Chrome will open - open DevTools (F12)
4. Check Console tab for logs

## Still Having Issues?

Run this diagnostic command and share the output:

```bash
cd /Users/Efren/repos/homeforpup/apps/breeder-ios-app
npx react-native doctor
```

## Quick Test - Minimal App

If nothing works, let's test with a minimal version. Create `test-app.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function TestApp() {
  console.log('TestApp: Rendering');
  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ App is Working!</Text>
      <Text style={styles.subtitle}>
        If you see this, React Native is fine.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
});

export default TestApp;
```

Then temporarily change `App.tsx`:

```typescript
import TestApp from './test-app';
export default TestApp;
```

If this works, the issue is in one of your components.

---

**Remember**: The error boundary will now catch crashes and show you exactly what's failing! 🎯
