import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import { Kennel } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useKennels } from '../../hooks/useApi';
import apiService from '../../services/apiService';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { LocationInput } from '../../components';
import Icon from 'react-native-vector-icons/Ionicons';

interface FormData {
  name: string;
  description: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website: string;
  phone: string;
  email: string;
  specialties: string[];
  businessType: 'hobby' | 'commercial' | 'show' | 'working';
  establishedDate: string;
  licenseNumber: string;
}

const CreateKennelScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { data: kennelsData, loading: kennelsLoading } = useKennels();
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    website: '',
    phone: '',
    email: user?.email || '',
    specialties: [],
    businessType: 'hobby',
    establishedDate: '',
    licenseNumber: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentKennelCount, setCurrentKennelCount] = useState(0);
  const [maxKennels, setMaxKennels] = useState(1);

  // Check kennel limits based on subscription plan
  useEffect(() => {
    if (kennelsData?.kennels) {
      setCurrentKennelCount(kennelsData.kennels.length);
    }
    
    // Get subscription plan from user profile
    const subscriptionPlan = user?.subscriptionPlan || 'basic';
    setMaxKennels(subscriptionPlan === 'basic' ? 1 : 10);
  }, [kennelsData, user]);

  // Check if user can create more kennels
  const canCreateKennel = currentKennelCount < maxKennels;

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Kennel name is required';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLocationSelect = (address: string, details?: any) => {
    console.log('Location selected:', address);
    
    // Parse the address string (format: "City, State" or "City, State, Country")
    const parts = address.split(',').map(part => part.trim());
    
    if (parts.length >= 2) {
      const city = parts[0];
      const state = parts[1];
      const country = parts.length > 2 ? parts[2] : 'United States';
      
      setFormData(prev => ({
        ...prev,
        city,
        state,
        country,
      }));
      
      // Clear any location-related errors
      setErrors(prev => ({
        ...prev,
        city: undefined,
        state: undefined,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!canCreateKennel) {
      Alert.alert(
        'Kennel Limit Reached',
        `You have reached the maximum number of kennels for your ${user?.subscriptionPlan || 'basic'} plan. Upgrade to premium to create more kennels.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade Plan', onPress: () => navigation.navigate('Profile' as never) },
        ]
      );
      return;
    }

    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors below and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const kennelData: Partial<Kennel> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim(),
          country: formData.country.trim(),
        },
        website: formData.website.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        specialties: formData.specialties,
        businessType: formData.businessType,
        establishedDate: formData.establishedDate || undefined,
        licenseNumber: formData.licenseNumber.trim() || undefined,
        isActive: true,
        isPublic: true,
      };

      // Call API to create kennel
      console.log('Creating kennel:', kennelData);
      
      const response = await apiService.createKennel(kennelData);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to create kennel');
      }
      
      Alert.alert(
        'Success',
        'Kennel created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating kennel:', error);
      Alert.alert('Error', 'Failed to create kennel. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (kennelsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: 0 }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + theme.spacing.lg }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Create Kennel</Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.subscriptionInfo}>
            <Icon 
              name={user?.subscriptionPlan === 'premium' ? 'star' : 'shield-checkmark'} 
              size={16} 
              color={theme.colors.primary} 
            />
            <Text style={styles.subscriptionText}>
              {user?.subscriptionPlan === 'premium' ? 'Premium Plan' : 'Basic Plan'} - 
              {currentKennelCount}/{maxKennels} kennels used
            </Text>
          </View>
        </View>

        {!canCreateKennel && (
          <View style={styles.limitWarning}>
            <Icon name="warning" size={20} color={theme.colors.warning} />
            <Text style={styles.limitWarningText}>
              You've reached the kennel limit for your plan. Upgrade to create more kennels.
            </Text>
          </View>
        )}

        <View style={styles.form}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Input
              label="Kennel Name"
              placeholder="Enter your kennel name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              error={errors.name}
              required
            />

            <Input
              label="Description"
              placeholder="Tell us about your kennel..."
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Address Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Information</Text>
            
            <LocationInput
              label="Location"
              value={formData.city && formData.state ? `${formData.city}, ${formData.state}` : ''}
              onLocationSelect={handleLocationSelect}
              placeholder="Search for your location"
              error={errors.city || errors.state}
              required
            />

            <Input
              label="Street Address"
              placeholder="123 Main Street"
              value={formData.street}
              onChangeText={(value) => handleInputChange('street', value)}
              error={errors.street}
              required
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="City"
                  placeholder="City"
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  error={errors.city}
                  required
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="State"
                  placeholder="State"
                  value={formData.state}
                  onChangeText={(value) => handleInputChange('state', value)}
                  error={errors.state}
                  required
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="ZIP Code"
                  placeholder="12345"
                  value={formData.zipCode}
                  onChangeText={(value) => handleInputChange('zipCode', value)}
                  error={errors.zipCode}
                  required
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="Country"
                  placeholder="Country"
                  value={formData.country}
                  onChangeText={(value) => handleInputChange('country', value)}
                />
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <Input
              label="Email"
              placeholder="kennel@example.com"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Phone"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />

            <Input
              label="Website"
              placeholder="https://yourkennel.com"
              value={formData.website}
              onChangeText={(value) => handleInputChange('website', value)}
              error={errors.website}
              autoCapitalize="none"
            />
          </View>

          {/* Business Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Information</Text>
            
            <View style={styles.businessTypeContainer}>
              <Text style={styles.label}>Business Type *</Text>
              <View style={styles.businessTypeOptions}>
                {(['hobby', 'commercial', 'show', 'working'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.businessTypeOption,
                      formData.businessType === type && styles.businessTypeOptionSelected,
                    ]}
                    onPress={() => handleInputChange('businessType', type)}
                  >
                    <Text
                      style={[
                        styles.businessTypeText,
                        formData.businessType === type && styles.businessTypeTextSelected,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Established Date"
              placeholder="YYYY-MM-DD"
              value={formData.establishedDate}
              onChangeText={(value) => handleInputChange('establishedDate', value)}
            />

            <Input
              label="License Number"
              placeholder="Enter your kennel license number"
              value={formData.licenseNumber}
              onChangeText={(value) => handleInputChange('licenseNumber', value)}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Create Kennel"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!canCreateKennel || isSubmitting}
            style={styles.submitButton}
          />
          
          {!canCreateKennel && (
            <Button
              title="Upgrade Plan"
              onPress={() => navigation.navigate('Profile' as never)}
              variant="outline"
              style={styles.upgradeButton}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  subscriptionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warningLight,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
  },
  limitWarningText: {
    fontSize: 14,
    color: theme.colors.warning,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  form: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  businessTypeContainer: {
    marginBottom: theme.spacing.md,
  },
  businessTypeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  businessTypeOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  businessTypeOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  businessTypeText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  businessTypeTextSelected: {
    color: theme.colors.textInverse,
  },
  footer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  submitButton: {
    marginBottom: theme.spacing.md,
  },
  upgradeButton: {
    // Additional styles if needed
  },
});

export default CreateKennelScreen;


