import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../utils/theme';
import { Litter } from '../../types';
import { useLitters } from '../../hooks/useApi';

const LittersScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: littersData, loading, error, refreshing, refresh } = useLitters({
    page: 1,
    limit: 50,
  });

  const litters = littersData?.litters || [];

  const onRefresh = async () => {
    await refresh();
  };

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return ['#94a3b8', '#64748b'];
      case 'expecting':
        return ['#fbbf24', '#f59e0b'];
      case 'born':
        return ['#34d399', '#10b981'];
      case 'weaning':
        return ['#60a5fa', '#3b82f6'];
      case 'ready':
        return ['#10b981', '#059669'];
      case 'sold_out':
        return ['#9ca3af', '#6b7280'];
      default:
        return [theme.colors.primary, theme.colors.primaryDark];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned':
        return 'Planned';
      case 'expecting':
        return 'Expecting';
      case 'born':
        return 'Born';
      case 'weaning':
        return 'Weaning';
      case 'ready':
        return 'Ready for Homes';
      case 'sold_out':
        return 'All Placed';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderLitterCard = ({ item }: { item: Litter }) => {
    const statusColors = getStatusColor(item.status);
    const isExpecting =
      item.status === 'expecting' || item.status === 'planned';
    const targetDate = isExpecting ? item.expectedDate : item.birthDate;

    return (
      <TouchableOpacity
        style={styles.litterCard}
        onPress={() =>
          navigation.navigate(
            'LitterDetail' as never,
            { litter: item } as never,
          )
        }
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={statusColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statusBar}
        />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.breedInfo}>
              <Text style={styles.breedText}>{item.breed}</Text>
              <Text style={styles.seasonText}>{item.season} Litter</Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColors[0] }]}
            >
              <Text style={styles.statusText}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>

          {targetDate && (
            <View style={styles.dateRow}>
              <Icon
                name="calendar-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.dateText}>
                {isExpecting ? 'Expected: ' : 'Born: '}
                {formatDate(targetDate)}
              </Text>
            </View>
          )}

          {item.description && (
            <Text style={styles.descriptionText} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.statsContainer}>
            {item.puppyCount !== undefined && (
              <View style={styles.statItem}>
                <Icon name="paw" size={16} color={theme.colors.primary} />
                <Text style={styles.statLabel}>Total</Text>
                <Text style={styles.statValue}>{item.puppyCount}</Text>
              </View>
            )}

            {item.availablePuppies !== undefined && (
              <View style={styles.statItem}>
                <Icon
                  name="checkmark-circle"
                  size={16}
                  color={theme.colors.success}
                />
                <Text style={styles.statLabel}>Available</Text>
                <Text style={styles.statValue}>{item.availablePuppies}</Text>
              </View>
            )}

            {item.maleCount !== undefined && (
              <View style={styles.statItem}>
                <Icon name="male" size={16} color="#3b82f6" />
                <Text style={styles.statLabel}>Males</Text>
                <Text style={styles.statValue}>{item.maleCount}</Text>
              </View>
            )}

            {item.femaleCount !== undefined && (
              <View style={styles.statItem}>
                <Icon name="female" size={16} color="#ec4899" />
                <Text style={styles.statLabel}>Females</Text>
                <Text style={styles.statValue}>{item.femaleCount}</Text>
              </View>
            )}
          </View>

          {item.priceRange && (
            <View style={styles.priceRow}>
              <Icon
                name="cash-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.priceText}>
                ${item.priceRange.min.toLocaleString()} - $
                {item.priceRange.max.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        <Icon
          name="chevron-forward"
          size={24}
          color={theme.colors.textTertiary}
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={[theme.colors.primary + '20', theme.colors.secondary + '20']}
        style={styles.emptyIconContainer}
      >
        <Icon name="albums-outline" size={64} color={theme.colors.primary} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>No Litters Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first litter to start tracking breeding operations and puppy
        placements
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateLitter' as never)}
        activeOpacity={0.8}
      >
        <Icon name="add" size={20} color="#ffffff" />
        <Text style={styles.createButtonText}>Create First Litter</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading litters...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="alert-circle" size={48} color={theme.colors.error} />
        <Text style={styles.errorText}>Error loading litters</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {litters.length > 0 && (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateLitter' as never)}
            activeOpacity={0.8}
          >
            <Icon name="add" size={24} color="#ffffff" />
            <Text style={styles.addButtonText}>New Litter</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={litters}
        renderItem={renderLitterCard}
        keyExtractor={item => item.id}
        contentContainerStyle={
          litters.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerActions: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  litterCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  cardContent: {
    flex: 1,
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  breedInfo: {
    flex: 1,
  },
  breedText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  seasonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  dateText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  descriptionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    marginRight: theme.spacing.xs / 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  chevron: {
    marginRight: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.error,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LittersScreen;
