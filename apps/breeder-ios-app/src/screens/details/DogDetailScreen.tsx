import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { theme } from '../../utils/theme';

const DogDetailScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dog Details</Text>
        <Text style={styles.subtitle}>Manage dog information and records</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          Dog detail screen - Coming soon!
        </Text>
        <Text style={styles.descriptionText}>
          This screen will display detailed information about a specific dog,
          including health records, breeding history, and photos.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  content: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  descriptionText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default DogDetailScreen;


