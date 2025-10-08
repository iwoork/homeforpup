import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { theme } from '../../utils/theme';

const KennelDetailScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kennel Details</Text>
        <Text style={styles.subtitle}>Manage your kennel information</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          Kennel detail screen - Coming soon!
        </Text>
        <Text style={styles.descriptionText}>
          This screen will display detailed information about a specific kennel,
          including dogs, litters, and management options.
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

export default KennelDetailScreen;
