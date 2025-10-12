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

const PrivacySettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [preferences, setPreferences] = useState({
    showEmail: user?.preferences?.privacy?.showEmail ?? false,
    showPhone: user?.preferences?.privacy?.showPhone ?? false,
    showLocation: user?.preferences?.privacy?.showLocation ?? true,
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
            showEmail: userData.preferences?.privacy?.showEmail ?? false,
            showPhone: userData.preferences?.privacy?.showPhone ?? false,
            showLocation: userData.preferences?.privacy?.showLocation ?? true,
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
          privacy: {
            showEmail: preferences.showEmail,
            showPhone: preferences.showPhone,
            showLocation: preferences.showLocation,
          },
        },
      };

      const response = await apiService.updateUser(user.userId, updateData);

      if (!response.success) {
        throw new Error(response.error || 'Failed to update privacy settings');
      }

      if (updateUser && response.data?.user) {
        updateUser(response.data.user);
      }

      Alert.alert('Success', 'Privacy settings updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update privacy settings. Please try again.'
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
              color={preferences[key] ? theme.colors.success : theme.colors.textSecondary}
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
          trackColor={{ false: theme.colors.border, true: theme.colors.success }}
          thumbColor={preferences[key] ? '#ffffff' : theme.colors.textSecondary}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading privacy settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="shield-checkmark" size={24} color={theme.colors.success} />
          <Text style={styles.infoText}>
            Control what information is visible to other users. Your privacy and security are important to us.
          </Text>
        </View>

        {/* Privacy Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visibility Settings</Text>
          
          {renderSwitch(
            'Show Email Address',
            'showEmail',
            'Allow others to see your email address',
            'mail'
          )}
          
          {renderSwitch(
            'Show Phone Number',
            'showPhone',
            'Allow others to see your phone number',
            'call'
          )}
          
          {renderSwitch(
            'Show Location',
            'showLocation',
            'Allow others to see your location',
            'location'
          )}
        </View>

        {/* Security Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Data is Safe</Text>
          <View style={styles.securityCard}>
            <View style={styles.securityItem}>
              <View style={styles.securityIconContainer}>
                <Icon name="lock-closed" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.securityTextContainer}>
                <Text style={styles.securityTitle}>Encrypted Communications</Text>
                <Text style={styles.securityDescription}>
                  All messages and data are encrypted
                </Text>
              </View>
            </View>

            <View style={styles.securityItem}>
              <View style={styles.securityIconContainer}>
                <Icon name="shield-checkmark" size={20} color={theme.colors.success} />
              </View>
              <View style={styles.securityTextContainer}>
                <Text style={styles.securityTitle}>Verified Accounts</Text>
                <Text style={styles.securityDescription}>
                  {user?.userType === 'breeder' ? 'All dog parents are verified' : 'All breeders are verified'}
                </Text>
              </View>
            </View>

            <View style={styles.securityItem}>
              <View style={styles.securityIconContainer}>
                <Icon name="eye-off" size={20} color={theme.colors.info} />
              </View>
              <View style={styles.securityTextContainer}>
                <Text style={styles.securityTitle}>No Data Selling</Text>
                <Text style={styles.securityDescription}>
                  We never sell your personal information
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.noteCard}>
          <Icon name="information-circle" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.noteText}>
            Note: Some information may still be visible to users you've interacted with directly.
          </Text>
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
                <Text style={styles.saveButtonText}>Save Settings</Text>
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
    backgroundColor: theme.colors.successLight,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.success + '40',
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
  securityCard: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  securityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  securityDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  noteCard: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  saveButton: {
    backgroundColor: theme.colors.success,
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

export default PrivacySettingsScreen;

