import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import { Dog } from '../../types';
import apiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const placeholderImage = require('../../assets/placeholder.png');

type FilterType = 'all' | 'puppy' | 'adult' | 'breeding';
type GenderFilter = 'all' | 'male' | 'female';
type BreedingStatusFilter = 'all' | 'available' | 'not_ready' | 'retired';

const DogsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
  const [breedingStatusFilter, setBreedingStatusFilter] = useState<BreedingStatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDogs();
  }, [user]);

  // Refresh when screen comes into focus (returning from detail/edit screens)
  useFocusEffect(
    React.useCallback(() => {
      console.log('DogsScreen focused - refreshing dogs list');
      fetchDogs();
    }, [user?.userId])
  );

  const fetchDogs = async () => {
    try {
      setError(null);
      console.log('Fetching dogs for user:', user?.userId);
      
      if (!user?.userId) {
        console.log('No user ID available, skipping fetch');
        setDogs([]);
        setLoading(false);
        return;
      }
      
      // Fetch dogs filtered by owner ID on the server
      const response = await apiService.getDogs({ 
        ownerId: user.userId,
        limit: 100,
        page: 1 
      });

      console.log('Dogs API response:', {
        success: response.success,
        count: response.data?.dogs?.length || 0,
        error: response.error
      });

      if (response.success && response.data) {
        console.log('User dogs fetched:', {
          count: response.data.dogs.length,
          userId: user?.userId
        });
        
        setDogs(response.data.dogs);
      } else {
        console.error('Failed to fetch dogs:', response.error);
        setError(response.error || 'Failed to fetch dogs');
        Alert.alert(
          'Error',
          response.error || 'Failed to fetch dogs. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error fetching dogs:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      Alert.alert('Error', 'Failed to fetch dogs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDogs();
    setRefreshing(false);
  };

  // Filter dogs based on selected filters and search query
  const filteredDogs = useMemo(() => {
    return dogs.filter(dog => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = dog.name.toLowerCase().includes(query);
        const matchesBreed = dog.breed?.toLowerCase().includes(query);
        const matchesColor = dog.color?.toLowerCase().includes(query);
        
        if (!matchesName && !matchesBreed && !matchesColor) return false;
      }
      
      // Type filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'puppy' && dog.dogType !== 'puppy') return false;
        if (typeFilter === 'adult' && dog.dogType !== 'adult') return false;
        if (typeFilter === 'breeding' && !dog.breeding?.isBreedingDog) return false;
      }
      
      // Gender filter
      if (genderFilter !== 'all' && dog.gender !== genderFilter) return false;
      
      // Breeding status filter
      if (breedingStatusFilter !== 'all' && dog.breedingStatus !== breedingStatusFilter) return false;
      
      return true;
    });
  }, [dogs, searchQuery, typeFilter, genderFilter, breedingStatusFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setGenderFilter('all');
    setBreedingStatusFilter('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || typeFilter !== 'all' || genderFilter !== 'all' || breedingStatusFilter !== 'all';

  const getAgeFromBirthDate = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMonths = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (ageInMonths < 12) {
      return `${ageInMonths} months`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years}y ${months}m` : `${years} years`;
    }
  };

  const getStatusColor = (breedingStatus: string) => {
    if (breedingStatus === 'available') {
      return theme.colors.success;
    } else if (breedingStatus === 'retired') {
      return theme.colors.textSecondary;
    } else {
      return theme.colors.warning;
    }
  };

  const getDogPhoto = (dog: Dog) => {
    // Check photoGallery first, then photos array, then photoUrl
    const photoFromGallery = (dog as any)?.photoGallery?.[0]?.url;
    const photoFromArray = (dog as any)?.photos?.[0];
    return photoFromGallery || photoFromArray || dog.photoUrl;
  };

  const renderDogItem = ({ item }: { item: Dog }) => {
    const photoUrl = getDogPhoto(item);
    // Add timestamp to force cache refresh
    const photoUrlWithCache = photoUrl 
      ? `${photoUrl}${photoUrl.includes('?') ? '&' : '?'}t=${item.updatedAt || Date.now()}`
      : null;

    return (
      <TouchableOpacity 
        style={styles.dogCard}
        onPress={() => navigation.navigate('DogDetail' as never, { dog: item } as never)}
      >
        <View style={styles.dogImageContainer}>
          {photoUrlWithCache ? (
            <Image 
              key={`dog-${item.id}-${item.updatedAt}`}
              source={{ 
                uri: photoUrlWithCache,
                cache: 'reload', // Force reload from server
              }} 
              style={styles.dogImage}
              resizeMode="cover"
            />
          ) : (
            <Image 
              source={placeholderImage}
              style={styles.dogImage}
              resizeMode="cover"
            />
          )}
        </View>
      
      <View style={styles.dogContent}>
        <View style={styles.dogHeader}>
          <Text style={styles.dogName}>{item.name}</Text>
          <View style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(item.breedingStatus) }
          ]} />
        </View>
        
        <Text style={styles.dogBreed}>{item.breed}</Text>
        
        <View style={styles.dogDetails}>
          <View style={styles.detailRow}>
            <Icon 
              name={item.gender === 'male' ? 'male' : 'female'} 
              size={16} 
              color={item.gender === 'male' ? '#3b82f6' : '#ec4899'} 
              style={styles.genderIcon}
            />
            <Text style={styles.detailText}>
              {item.gender === 'male' ? 'Male' : 'Female'} • {getAgeFromBirthDate(item.birthDate)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🎨</Text>
            <Text style={[styles.detailText, { marginLeft: theme.spacing.xs }]}>{item.color}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>⚖️</Text>
            <Text style={[styles.detailText, { marginLeft: theme.spacing.xs }]}>{item.weight} lbs</Text>
          </View>
        </View>
        
        <View style={styles.dogTags}>
          <View style={[styles.tag, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.tagText}>{item.dogType}</Text>
          </View>
          
          {item.breedingStatus === 'available' && (
            <View style={[styles.tag, { backgroundColor: theme.colors.secondary }]}>
              <Text style={styles.tagText}>Breeding</Text>
            </View>
          )}
          
          <View style={[
            styles.tag,
            { backgroundColor: item.healthStatus === 'excellent' ? theme.colors.success : theme.colors.warning }
          ]}>
            <Text style={styles.tagText}>
              {item.healthStatus}
            </Text>
          </View>
        </View>
      </View>
      
        <Text style={styles.chevronIcon}>›</Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🐕</Text>
      <Text style={styles.emptyTitle}>No Dogs Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first dog to start building your kennel's breeding program
      </Text>
      <TouchableOpacity style={styles.createButton}>
        <Text style={styles.createButtonText}>Add Dog</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your dogs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={fetchDogs} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Icon name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, breed, or color..."
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
              
              {typeFilter !== 'all' && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>
                    {typeFilter === 'puppy' ? '🐕 Puppy' : typeFilter === 'adult' ? '🐶 Adult' : '💫 Breeding'}
                  </Text>
                  <TouchableOpacity onPress={() => setTypeFilter('all')}>
                    <Icon name="close-circle" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
              
              {genderFilter !== 'all' && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>
                    {genderFilter === 'male' ? '♂️ Male' : '♀️ Female'}
                  </Text>
                  <TouchableOpacity onPress={() => setGenderFilter('all')}>
                    <Icon name="close-circle" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
              
              {breedingStatusFilter !== 'all' && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>
                    {breedingStatusFilter === 'available' ? '✓ Available' : 
                     breedingStatusFilter === 'not_ready' ? '⏳ Not Ready' : '🏖️ Retired'}
                  </Text>
                  <TouchableOpacity onPress={() => setBreedingStatusFilter('all')}>
                    <Icon name="close-circle" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>

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
              <Text style={styles.modalTitle}>Filter Dogs</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterOptionsContainer}>
              {/* Type Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Type</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[styles.filterOption, typeFilter === 'all' && styles.filterOptionActive]}
                    onPress={() => setTypeFilter('all')}
                  >
                    <Text style={[styles.filterOptionText, typeFilter === 'all' && styles.filterOptionTextActive]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, typeFilter === 'puppy' && styles.filterOptionActive]}
                    onPress={() => setTypeFilter('puppy')}
                  >
                    <Text style={[styles.filterOptionText, typeFilter === 'puppy' && styles.filterOptionTextActive]}>
                      🐕 Puppies
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, typeFilter === 'adult' && styles.filterOptionActive]}
                    onPress={() => setTypeFilter('adult')}
                  >
                    <Text style={[styles.filterOptionText, typeFilter === 'adult' && styles.filterOptionTextActive]}>
                      🐶 Adults
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, typeFilter === 'breeding' && styles.filterOptionActive]}
                    onPress={() => setTypeFilter('breeding')}
                  >
                    <Text style={[styles.filterOptionText, typeFilter === 'breeding' && styles.filterOptionTextActive]}>
                      💫 Breeding Dogs
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Gender Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Gender</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[styles.filterOption, genderFilter === 'all' && styles.filterOptionActive]}
                    onPress={() => setGenderFilter('all')}
                  >
                    <Text style={[styles.filterOptionText, genderFilter === 'all' && styles.filterOptionTextActive]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, genderFilter === 'male' && styles.filterOptionActive]}
                    onPress={() => setGenderFilter('male')}
                  >
                    <Text style={[styles.filterOptionText, genderFilter === 'male' && styles.filterOptionTextActive]}>
                      ♂️ Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, genderFilter === 'female' && styles.filterOptionActive]}
                    onPress={() => setGenderFilter('female')}
                  >
                    <Text style={[styles.filterOptionText, genderFilter === 'female' && styles.filterOptionTextActive]}>
                      ♀️ Female
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Breeding Status Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Breeding Status</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[styles.filterOption, breedingStatusFilter === 'all' && styles.filterOptionActive]}
                    onPress={() => setBreedingStatusFilter('all')}
                  >
                    <Text style={[styles.filterOptionText, breedingStatusFilter === 'all' && styles.filterOptionTextActive]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, breedingStatusFilter === 'available' && styles.filterOptionActive]}
                    onPress={() => setBreedingStatusFilter('available')}
                  >
                    <Text style={[styles.filterOptionText, breedingStatusFilter === 'available' && styles.filterOptionTextActive]}>
                      ✓ Available
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, breedingStatusFilter === 'not_ready' && styles.filterOptionActive]}
                    onPress={() => setBreedingStatusFilter('not_ready')}
                  >
                    <Text style={[styles.filterOptionText, breedingStatusFilter === 'not_ready' && styles.filterOptionTextActive]}>
                      ⏳ Not Ready
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, breedingStatusFilter === 'retired' && styles.filterOptionActive]}
                    onPress={() => setBreedingStatusFilter('retired')}
                  >
                    <Text style={[styles.filterOptionText, breedingStatusFilter === 'retired' && styles.filterOptionTextActive]}>
                      🏖️ Retired
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
                  Apply ({filteredDogs.length} dogs)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={filteredDogs}
        renderItem={renderDogItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={filteredDogs.length === 0 ? styles.emptyContainer : styles.listContainer}
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
  errorBanner: {
    backgroundColor: '#fee',
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#fcc',
  },
  errorText: {
    flex: 1,
    color: '#c00',
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.md,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dogCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dogImageContainer: {
    marginRight: theme.spacing.md,
  },
  dogImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
  },
  dogContent: {
    flex: 1,
  },
  dogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  dogName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: theme.spacing.sm,
  },
  dogBreed: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
  },
  dogDetails: {
    marginBottom: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  detailIcon: {
    fontSize: 14,
  },
  genderIcon: {
    marginRight: 4,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  dogTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  tagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  chevronIcon: {
    fontSize: 32,
    color: theme.colors.textSecondary,
    fontWeight: '300',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
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
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Search Bar Styles
  searchContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
  // Filter Bar Styles
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    marginLeft: theme.spacing.xs,
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
    fontSize: 13,
    fontWeight: '600',
  },
  clearFiltersButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.error + '20',
    marginRight: theme.spacing.sm,
  },
  clearFiltersText: {
    color: theme.colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
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
    padding: theme.spacing.lg,
  },
  filterSection: {
    marginBottom: theme.spacing.xl,
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  filterOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  filterOptionTextActive: {
    color: '#fff',
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
    borderColor: theme.colors.error,
    alignItems: 'center',
  },
  clearButtonText: {
    color: theme.colors.error,
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

export default DogsScreen;
