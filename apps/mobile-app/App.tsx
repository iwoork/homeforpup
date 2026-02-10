/**
 * Breeder iOS App
 * HomeForPup Breeder Mobile Application
 */

// Import polyfills for React Native
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import React, { useEffect } from 'react';
import { StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureAmplify } from './src/services/authService';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import pushNotificationService from './src/services/pushNotificationService';

// Configure Amplify
console.log('App.tsx: Starting app initialization');
try {
  configureAmplify();
  console.log('App.tsx: Amplify configured successfully');
} catch (error) {
  console.error('App.tsx: Error configuring Amplify:', error);
}

function App(): React.JSX.Element {
  useEffect(() => {
    console.log('App.tsx: App component mounted');
    // Initialize push notification listeners early
    pushNotificationService.initialize();
  }, []);

  console.log('App.tsx: Rendering app');

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;