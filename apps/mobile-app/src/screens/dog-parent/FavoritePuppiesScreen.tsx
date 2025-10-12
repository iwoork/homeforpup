import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';

interface FavoritePuppy {
  id: string;
  name: string;
  breed: string;
  age: string;
  price: number;
  location: string;
  imageUrl?: string;
  gender: 'male' | 'female';
  breederId: string; // Breeder's user ID
  breederName: string;
  savedDate: string;
}

const FavoritePuppiesScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Mock data - replace with actual API call
  const [favorites, setFavorites] = useState<FavoritePuppy[]>([
    // This will be populated from API/local storage
  ]);

  const removeFavorite = (puppyId: string) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this puppy from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFavorites(favorites.filter((p) => p.id !== puppyId));
          },
        },
      ]
    );
  };

  const renderFavoritePuppy = ({ item }: { item: FavoritePuppy }) => (
    <TouchableOpacity
      style={styles.puppyCard}
      onPress={() => navigation.navigate('DogDetail' as never, { id: item.id } as never)}
    >
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.puppyImage} />
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
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFavorite(item.id)}
          >
            <Icon name="heart" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Icon name="calendar-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{item.age}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon
              name={item.gender === 'male' ? 'male' : 'female'}
              size={14}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.detailText}>{item.gender}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="location-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            {item.price && (
              <Text style={styles.price}>${item.price.toLocaleString()}</Text>
            )}
            <Text style={styles.breeder}>by {item.breederName}</Text>
          </View>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => {
              console.log('Contact breeder for favorite puppy:', item.id);
              (navigation as any).navigate('ContactBreeder', {
                receiverId: item.breederId,
                breederName: item.breederName,
                puppyId: item.id,
                puppyName: item.name,
                puppyBreed: item.breed,
                puppyPhoto: item.imageUrl,
              });
            }}
          >
            <Icon name="chatbubble" size={16} color="#ffffff" />
            <Text style={styles.messageButtonText}>Contact Breeder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

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
    marginBottom: 2,
  },
  breeder: {
    fontSize: 11,
    color: theme.colors.textTertiary,
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

