/**
 * Breeder iOS App
 * HomeForPup Breeder Mobile Application
 */

// Import polyfills for React Native
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider } from '@clerk/clerk-react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import pushNotificationService from './src/services/pushNotificationService';
import config from './src/config/config';

// Token cache for Clerk (bare React Native, not Expo)
const tokenCache = {
  getToken: (key: string) => AsyncStorage.getItem(key),
  saveToken: (key: string, value: string) => AsyncStorage.setItem(key, value),
  clearToken: (key: string) => AsyncStorage.removeItem(key),
};

function App(): React.JSX.Element {
  useEffect(() => {
    console.log('App.tsx: App component mounted');
    pushNotificationService.initialize();
  }, []);

  return (
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={config.clerk.publishableKey}
        tokenCache={tokenCache}
      >
        <SafeAreaProvider>
          <AuthProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <AppNavigator />
          </AuthProvider>
        </SafeAreaProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

export default App;
