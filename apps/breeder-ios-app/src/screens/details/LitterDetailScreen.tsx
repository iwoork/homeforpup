import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../utils/theme';
import { Litter, Dog } from '../../types';
import apiService from '../../services/apiService';

interface RouteParams {
  litter: Litter;
}

const LitterDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { litter: initialLitter } = route.params as RouteParams;
  const [litter] = useState<Litter>(initialLitter);
  const [puppies] = useState<Dog[]>([]); // Will be fetched from API
  const [sire, setSire] = useState<Dog | null>(null);
  const [dam, setDam] = useState<Dog | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

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

  const getPuppyStatus = () => {
    const total = litter.puppyCount || 0;
    const available = litter.availablePuppies || 0;
    const pending = Math.floor(total * 0.2); // Example calculation
    const placed = total - available - pending;

    return { total, available, pending, placed };
  };

  const handleEdit = () => {
    navigation.navigate('EditLitter' as never, { litter } as never);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Litter',
      'Are you sure you want to delete this litter? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.deleteLitter(litter.id);
              if (response.success) {
                Alert.alert('Success', 'Litter deleted successfully', [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } else {
                throw new Error(response.error || 'Failed to delete litter');
              }
            } catch (error) {
              console.error('Error deleting litter:', error);
              Alert.alert(
                'Error',
                error instanceof Error
                  ? error.message
                  : 'Failed to delete litter. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  const handleAddPuppy = () => {
    navigation.navigate(
      'CreateDog' as never,
      { litterId: litter.id, dogType: 'puppy' } as never,
    );
  };

  const renderPuppyCard = ({ item }: { item: Dog }) => (
    <TouchableOpacity
      style={styles.puppyCard}
      onPress={() =>
        navigation.navigate('DogDetail' as never, { dog: item } as never)
      }
      activeOpacity={0.8}
    >
      {item.photoUrl ? (
        <Image source={{ uri: item.photoUrl }} style={styles.puppyImage} />
      ) : (
        <View style={styles.puppyImagePlaceholder}>
          <Icon name="paw" size={32} color={theme.colors.primary} />
        </View>
      )}
      <View style={styles.puppyInfo}>
        <Text style={styles.puppyName}>{item.name}</Text>
        <View style={styles.puppyMeta}>
          <Icon
            name={item.gender === 'male' ? 'male' : 'female'}
            size={14}
            color={item.gender === 'male' ? '#3b82f6' : '#ec4899'}
          />
          <Text style={styles.puppyGender}>{item.gender}</Text>
          <Text style={styles.puppyColor}>{item.color}</Text>
        </View>
      </View>
      <Icon
        name="chevron-forward"
        size={20}
        color={theme.colors.textTertiary}
      />
    </TouchableOpacity>
  );

  const statusColors = getStatusColor(litter.status);
  const stats = getPuppyStatus();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={statusColors} style={styles.header}>
        <Text style={styles.breedTitle}>{litter.breed}</Text>
        <Text style={styles.seasonText}>{litter.season} Litter</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{litter.status.toUpperCase()}</Text>
        </View>
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
          activeOpacity={0.8}
        >
          <Icon name="create-outline" size={20} color="#ffffff" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Icon name="trash-outline" size={20} color="#ffffff" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Puppy Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.statGradient}
            >
              <Icon name="paw" size={28} color="#ffffff" />
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.statGradient}
            >
              <Icon name="checkmark-circle" size={28} color="#ffffff" />
              <Text style={styles.statValue}>{stats.available}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.statGradient}
            >
              <Icon name="time" size={28} color="#ffffff" />
              <Text style={styles.statValue}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Reserved</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#6366f1', '#4f46e5']}
              style={styles.statGradient}
            >
              <Icon name="home" size={28} color="#ffffff" />
              <Text style={styles.statValue}>{stats.placed}</Text>
              <Text style={styles.statLabel}>Placed</Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Dates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Important Dates</Text>
        <View style={styles.dateCard}>
          <View style={styles.dateItem}>
            <Icon name="calendar" size={20} color={theme.colors.primary} />
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Breeding Date</Text>
              <Text style={styles.dateValue}>
                {formatDate(litter.breedingDate)}
              </Text>
            </View>
          </View>
          <View style={styles.dateItem}>
            <Icon
              name="calendar-outline"
              size={20}
              color={theme.colors.secondary}
            />
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Expected Birth</Text>
              <Text style={styles.dateValue}>
                {formatDate(litter.expectedDate)}
              </Text>
            </View>
          </View>
          {litter.birthDate && (
            <View style={styles.dateItem}>
              <Icon name="calendar" size={20} color={theme.colors.success} />
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Actual Birth</Text>
                <Text style={styles.dateValue}>
                  {formatDate(litter.birthDate)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Gender Distribution */}
      {(litter.maleCount !== undefined || litter.femaleCount !== undefined) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gender Distribution</Text>
          <View style={styles.genderCard}>
            <View style={styles.genderItem}>
              <Icon name="male" size={24} color="#3b82f6" />
              <Text style={styles.genderLabel}>Males</Text>
              <Text style={styles.genderValue}>{litter.maleCount || 0}</Text>
            </View>
            <View style={styles.genderDivider} />
            <View style={styles.genderItem}>
              <Icon name="female" size={24} color="#ec4899" />
              <Text style={styles.genderLabel}>Females</Text>
              <Text style={styles.genderValue}>{litter.femaleCount || 0}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Price Range */}
      {litter.priceRange && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.priceCard}>
            <Icon name="cash" size={24} color={theme.colors.success} />
            <Text style={styles.priceText}>
              ${litter.priceRange.min.toLocaleString()} - $
              {litter.priceRange.max.toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      {/* Description */}
      {litter.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>{litter.description}</Text>
          </View>
        </View>
      )}

      {/* Puppies List */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Puppies</Text>
          <TouchableOpacity
            style={styles.addPuppyButton}
            onPress={handleAddPuppy}
            activeOpacity={0.8}
          >
            <Icon name="add" size={20} color={theme.colors.primary} />
            <Text style={styles.addPuppyText}>Add Puppy</Text>
          </TouchableOpacity>
        </View>
        {puppies.length === 0 ? (
          <View style={styles.emptyPuppies}>
            <Icon
              name="paw-outline"
              size={48}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyPuppiesText}>No puppies added yet</Text>
            <Text style={styles.emptyPuppiesSubtext}>
              Add puppies to this litter to track their information
            </Text>
          </View>
        ) : (
          <FlatList
            data={puppies}
            renderItem={renderPuppyCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  breedTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: theme.spacing.xs,
  },
  seasonText: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: theme.spacing.md,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  section: {
    padding: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  statGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    minHeight: 110,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
    opacity: 0.95,
  },
  dateCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  dateInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  genderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  genderItem: {
    flex: 1,
    alignItems: 'center',
  },
  genderDivider: {
    width: 1,
    height: 60,
    backgroundColor: theme.colors.border,
  },
  genderLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs / 2,
  },
  genderValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  priceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.success,
    marginLeft: theme.spacing.md,
  },
  descriptionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  descriptionText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 24,
  },
  addPuppyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  addPuppyText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  puppyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  puppyImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
  },
  puppyImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  puppyInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  puppyName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  puppyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  puppyGender: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    marginRight: theme.spacing.sm,
    textTransform: 'capitalize',
  },
  puppyColor: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyPuppies: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  emptyPuppiesText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyPuppiesSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default LitterDetailScreen;
