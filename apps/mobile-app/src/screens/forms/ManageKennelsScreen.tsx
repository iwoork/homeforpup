import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../utils/theme';
import { Kennel } from '../../types';
import { useKennels } from '../../hooks/useApi';

const ManageKennelsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    data: kennelsData,
    loading,
    error,
    refreshing,
    refresh,
  } = useKennels({
    page: 1,
    limit: 20,
  });

  const kennels = kennelsData?.kennels || [];

  const onRefresh = async () => {
    await refresh();
  };

  const handleDeleteKennel = (kennel: Kennel) => {
    Alert.alert(
      'Delete Kennel',
      `Are you sure you want to delete "${kennel.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement API call to delete kennel
            Alert.alert('Success', 'Kennel deleted successfully');
          },
        },
      ],
    );
  };

  const renderKennelCard = ({ item }: { item: Kennel }) => (
    <View style={styles.kennelCard}>
      <TouchableOpacity
        style={styles.kennelContent}
        onPress={() =>
          navigation.navigate(
            'KennelDetail' as never,
            { kennel: item } as never,
          )
        }
        activeOpacity={0.8}
      >
        <View style={styles.kennelImageContainer}>
          {item.photoUrl ? (
            <Image source={{ uri: item.photoUrl }} style={styles.kennelImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="home" size={32} color={theme.colors.primary} />
            </View>
          )}
        </View>

        <View style={styles.kennelInfo}>
          <Text style={styles.kennelName}>{item.name}</Text>
          <Text style={styles.kennelDescription} numberOfLines={2}>
            {item.description || 'No description available'}
          </Text>

          {item.address && (
            <View style={styles.kennelLocation}>
              <Icon
                name="location"
                size={14}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.locationText}>
                {item.address.city}, {item.address.state}
              </Text>
            </View>
          )}

          <View style={styles.kennelStatus}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: item.isActive
                    ? theme.colors.success
                    : theme.colors.textSecondary,
                },
              ]}
            />
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
      </TouchableOpacity>

      <View style={styles.kennelActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate(
              'KennelDetail' as never,
              { kennel: item } as never,
            )
          }
          activeOpacity={0.7}
        >
          <Icon name="create-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteKennel(item)}
          activeOpacity={0.7}
        >
          <Icon name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={[theme.colors.primary + '20', theme.colors.secondary + '20']}
        style={styles.emptyIconContainer}
      >
        <Icon name="home-outline" size={64} color={theme.colors.primary} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>No Kennels Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first kennel to start managing your breeding operations
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateKennel' as never)}
        activeOpacity={0.8}
      >
        <Icon name="add" size={20} color="#ffffff" />
        <Text style={styles.createButtonText}>Create First Kennel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.headerGradient}
      >
        <Icon name="home" size={40} color="#ffffff" />
        <Text style={styles.headerTitle}>My Kennels</Text>
        <Text style={styles.headerSubtitle}>
          Manage your breeding facilities
        </Text>
      </LinearGradient>

      {kennels.length > 0 && (
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateKennel' as never)}
            activeOpacity={0.8}
          >
            <Icon name="add" size={24} color="#ffffff" />
            <Text style={styles.addButtonText}>Add Kennel</Text>
          </TouchableOpacity>
        </View>
      )}

      {kennels.length > 0 && (
        <View style={styles.infoCard}>
          <Icon name="information-circle" size={24} color={theme.colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Basic Plan</Text>
            <Text style={styles.infoText}>
              You can manage up to 1 kennel on the Basic plan. Upgrade to add
              more kennels.
            </Text>
            <TouchableOpacity style={styles.upgradeLink} activeOpacity={0.7}>
              <Text style={styles.upgradeLinkText}>Learn about Premium →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading kennels...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="alert-circle" size={48} color={theme.colors.error} />
        <Text style={styles.errorText}>Error loading kennels</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={kennels}
        renderItem={renderKennelCard}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          kennels.length === 0 ? styles.emptyContainer : undefined
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.error,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  errorSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  headerGradient: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  headerActions: {
    padding: theme.spacing.md,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  infoCard: {
    backgroundColor: theme.colors.info + '15',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.colors.info + '30',
  },
  infoContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  upgradeLink: {
    alignSelf: 'flex-start',
  },
  upgradeLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  kennelCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  kennelContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  kennelImageContainer: {
    marginRight: theme.spacing.md,
  },
  kennelImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kennelInfo: {
    flex: 1,
  },
  kennelName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  kennelDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  kennelLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  locationText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs / 2,
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
  kennelActions: {
    flexDirection: 'row',
    paddingRight: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
});

export default ManageKennelsScreen;
