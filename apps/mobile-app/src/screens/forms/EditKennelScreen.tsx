import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../utils/theme';
import { Kennel } from '../../types';
import apiService from '../../services/apiService';

interface EditKennelRouteParams {
  kennel: Kennel;
}

interface FormErrors {
  [key: string]: string;
}

interface KennelFormData {
  name: string;
  businessName: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  
  // Address
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Facilities
  indoorSpace: boolean;
  outdoorSpace: boolean;
  exerciseArea: boolean;
  whelpingArea: boolean;
  quarantineArea: boolean;
  groomingArea: boolean;
  veterinaryAccess: boolean;
  climateControl: boolean;
  security: boolean;
  
  // Capacity
  maxDogs: string;
  maxLitters: string;
  
  // Social Media
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
}

const EditKennelScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { kennel } = route.params as EditKennelRouteParams;

  const [activeSection, setActiveSection] = useState<string>('basic');
  const [formData, setFormData] = useState<KennelFormData>({
    name: kennel.name || '',
    businessName: kennel.businessName || '',
    description: kennel.description || '',
    website: kennel.website || '',
    phone: kennel.phone || '',
    email: kennel.email || '',
    
    // Address
    street: kennel.address?.street || '',
    city: kennel.address?.city || '',
    state: kennel.address?.state || '',
    zipCode: kennel.address?.zipCode || '',
    country: kennel.address?.country || 'USA',
    
    // Facilities
    indoorSpace: kennel.facilities?.indoorSpace || false,
    outdoorSpace: kennel.facilities?.outdoorSpace || false,
    exerciseArea: kennel.facilities?.exerciseArea || false,
    whelpingArea: kennel.facilities?.whelpingArea || false,
    quarantineArea: kennel.facilities?.quarantineArea || false,
    groomingArea: kennel.facilities?.groomingArea || false,
    veterinaryAccess: kennel.facilities?.veterinaryAccess || false,
    climateControl: kennel.facilities?.climateControl || false,
    security: kennel.facilities?.security || false,
    
    // Capacity
    maxDogs: kennel.capacity?.maxDogs?.toString() || '10',
    maxLitters: kennel.capacity?.maxLitters?.toString() || '5',
    
    // Social Media
    facebook: kennel.socialMedia?.facebook || '',
    instagram: kennel.socialMedia?.instagram || '',
    twitter: kennel.socialMedia?.twitter || '',
    youtube: kennel.socialMedia?.youtube || '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = (field: keyof KennelFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Basic info validation
    if (!formData.name.trim()) {
      newErrors.name = 'Kennel name is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation (basic)
    if (formData.phone && formData.phone.replace(/[^0-9]/g, '').length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }

    // Website validation
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    // Capacity validation
    if (isNaN(Number(formData.maxDogs)) || Number(formData.maxDogs) < 1) {
      newErrors.maxDogs = 'Max dogs must be a positive number';
    }

    if (isNaN(Number(formData.maxLitters)) || Number(formData.maxLitters) < 1) {
      newErrors.maxLitters = 'Max litters must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    setLoading(true);

    try {
      const kennelData = {
        name: formData.name,
        businessName: formData.businessName || undefined,
        description: formData.description || undefined,
        website: formData.website || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: {
          street: formData.street || '',
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode || '',
          country: formData.country,
        },
        facilities: {
          indoorSpace: formData.indoorSpace,
          outdoorSpace: formData.outdoorSpace,
          exerciseArea: formData.exerciseArea,
          whelpingArea: formData.whelpingArea,
          quarantineArea: formData.quarantineArea,
          groomingArea: formData.groomingArea,
          veterinaryAccess: formData.veterinaryAccess,
          climateControl: formData.climateControl,
          security: formData.security,
        },
        capacity: {
          maxDogs: Number(formData.maxDogs),
          maxLitters: Number(formData.maxLitters),
          currentDogs: kennel.capacity?.currentDogs || 0,
          currentLitters: kennel.capacity?.currentLitters || 0,
        },
        socialMedia: {
          facebook: formData.facebook || undefined,
          instagram: formData.instagram || undefined,
          twitter: formData.twitter || undefined,
          youtube: formData.youtube || undefined,
        },
      };

      const response = await apiService.updateKennel(kennel.id, kennelData);

      if (response.success) {
        Alert.alert('Success', 'Kennel updated successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to update kennel');
      }
    } catch (error) {
      console.error('Error updating kennel:', error);
      Alert.alert('Error', 'Failed to update kennel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSectionButton = (
    section: string,
    icon: string,
    label: string,
  ) => (
    <TouchableOpacity
      style={[
        styles.sectionButton,
        activeSection === section && styles.sectionButtonActive,
      ]}
      onPress={() => setActiveSection(section)}
      activeOpacity={0.7}>
      <Icon
        name={icon}
        size={15}
        color={
          activeSection === section
            ? theme.colors.primary
            : theme.colors.textSecondary
        }
      />
      <Text
        style={[
          styles.sectionButtonText,
          activeSection === section && styles.sectionButtonTextActive,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderInput = (
    label: string,
    field: keyof KennelFormData,
    options?: {
      placeholder?: string;
      multiline?: boolean;
      keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url' | 'numeric';
      autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    },
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          options?.multiline && styles.textArea,
          errors[field] && styles.inputError,
        ]}
        value={String(formData[field])}
        onChangeText={value => updateField(field, value)}
        placeholder={options?.placeholder || label}
        placeholderTextColor={theme.colors.textSecondary}
        multiline={options?.multiline}
        numberOfLines={options?.multiline ? 4 : 1}
        keyboardType={options?.keyboardType}
        autoCapitalize={options?.autoCapitalize || 'sentences'}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  const renderSwitch = (
    label: string,
    field: keyof KennelFormData,
    description?: string,
  ) => (
    <View style={styles.switchRow}>
      <View style={styles.switchLabelContainer}>
        <Text style={styles.switchLabel}>{label}</Text>
        {description && (
          <Text style={styles.switchDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={formData[field] as boolean}
        onValueChange={value => updateField(field, value)}
        trackColor={{
          false: theme.colors.borderLight,
          true: theme.colors.primary,
        }}
        thumbColor="#ffffff"
      />
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
      {renderInput('Kennel Name *', 'name', {
        placeholder: 'Enter kennel name',
      })}
      
      {renderInput('Business Name', 'businessName', {
        placeholder: 'Legal business name (optional)',
      })}
      
      {renderInput('Description', 'description', {
        placeholder: 'Describe your kennel...',
        multiline: true,
      })}
      
      {renderInput('Website', 'website', {
        placeholder: 'https://example.com',
        keyboardType: 'url',
        autoCapitalize: 'none',
      })}
      
      {renderInput('Phone', 'phone', {
        placeholder: '(555) 123-4567',
        keyboardType: 'phone-pad',
      })}
      
      {renderInput('Email', 'email', {
        placeholder: 'kennel@example.com',
        keyboardType: 'email-address',
        autoCapitalize: 'none',
      })}
    </View>
  );

  const renderLocation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Location</Text>
      
      {renderInput('Street Address', 'street', {
        placeholder: '123 Main Street',
      })}
      
      {renderInput('City *', 'city', {
        placeholder: 'Enter city',
      })}
      
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          {renderInput('State *', 'state', {
            placeholder: 'State',
          })}
        </View>
        <View style={styles.halfWidth}>
      {renderInput('Zip Code', 'zipCode', {
        placeholder: '12345',
        keyboardType: 'numeric',
      })}
        </View>
      </View>
      
      {renderInput('Country *', 'country', {
        placeholder: 'USA',
      })}
    </View>
  );

  const renderFacilities = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Facilities</Text>
      <Text style={styles.sectionSubtitle}>
        Select the facilities available at your kennel
      </Text>
      
      {renderSwitch('Indoor Space', 'indoorSpace', 'Climate-controlled indoor areas')}
      {renderSwitch('Outdoor Space', 'outdoorSpace', 'Fenced outdoor areas')}
      {renderSwitch('Exercise Area', 'exerciseArea', 'Dedicated exercise space')}
      {renderSwitch('Whelping Area', 'whelpingArea', 'Dedicated birthing area')}
      {renderSwitch('Quarantine Area', 'quarantineArea', 'Isolation for new/sick dogs')}
      {renderSwitch('Grooming Area', 'groomingArea', 'Professional grooming facilities')}
      {renderSwitch('Veterinary Access', 'veterinaryAccess', 'On-site or nearby vet')}
      {renderSwitch('Climate Control', 'climateControl', 'Heating and cooling')}
      {renderSwitch('Security', 'security', 'Security system and monitoring')}
    </View>
  );

  const renderCapacity = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Capacity</Text>
      <Text style={styles.sectionSubtitle}>
        Define the maximum capacity for your kennel
      </Text>
      
      {renderInput('Maximum Dogs *', 'maxDogs', {
        placeholder: '10',
        keyboardType: 'numeric',
      })}
      
      {renderInput('Maximum Litters *', 'maxLitters', {
        placeholder: '5',
        keyboardType: 'numeric',
      })}
      
      <View style={styles.infoBox}>
        <Icon name="information-circle" size={24} color={theme.colors.info} />
        <Text style={styles.infoText}>
          Current capacity: {kennel.capacity?.currentDogs || 0} dogs, {kennel.capacity?.currentLitters || 0} litters
        </Text>
      </View>
    </View>
  );

  const renderSocialMedia = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Social Media</Text>
      <Text style={styles.sectionSubtitle}>
        Connect your social media accounts
      </Text>
      
      {renderInput('Facebook', 'facebook', {
        placeholder: 'https://facebook.com/yourkennel',
        keyboardType: 'url',
        autoCapitalize: 'none',
      })}
      
      {renderInput('Instagram', 'instagram', {
        placeholder: 'https://instagram.com/yourkennel',
        keyboardType: 'url',
        autoCapitalize: 'none',
      })}
      
      {renderInput('Twitter', 'twitter', {
        placeholder: 'https://twitter.com/yourkennel',
        keyboardType: 'url',
        autoCapitalize: 'none',
      })}
      
      {renderInput('YouTube', 'youtube', {
        placeholder: 'https://youtube.com/yourkennel',
        keyboardType: 'url',
        autoCapitalize: 'none',
      })}
    </View>
  );

  return (
    <View style={styles.keyboardAvoidingView}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.container}>
        {/* Combined Header with Navigation */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Icon name="arrow-back" size={22} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Kennel</Text>
            <View style={styles.backButton} />
          </View>
        </LinearGradient>

        {/* Section Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sectionNav}
          contentContainerStyle={styles.sectionNavContent}>
          {renderSectionButton('basic', 'information-circle', 'Basic')}
          {renderSectionButton('location', 'location', 'Location')}
          {renderSectionButton('facilities', 'home', 'Facilities')}
          {renderSectionButton('capacity', 'resize', 'Capacity')}
          {renderSectionButton('social', 'share-social', 'Social')}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag">
        {activeSection === 'basic' && renderBasicInfo()}
        {activeSection === 'location' && renderLocation()}
        {activeSection === 'facilities' && renderFacilities()}
        {activeSection === 'capacity' && renderCapacity()}
        {activeSection === 'social' && renderSocialMedia()}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Icon name="checkmark-circle" size={24} color="#ffffff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  header: {
    paddingTop: 44,
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionNav: {
    backgroundColor: theme.colors.surface,
  },
  sectionNavContent: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm - 2,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    marginRight: theme.spacing.sm,
  },
  sectionButtonActive: {
    backgroundColor: theme.colors.primary + '20',
  },
  sectionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  sectionButtonTextActive: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 3,
    flexGrow: 1,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    fontSize: 16,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm + 2,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginTop: theme.spacing.xs / 2,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  switchDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.info + '15',
    borderWidth: 1,
    borderColor: theme.colors.info + '30',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: theme.spacing.sm,
  },
});

export default EditKennelScreen;

