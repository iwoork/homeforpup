import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences?.notifications?.email ?? true,
    smsNotifications: user?.preferences?.notifications?.sms ?? false,
    pushNotifications: user?.preferences?.notifications?.push ?? true,
  });

  // Fetch latest preferences from API
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user?.userId) return;

      setLoading(true);
      try {
        const response = await apiService.getUserById(user.userId);
        if (response.success && response.data?.user) {
          const userData = response.data.user;
          setPreferences({
            emailNotifications: userData.preferences?.notifications?.email ?? true,
            smsNotifications: userData.preferences?.notifications?.sms ?? false,
            pushNotifications: userData.preferences?.notifications?.push ?? true,
          });
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user?.userId]);

  const handleSave = async () => {
    if (!user?.userId) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        preferences: {
          ...user.preferences,
          notifications: {
            email: preferences.emailNotifications,
            sms: preferences.smsNotifications,
            push: preferences.pushNotifications,
          },
        },
      };

      const response = await apiService.updateUser(user.userId, updateData);

      if (!response.success) {
        throw new Error(response.error || 'Failed to update preferences');
      }

      if (updateUser && response.data?.user) {
        updateUser(response.data.user);
      }

      Alert.alert('Success', 'Notification preferences updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating preferences:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update preferences. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const renderSwitch = (
    label: string,
    key: keyof typeof preferences,
    description?: string,
    icon?: string
  ) => (
    <View style={styles.switchGroup}>
      <View style={styles.switchHeader}>
        <View style={styles.switchLabelContainer}>
          {icon && (
            <Icon
              name={icon}
              size={24}
              color={preferences[key] ? theme.colors.primary : theme.colors.textSecondary}
              style={styles.switchIcon}
            />
          )}
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchLabel}>{label}</Text>
            {description && <Text style={styles.switchDescription}>{description}</Text>}
          </View>
        </View>
        <Switch
          value={preferences[key]}
          onValueChange={value => setPreferences({ ...preferences, [key]: value })}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={preferences[key] ? '#ffffff' : theme.colors.textSecondary}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="information-circle" size={24} color={theme.colors.info} />
          <Text style={styles.infoText}>
            Manage how you receive notifications from HomeForPup. You can customize your preferences for each notification type.
          </Text>
        </View>

        {/* Notification Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          
          {renderSwitch(
            'Email Notifications',
            'emailNotifications',
            'Receive notifications via email',
            'mail'
          )}
          
          {renderSwitch(
            'SMS Notifications',
            'smsNotifications',
            'Receive notifications via text message',
            'chatbox'
          )}
          
          {renderSwitch(
            'Push Notifications',
            'pushNotifications',
            'Receive push notifications on your device',
            'notifications'
          )}
        </View>

        {/* What You'll Receive Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You'll Receive</Text>
          <View style={styles.infoList}>
            <View style={styles.infoListItem}>
              <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.infoListText}>New messages from {user?.userType === 'breeder' ? 'future dog parents' : 'breeders'}</Text>
            </View>
            <View style={styles.infoListItem}>
              <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.infoListText}>
                {user?.userType === 'breeder' ? 'Inquiry updates' : 'Puppy availability updates'}
              </Text>
            </View>
            <View style={styles.infoListItem}>
              <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.infoListText}>Important account updates</Text>
            </View>
            <View style={styles.infoListItem}>
              <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.infoListText}>Security alerts</Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Icon name="checkmark" size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>Save Preferences</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.infoLight,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.info + '40',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  section: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  switchGroup: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  switchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  switchIcon: {
    marginRight: theme.spacing.md,
  },
  switchTextContainer: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  infoList: {
    paddingHorizontal: theme.spacing.lg,
  },
  infoListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  infoListText: {
    fontSize: 15,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md + 2,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md + 2,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationsScreen;

