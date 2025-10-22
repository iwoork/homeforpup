import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import { VetVisit } from '@homeforpup/shared-types';
import apiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const VetVisitsListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [vetVisits, setVetVisits] = useState<VetVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVetVisits = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await apiService.getVetVisits({
        ownerId: user.userId,
        limit: 100,
      });

      if (response.ok && response.data) {
        setVetVisits(response.data.vetVisits || []);
      } else {
        setError(response.error || 'Failed to fetch vet visits');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVetVisits();
  }, [user?.userId]);


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVetVisits();
    setRefreshing(false);
  };

  const handleAddVetVisit = () => {
    navigation.navigate('RecordVetVisit' as never);
  };

  const handleViewVetVisit = (vetVisit: VetVisit) => {
    // For now, just show an alert. Later we can create a detail screen
    Alert.alert(
      'Vet Visit Details',
      `Date: ${new Date(vetVisit.visitDate).toLocaleDateString()}\nType: ${vetVisit.visitType}\nReason: ${vetVisit.reason}`,
      [{ text: 'OK' }]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getVisitTypeColor = (visitType: string) => {
    switch (visitType) {
      case 'routine':
        return theme.colors.primary;
      case 'emergency':
        return theme.colors.error;
      case 'vaccination':
        return theme.colors.success;
      case 'checkup':
        return theme.colors.secondary;
      case 'surgery':
        return '#8b5cf6';
      default:
        return theme.colors.textSecondary;
    }
  };

  const renderVetVisitCard = (vetVisit: VetVisit) => (
    <TouchableOpacity
      key={vetVisit.id}
      style={styles.vetVisitCard}
      onPress={() => handleViewVetVisit(vetVisit)}
    >
      <View style={styles.vetVisitHeader}>
        <View style={styles.vetVisitInfo}>
          <Text style={styles.vetVisitDate}>{formatDate(vetVisit.visitDate)}</Text>
          <Text style={styles.vetVisitType}>{vetVisit.visitType.replace('_', ' ').toUpperCase()}</Text>
        </View>
        <View style={[styles.visitTypeBadge, { backgroundColor: getVisitTypeColor(vetVisit.visitType) + '15' }]}>
          <Text style={[styles.visitTypeText, { color: getVisitTypeColor(vetVisit.visitType) }]}>
            {vetVisit.visitType.replace('_', ' ')}
          </Text>
        </View>
      </View>
      
      <Text style={styles.vetVisitReason} numberOfLines={2}>
        {vetVisit.reason}
      </Text>
      
      {vetVisit.veterinarian && (
        <View style={styles.veterinarianInfo}>
          <Icon name="medical" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.veterinarianText}>
            {vetVisit.veterinarian.name} - {vetVisit.veterinarian.clinic}
          </Text>
        </View>
      )}
      
      {vetVisit.cost && (
        <View style={styles.costInfo}>
          <Icon name="card" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.costText}>
            ${vetVisit.cost} {vetVisit.currency || 'USD'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading vet visits...</Text>
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
        <Text style={styles.title}>Vet Visits</Text>
        <Text style={styles.subtitle}>View and manage veterinary visit records</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Visit Records</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddVetVisit}
          >
            <Icon name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Add Visit</Text>
          </TouchableOpacity>
        </View>

        {vetVisits.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="medical-outline" size={64} color={theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Vet Visits</Text>
            <Text style={styles.emptySubtitle}>
              Start recording your dog's veterinary visits to keep track of their health
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAddVetVisit}
            >
              <Text style={styles.emptyButtonText}>Record First Visit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.vetVisitsList}>
            {vetVisits.map(renderVetVisitCard)}
          </View>
        )}
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
    marginTop: theme.spacing.md,
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
  vetVisitsList: {
    paddingHorizontal: theme.spacing.lg,
  },
  vetVisitCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  vetVisitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  vetVisitInfo: {
    flex: 1,
  },
  vetVisitDate: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  vetVisitType: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  visitTypeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  visitTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  vetVisitReason: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  veterinarianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  veterinarianText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  costInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
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

export default VetVisitsListScreen;
