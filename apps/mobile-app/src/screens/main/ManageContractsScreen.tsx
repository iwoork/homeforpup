import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import { apiService, Contract } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

type ContractStatus = Contract['status'];

const ManageContractsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    if (!user?.userId) return;
    try {
      setError(null);
      const response = await apiService.getContracts(user.userId);
      if (response.success && response.data) {
        setContracts(response.data.contracts);
      } else {
        setError(response.error || 'Failed to load contracts');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  }, [user?.userId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    await fetchContracts();
    setLoading(false);
  }, [fetchContracts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchContracts();
    setRefreshing(false);
  }, [fetchContracts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case 'draft':
        return '#6b7280';
      case 'sent':
        return '#f59e0b';
      case 'signed':
        return '#10b981';
      case 'completed':
        return '#059669';
      case 'cancelled':
        return '#dc2626';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status: ContractStatus) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'sent':
        return 'Sent for Review';
      case 'signed':
        return 'Signed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getContractTypeLabel = (type: Contract['contractType']) => {
    switch (type) {
      case 'puppy_sale':
        return 'Puppy Sale';
      case 'co_ownership':
        return 'Co-Ownership';
      case 'breeding_rights':
        return 'Breeding Rights';
      default:
        return type;
    }
  };

  const handleCreateContract = () => {
    Alert.alert(
      'Create New Contract',
      'This will open the contract creation wizard.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create', onPress: async () => {
          const response = await apiService.createContract({
            buyerName: 'New Buyer',
            buyerEmail: 'buyer@example.com',
            contractType: 'puppy_sale',
            status: 'draft',
          });
          if (response.success) {
            Alert.alert('Success', 'Contract created');
            fetchContracts();
          } else {
            Alert.alert('Error', response.error || 'Failed to create contract');
          }
        }},
      ]
    );
  };

  const handleContractPress = (contract: Contract) => {
    const statusActions: { text: string; newStatus: ContractStatus }[] = [];
    if (contract.status === 'draft') {
      statusActions.push({ text: 'Send for Review', newStatus: 'sent' });
    }
    if (contract.status === 'sent') {
      statusActions.push({ text: 'Mark as Signed', newStatus: 'signed' });
    }
    if (contract.status === 'signed') {
      statusActions.push({ text: 'Mark Completed', newStatus: 'completed' });
    }
    if (contract.status !== 'cancelled' && contract.status !== 'completed') {
      statusActions.push({ text: 'Cancel Contract', newStatus: 'cancelled' });
    }

    const buttons: any[] = [{ text: 'Close', style: 'cancel' }];
    statusActions.forEach(action => {
      buttons.push({
        text: action.text,
        style: action.newStatus === 'cancelled' ? 'destructive' : 'default',
        onPress: async () => {
          const response = await apiService.updateContract(contract.id, {
            status: action.newStatus,
          });
          if (response.success) {
            Alert.alert('Success', `Contract ${action.newStatus}`);
            fetchContracts();
          } else {
            Alert.alert('Error', response.error || 'Failed to update contract');
          }
        },
      });
    });

    Alert.alert(
      'Contract Details',
      `Type: ${getContractTypeLabel(contract.contractType)}\nBuyer: ${contract.buyerName}\nStatus: ${getStatusLabel(contract.status)}${contract.totalAmount ? `\nTotal: $${contract.totalAmount}` : ''}`,
      buttons,
    );
  };

  const renderContractCard = ({ item }: { item: Contract }) => (
    <TouchableOpacity
      style={styles.contractCard}
      onPress={() => handleContractPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.contractHeader}>
        <View style={styles.contractTitleContainer}>
          <Text style={styles.contractTitle} numberOfLines={1}>
            {getContractTypeLabel(item.contractType)} - {item.buyerName}
          </Text>
          <Text style={styles.buyerName}>{item.buyerEmail}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.contractDetails}>
        {item.totalAmount != null && (
          <View style={styles.detailRow}>
            <Icon name="cash" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>Total: ${item.totalAmount}</Text>
          </View>
        )}
        {item.depositAmount != null && (
          <View style={styles.detailRow}>
            <Icon name="card" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>
              Deposit: ${item.depositAmount} {item.depositPaid ? '✅' : '⏳'}
            </Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Icon name="document-text" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            {getContractTypeLabel(item.contractType)}
          </Text>
        </View>
      </View>

      <View style={styles.contractFooter}>
        <Text style={styles.dateText}>
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="document-text-outline" size={64} color={theme.colors.textTertiary} />
      <Text style={styles.emptyTitle}>No Contracts Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first contract to manage puppy sales professionally
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateContract}>
        <Icon name="add" size={20} color="#ffffff" />
        <Text style={styles.createButtonText}>Create Contract</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Icon name="alert-circle-outline" size={64} color={theme.colors.textTertiary} />
      <Text style={styles.emptyTitle}>Something went wrong</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadData}>
        <Icon name="refresh" size={20} color="#ffffff" />
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const getStatsData = () => {
    const total = contracts.length;
    const signed = contracts.filter(c => c.status === 'signed').length;
    const completed = contracts.filter(c => c.status === 'completed').length;
    const pending = contracts.filter(c => ['draft', 'sent'].includes(c.status)).length;

    return { total, signed, completed, pending };
  };

  const stats = getStatsData();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading contracts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#f0f9fa', '#ffffff']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Contract Management</Text>
            <Text style={styles.headerSubtitle}>Manage puppy sales contracts</Text>
          </View>
          <TouchableOpacity style={styles.createButtonSmall} onPress={handleCreateContract}>
            <Icon name="add" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.signed}</Text>
            <Text style={styles.statLabel}>Signed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Contracts List */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Recent Contracts</Text>
        {error ? (
          renderErrorState()
        ) : contracts.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={contracts}
            renderItem={renderContractCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          />
        )}
      </View>
    </View>
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
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  createButtonSmall: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    ...theme.shadows.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  contractCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  contractTitleContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  buyerName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contractDetails: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  contractFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManageContractsScreen;
