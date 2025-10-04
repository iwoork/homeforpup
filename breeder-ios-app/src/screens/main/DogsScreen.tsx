import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../utils/theme';
import { Dog } from '../../types';

const DogsScreen: React.FC = () => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDogs();
  }, []);

  const fetchDogs = async () => {
    try {
      // TODO: Implement actual API call
      // Simulate API call
      setTimeout(() => {
        setDogs([
          {
            id: '1',
            name: 'Bella',
            breed: 'Golden Retriever',
            gender: 'female',
            birthDate: '2020-03-15',
            color: 'Golden',
            weight: 65,
            type: 'parent',
            kennelId: '1',
            kennelName: 'Sunny Acres Kennel',
            breeding: {
              isBreedingDog: true,
              breedingStatus: 'available',
              breedingHistory: [],
              geneticTests: [],
            },
            status: 'active',
            health: {
              healthClearances: [],
              vaccinations: [],
              medicalHistory: [],
              currentHealthStatus: 'excellent',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Max',
            breed: 'German Shepherd',
            gender: 'male',
            birthDate: '2019-07-22',
            color: 'Black and Tan',
            weight: 80,
            type: 'parent',
            kennelId: '2',
            kennelName: 'Mountain View Kennels',
            breeding: {
              isBreedingDog: true,
              breedingStatus: 'available',
              breedingHistory: [],
              geneticTests: [],
            },
            status: 'active',
            health: {
              healthClearances: [],
              vaccinations: [],
              medicalHistory: [],
              currentHealthStatus: 'good',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching dogs:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDogs();
    setRefreshing(false);
  };

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

  const getStatusColor = (status: string, breedingStatus: string) => {
    if (status === 'active' && breedingStatus === 'available') {
      return theme.colors.success;
    } else if (status === 'active') {
      return theme.colors.primary;
    } else {
      return theme.colors.textSecondary;
    }
  };

  const renderDogItem = ({ item }: { item: Dog }) => (
    <TouchableOpacity style={styles.dogCard}>
      <View style={styles.dogImageContainer}>
        {item.photos && item.photos.length > 0 ? (
          <Image source={{ uri: item.photos[0] }} style={styles.dogImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="pets" size={40} color={theme.colors.textSecondary} />
          </View>
        )}
      </View>
      
      <View style={styles.dogContent}>
        <View style={styles.dogHeader}>
          <Text style={styles.dogName}>{item.name}</Text>
          <View style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(item.status, item.breeding.breedingStatus) }
          ]} />
        </View>
        
        <Text style={styles.dogBreed}>{item.breed}</Text>
        
        <View style={styles.dogDetails}>
          <View style={styles.detailRow}>
            <Icon name="pets" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>
              {item.gender === 'male' ? 'Male' : 'Female'} • {getAgeFromBirthDate(item.birthDate)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="palette" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{item.color}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="monitor-weight" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{item.weight} lbs</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="home" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{item.kennelName}</Text>
          </View>
        </View>
        
        <View style={styles.dogTags}>
          <View style={[styles.tag, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.tagText}>{item.type}</Text>
          </View>
          
          {item.breeding.isBreedingDog && (
            <View style={[styles.tag, { backgroundColor: theme.colors.secondary }]}>
              <Text style={styles.tagText}>Breeding</Text>
            </View>
          )}
          
          <View style={[
            styles.tag,
            { backgroundColor: item.health.currentHealthStatus === 'excellent' ? theme.colors.success : theme.colors.warning }
          ]}>
            <Text style={styles.tagText}>
              {item.health.currentHealthStatus}
            </Text>
          </View>
        </View>
      </View>
      
      <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="pets" size={64} color={theme.colors.textSecondary} />
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
        <Text>Loading dogs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={dogs}
        renderItem={renderDogItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={dogs.length === 0 ? styles.emptyContainer : styles.listContainer}
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
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
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
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
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
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
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
});

export default DogsScreen;

