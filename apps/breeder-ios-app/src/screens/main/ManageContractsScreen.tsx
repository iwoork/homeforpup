import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';

type ContractStatus = 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'cancelled';

interface Contract {
  id: string;
  title: string;
  buyerName: string;
  buyerEmail: string;
  puppyName: string;
  litterId: string;
  status: ContractStatus;
  price: number;
  depositAmount: number;
  depositPaid: boolean;
  createdAt: string;
  updatedAt: string;
  signedAt?: string;
  completedAt?: string;
}

const ManageContractsScreen: React.FC = () => {
  const navigation = useNavigation();

  // Mock data - in real app, this would come from API
  const [contracts] = useState<Contract[]>([
    {
      id: '1',
      title: 'Akita Puppy Contract - Max',
      buyerName: 'Sarah Johnson',
      buyerEmail: 'sarah.j@email.com',
      puppyName: 'Max',
      litterId: 'litter-1',
      status: 'active',
      price: 2500,
      depositAmount: 500,
      depositPaid: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      signedAt: '2024-01-20T14:30:00Z',
    },
    {
      id: '2',
      title: 'Golden Retriever Contract - Luna',
      buyerName: 'Mike Chen',
      buyerEmail: 'mike.chen@email.com',
      puppyName: 'Luna',
      litterId: 'litter-2',
      status: 'sent',
      price: 1800,
      depositAmount: 400,
      depositPaid: false,
      createdAt: '2024-01-18T09:15:00Z',
      updatedAt: '2024-01-22T11:45:00Z',
    },
    {
      id: '3',
      title: 'German Shepherd Contract - Zeus',
      buyerName: 'Emily Rodriguez',
      buyerEmail: 'emily.r@email.com',
      puppyName: 'Zeus',
      litterId: 'litter-3',
      status: 'draft',
      price: 2200,
      depositAmount: 450,
      depositPaid: false,
      createdAt: '2024-01-20T16:20:00Z',
      updatedAt: '2024-01-20T16:20:00Z',
    },
  ]);

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case 'draft':
        return '#6b7280';
      case 'sent':
        return '#f59e0b';
      case 'signed':
        return '#10b981';
      case 'active':
        return '#3b82f6';
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
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleCreateContract = () => {
    Alert.alert(
      'Create New Contract',
      'This will open the contract creation wizard.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create', onPress: () => {
          // TODO: Navigate to CreateContractScreen
          console.log('Navigate to CreateContractScreen');
        }},
      ]
    );
  };

  const handleContractPress = (contract: Contract) => {
    Alert.alert(
      'Contract Details',
      `Contract: ${contract.title}\nBuyer: ${contract.buyerName}\nStatus: ${getStatusLabel(contract.status)}\nPrice: $${contract.price}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'View Details', onPress: () => {
          // TODO: Navigate to ContractDetailScreen
          console.log('Navigate to ContractDetailScreen for:', contract.id);
        }},
      ]
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
            {item.title}
          </Text>
          <Text style={styles.buyerName}>{item.buyerName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.contractDetails}>
        <View style={styles.detailRow}>
          <Icon name="paw" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>Puppy: {item.puppyName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="cash" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>Price: ${item.price}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="card" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            Deposit: ${item.depositAmount} {item.depositPaid ? '✅' : '⏳'}
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

  const getStatsData = () => {
    const total = contracts.length;
    const active = contracts.filter(c => c.status === 'active').length;
    const completed = contracts.filter(c => c.status === 'completed').length;
    const pending = contracts.filter(c => ['draft', 'sent'].includes(c.status)).length;

    return { total, active, completed, pending };
  };

  const stats = getStatsData();

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
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
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
        {contracts.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={contracts}
            renderItem={renderContractCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
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
});

export default ManageContractsScreen;
