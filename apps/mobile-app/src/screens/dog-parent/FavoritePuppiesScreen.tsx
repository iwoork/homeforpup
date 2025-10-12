import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import { useFavorites } from '../../hooks/useFavorites';
import { Dog } from '../../services/apiService';
import { messageService, MessageThread } from '../../services/messageService';
import { useAuth } from '../../contexts/AuthContext';

interface FavoritePuppy extends Dog {
  savedDate: string;
}

const FavoritePuppiesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { favorites, loading, removeFavorite, refresh } = useFavorites();
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);

  // Refresh favorites and threads when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refresh();
      loadMessageThreads();
    }, [refresh])
  );

  const loadMessageThreads = async () => {
    try {
      setLoadingThreads(true);
      const threads = await messageService.getThreads();
      setMessageThreads(threads);
    } catch (error) {
      console.error('Error loading message threads:', error);
    } finally {
      setLoadingThreads(false);
    }
  };

  // Check if there's an existing thread with a breeder
  const findThreadWithBreeder = (breederId: string): MessageThread | undefined => {
    return messageThreads.find(thread => 
      thread.participants.includes(breederId) || 
      thread.otherParticipant === breederId
    );
  };

  const handleRemoveFavorite = (puppyId: string) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this puppy from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeFavorite(puppyId);
          },
        },
      ]
    );
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

  // Helper function to get photo URL from multiple possible fields
  const getPhotoUrl = (dog: Dog): string | undefined => {
    const photoFromUrl = dog.photoUrl;
    const photoFromArray = (dog as any).photos?.[0];
    const photoFromGallery = (dog as any).photoGallery?.[0]?.url;
    return photoFromUrl || photoFromArray || photoFromGallery;
  };

  const renderFavoritePuppy = ({ item }: { item: FavoritePuppy }) => {
    const photoUrl = getPhotoUrl(item);
    const displayAge = item.age || calculateAge(item.birthDate);

    return (
      <TouchableOpacity
        style={styles.puppyCard}
        onPress={() => navigation.navigate('DogDetail' as never, { id: item.id } as never)}
      >
        <View style={styles.imageContainer}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.puppyImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="paw" size={32} color={theme.colors.textTertiary} />
            </View>
          )}
        </View>
        
        <View style={styles.puppyInfo}>
          <View style={styles.puppyHeader}>
            <View style={styles.puppyTitleContainer}>
              <Text style={styles.puppyName}>{item.name}</Text>
              <Text style={styles.puppyBreed}>{item.breed}</Text>
              {item.breederName && (
                <View style={styles.breederRow}>
                  <Icon
                    name="person-outline"
                    size={12}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.breederText}>{item.breederName}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveFavorite(item.id)}
            >
              <Icon name="heart" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Icon name="calendar-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>{displayAge}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon
                name={item.gender === 'male' ? 'male' : 'female'}
                size={14}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.detailText}>{item.gender}</Text>
            </View>
            {item.location && (
              <View style={styles.detailItem}>
                <Icon name="location-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.detailText}>{item.location}</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            {item.price && (
              <Text style={styles.price}>${item.price.toLocaleString()}</Text>
            )}
            {(() => {
              const ownerId = item.ownerId || (item as any).kennelOwners?.[0];
              if (!ownerId) return null;

              const existingThread = findThreadWithBreeder(ownerId);
              
              if (existingThread) {
                // Show "View Messages" button if thread exists
                return (
                  <TouchableOpacity
                    style={[styles.messageButton, styles.viewMessagesButton]}
                    onPress={() => {
                      (navigation as any).navigate('MessageDetail', { 
                        thread: existingThread 
                      });
                    }}
                  >
                    <Icon name="chatbubbles" size={16} color="#ffffff" />
                    <Text style={styles.messageButtonText}>View Messages</Text>
                  </TouchableOpacity>
                );
              } else {
                // Show "Contact Breeder" button if no thread exists
                return (
                  <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() => {
                      (navigation as any).navigate('ContactBreeder', {
                        receiverId: ownerId,
                        breederName: (item as any).kennelName || item.breederName || 'Breeder',
                        puppyId: item.id,
                        puppyName: item.name,
                        puppyBreed: item.breed,
                        puppyPhoto: photoUrl,
                      });
                    }}
                  >
                    <Icon name="chatbubble" size={16} color="#ffffff" />
                    <Text style={styles.messageButtonText}>Contact Breeder</Text>
                  </TouchableOpacity>
                );
              }
            })()}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyText}>Loading favorites...</Text>
        </View>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Icon name="heart-outline" size={80} color={theme.colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyText}>
            Start exploring and save your favorite puppies here!
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('SearchPuppies' as never)}
          >
            <Text style={styles.exploreButtonText}>Explore Puppies</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favorites</Text>
        <Text style={styles.headerSubtitle}>
          {favorites.length} {favorites.length === 1 ? 'puppy' : 'puppies'} saved
        </Text>
      </View>
      
      <FlatList
        data={favorites}
        renderItem={renderFavoritePuppy}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
  list: {
    padding: theme.spacing.lg,
  },
  puppyCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  imageContainer: {
    width: 120,
    height: 120,
  },
  puppyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
  },
  puppyInfo: {
    flex: 1,
    padding: theme.spacing.md,
  },
  puppyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  puppyTitleContainer: {
    flex: 1,
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
    marginBottom: 2,
  },
  breederRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  breederText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  viewMessagesButton: {
    backgroundColor: '#10b981', // Green color to indicate existing conversation
  },
  messageButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  exploreButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default FavoritePuppiesScreen;

