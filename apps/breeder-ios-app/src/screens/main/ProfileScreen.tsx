import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../utils/theme';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  // Mock subscription data - will be replaced with real data
  type SubscriptionPlan = 'basic' | 'premium';
  const subscriptionPlan: SubscriptionPlan = 'basic' as SubscriptionPlan;
  const kennelCount = 1;
  const maxKennels = subscriptionPlan === 'basic' ? 1 : 10;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await logout();
          } catch (error) {
            Alert.alert('Error', 'Failed to logout. Please try again.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const businessMenuItems = [
    {
      title: 'Manage Kennels',
      subtitle: `${kennelCount} of ${maxKennels} kennels`,
      icon: 'home',
      iconColor: theme.colors.primary,
      onPress: () => navigation.navigate('ManageKennels' as never),
    },
  ];

  const profileMenuItems = [
    {
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: 'person-outline',
      iconColor: theme.colors.primary,
      onPress: () => navigation.navigate('EditProfile' as never),
    },
    {
      title: 'Account Settings',
      subtitle: 'Manage your account preferences',
      icon: 'settings-outline',
      iconColor: '#64748b',
      onPress: () => {}, // TODO: Navigate to settings
    },
    {
      title: 'Notifications',
      subtitle: 'Configure notification preferences',
      icon: 'notifications-outline',
      iconColor: '#f59e0b',
      onPress: () => {}, // TODO: Navigate to notifications
    },
    {
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      icon: 'shield-checkmark-outline',
      iconColor: '#10b981',
      onPress: () => {}, // TODO: Navigate to privacy settings
    },
    {
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline',
      iconColor: theme.colors.secondary,
      onPress: () => {}, // TODO: Navigate to help
    },
  ];

  const statsData = [
    {
      title: 'Litters',
      value: '3',
      icon: 'albums',
      colors: [theme.colors.primary, theme.colors.primaryDark],
    },
    {
      title: 'Dogs',
      value: '12',
      icon: 'paw',
      colors: [theme.colors.secondary, theme.colors.secondaryDark],
    },
    {
      title: 'Messages',
      value: '45',
      icon: 'chatbubbles',
      colors: ['#f59e0b', '#d97706'],
    },
    {
      title: 'Profile Views',
      value: '128',
      icon: 'eye',
      colors: ['#10b981', '#059669'],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <LinearGradient
        colors={['#f0f9fa', '#ffffff']}
        style={styles.profileHeaderGradient}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="person" size={48} color={theme.colors.primary} />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.name || 'Breeder'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.userTypeBadge}>
            <Icon
              name="checkmark-circle"
              size={16}
              color={theme.colors.success}
            />
            <Text style={styles.userTypeText}>Verified Breeder</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Statistics</Text>
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statCard}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={stat.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCardGradient}
              >
                <Icon name={stat.icon} size={24} color="#ffffff" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Subscription Section */}
      <View style={styles.subscriptionSection}>
        <Text style={styles.sectionTitle}>Subscription Plan</Text>
        <View style={styles.subscriptionCard}>
          <LinearGradient
            colors={
              subscriptionPlan === 'premium'
                ? ['#6366f1', '#4f46e5']
                : [theme.colors.primary, theme.colors.primaryDark]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.subscriptionGradient}
          >
            <View style={styles.subscriptionHeader}>
              <View style={styles.subscriptionBadge}>
                <Icon
                  name={
                    subscriptionPlan === 'premium' ? 'star' : 'shield-checkmark'
                  }
                  size={24}
                  color="#ffffff"
                />
              </View>
              <View style={styles.subscriptionInfo}>
                <Text style={styles.planName}>
                  {subscriptionPlan === 'premium'
                    ? 'Premium Plan'
                    : 'Basic Plan'}
                </Text>
                <Text style={styles.planDescription}>
                  {subscriptionPlan === 'premium'
                    ? 'Full access to all features'
                    : 'Perfect for getting started'}
                </Text>
              </View>
            </View>

            <View style={styles.planFeatures}>
              <View style={styles.featureRow}>
                <Icon name="checkmark-circle" size={18} color="#ffffff" />
                <Text style={styles.featureText}>
                  Up to {maxKennels} {maxKennels === 1 ? 'kennel' : 'kennels'}
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Icon name="checkmark-circle" size={18} color="#ffffff" />
                <Text style={styles.featureText}>
                  {subscriptionPlan === 'premium' ? 'Unlimited' : 'Basic'}{' '}
                  litter management
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Icon name="checkmark-circle" size={18} color="#ffffff" />
                <Text style={styles.featureText}>
                  {subscriptionPlan === 'premium' ? 'Priority' : 'Standard'}{' '}
                  support
                </Text>
              </View>
            </View>

            {subscriptionPlan === 'basic' && (
              <TouchableOpacity
                style={styles.upgradeButton}
                activeOpacity={0.8}
                onPress={() => {
                  Alert.alert(
                    'Upgrade to Premium',
                    'Get access to unlimited kennels, advanced features, and priority support.\n\nPrice: $29.99/month',
                    [
                      { text: 'Maybe Later', style: 'cancel' },
                      { text: 'Upgrade Now', onPress: () => {} }, // TODO: Navigate to upgrade flow
                    ],
                  );
                }}
              >
                <Icon
                  name="arrow-up-circle"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>
      </View>

      {/* Business Management Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Business Management</Text>
        {businessMenuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={item.onPress}
          >
            <View
              style={[
                styles.menuIconContainer,
                { backgroundColor: `${item.iconColor}15` },
              ]}
            >
              <Icon name={item.icon} size={22} color={item.iconColor} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Icon
              name="chevron-forward"
              size={24}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Account Management Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account Management</Text>
        {profileMenuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={item.onPress}
          >
            <View
              style={[
                styles.menuIconContainer,
                { backgroundColor: `${item.iconColor}15` },
              ]}
            >
              <Icon name={item.icon} size={22} color={item.iconColor} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Icon
              name="chevron-forward"
              size={24}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* App Info Section */}
      <View style={styles.appInfoSection}>
        <Text style={styles.sectionTitle}>App Information</Text>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Build</Text>
          <Text style={styles.infoValue}>2024.01.01</Text>
        </View>
      </View>

      {/* Logout Section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={[styles.logoutButton, loading && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Icon name="log-out-outline" size={20} color="#ffffff" />
          <Text style={styles.logoutButtonText}>
            {loading ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileHeaderGradient: {
    marginBottom: theme.spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    ...theme.shadows.md,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  userTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: theme.spacing.md + 4,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.sm,
  },
  userTypeText: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  statsSection: {
    marginBottom: theme.spacing.lg,
  },
  subscriptionSection: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  subscriptionCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  subscriptionGradient: {
    padding: theme.spacing.lg,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  subscriptionBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  subscriptionInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: theme.spacing.xs / 2,
  },
  planDescription: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  planFeatures: {
    marginBottom: theme.spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: theme.spacing.sm,
    opacity: 0.95,
  },
  upgradeButton: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.sm,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
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
    minHeight: 110,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    fontSize: 13,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
    opacity: 0.95,
  },
  menuSection: {
    marginBottom: theme.spacing.xl,
  },
  menuItem: {
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
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  appInfoSection: {
    marginBottom: theme.spacing.xl,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  infoValue: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  logoutSection: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md + 4,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: theme.spacing.sm,
  },
});

export default ProfileScreen;
