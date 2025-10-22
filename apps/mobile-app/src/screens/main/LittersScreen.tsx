import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../utils/theme';
import { Litter } from '../../types';
import { useLitters } from '../../hooks/useApi';

// Filter types
type StatusFilter = 'all' | 'planned' | 'expecting' | 'born' | 'weaning' | 'ready' | 'sold_out';
type SeasonFilter = 'all' | 'spring' | 'summer' | 'fall' | 'winter';

const LittersScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: littersData, loading, error, refreshing, refresh } = useLitters({
    page: 1,
    limit: 50,
  });

  const litters = littersData?.litters || [];

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const onRefresh = async () => {
    await refresh();
  };

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh]),
  );

  // Filter litters based on selected filters and search query
  const filteredLitters = useMemo(() => {
    return litters.filter(litter => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesBreed = litter.breed?.toLowerCase().includes(query);
        const matchesDescription = litter.description?.toLowerCase().includes(query);
        
        if (!matchesBreed && !matchesDescription) return false;
      }
      
      // Status filter
      if (statusFilter !== 'all' && litter.status !== statusFilter) return false;
      
      // Season filter
      if (seasonFilter !== 'all' && litter.season !== seasonFilter) return false;
      
      return true;
    });
  }, [litters, searchQuery, statusFilter, seasonFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSeasonFilter('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all' || seasonFilter !== 'all';

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
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Icon name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by breed or description..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.trim() !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
              <Icon name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon 
              name="options-outline" 
              size={18} 
              color={showFilters ? '#fff' : theme.colors.primary} 
            />
            <Text style={[styles.filterButtonText, showFilters && styles.filterButtonTextActive]}>
              Filters
            </Text>
            {hasActiveFilters && <View style={styles.filterBadge} />}
          </TouchableOpacity>

          {hasActiveFilters && (
            <>
              {searchQuery.trim() !== '' && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText} numberOfLines={1}>
                    🔍 "{searchQuery.length > 15 ? searchQuery.substring(0, 15) + '...' : searchQuery}"
                  </Text>
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Icon name="close-circle" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
              
              {statusFilter !== 'all' && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>
                    📋 {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace('_', ' ')}
                  </Text>
                  <TouchableOpacity onPress={() => setStatusFilter('all')}>
                    <Icon name="close-circle" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
              
              {seasonFilter !== 'all' && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>
                    🌸 {seasonFilter.charAt(0).toUpperCase() + seasonFilter.slice(1)}
                  </Text>
                  <TouchableOpacity onPress={() => setSeasonFilter('all')}>
                    <Icon name="close-circle" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
              
              <TouchableOpacity style={styles.clearAllButton} onPress={clearFilters}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>

      <FlatList
        data={filteredLitters}
        renderItem={renderLitterCard}
        keyExtractor={item => item.id}
        contentContainerStyle={
          filteredLitters.length === 0 ? styles.emptyContainer : styles.listContainer
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Litters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterOptionsContainer}>
              {/* Status Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Status</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[styles.filterOption, statusFilter === 'all' && styles.filterOptionActive]}
                    onPress={() => setStatusFilter('all')}
                  >
                    <Text style={[styles.filterOptionText, statusFilter === 'all' && styles.filterOptionTextActive]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, statusFilter === 'planned' && styles.filterOptionActive]}
                    onPress={() => setStatusFilter('planned')}
                  >
                    <Text style={[styles.filterOptionText, statusFilter === 'planned' && styles.filterOptionTextActive]}>
                      📋 Planned
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, statusFilter === 'expecting' && styles.filterOptionActive]}
                    onPress={() => setStatusFilter('expecting')}
                  >
                    <Text style={[styles.filterOptionText, statusFilter === 'expecting' && styles.filterOptionTextActive]}>
                      🤰 Expecting
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, statusFilter === 'born' && styles.filterOptionActive]}
                    onPress={() => setStatusFilter('born')}
                  >
                    <Text style={[styles.filterOptionText, statusFilter === 'born' && styles.filterOptionTextActive]}>
                      👶 Born
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, statusFilter === 'weaning' && styles.filterOptionActive]}
                    onPress={() => setStatusFilter('weaning')}
                  >
                    <Text style={[styles.filterOptionText, statusFilter === 'weaning' && styles.filterOptionTextActive]}>
                      🍼 Weaning
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, statusFilter === 'ready' && styles.filterOptionActive]}
                    onPress={() => setStatusFilter('ready')}
                  >
                    <Text style={[styles.filterOptionText, statusFilter === 'ready' && styles.filterOptionTextActive]}>
                      ✅ Ready
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, statusFilter === 'sold_out' && styles.filterOptionActive]}
                    onPress={() => setStatusFilter('sold_out')}
                  >
                    <Text style={[styles.filterOptionText, statusFilter === 'sold_out' && styles.filterOptionTextActive]}>
                      🏠 Sold Out
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Season Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Season</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[styles.filterOption, seasonFilter === 'all' && styles.filterOptionActive]}
                    onPress={() => setSeasonFilter('all')}
                  >
                    <Text style={[styles.filterOptionText, seasonFilter === 'all' && styles.filterOptionTextActive]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, seasonFilter === 'spring' && styles.filterOptionActive]}
                    onPress={() => setSeasonFilter('spring')}
                  >
                    <Text style={[styles.filterOptionText, seasonFilter === 'spring' && styles.filterOptionTextActive]}>
                      🌸 Spring
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, seasonFilter === 'summer' && styles.filterOptionActive]}
                    onPress={() => setSeasonFilter('summer')}
                  >
                    <Text style={[styles.filterOptionText, seasonFilter === 'summer' && styles.filterOptionTextActive]}>
                      ☀️ Summer
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, seasonFilter === 'fall' && styles.filterOptionActive]}
                    onPress={() => setSeasonFilter('fall')}
                  >
                    <Text style={[styles.filterOptionText, seasonFilter === 'fall' && styles.filterOptionTextActive]}>
                      🍂 Fall
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, seasonFilter === 'winter' && styles.filterOptionActive]}
                    onPress={() => setSeasonFilter('winter')}
                  >
                    <Text style={[styles.filterOptionText, seasonFilter === 'winter' && styles.filterOptionTextActive]}>
                      ❄️ Winter
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton} 
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>
                  Apply ({filteredLitters.length} litters)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={() => navigation.navigate('CreateLitter' as never)}
        activeOpacity={0.8}
      >
        <Icon name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  floatingAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  // Search styles
  searchContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 0,
  },
  clearSearchButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  // Filter bar styles
  filterBar: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
  },
  filterScrollContent: {
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary + '20',
    marginRight: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  activeFilterText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '500',
    marginRight: theme.spacing.xs,
  },
  clearAllButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.error + '20',
    marginRight: theme.spacing.sm,
  },
  clearAllText: {
    color: theme.colors.error,
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  filterOptionsContainer: {
    maxHeight: 400,
  },
  filterSection: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  filterOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  filterOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#ffffff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  clearButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  clearButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LittersScreen;
