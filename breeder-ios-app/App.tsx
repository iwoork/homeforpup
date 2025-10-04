/**
 * Breeder iOS App
 * HomeForPup Breeder Mobile Application
 */

// Import polyfills for React Native
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureAmplify } from './src/services/authService';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Configure Amplify
configureAmplify();

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;