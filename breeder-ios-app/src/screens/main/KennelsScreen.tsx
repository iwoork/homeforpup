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
import { Kennel } from '../../types';

const KennelsScreen: React.FC = () => {
  const [kennels, setKennels] = useState<Kennel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchKennels();
  }, []);

  const fetchKennels = async () => {
    try {
      // TODO: Implement actual API call
      // Simulate API call
      setTimeout(() => {
        setKennels([
          {
            id: '1',
            name: 'Sunny Acres Kennel',
            description: 'Specializing in Golden Retrievers and Labradors',
            address: {
              street: '123 Farm Road',
              city: 'Springfield',
              state: 'IL',
              zipCode: '62701',
              country: 'USA',
            },
            specialties: ['Golden Retriever', 'Labrador'],
            isActive: true,
            isPublic: true,
            photoUrl: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Mountain View Kennels',
            description: 'Premier breeding facility for German Shepherds',
            address: {
              street: '456 Mountain Drive',
              city: 'Denver',
              state: 'CO',
              zipCode: '80202',
              country: 'USA',
            },
            specialties: ['German Shepherd'],
            isActive: true,
            isPublic: true,
            photoUrl: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching kennels:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchKennels();
    setRefreshing(false);
  };

  const renderKennelItem = ({ item }: { item: Kennel }) => (
    <TouchableOpacity style={styles.kennelCard}>
      <View style={styles.kennelImageContainer}>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.kennelImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="home" size={40} color={theme.colors.textSecondary} />
          </View>
        )}
      </View>
      
      <View style={styles.kennelContent}>
        <Text style={styles.kennelName}>{item.name}</Text>
        <Text style={styles.kennelDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.kennelLocation}>
          <Icon name="location-on" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.locationText}>
            {item.address.city}, {item.address.state}
          </Text>
        </View>
        
        <View style={styles.specialtiesContainer}>
          {item.specialties.slice(0, 2).map((specialty, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
          {item.specialties.length > 2 && (
            <Text style={styles.moreSpecialties}>
              +{item.specialties.length - 2} more
            </Text>
          )}
        </View>
        
        <View style={styles.kennelStatus}>
          <View style={[
            styles.statusDot,
            { backgroundColor: item.isActive ? theme.colors.success : theme.colors.textSecondary }
          ]} />
          <Text style={styles.statusText}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
          {item.isPublic && (
            <View style={styles.publicBadge}>
              <Text style={styles.publicText}>Public</Text>
            </View>
          )}
        </View>
      </View>
      
      <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="home" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Kennels Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first kennel to start managing your breeding operations
      </Text>
      <TouchableOpacity style={styles.createButton}>
        <Text style={styles.createButtonText}>Create Kennel</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading kennels...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={kennels}
        renderItem={renderKennelItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={kennels.length === 0 ? styles.emptyContainer : styles.listContainer}
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
  kennelCard: {
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
  kennelImageContainer: {
    marginRight: theme.spacing.md,
  },
  kennelImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kennelContent: {
    flex: 1,
  },
  kennelName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  kennelDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  kennelLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  locationText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  specialtyTag: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  specialtyText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  moreSpecialties: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  kennelStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  publicBadge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  publicText: {
    fontSize: 10,
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

export default KennelsScreen;

