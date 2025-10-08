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
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../utils/theme';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
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
      ]
    );
  };

  const profileMenuItems = [
    {
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: '✏️',
      screen: 'EditProfile',
    },
    {
      title: 'Account Settings',
      subtitle: 'Manage your account preferences',
      icon: '⚙️',
      screen: 'AccountSettings',
    },
    {
      title: 'Notifications',
      subtitle: 'Configure notification preferences',
      icon: '🔔',
      screen: 'Notifications',
    },
    {
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      icon: '🔒',
      screen: 'PrivacySecurity',
    },
    {
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: '❓',
      screen: 'HelpSupport',
    },
  ];

  const statsData = [
    {
      title: 'Kennels',
      value: '2',
      icon: '🏠',
      color: theme.colors.primary,
    },
    {
      title: 'Dogs',
      value: '12',
      icon: '🐕',
      color: theme.colors.secondary,
    },
    {
      title: 'Messages',
      value: '45',
      icon: '💬',
      color: theme.colors.warning,
    },
    {
      title: 'Profile Views',
      value: '128',
      icon: '👁️',
      color: theme.colors.success,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarIcon}>👤</Text>
            </View>
          )}
          <TouchableOpacity style={styles.editAvatarButton}>
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.userName}>{user?.name || 'Breeder'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        
        <View style={styles.userTypeBadge}>
          <Text style={styles.badgeIcon}>✓</Text>
          <Text style={styles.userTypeText}>Verified Breeder</Text>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Statistics</Text>
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
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

      {/* Menu Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account Management</Text>
        {profileMenuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>{item.icon}</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.chevronIcon}>›</Text>
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
        >
          <Text style={styles.logoutIcon}>🚪</Text>
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
  profileHeader: {
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    fontSize: 40,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  cameraIcon: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
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
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  badgeIcon: {
    fontSize: 14,
    color: theme.colors.secondary,
  },
  userTypeText: {
    fontSize: 14,
    color: theme.colors.secondary,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  statsSection: {
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconText: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  menuSection: {
    marginBottom: theme.spacing.lg,
  },
  menuItem: {
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
  menuIcon: {
    marginRight: theme.spacing.md,
  },
  menuIconText: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  menuSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  chevronIcon: {
    fontSize: 32,
    color: theme.colors.textSecondary,
    fontWeight: '300',
  },
  appInfoSection: {
    marginBottom: theme.spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  infoLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  infoValue: {
    fontSize: 16,
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
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  logoutButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
  },
  logoutIcon: {
    fontSize: 16,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
});

export default ProfileScreen;
