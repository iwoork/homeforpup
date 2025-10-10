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
  const [fetchingProfile, setFetchingProfile] = useState(true);

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

  // Fetch latest user data from API when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.userId) {
        setFetchingProfile(false);
        return;
      }

      try {
        console.log('=== FETCHING USER PROFILE ===');
        console.log('User ID:', user.userId);
        
        const response = await apiService.getUserById(user.userId);
        
        console.log('Profile fetch response:', JSON.stringify(response, null, 2));
        
        if (response.success && response.data) {
          // API returns { user: {...} }
          const userData = response.data.user;
          
          // Update form data with fresh data from API
          setFormData({
            name: userData.name || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            displayName: userData.displayName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            location: userData.location || '',
            bio: userData.bio || '',
            website: userData.breederInfo?.website || '',
            license: userData.breederInfo?.license || '',
            experience: userData.breederInfo?.experience?.toString() || '',
            specialties: userData.breederInfo?.specialties?.join(', ') || '',
            facebook: userData.socialLinks?.facebook || '',
            instagram: userData.socialLinks?.instagram || '',
            twitter: userData.socialLinks?.twitter || '',
          });

          // Update preferences with fresh data from API
          setPreferences({
            emailNotifications: userData.preferences?.notifications?.email ?? true,
            smsNotifications: userData.preferences?.notifications?.sms ?? false,
            pushNotifications: userData.preferences?.notifications?.push ?? true,
            showEmail: userData.preferences?.privacy?.showEmail ?? false,
            showPhone: userData.preferences?.privacy?.showPhone ?? false,
            showLocation: userData.preferences?.privacy?.showLocation ?? true,
          });

          // Also update the local user context
          if (updateUser) {
            updateUser(userData);
          }
          
          console.log('✅ Profile data loaded successfully');
        } else {
          console.error('Failed to fetch profile:', response.error);
          Alert.alert('Error', 'Failed to load profile data. Using cached data.');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile data. Using cached data.');
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user?.userId]);

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

    if (!user?.userId) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      // Build update data - only include fields that have values
      const updateData: any = {
        name: formData.name,
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

      // Add optional fields only if they have values
      if (formData.firstName?.trim()) updateData.firstName = formData.firstName.trim();
      if (formData.lastName?.trim()) updateData.lastName = formData.lastName.trim();
      if (formData.displayName?.trim()) updateData.displayName = formData.displayName.trim();
      if (formData.phone?.trim()) updateData.phone = formData.phone.trim();
      if (formData.location?.trim()) updateData.location = formData.location.trim();
      if (formData.bio?.trim()) updateData.bio = formData.bio.trim();

      // Breeder info (kennel info managed separately in Kennel Management)
      const breederInfo: any = {};
      if (formData.website?.trim()) breederInfo.website = formData.website.trim();
      if (formData.license?.trim()) breederInfo.license = formData.license.trim();
      if (formData.experience) breederInfo.experience = Number(formData.experience);
      if (formData.specialties?.trim()) {
        breederInfo.specialties = formData.specialties.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (Object.keys(breederInfo).length > 0) updateData.breederInfo = breederInfo;

      // Social links
      const socialLinks: any = {};
      if (formData.facebook?.trim()) socialLinks.facebook = formData.facebook.trim();
      if (formData.instagram?.trim()) socialLinks.instagram = formData.instagram.trim();
      if (formData.twitter?.trim()) socialLinks.twitter = formData.twitter.trim();
      if (Object.keys(socialLinks).length > 0) updateData.socialLinks = socialLinks;

      // Call the API to update the profile
      console.log('=== PROFILE UPDATE START ===');
      console.log('User ID:', user.userId);
      console.log('Update Data:', JSON.stringify(updateData, null, 2));
      
      const response = await apiService.updateUser(user.userId, updateData);
      
      console.log('API Response:', JSON.stringify(response, null, 2));
      console.log('Response Success:', response.success);
      console.log('Response Data:', response.data);
      
      if (!response.success) {
        console.error('API Error:', response.error);
        throw new Error(response.error || 'Failed to update profile');
      }

      // Update local user state with the response from the API
      // API returns { user: {...} }
      if (updateUser && response.data?.user) {
        console.log('Updating local user state with:', response.data.user);
        updateUser(response.data.user);
      } else {
        console.warn('No user data in response to update local state');
      }
      
      console.log('=== PROFILE UPDATE COMPLETE ===');

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

      if (!user?.userId) {
        Alert.alert('Error', 'User not found. Please log in again.');
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

        console.log('=== PHOTO UPLOAD TO S3 START ===');
        console.log('Upload URL (presigned):', uploadUrl?.substring(0, 100) + '...');
        console.log('Final Photo URL (S3):', photoUrl);
        console.log('Asset URI:', asset.uri);
        console.log('Asset type:', asset.type);
        console.log('Asset fileName:', asset.fileName);

        // Upload file to S3
        const uploadResult = await fetch(uploadUrl, {
          method: 'PUT',
          body: asset as any,
          headers: {
            'Content-Type': asset.type || 'image/jpeg',
          },
        });

        console.log('S3 Upload Result:', {
          ok: uploadResult.ok,
          status: uploadResult.status,
          statusText: uploadResult.statusText
        });

        if (!uploadResult.ok) {
          const errorText = await uploadResult.text();
          console.error('S3 Upload Failed:', errorText);
          throw new Error(`Failed to upload photo: ${uploadResult.statusText}`);
        }

        console.log('✅ Photo uploaded to S3 successfully!');

        // Update user profile in the API with new photo URL
        console.log('=== PHOTO UPDATE START ===');
        console.log('User ID:', user.userId);
        console.log('Photo URL to save in DB:', photoUrl);
        
        const updateResponse = await apiService.updateUser(user.userId, {
          profileImage: photoUrl,
        });

        console.log('Photo Update API Response:', JSON.stringify(updateResponse, null, 2));
        
        if (!updateResponse.success) {
          console.error('Photo Update API Error:', updateResponse.error);
          throw new Error(updateResponse.error || 'Failed to save profile photo');
        }

        // Update local user state with the response from the API
        // API returns { user: {...} }
        if (updateUser && updateResponse.data?.user) {
          console.log('Updating local user state with photo');
          updateUser(updateResponse.data.user);
        } else {
          console.warn('No user data in photo update response');
        }
        
        console.log('=== PHOTO UPDATE COMPLETE ===');

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

  // Show loading indicator while fetching profile
  if (fetchingProfile) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Profile Photo Section */}
      <View style={[styles.section, styles.firstSection]}>
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

      {/* Breeder Information - Only show for breeders */}
      {user?.userType === 'breeder' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Breeder Information</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ManageKennels' as never)}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>Manage Kennels</Text>
              <Icon name="arrow-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
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
          
          <View style={styles.infoCard}>
            <Icon name="information-circle" size={24} color={theme.colors.info} />
            <Text style={styles.infoText}>
              Kennel details are managed separately. Use "Manage Kennels" to create and edit your kennels.
            </Text>
          </View>
        </View>
      )}

      {/* Dog Parent Preferences - Only show for dog parents */}
      {user?.userType === 'dog-parent' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Adoption Preferences</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('DogParentPreferences' as never)}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>Edit Detailed Preferences</Text>
              <Icon name="arrow-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoCard}>
            <Icon name="information-circle" size={24} color={theme.colors.info} />
            <Text style={styles.infoText}>
              Set your detailed adoption preferences (breeds, housing, experience) in the dedicated preferences screen.
            </Text>
          </View>
        </View>
      )}

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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  section: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  firstSection: {
    marginTop: theme.spacing.md,
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
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: theme.spacing.sm,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  infoCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.infoLight,
    padding: theme.spacing.md,
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
});

export default EditProfileScreen;


