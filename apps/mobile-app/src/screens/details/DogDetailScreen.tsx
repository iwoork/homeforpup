import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../utils/theme';
import { Dog } from '../../types';
import apiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const placeholderImage = require('../../assets/placeholder.png');

interface DogDetailRouteParams {
  dog?: Dog;
  id?: string;
}

const DogDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const params = route.params as DogDetailRouteParams;
  const initialDog = params?.dog;
  const dogId = params?.id || initialDog?.id;
  
  // Debug logging
  console.log('DogDetailScreen - received params:', { hasDog: !!initialDog, dogId });
  
  const [dog, setDog] = useState<Dog | null>(initialDog || null);
  const [loading, setLoading] = useState(!initialDog); // Load if we don't have initial dog
  const [error, setError] = useState<string | null>(null);
  const [litters, setLitters] = useState<any[]>([]);
  const [littersLoading, setLittersLoading] = useState(false);
  const [kennelOwner, setKennelOwner] = useState<{ id: string; name: string } | null>(null);
  const [fetchingKennel, setFetchingKennel] = useState(false);
  
  // Check if user can edit (is the owner)
  const canEdit = dog?.ownerId === user?.userId || kennelOwner?.id === user?.userId;
  
  // Check if user can contact (not the owner)
  const canContact = kennelOwner?.id && kennelOwner.id !== user?.userId;
  
  // Fetch dog if we only have an ID
  useEffect(() => {
    const fetchDog = async () => {
      if (!initialDog && dogId) {
        console.log('Fetching dog by ID:', dogId);
        setLoading(true);
        setError(null);
        try {
          const response = await apiService.getDogById(dogId);
          console.log('API Response:', response);
          
          if (response.success && response.data) {
            // Handle both formats: { dog: {...} } and direct dog object
            const dogData = (response.data as any).dog || response.data;
            console.log('Dog fetched successfully:', dogData);
            setDog(dogData as Dog);
          } else {
            console.error('Failed to fetch dog:', response.error);
            setError(response.error || 'Failed to load dog details');
          }
        } catch (err) {
          console.error('Error fetching dog:', err);
          setError('An error occurred while loading dog details');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchDog();
  }, [dogId, initialDog]);
  
  // Get health status from nested object or top-level field
  const getHealthStatus = () => {
    return (dog as any)?.health?.currentHealthStatus || dog?.healthStatus;
  };
  
  // Get photo URL from photos array, photoGallery, or photoUrl field
  const getPhotoUrl = () => {
    const photoFromArray = (dog as any)?.photos?.[0];
    const photoFromGallery = (dog as any)?.photoGallery?.[0]?.url;
    const photo = photoFromArray || photoFromGallery || dog?.photoUrl;
    console.log('getPhotoUrl - photos array:', (dog as any)?.photos);
    console.log('getPhotoUrl - photoGallery:', (dog as any)?.photoGallery);
    console.log('getPhotoUrl - photoUrl field:', dog?.photoUrl);
    console.log('getPhotoUrl - returning:', photo);
    
    // Add cache busting parameter
    if (photo) {
      return `${photo}${photo.includes('?') ? '&' : '?'}t=${dog?.updatedAt || Date.now()}`;
    }
    return photo;
  };

  // Fetch litters for this dog
  const fetchLitters = async () => {
    if (!dog?.id || !dog?.ownerId) return;
    
    setLittersLoading(true);
    try {
      const response = await apiService.getLitters({
        breederId: dog.ownerId,
        limit: 100,
      });
      
      if (response.success && response.data?.litters) {
        // Filter litters where this dog is either dam or sire
        const dogLitters = response.data.litters.filter((litter: any) => 
          litter.damId === dog.id || litter.sireId === dog.id
        );
        setLitters(dogLitters);
        console.log('Found litters for dog:', dogLitters.length);
      }
    } catch (error) {
      console.error('Error fetching litters:', error);
    } finally {
      setLittersLoading(false);
    }
  };

  // Fetch kennel owner information
  const fetchKennelOwner = async () => {
    if (!dog?.kennelId) {
      console.log('No kennelId available for dog');
      return;
    }
    
    setFetchingKennel(true);
    try {
      // Fetch kennel information
      const response = await apiService.getKennelById(dog.kennelId);
      
      if (response.success && response.data) {
        const kennel = response.data;
        console.log('Fetched kennel:', { id: kennel.id, name: kennel.name, ownerId: kennel.ownerId });
        
        // Set kennel owner info
        setKennelOwner({
          id: kennel.ownerId,
          name: kennel.name || 'Kennel Owner'
        });
      }
    } catch (error) {
      console.error('Error fetching kennel:', error);
      // Try fallback to ownerId on dog if kennel fetch fails
      if (dog.ownerId) {
        setKennelOwner({
          id: dog.ownerId,
          name: (dog as any).breederName || 'Dog Owner'
        });
      }
    } finally {
      setFetchingKennel(false);
    }
  };

  // Fetch litters and kennel owner when dog is loaded
  useEffect(() => {
    if (dog?.id) {
      fetchLitters();
      fetchKennelOwner();
    }
  }, [dog?.id]);

  // Refresh dog data when returning from edit screen
  useFocusEffect(
    React.useCallback(() => {
      const refreshDogData = async () => {
        // Check if we have updated params (coming back from edit)
        const updatedParams = route.params as DogDetailRouteParams;
        const updatedDog = updatedParams?.dog;
        
        if (updatedDog) {
          console.log('Dog data updated from navigation params');
          setDog(updatedDog);
        } else if (dogId && dog) {
          // Fetch fresh data from API if we already have a dog loaded
          console.log('Refreshing dog data from API');
          try {
            const response = await apiService.getDogById(dogId);
            if (response.success && response.data) {
              // Handle both formats: { dog: {...} } and direct dog object
              const dogData = (response.data as any).dog || response.data;
              setDog(dogData as Dog);
            }
          } catch (error) {
            console.error('Error refreshing dog data:', error);
          }
        }
      };
      
      refreshDogData();
    }, [route.params, dogId, dog])
  );

  // Show error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show not found state
  if (!loading && !dog) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>Dog not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getAgeFromBirthDate = (birthDate?: string) => {
    if (!birthDate) return 'Unknown age';
    
    try {
      const birth = new Date(birthDate);
      const today = new Date();
      const ageInMonths = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      if (ageInMonths < 12) {
        return `${ageInMonths} months old`;
      } else {
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        return months > 0 ? `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''} old` : `${years} year${years > 1 ? 's' : ''} old`;
      }
    } catch (error) {
      console.error('Error calculating age:', error);
      return 'Unknown age';
    }
  };

  const getStatusColor = (breedingStatus?: string) => {
    switch (breedingStatus) {
      case 'available':
        return theme.colors.success;
      case 'retired':
        return theme.colors.textSecondary;
      default:
        return theme.colors.warning;
    }
  };

  const getHealthColor = (healthStatus?: string) => {
    switch (healthStatus) {
      case 'good':
      case 'excellent':
        return theme.colors.success;
      case 'fair':
        return theme.colors.warning;
      default:
        return theme.colors.error;
    }
  };

  const formatStatus = (status?: string): string => {
    if (!status) return 'Unknown';
    if (status === 'not_ready') return 'Not Ready';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleEdit = () => {
    navigation.navigate('EditDog' as never, { dog } as never);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Dog',
      `Are you sure you want to delete ${dog.name}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Use dogId if available, fallback to id for backwards compatibility
              const dogIdentifier = (dog as any).dogId || dog.id;
              const response = await apiService.deleteDog(dogIdentifier);
              if (response.success) {
                Alert.alert('Success', 'Dog deleted successfully', [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } else {
                Alert.alert('Error', response.error || 'Failed to delete dog');
              }
            } catch (error) {
              console.error('Error deleting dog:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading && !dog) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading dog details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {loading && (
        <View style={styles.refreshIndicator}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
      {/* Hero Image Section */}
      <View style={styles.heroSection}>
        {getPhotoUrl() ? (
          <Image 
            key={`dog-photo-${dog?.id}-${dog?.updatedAt}`}
            source={{ 
              uri: getPhotoUrl(),
              cache: 'reload',
            }} 
            style={styles.heroImage} 
          />
        ) : (
          <Image 
            source={placeholderImage}
            style={styles.heroImage} 
          />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.heroOverlay}
        >
          <Text style={styles.heroName}>{dog?.name || 'Unknown Dog'}</Text>
          {dog?.callName && dog.callName !== dog.name && (
            <Text style={styles.heroCallName}>"{dog.callName}"</Text>
          )}
        </LinearGradient>
      </View>

      {/* Action Buttons - Only show for owners/breeders */}
      {canEdit && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Icon name="pencil" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Icon name="trash-outline" size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Contact Owner Button - Show for non-owners (both dog parents and breeders) */}
      {canContact && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => {
              // Debug log to see what data we have
              console.log('🔍 Contact info available:', {
                hasKennelOwner: !!kennelOwner,
                kennelOwnerId: kennelOwner?.id,
                kennelName: kennelOwner?.name,
                dogKennelId: dog?.kennelId,
                dogId: dog?.id,
                dogName: dog?.name,
              });
              
              if (!kennelOwner?.id) {
                Alert.alert(
                  'Unable to Contact',
                  'Owner information is not available for this dog. Please try again later or contact support.',
                  [{ text: 'OK' }]
                );
                return;
              }
              
              (navigation as any).navigate('ContactBreeder', {
                receiverId: kennelOwner.id,
                breederName: kennelOwner.name,
                puppyId: dog?.id,
                puppyName: dog?.name,
                puppyBreed: dog?.breed,
                puppyPhoto: dog?.photoUrl,
              });
            }}
          >
            <Icon name="chatbubble" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>
              {user?.userType === 'breeder' ? 'Contact Owner' : 'Contact Breeder'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Basic Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Basic Information</Text>
        
        {dog?.breed && (
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Icon name="paw" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Breed</Text>
              <Text style={styles.infoValue}>{dog.breed}</Text>
            </View>
          </View>
        )}

        {dog?.gender && (
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Icon name={dog.gender === 'male' ? 'male' : 'female'} size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{dog.gender === 'male' ? 'Male' : 'Female'}</Text>
            </View>
          </View>
        )}

        {dog?.birthDate && (
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Icon name="calendar" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{getAgeFromBirthDate(dog.birthDate)}</Text>
              <Text style={styles.infoSubtext}>Born: {new Date(dog.birthDate).toLocaleDateString()}</Text>
            </View>
          </View>
        )}

        {dog?.color && (
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Icon name="color-palette" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Color</Text>
              <Text style={styles.infoValue}>{dog.color}</Text>
            </View>
          </View>
        )}

        {dog?.weight && dog.weight > 0 && (
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Icon name="scale-outline" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>{dog.weight} lbs</Text>
            </View>
          </View>
        )}

        {dog?.dogType && (
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Icon name="pricetag" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>{dog.dogType === 'parent' ? 'Parent Dog' : 'Puppy'}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Status Card */}
      {(dog?.breedingStatus || getHealthStatus()) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status</Text>
          
          <View style={styles.statusRow}>
            {dog?.breedingStatus && (
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Breeding Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(dog.breedingStatus) }]}>
                  <Text style={styles.statusBadgeText}>
                    {formatStatus(dog.breedingStatus)}
                  </Text>
                </View>
              </View>
            )}
            
            {getHealthStatus() && (
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Health Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: getHealthColor(getHealthStatus()) }]}>
                  <Text style={styles.statusBadgeText}>
                    {formatStatus(getHealthStatus())}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Description Card */}
      {dog?.description && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.descriptionText}>{dog.description}</Text>
        </View>
      )}

      {/* Litters Card */}
      {litters.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Litters ({litters.length})</Text>
            <Icon name="albums" size={24} color={theme.colors.primary} />
          </View>
          {littersLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <View style={styles.littersContainer}>
              {litters.map((litter: any) => (
                <TouchableOpacity
                  key={litter.id}
                  style={styles.litterCard}
                  onPress={() => navigation.navigate('LitterDetail' as never, { litter } as never)}
                >
                  <View style={styles.litterHeader}>
                    <View style={styles.litterIconContainer}>
                      <Icon name="albums" size={20} color={theme.colors.primary} />
                    </View>
                    <View style={styles.litterInfo}>
                      <Text style={styles.litterName}>
                        {litter.damName || 'Unknown Dam'} × {litter.sireName || 'Unknown Sire'}
                      </Text>
                      <Text style={styles.litterRole}>
                        {litter.damId === dog?.id ? '🐕 Mother' : '🐕 Father'}
                      </Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                  </View>
                  <View style={styles.litterDetails}>
                    <View style={styles.litterDetailItem}>
                      <Icon name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.litterDetailText}>
                        {litter.birthDate ? new Date(litter.birthDate).toLocaleDateString() : 'Expected'}
                      </Text>
                    </View>
                    <View style={styles.litterDetailItem}>
                      <Icon name="paw-outline" size={16} color={theme.colors.textSecondary} />
                      <Text style={styles.litterDetailText}>
                        {litter.puppyCount || 0} {litter.puppyCount === 1 ? 'puppy' : 'puppies'}
                      </Text>
                    </View>
                    <View style={[
                      styles.litterStatusBadge,
                      { backgroundColor: litter.status === 'active' ? theme.colors.success : theme.colors.warning }
                    ]}>
                      <Text style={styles.litterStatusText}>{litter.status || 'planned'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Quick Stats */}
      {(dog?.createdAt || dog?.updatedAt) && (
        <View style={styles.statsCard}>
          {dog?.createdAt && (
            <View style={styles.statItem}>
              <Icon name="time-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.statLabel}>Created</Text>
              <Text style={styles.statValue}>{new Date(dog.createdAt).toLocaleDateString()}</Text>
            </View>
          )}
          {dog?.createdAt && dog?.updatedAt && <View style={styles.statDivider} />}
          {dog?.updatedAt && (
            <View style={styles.statItem}>
              <Icon name="refresh-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.statLabel}>Updated</Text>
              <Text style={styles.statValue}>{new Date(dog.updatedAt).toLocaleDateString()}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.error,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  heroSection: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
  },
  heroName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroCallName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
    marginTop: theme.spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionBar: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.error,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
  },
  infoSubtext: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statusItem: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  statsCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: theme.colors.border,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  bottomSpacer: {
    height: theme.spacing.xl,
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
  refreshIndicator: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    zIndex: 1000,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.sm,
    ...theme.shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  littersContainer: {
    gap: theme.spacing.md,
  },
  litterCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  litterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  litterIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  litterInfo: {
    flex: 1,
  },
  litterName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  litterRole: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  litterDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  litterDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  litterDetailText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  litterStatusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginLeft: 'auto',
  },
  litterStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
});

export default DogDetailScreen;


