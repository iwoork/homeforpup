import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../utils/theme';
import { useDashboardStats } from '../../hooks/useApi';

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { data: stats, loading, error, refreshing, refresh } = useDashboardStats(user?.userId);

  const onRefresh = React.useCallback(async () => {
    await refresh();
  }, [refresh]);

  const statsDisplay = [
    {
      title: 'Total Kennels',
      value: stats?.totalKennels?.toString() || '0',
      icon: '🏠',
      color: theme.colors.primary,
    },
    {
      title: 'Total Dogs',
      value: stats?.totalDogs?.toString() || '0',
      icon: '🐕',
      color: theme.colors.secondary,
    },
    {
      title: 'Active Messages',
      value: stats?.activeMessages?.toString() || '0',
      icon: '💬',
      color: theme.colors.warning,
    },
    {
      title: 'New Inquiries',
      value: stats?.newInquiries?.toString() || '0',
      icon: '📥',
      color: theme.colors.success,
    },
  ];

  const quickActions = [
    {
      title: 'Add Kennel',
      subtitle: 'Create a new kennel',
      icon: '➕🏠',
      screen: 'CreateKennel',
    },
    {
      title: 'Add Dog',
      subtitle: 'Register a new dog',
      icon: '➕🐕',
      screen: 'CreateDog',
    },
    {
      title: 'View Messages',
      subtitle: 'Check your inbox',
      icon: '💬',
      screen: 'Messages',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Welcome back, {user?.name || 'Breeder'}!
        </Text>
        <Text style={styles.subtitle}>Here's your kennel overview</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {statsDisplay.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                <Text style={styles.iconText}>{stat.icon}</Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {quickActions.map((action, index) => (
          <TouchableOpacity key={index} style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>{action.icon}</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </View>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>No recent activity</Text>
          <Text style={styles.activitySubtext}>
            Your recent kennel activities will appear here
          </Text>
        </View>
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
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  statsContainer: {
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    width: '48%',
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconText: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: theme.spacing.lg,
  },
  actionCard: {
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  actionIcon: {
    marginRight: theme.spacing.md,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  actionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  chevronIcon: {
    fontSize: 32,
    color: theme.colors.textSecondary,
    fontWeight: '300',
  },
  recentActivity: {
    marginBottom: theme.spacing.xl,
  },
  activityCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  activityText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  activitySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default DashboardScreen;

