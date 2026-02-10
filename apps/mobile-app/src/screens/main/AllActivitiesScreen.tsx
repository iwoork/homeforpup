import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import apiService, { Activity, ActivitiesResponse } from '../../services/apiService';

const ACTIVITY_ICON_MAP: Record<string, { icon: string; color: string }> = {
  kennel_created: { icon: 'home', color: '#10b981' },
  kennel_updated: { icon: 'home-outline', color: '#2d8a8f' },
  dog_added: { icon: 'paw', color: '#f59e0b' },
  dog_updated: { icon: 'paw-outline', color: '#2d8a8f' },
  litter_created: { icon: 'albums', color: '#10b981' },
  litter_updated: { icon: 'albums-outline', color: '#2d8a8f' },
  puppy_listed: { icon: 'star', color: '#f59e0b' },
  puppy_updated: { icon: 'star-outline', color: '#2d8a8f' },
  puppy_removed: { icon: 'close-circle', color: '#ef4444' },
  message_received: { icon: 'chatbubble', color: '#3b82f6' },
  message_sent: { icon: 'chatbubble-outline', color: '#2d8a8f' },
  inquiry_received: { icon: 'mail', color: '#f59e0b' },
  inquiry_responded: { icon: 'mail-open', color: '#10b981' },
  health_record_updated: { icon: 'medical', color: '#10b981' },
  photo_uploaded: { icon: 'camera', color: '#8b5cf6' },
  profile_updated: { icon: 'person', color: '#2d8a8f' },
  account_created: { icon: 'person-add', color: '#10b981' },
  login: { icon: 'log-in', color: '#6b7280' },
};

function getActivityIcon(type: string): { icon: string; color: string } {
  return ACTIVITY_ICON_MAP[type] || { icon: 'ellipse', color: theme.colors.textTertiary };
}

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const AllActivitiesScreen: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchActivities = useCallback(async (offset = 0, append = false) => {
    try {
      const response = await apiService.getActivities({ limit: 20, offset });
      if (response.success && response.data) {
        const newActivities = response.data.activities || [];
        setActivities(prev => append ? [...prev, ...newActivities] : newActivities);
        setHasMore(response.data.hasMore);
        setError(null);
      } else {
        if (!append) setActivities([]);
        setError(response.error || 'Failed to fetch activities');
      }
    } catch {
      if (!append) setActivities([]);
      setError('Network error');
    }
  }, []);

  React.useEffect(() => {
    setLoading(true);
    fetchActivities(0).finally(() => setLoading(false));
  }, [fetchActivities]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActivities(0);
    setRefreshing(false);
  }, [fetchActivities]);

  const onLoadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await fetchActivities(activities.length, true);
    setLoadingMore(false);
  }, [hasMore, loadingMore, activities.length, fetchActivities]);

  const renderActivity = ({ item }: { item: Activity }) => {
    const { icon, color } = getActivityIcon(item.type);
    return (
      <View style={styles.activityItem}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Icon name={icon} size={22} color={color} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activityDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.activityTimestamp}>{getRelativeTime(item.timestamp)}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error && activities.length === 0) {
    return (
      <View style={styles.centered}>
        <Icon name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => {
          setLoading(true);
          fetchActivities(0).finally(() => setLoading(false));
        }}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={activities}
      renderItem={renderActivity}
      keyExtractor={item => item.id}
      style={styles.container}
      contentContainerStyle={activities.length === 0 ? styles.emptyContainer : undefined}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.3}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Icon name="time-outline" size={48} color={theme.colors.textTertiary} />
          <Text style={styles.emptyText}>No activities yet</Text>
          <Text style={styles.emptySubtext}>
            Your activities will appear here as you use the app
          </Text>
        </View>
      }
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  activityTimestamp: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  footer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
});

export default AllActivitiesScreen;
