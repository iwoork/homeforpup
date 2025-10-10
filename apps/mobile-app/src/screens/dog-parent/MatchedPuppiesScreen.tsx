import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';

interface MatchedPuppy {
  id: string;
  name: string;
  breed: string;
  age: string;
  price: number;
  location: string;
  imageUrl?: string;
  gender: 'male' | 'female';
  breederName: string;
  matchScore: number; // 0-100
  matchReasons: string[];
}

const MatchedPuppiesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  // Mock data - replace with actual API call based on user preferences
  const [matchedPuppies, setMatchedPuppies] = useState<MatchedPuppy[]>([
    // This will be populated from API based on user.puppyParentInfo
  ]);

  const hasPreferences = user?.puppyParentInfo?.preferredBreeds && 
                        user.puppyParentInfo.preferredBreeds.length > 0;

  const renderMatchedPuppy = (puppy: MatchedPuppy) => (
    <TouchableOpacity
      key={puppy.id}
      style={styles.puppyCard}
      onPress={() => navigation.navigate('DogDetail' as never, { id: puppy.id } as never)}
    >
      <View style={styles.imageContainer}>
        {puppy.imageUrl ? (
          <Image source={{ uri: puppy.imageUrl }} style={styles.puppyImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="paw" size={60} color={theme.colors.textTertiary} />
          </View>
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        >
          <View style={styles.matchBadge}>
            <Icon name="heart" size={16} color="#ffffff" />
            <Text style={styles.matchScore}>{puppy.matchScore}% Match</Text>
          </View>
        </LinearGradient>
      </View>
      
      <View style={styles.puppyInfo}>
        <View style={styles.puppyHeader}>
          <View style={styles.puppyTitleContainer}>
            <Text style={styles.puppyName}>{puppy.name}</Text>
            <Text style={styles.puppyBreed}>{puppy.breed}</Text>
          </View>
          <View style={styles.genderBadge}>
            <Icon
              name={puppy.gender === 'male' ? 'male' : 'female'}
              size={20}
              color={puppy.gender === 'male' ? '#3b82f6' : '#ec4899'}
            />
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Icon name="calendar-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{puppy.age}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="location-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{puppy.location}</Text>
          </View>
        </View>

        <View style={styles.matchReasonsContainer}>
          <Text style={styles.matchReasonsTitle}>Why this match:</Text>
          {puppy.matchReasons.map((reason, index) => (
            <View key={index} style={styles.matchReason}>
              <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={styles.matchReasonText}>{reason}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          {puppy.price && (
            <Text style={styles.price}>${puppy.price.toLocaleString()}</Text>
          )}
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => {
              console.log('Contact breeder for matched puppy:', puppy.id);
              (navigation as any).navigate('ContactBreeder', {
                receiverId: puppy.breederName, // TODO: Need actual breeder ID from API
                breederName: puppy.breederName,
                puppyId: puppy.id,
                puppyName: puppy.name,
                puppyBreed: puppy.breed,
                puppyPhoto: puppy.imageUrl,
              });
            }}
          >
            <Icon name="chatbubble" size={16} color="#ffffff" />
            <Text style={styles.contactButtonText}>Contact Breeder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!hasPreferences) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <LinearGradient
            colors={[theme.colors.primary + '20', theme.colors.secondary + '20']}
            style={styles.emptyIconContainer}
          >
            <Icon name="heart-outline" size={64} color={theme.colors.primary} />
          </LinearGradient>
          <Text style={styles.emptyTitle}>Set Your Preferences</Text>
          <Text style={styles.emptyText}>
            Tell us what you're looking for in a puppy, and we'll find the perfect matches for you!
          </Text>
          <TouchableOpacity
            style={styles.preferencesButton}
            onPress={() => navigation.navigate('DogParentPreferences' as never)}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.buttonGradient}
            >
              <Icon name="options" size={20} color="#ffffff" />
              <Text style={styles.buttonText}>Set Preferences</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Matches</Text>
        <Text style={styles.headerSubtitle}>
          Based on your preferences
        </Text>
        <TouchableOpacity
          style={styles.editPreferencesLink}
          onPress={() => navigation.navigate('DogParentPreferences' as never)}
        >
          <Text style={styles.editPreferencesText}>Edit Preferences</Text>
          <Icon name="chevron-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {matchedPuppies.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyScrollState}>
          <Icon name="search-outline" size={64} color={theme.colors.textTertiary} />
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptyText}>
            We're looking for puppies that match your preferences. Check back soon!
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('SearchPuppies' as never)}
          >
            <Text style={styles.searchButtonText}>Browse All Puppies</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.puppiesList}>
          {matchedPuppies.map(renderMatchedPuppy)}
        </ScrollView>
      )}
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
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  editPreferencesLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editPreferencesText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  puppiesList: {
    padding: theme.spacing.lg,
  },
  puppyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  imageContainer: {
    height: 240,
    position: 'relative',
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
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: 6,
  },
  matchScore: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  puppyInfo: {
    padding: theme.spacing.lg,
  },
  puppyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  puppyTitleContainer: {
    flex: 1,
  },
  puppyName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  puppyBreed: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  genderBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  matchReasonsContainer: {
    marginBottom: theme.spacing.lg,
  },
  matchReasonsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  matchReason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.xs,
  },
  matchReasonText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyScrollState: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
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
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MatchedPuppiesScreen;

