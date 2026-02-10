import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../utils/theme';
import { useDashboardStats } from '../../hooks/useApi';
import apiService, { Activity } from '../../services/apiService';

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

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { data: stats, loading, error, refreshing, refresh } = useDashboardStats(user?.userId);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await apiService.getActivities({ limit: 10 });
      if (response.success && response.data) {
        setActivities(response.data.activities || []);
        setActivitiesError(null);
      } else {
        setActivities([]);
        setActivitiesError(response.error || 'Failed to fetch activities');
      }
    } catch {
      setActivities([]);
      setActivitiesError('Network error');
    }
  }, []);

  useEffect(() => {
    setActivitiesLoading(true);
    fetchActivities().finally(() => setActivitiesLoading(false));
  }, [fetchActivities]);

  const onRefresh = useCallback(async () => {
    await Promise.all([refresh(), fetchActivities()]);
  }, [refresh, fetchActivities]);

  const statsDisplay = [
    {
      title: 'Total Litters',
      value: stats?.totalLitters?.toString() || '0',
      icon: 'albums',
      colors: [theme.colors.primary, theme.colors.primaryDark],
    },
    {
      title: 'Total Dogs',
      value: stats?.totalDogs?.toString() || '0',
      icon: 'paw',
      colors: [theme.colors.secondary, theme.colors.secondaryDark],
    },
    {
      title: 'Active Messages',
      value: stats?.activeMessages?.toString() || '0',
      icon: 'chatbubbles',
      colors: ['#f59e0b', '#d97706'],
    },
    {
      title: 'New Inquiries',
      value: stats?.newInquiries?.toString() || '0',
      icon: 'mail',
      colors: ['#10b981', '#059669'],
    },
  ];

  const quickActions = [
    {
      title: 'Add Litter',
      subtitle: 'Create a new litter',
      icon: 'add-circle',
      iconColor: theme.colors.primary,
      screen: 'CreateLitter',
    },
    {
      title: 'Add Dog',
      subtitle: 'Register a new dog',
      icon: 'paw',
      iconColor: theme.colors.secondary,
      screen: 'CreateDog',
    },
    {
      title: 'Record Vet Visit',
      subtitle: 'Log veterinary care',
      icon: 'medical',
      iconColor: '#10b981',
      screen: 'RecordVetVisit',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={['#f0f9fa', '#ffffff']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Welcome back, {user?.name || (user?.userType === 'dog-parent' ? 'Dog Parent' : 'Breeder')}!
          </Text>
          <Text style={styles.subtitle}>
            {user?.userType === 'dog-parent' 
              ? "Here's your puppy search overview" 
              : "Here's your breeding overview"
            }
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {statsDisplay.map((stat, index) => (
            <TouchableOpacity key={index} style={styles.statCard} activeOpacity={0.8}>
              <LinearGradient
                colors={stat.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCardGradient}
              >
                <View style={styles.statIconContainer}>
                  <Icon name={stat.icon} size={28} color="#ffffff" />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {quickActions.map((action, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.actionCard} 
            activeOpacity={0.7}
            onPress={() => {
              if (action.screen === 'CreateDog') {
                navigation.navigate('CreateDog' as never, { dogType: 'parent' } as never);
              } else {
                navigation.navigate(action.screen as never);
              }
            }}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: `${action.iconColor}15` }]}>
              <Icon name={action.icon} size={24} color={action.iconColor} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </View>
            <Icon name="chevron-forward" size={24} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>


      <View style={styles.recentActivity}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { marginBottom: 0, paddingHorizontal: 0 }]}>Recent Activity</Text>
          {activities.length > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('AllActivities' as never)}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
        {activitiesLoading ? (
          <View style={styles.activityCard}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : activitiesError && activities.length === 0 ? (
          <View style={styles.activityCard}>
            <Icon name="alert-circle-outline" size={48} color={theme.colors.error} />
            <Text style={styles.activityText}>Failed to load activities</Text>
            <TouchableOpacity onPress={() => {
              setActivitiesLoading(true);
              fetchActivities().finally(() => setActivitiesLoading(false));
            }}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        ) : activities.length === 0 ? (
          <View style={styles.activityCard}>
            <Icon name="time-outline" size={48} color={theme.colors.textTertiary} />
            <Text style={styles.activityText}>No recent activity</Text>
            <Text style={styles.activitySubtext}>
              Your recent breeding activities will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.activityList}>
            {activities.map((activity) => {
              const { icon, color } = getActivityIcon(activity.type);
              return (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={[styles.activityIconContainer, { backgroundColor: `${color}15` }]}>
                    <Icon name={icon} size={20} color={color} />
                  </View>
                  <View style={styles.activityItemContent}>
                    <Text style={styles.activityItemTitle}>{activity.title}</Text>
                    <Text style={styles.activityItemDescription} numberOfLines={1}>
                      {activity.description}
                    </Text>
                  </View>
                  <Text style={styles.activityTimestamp}>
                    {getRelativeTime(activity.timestamp)}
                  </Text>
                </View>
              );
            })}
          </View>
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
  headerGradient: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  statsContainer: {
    marginBottom: theme.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  statCard: {
    borderRadius: theme.borderRadius.lg,
    width: '48%',
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  statCardGradient: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  statIconContainer: {
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    fontSize: 13,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
    opacity: 0.95,
  },
  actionsContainer: {
    marginBottom: theme.spacing.xl,
  },
  actionCard: {
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  recentActivity: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  activityCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  activityText: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  activitySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
  activityList: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  activityItemContent: {
    flex: 1,
  },
  activityItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 1,
  },
  activityItemDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  activityTimestamp: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    marginLeft: theme.spacing.sm,
  },
});

export default DashboardScreen;

