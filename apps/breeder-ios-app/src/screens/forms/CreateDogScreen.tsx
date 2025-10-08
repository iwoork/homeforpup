import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { theme } from '../../utils/theme';

const CreateDogScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Dog</Text>
        <Text style={styles.subtitle}>Register a new dog in your kennel</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          Add dog form - Coming soon!
        </Text>
        <Text style={styles.descriptionText}>
          This screen will contain a form to add a new dog with
          all the necessary information including breed, health records, and photos.
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

export default CreateDogScreen;


