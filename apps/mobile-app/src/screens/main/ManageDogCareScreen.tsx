import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useVeterinarians } from '../../hooks/useVeterinarians';
import { theme } from '../../utils/theme';
import { Veterinarian } from '../../../../packages/shared-types/src';

const ManageDogCareScreen: React.FC = () => {
  const navigation = useNavigation();
  const { veterinarians, loading, error, refetch, createVeterinarian, deleteVeterinarian } = useVeterinarians();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };


  const handleAddVeterinarian = () => {
    navigation.navigate('AddVeterinarian' as never);
  };

  const handleEditVeterinarian = (veterinarian: Veterinarian) => {
    navigation.navigate('EditVeterinarian' as never, { veterinarian } as never);
  };

  const handleDeleteVeterinarian = (veterinarian: Veterinarian) => {
    Alert.alert(
      'Delete Veterinarian',
      `Are you sure you want to delete ${veterinarian.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteVeterinarian(veterinarian.id);
            if (!success) {
              Alert.alert('Error', 'Failed to delete veterinarian');
            }
          },
        },
      ]
    );
  };

  const handleViewVetVisits = () => {
    navigation.navigate('VetVisitsList' as never);
  };

  const renderVeterinarianCard = (veterinarian: Veterinarian) => (
    <View key={veterinarian.id} style={styles.veterinarianCard}>
      <View style={styles.veterinarianHeader}>
        <View style={styles.veterinarianInfo}>
          <Text style={styles.veterinarianName}>{veterinarian.name}</Text>
          <Text style={styles.veterinarianClinic}>{veterinarian.clinic}</Text>
          {veterinarian.phone && (
            <Text style={styles.veterinarianPhone}>{veterinarian.phone}</Text>
          )}
        </View>
        <View style={styles.veterinarianActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditVeterinarian(veterinarian)}
          >
            <Icon name="pencil" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteVeterinarian(veterinarian)}
          >
            <Icon name="trash" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      {veterinarian.specialties && veterinarian.specialties.length > 0 && (
        <View style={styles.specialtiesContainer}>
          {veterinarian.specialties.map((specialty, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading veterinarians...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Manage Dog Care</Text>
        <Text style={styles.subtitle}>Manage your veterinarians and care records</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Veterinarians</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddVeterinarian}
          >
            <Icon name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Add Vet</Text>
          </TouchableOpacity>
        </View>

        {veterinarians.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="medical-outline" size={64} color={theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Veterinarians</Text>
            <Text style={styles.emptySubtitle}>
              Add your first veterinarian to get started with managing your dog's care
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAddVeterinarian}
            >
              <Text style={styles.emptyButtonText}>Add Veterinarian</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.veterinariansList}>
            {veterinarians.map(renderVeterinarianCard)}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Care Records</Text>
        </View>
        <TouchableOpacity
          style={styles.recordCard}
          onPress={handleViewVetVisits}
        >
          <View style={styles.recordIconContainer}>
            <Icon name="document-text" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.recordContent}>
            <Text style={styles.recordTitle}>Vet Visits</Text>
            <Text style={styles.recordSubtitle}>View and manage veterinary visit records</Text>
          </View>
          <Icon name="chevron-forward" size={24} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  veterinariansList: {
    paddingHorizontal: theme.spacing.lg,
  },
  veterinarianCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  veterinarianHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  veterinarianInfo: {
    flex: 1,
  },
  veterinarianName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  veterinarianClinic: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  veterinarianPhone: {
    fontSize: 14,
    color: theme.colors.textTertiary,
  },
  veterinarianActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  specialtyTag: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  specialtyText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  recordIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  recordContent: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  recordSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.error + '15',
    borderRadius: theme.borderRadius.md,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  },
});

export default ManageDogCareScreen;
