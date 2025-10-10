import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../utils/theme';

const DogParentDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // TODO: Implement refresh logic
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const quickActions = [
    {
      title: 'Search Puppies',
      subtitle: 'Browse available puppies',
      icon: 'search',
      iconColor: theme.colors.primary,
      screen: 'SearchPuppies',
      gradient: [theme.colors.primary, theme.colors.primaryDark],
    },
    {
      title: 'Matched Puppies',
      subtitle: 'Puppies that match your preferences',
      icon: 'heart',
      iconColor: '#ec4899',
      screen: 'MatchedPuppies',
      gradient: ['#ec4899', '#db2777'],
    },
    {
      title: 'My Favorites',
      subtitle: 'Saved puppies',
      icon: 'star',
      iconColor: '#f59e0b',
      screen: 'FavoritePuppies',
      gradient: ['#f59e0b', '#d97706'],
    },
    {
      title: 'Edit Preferences',
      subtitle: 'Update your search criteria',
      icon: 'options',
      iconColor: '#8b5cf6',
      screen: 'DogParentPreferences',
      gradient: ['#8b5cf6', '#7c3aed'],
    },
  ];

  const statsDisplay = [
    {
      title: 'Favorites',
      value: '0',
      icon: 'star',
      colors: ['#f59e0b', '#d97706'],
    },
    {
      title: 'Messages',
      value: '0',
      icon: 'chatbubbles',
      colors: [theme.colors.primary, theme.colors.primaryDark],
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
            Welcome, {user?.name || 'Friend'}! 🐾
          </Text>
          <Text style={styles.subtitle}>Find your perfect puppy companion</Text>
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
            onPress={() => navigation.navigate(action.screen as never)}
          >
            <LinearGradient
              colors={action.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}
            >
              <View style={styles.actionIconContainer}>
                <Icon name={action.icon} size={28} color="#ffffff" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
              <Icon name="chevron-forward" size={24} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.sectionTitle}>Tips for Finding Your Puppy</Text>
        <View style={styles.tipCard}>
          <Icon name="bulb-outline" size={32} color={theme.colors.primary} />
          <Text style={styles.tipTitle}>Be Prepared</Text>
          <Text style={styles.tipText}>
            Make sure you have everything ready for your new puppy before bringing them home.
          </Text>
        </View>
        <View style={styles.tipCard}>
          <Icon name="people-outline" size={32} color={theme.colors.secondary} />
          <Text style={styles.tipTitle}>Ask Questions</Text>
          <Text style={styles.tipText}>
            Don't hesitate to ask breeders about health tests, parents, and puppy care.
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
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.9,
  },
  tipsContainer: {
    marginBottom: theme.spacing.xl,
  },
  tipCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  tipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DogParentDashboardScreen;

