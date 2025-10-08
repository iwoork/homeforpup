import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, MediaType } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    website: user?.breederInfo?.website || '',
    kennelName: user?.breederInfo?.kennelName || '',
    license: user?.breederInfo?.license || '',
    experience: user?.breederInfo?.experience?.toString() || '',
    specialties: user?.breederInfo?.specialties?.join(', ') || '',
    facebook: user?.socialLinks?.facebook || '',
    instagram: user?.socialLinks?.instagram || '',
    twitter: user?.socialLinks?.twitter || '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences?.notifications?.email ?? true,
    smsNotifications: user?.preferences?.notifications?.sms ?? false,
    pushNotifications: user?.preferences?.notifications?.push ?? true,
    showEmail: user?.preferences?.privacy?.showEmail ?? false,
    showPhone: user?.preferences?.privacy?.showPhone ?? false,
    showLocation: user?.preferences?.privacy?.showLocation ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.experience && isNaN(Number(formData.experience))) {
      newErrors.experience = 'Experience must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        displayName: formData.displayName || undefined,
        phone: formData.phone || undefined,
        location: formData.location || undefined,
        bio: formData.bio || undefined,
        breederInfo: {
          website: formData.website || undefined,
          kennelName: formData.kennelName || undefined,
          license: formData.license || undefined,
          experience: formData.experience ? Number(formData.experience) : undefined,
          specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()).filter(Boolean) : [],
        },
        socialLinks: {
          facebook: formData.facebook || undefined,
          instagram: formData.instagram || undefined,
          twitter: formData.twitter || undefined,
        },
        preferences: {
          notifications: {
            email: preferences.emailNotifications,
            sms: preferences.smsNotifications,
            push: preferences.pushNotifications,
          },
          privacy: {
            showEmail: preferences.showEmail,
            showPhone: preferences.showPhone,
            showLocation: preferences.showLocation,
          },
        },
      };

      // TODO: Replace with actual API call
      // const response = await apiService.updateProfile(updateData);
      
      // For now, just update local user state
      if (updateUser) {
        updateUser({ ...user, ...updateData });
      }

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      selectionLimit: 1,
    };

    launchImageLibrary(options, async (result) => {
      if (result.didCancel || result.errorCode) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset || !asset.uri) {
        return;
      }

      setUploading(true);
      try {
        // Get presigned upload URL
        const uploadResponse = await apiService.getUploadUrl({
          fileName: asset.fileName || 'profile-photo.jpg',
          contentType: asset.type || 'image/jpeg',
          uploadPath: 'profile-photos',
        });

        if (!uploadResponse.success || !uploadResponse.data) {
          throw new Error(uploadResponse.error || 'Failed to get upload URL');
        }

        const { uploadUrl, photoUrl } = uploadResponse.data;

        // Upload file to S3
        const uploadResult = await fetch(uploadUrl, {
          method: 'PUT',
          body: asset as any,
          headers: {
            'Content-Type': asset.type || 'image/jpeg',
          },
        });

        if (!uploadResult.ok) {
          throw new Error('Failed to upload photo');
        }

        // Update user profile with new photo URL
        if (updateUser) {
          updateUser({ ...user, profileImage: photoUrl });
        }

        Alert.alert('Success', 'Profile photo updated successfully!');
      } catch (error) {
        console.error('Error uploading photo:', error);
        Alert.alert(
          'Error',
          error instanceof Error ? error.message : 'Failed to upload photo. Please try again.'
        );
      } finally {
        setUploading(false);
      }
    });
  };

  const renderInput = (
    label: string,
    key: keyof typeof formData,
    placeholder: string,
    options?: {
      multiline?: boolean;
      keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
      maxLength?: number;
      icon?: string;
    }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        {options?.icon && (
          <Icon
            name={options.icon}
            size={20}
            color={theme.colors.textSecondary}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            options?.multiline && styles.textArea,
            errors[key] && styles.inputError,
          ]}
          value={formData[key]}
          onChangeText={text => {
            setFormData({ ...formData, [key]: text });
            if (errors[key]) {
              setErrors({ ...errors, [key]: '' });
            }
          }}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          multiline={options?.multiline}
          keyboardType={options?.keyboardType || 'default'}
          maxLength={options?.maxLength}
        />
      </View>
      {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
    </View>
  );

  const renderSwitch = (
    label: string,
    key: keyof typeof preferences,
    description?: string
  ) => (
    <View style={styles.switchGroup}>
      <View style={styles.switchHeader}>
        <Text style={styles.switchLabel}>{label}</Text>
        <Switch
          value={preferences[key]}
          onValueChange={value => setPreferences({ ...preferences, [key]: value })}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={preferences[key] ? '#ffffff' : theme.colors.textSecondary}
        />
      </View>
      {description && <Text style={styles.switchDescription}>{description}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>Update your personal information</Text>
          </View>
        </View>
      </View>

      {/* Profile Photo Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Photo</Text>
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Icon name="person" size={40} color={theme.colors.textSecondary} />
              </View>
            )}
            {uploading && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color="#ffffff" />
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.photoButton}
            onPress={handlePhotoUpload}
            disabled={uploading}
          >
            <Icon name="camera" size={16} color={theme.colors.primary} />
            <Text style={styles.photoButtonText}>
              {uploading ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        {renderInput('Full Name *', 'name', 'Enter your full name', { icon: 'person' })}
        
        {renderInput('First Name', 'firstName', 'Enter your first name', { icon: 'person-outline' })}
        
        {renderInput('Last Name', 'lastName', 'Enter your last name', { icon: 'person-outline' })}
        
        {renderInput('Display Name', 'displayName', 'Public display name', { icon: 'at' })}
        
        {renderInput('Email *', 'email', 'Enter your email address', { 
          icon: 'mail', 
          keyboardType: 'email-address' 
        })}
        
        {renderInput('Phone', 'phone', 'Enter your phone number', { 
          icon: 'call', 
          keyboardType: 'phone-pad' 
        })}
        
        {renderInput('Location', 'location', 'City, State', { icon: 'location' })}
        
        {renderInput('Bio', 'bio', 'Tell us about yourself...', { 
          icon: 'document-text',
          multiline: true,
          maxLength: 500
        })}
      </View>

      {/* Breeder Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Breeder Information</Text>
        
        {renderInput('Kennel Name', 'kennelName', 'Enter your kennel name', { icon: 'home' })}
        
        {renderInput('Website', 'website', 'https://your-website.com', { 
          icon: 'globe',
          keyboardType: 'email-address'
        })}
        
        {renderInput('License Number', 'license', 'Breeding license number', { icon: 'card' })}
        
        {renderInput('Years of Experience', 'experience', 'Number of years', { 
          icon: 'time',
          keyboardType: 'numeric'
        })}
        
        {renderInput('Specialties', 'specialties', 'Golden Retriever, Labrador, etc.', { 
          icon: 'paw',
          multiline: true
        })}
      </View>

      {/* Social Media */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Social Media</Text>
        
        {renderInput('Facebook', 'facebook', 'https://facebook.com/yourpage', { 
          icon: 'logo-facebook',
          keyboardType: 'email-address'
        })}
        
        {renderInput('Instagram', 'instagram', '@yourusername', { 
          icon: 'logo-instagram'
        })}
        
        {renderInput('Twitter', 'twitter', '@yourusername', { 
          icon: 'logo-twitter'
        })}
      </View>

      {/* Privacy Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        
        {renderSwitch(
          'Show Email',
          'showEmail',
          'Allow others to see your email address'
        )}
        
        {renderSwitch(
          'Show Phone',
          'showPhone',
          'Allow others to see your phone number'
        )}
        
        {renderSwitch(
          'Show Location',
          'showLocation',
          'Allow others to see your location'
        )}
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        {renderSwitch(
          'Email Notifications',
          'emailNotifications',
          'Receive notifications via email'
        )}
        
        {renderSwitch(
          'SMS Notifications',
          'smsNotifications',
          'Receive notifications via text message'
        )}
        
        {renderSwitch(
          'Push Notifications',
          'pushNotifications',
          'Receive push notifications on your device'
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Icon name="checkmark" size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
  header: {
    backgroundColor: theme.colors.surface,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  section: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
  },
  photoContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.background,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  photoButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  switchGroup: {
    marginBottom: theme.spacing.lg,
  },
  switchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    flex: 1,
  },
  switchDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
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

export default EditProfileScreen;


