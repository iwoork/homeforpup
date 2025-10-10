import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import { useAvailablePuppies } from '../../hooks/useAvailablePuppies';
import { Dog } from '../../services/apiService';

const SearchPuppiesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Use the hook to fetch real data
  const { puppies, loading, error, total, refresh, loadMore, updateFilters } =
    useAvailablePuppies({ autoFetch: true });

  // Update filters when selections change
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({
        search: searchQuery || undefined,
        breed: selectedBreed || undefined,
      });
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery, selectedBreed, updateFilters]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Calculate age from birthDate
  const calculateAge = (birthDate: string): string => {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

    if (diffWeeks < 1) {
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffWeeks < 52) {
      return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffWeeks / 52);
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
  };

  const popularBreeds = [
    'Golden Retriever',
    'Labrador',
    'German Shepherd',
    'French Bulldog',
    'Beagle',
    'Poodle',
  ];

  // Helper function to get photo URL from multiple possible fields
  const getPhotoUrl = (dog: Dog): string | undefined => {
    // Check multiple possible photo field formats
    const photoFromUrl = dog.photoUrl;
    const photoFromArray = (dog as any).photos?.[0];
    const photoFromGallery = (dog as any).photoGallery?.[0]?.url;

    const photo = photoFromUrl || photoFromArray || photoFromGallery;

    console.log('Getting photo for', dog.name, ':', {
      photoUrl: dog.photoUrl,
      photosArray: (dog as any).photos,
      photoGallery: (dog as any).photoGallery,
      finalPhoto: photo,
    });

    return photo;
  };

  const renderPuppyCard = ({ item }: { item: Dog }) => {
    console.log('Rendering puppy card:', {
      id: item.id,
      name: item.name,
      breed: item.breed,
      hasId: !!item.id,
      photoUrl: item.photoUrl,
    });

    const photoUrl = getPhotoUrl(item);

    return (
      <TouchableOpacity
        style={styles.puppyCard}
        onPress={() => {
          console.log('Navigating to DogDetail with ID:', item.id);
          (navigation as any).navigate('DogDetail', { id: item.id });
        }}
      >
        <View style={styles.imageContainer}>
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              style={styles.puppyImage}
              resizeMode="cover"
              onError={err => {
                console.log('❌ Image load error for', item.name, ':', {
                  error: err.nativeEvent,
                  url: photoUrl,
                });
              }}
              onLoad={() => {
                console.log(
                  '✅ Image loaded successfully for',
                  item.name,
                  photoUrl,
                );
              }}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="paw" size={40} color={theme.colors.textTertiary} />
            </View>
          )}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => {
              // TODO: Implement favorites
              console.log('Add to favorites:', item.id);
            }}
          >
            <Icon name="heart-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <View style={styles.puppyInfo}>
          <Text style={styles.puppyName}>{item.name}</Text>
          <Text style={styles.puppyBreed}>{item.breed}</Text>
          <View style={styles.puppyDetails}>
            <View style={styles.detailItem}>
              <Icon
                name="calendar-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.detailText}>
                {item.age || calculateAge(item.birthDate)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon
                name={item.gender === 'male' ? 'male' : 'female'}
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.detailText}>{item.gender}</Text>
            </View>
          </View>
          {item.location && (
            <View style={styles.locationRow}>
              <Icon
                name="location-outline"
                size={14}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}
          {item.price ? (
            <View style={styles.priceRow}>
              <Text style={styles.price}>${item.price.toLocaleString()}</Text>
              {item.breederName && (
                <Text style={styles.breeder}>by {item.breederName}</Text>
              )}
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.contactBreederButton}
            onPress={e => {
              e.stopPropagation();
              console.log('Contact breeder for puppy:', item.id, item.ownerId);
              (navigation as any).navigate('ContactBreeder', {
                receiverId: item.ownerId,
                breederName: item.breederName,
                puppyId: item.id,
                puppyName: item.name,
                puppyBreed: item.breed,
                puppyPhoto: photoUrl,
              });
            }}
          >
            <Icon name="chatbubble" size={16} color="#ffffff" />
            <Text style={styles.contactBreederText}>Contact Breeder</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by breed, location..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon
                name="close-circle"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="options-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Popular Breeds */}
      <View style={styles.breedsContainer}>
        <Text style={styles.sectionTitle}>Popular Breeds</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.breedsList}>
            {popularBreeds.map(breed => (
              <TouchableOpacity
                key={breed}
                style={[
                  styles.breedChip,
                  selectedBreed === breed && styles.breedChipActive,
                ]}
                onPress={() =>
                  setSelectedBreed(selectedBreed === breed ? null : breed)
                }
              >
                <Text
                  style={[
                    styles.breedChipText,
                    selectedBreed === breed && styles.breedChipTextActive,
                  ]}
                >
                  {breed}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Results Header */}
      {!loading && puppies.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {total} {total === 1 ? 'puppy' : 'puppies'} available
          </Text>
        </View>
      )}

      {/* Loading State */}
      {loading && puppies.length === 0 ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Searching for puppies...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Icon
            name="alert-circle-outline"
            size={64}
            color={theme.colors.error}
          />
          <Text style={styles.emptyTitle}>Error Loading Puppies</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : puppies.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon
            name="search-outline"
            size={64}
            color={theme.colors.textTertiary}
          />
          <Text style={styles.emptyTitle}>No puppies found</Text>
          <Text style={styles.emptyText}>
            Try adjusting your search criteria or check back later for new
            listings
          </Text>
          <TouchableOpacity
            style={styles.preferencesButton}
            onPress={() => navigation.navigate('DogParentPreferences' as never)}
          >
            <Text style={styles.preferencesButtonText}>
              Set Your Preferences
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={puppies}
          renderItem={renderPuppyCard}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.puppiesList}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && puppies.length > 0 ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchHeader: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breedsContainer: {
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  breedsList: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  breedChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  breedChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  breedChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  breedChipTextActive: {
    color: '#ffffff',
  },
  puppiesList: {
    padding: theme.spacing.md,
  },
  columnWrapper: {
    gap: theme.spacing.md,
  },
  puppyCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  puppyImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
  },
  favoriteButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  puppyInfo: {
    padding: theme.spacing.md,
  },
  puppyName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  puppyBreed: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  puppyDetails: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: theme.spacing.sm,
  },
  locationText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  breeder: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
  contactBreederButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: 4,
  },
  contactBreederText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
  },
  preferencesButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  preferencesButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultsHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  loadMoreContainer: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SearchPuppiesScreen;
