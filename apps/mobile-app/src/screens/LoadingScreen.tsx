import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Logo from '../components/Logo';
import { theme } from '../utils/theme';

const LoadingScreen: React.FC = () => {
  return (
    <LinearGradient
      colors={['#ffffff', '#f0f9fa', '#e8f5f6']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Logo variant="large" style={styles.logo} />
        <Text style={styles.appName}>Home for Pup</Text>
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.spinner} />
        <Text style={styles.text}>Loading your kennel...</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginBottom: theme.spacing.md,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
    letterSpacing: 0.5,
  },
  spinner: {
    marginBottom: theme.spacing.md,
  },
  text: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});

export default LoadingScreen;

