import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Dimensions,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary, MediaType } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../utils/theme';
import { Kennel, Litter, Dog } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useKennels, useLitters, useDogs } from '../../hooks/useApi';
import apiService from '../../services/apiService';

const { width } = Dimensions.get('window');

const KennelDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  // Get kennel data from route params
  const routeParams = (route.params as any);
  const kennelId = routeParams?.kennelId;
  const passedKennel = routeParams?.kennel;
  
  // State
  const [kennel, setKennel] = useState<Kennel | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'litters' | 'dogs' | 'contact'>('overview');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  
  // Fetch kennel data
  const { data: kennelsData, refresh: refreshKennels } = useKennels();
  const { data: littersData, refresh: refreshLitters } = useLitters({ kennelId });
  const { data: dogsData, refresh: refreshDogs } = useDogs({ kennelId });
  
  const litters = littersData?.litters || [];
  const dogs = dogsData?.dogs || [];
  
  // Find the specific kennel
  useEffect(() => {
    console.log('KennelDetailScreen useEffect:', {
      passedKennel: !!passedKennel,
      kennelId,
      kennelsData: !!kennelsData,
      kennelsCount: kennelsData?.kennels?.length || 0
    });
    
    // If kennel is passed directly, use it
    if (passedKennel) {
      console.log('Using passed kennel:', passedKennel.name);
      setKennel(passedKennel);
      setCoverPhoto(passedKennel.photos?.[0] || null);
      setLoading(false);
      return;
    }
    
    // Otherwise, find by ID
    if (kennelsData?.kennels && kennelId) {
      const foundKennel = kennelsData.kennels.find(k => k.id === kennelId);
      console.log('Found kennel by ID:', foundKennel?.name || 'Not found');
      setKennel(foundKennel || null);
      setCoverPhoto(foundKennel?.photos?.[0] || null);
      setLoading(false);
    }
  }, [kennelsData, kennelId, passedKennel]);
  
  // Timeout fallback to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('KennelDetailScreen timeout - still loading');
        setLoading(false);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeout);
  }, [loading]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshKennels(),
      refreshLitters(),
      refreshDogs(),
    ]);
    setRefreshing(false);
  };
  
  const handleContact = (type: 'phone' | 'email' | 'website') => {
    if (!kennel) return;
    
    switch (type) {
      case 'phone':
        if (kennel.phone) {
          Linking.openURL(`tel:${kennel.phone}`);
        }
        break;
      case 'email':
        if (kennel.email) {
          Linking.openURL(`mailto:${kennel.email}`);
        }
        break;
      case 'website':
        if (kennel.website) {
          Linking.openURL(kennel.website);
        }
        break;
    }
  };
  
  const handleNavigateToLitter = (litterId: string) => {
    navigation.navigate('LitterDetail' as never, { litterId } as never);
  };
  
  const handleNavigateToDog = (dogId: string) => {
    navigation.navigate('DogDetail' as never, { dogId } as never);
  };
  
  const handleUploadCoverPhoto = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      includeBase64: false,
    };
    
    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setUploadingCover(true);
        
        // Here you would typically upload to your server
        // For now, we'll just set the local URI
        setCoverPhoto(asset.uri || null);
        setUploadingCover(false);
        
        Alert.alert('Success', 'Cover photo updated successfully!');
      }
    });
  };
  
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading kennel details...</Text>
          <Text style={styles.debugText}>
            Debug: {passedKennel ? 'Has kennel' : 'No kennel'} | 
            ID: {kennelId || 'None'} | 
            Data: {kennelsData ? 'Loaded' : 'Loading...'}
          </Text>
        </View>
      </View>
    );
  }
  
  if (!kennel) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>Kennel not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const renderHeader = () => (
    <View style={styles.header}>
      {/* Cover Photo */}
      <View style={styles.coverPhotoContainer}>
        {coverPhoto ? (
          <Image source={{ uri: coverPhoto }} style={styles.coverPhoto} />
        ) : (
          <View style={styles.coverPhotoPlaceholder}>
            <Icon name="home" size={48} color={theme.colors.textInverse} />
          </View>
        )}
        
        {/* Upload Button Overlay */}
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={handleUploadCoverPhoto}
          disabled={uploadingCover}
        >
          <Icon 
            name={uploadingCover ? "hourglass" : "camera"} 
            size={20} 
            color={theme.colors.textInverse} 
          />
        </TouchableOpacity>
        
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { top: insets.top + theme.spacing.md }]}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.textInverse} />
        </TouchableOpacity>
      </View>
      
      {/* Kennel Info */}
      <View style={styles.kennelInfo}>
        <Text style={styles.kennelName}>{kennel.name}</Text>
        {kennel.description && (
          <Text style={styles.kennelDescription}>{kennel.description}</Text>
        )}
        
        <View style={styles.kennelStats}>
          <View style={styles.statItem}>
            <Icon name="home" size={16} color={theme.colors.textInverse} />
            <Text style={styles.statText}>{kennel.capacity?.currentLitters || 0} Litters</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="paw" size={16} color={theme.colors.textInverse} />
            <Text style={styles.statText}>{kennel.capacity?.currentDogs || 0} Dogs</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="location" size={16} color={theme.colors.textInverse} />
            <Text style={styles.statText}>{kennel.address?.city}, {kennel.address?.state}</Text>
          </View>
        </View>
      </View>
    </View>
  );
  
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {[
        { key: 'overview', label: 'Overview', icon: 'information-circle' },
        { key: 'litters', label: 'Litters', icon: 'home' },
        { key: 'dogs', label: 'Dogs', icon: 'paw' },
        { key: 'contact', label: 'Contact', icon: 'call' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <Icon 
            name={tab.icon as any} 
            size={16} 
            color={activeTab === tab.key ? theme.colors.primary : theme.colors.textSecondary} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === tab.key && styles.activeTabText
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Kennel Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About This Kennel</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="business" size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Business Type</Text>
              <Text style={styles.infoValue}>{kennel.businessType || 'Not specified'}</Text>
            </View>
          </View>
          
          {kennel.specialties && kennel.specialties.length > 0 && (
            <View style={styles.infoRow}>
              <Icon name="star" size={20} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Specialties</Text>
                <View style={styles.specialtiesContainer}>
                  {kennel.specialties.map((specialty, index) => (
                    <View key={index} style={styles.specialtyTag}>
                      <Text style={styles.specialtyText}>{specialty}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
          
          {kennel.establishedDate && (
            <View style={styles.infoRow}>
              <Icon name="calendar" size={20} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Established</Text>
                <Text style={styles.infoValue}>
                  {new Date(kennel.establishedDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
      
      {/* Facilities */}
      {kennel.facilities && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facilities</Text>
          <View style={styles.facilitiesGrid}>
            {Object.entries(kennel.facilities).map(([key, value]) => {
              if (typeof value === 'boolean' && value) {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <View key={key} style={styles.facilityItem}>
                    <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
                    <Text style={styles.facilityText}>{label}</Text>
                  </View>
                );
              }
              return null;
            })}
          </View>
        </View>
      )}
      
      {/* Location */}
      {kennel.address && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationCard}>
            <Icon name="location" size={20} color={theme.colors.primary} />
            <View style={styles.locationContent}>
              <Text style={styles.locationText}>
                {kennel.address.street}
              </Text>
              <Text style={styles.locationText}>
                {kennel.address.city}, {kennel.address.state} {kennel.address.zipCode}
              </Text>
              <Text style={styles.locationText}>
                {kennel.address.country}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
  
  const renderLitters = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Litters ({litters.length})</Text>
        {litters.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="home-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>No litters available</Text>
          </View>
        ) : (
          <View style={styles.littersList}>
            {litters.map((litter) => (
              <TouchableOpacity
                key={litter.id}
                style={styles.litterCard}
                onPress={() => handleNavigateToLitter(litter.id)}
              >
                <View style={styles.litterHeader}>
                  <Text style={styles.litterTitle}>{litter.name}</Text>
                  <View style={styles.litterStatus}>
                    <Text style={styles.litterStatusText}>{litter.status}</Text>
                  </View>
                </View>
                <Text style={styles.litterBreed}>
                  {litter.sireBreed} × {litter.damBreed}
                </Text>
                <Text style={styles.litterInfo}>
                  {litter.puppies?.length || 0} puppies • Born {new Date(litter.birthDate).toLocaleDateString()}
                </Text>
                <View style={styles.litterFooter}>
                  <Text style={styles.litterPrice}>
                    ${litter.priceRange?.min || 0} - ${litter.priceRange?.max || 0}
                  </Text>
                  <Icon name="chevron-forward" size={16} color={theme.colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
  
  const renderDogs = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dogs ({dogs.length})</Text>
        {dogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="paw-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyText}>No dogs available</Text>
          </View>
        ) : (
          <View style={styles.dogsList}>
            {dogs.map((dog) => (
              <TouchableOpacity
                key={dog.id}
                style={styles.dogCard}
                onPress={() => handleNavigateToDog(dog.id)}
              >
                <View style={styles.dogImageContainer}>
                  {dog.photos && dog.photos.length > 0 ? (
                    <Image source={{ uri: dog.photos[0] }} style={styles.dogImage} />
                  ) : (
                    <View style={styles.dogImagePlaceholder}>
                      <Icon name="paw" size={24} color={theme.colors.textTertiary} />
                    </View>
                  )}
                </View>
                <View style={styles.dogInfo}>
                  <Text style={styles.dogName}>{dog.name}</Text>
                  <Text style={styles.dogBreed}>{dog.breed}</Text>
                  <Text style={styles.dogAge}>
                    {dog.age} years old • {dog.gender}
                  </Text>
                  {dog.breeding && (
                    <View style={styles.breedingStatus}>
                      <Text style={styles.breedingStatusText}>
                        {dog.breeding.breedingStatus}
                      </Text>
                    </View>
                  )}
                </View>
                <Icon name="chevron-forward" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
  
  const renderContact = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        {kennel.phone && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact('phone')}
          >
            <View style={styles.contactIcon}>
              <Icon name="call" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>{kennel.phone}</Text>
            </View>
            <Icon name="chevron-forward" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
        
        {kennel.email && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact('email')}
          >
            <View style={styles.contactIcon}>
              <Icon name="mail" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{kennel.email}</Text>
            </View>
            <Icon name="chevron-forward" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
        
        {kennel.website && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContact('website')}
          >
            <View style={styles.contactIcon}>
              <Icon name="globe" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={styles.contactValue}>{kennel.website}</Text>
            </View>
            <Icon name="chevron-forward" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
        
        {kennel.socialMedia && (
          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>Follow Us</Text>
            <View style={styles.socialLinks}>
              {kennel.socialMedia.facebook && (
                <TouchableOpacity style={styles.socialLink}>
                  <Icon name="logo-facebook" size={24} color="#1877F2" />
                </TouchableOpacity>
              )}
              {kennel.socialMedia.instagram && (
                <TouchableOpacity style={styles.socialLink}>
                  <Icon name="logo-instagram" size={24} color="#E4405F" />
                </TouchableOpacity>
              )}
              {kennel.socialMedia.twitter && (
                <TouchableOpacity style={styles.socialLink}>
                  <Icon name="logo-twitter" size={24} color="#1DA1F2" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'litters':
        return renderLitters();
      case 'dogs':
        return renderDogs();
      case 'contact':
        return renderContact();
      default:
        return renderOverview();
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderHeader()}
        {renderTabs()}
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  debugText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: theme.colors.primary,
  },
  coverPhotoContainer: {
    height: 200,
    position: 'relative',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  coverPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kennelInfo: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  kennelName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textInverse,
    marginBottom: theme.spacing.sm,
  },
  kennelDescription: {
    fontSize: 16,
    color: theme.colors.textInverse,
    opacity: 0.9,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  kennelStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statText: {
    fontSize: 14,
    color: theme.colors.textInverse,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  specialtyTag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  specialtyText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    width: '45%',
  },
  facilityText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  locationContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  locationText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  littersList: {
    gap: theme.spacing.md,
  },
  litterCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  litterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  litterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  litterStatus: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  litterStatusText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  litterBreed: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  litterInfo: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  litterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  litterPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  dogsList: {
    gap: theme.spacing.md,
  },
  dogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dogImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: theme.spacing.md,
  },
  dogImage: {
    width: '100%',
    height: '100%',
  },
  dogImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dogInfo: {
    flex: 1,
  },
  dogName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  dogBreed: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  dogAge: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  breedingStatus: {
    marginTop: theme.spacing.xs,
  },
  breedingStatusText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  contactValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  socialSection: {
    marginTop: theme.spacing.lg,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  socialLink: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default KennelDetailScreen;