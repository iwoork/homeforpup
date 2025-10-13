import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { launchImageLibrary, MediaType } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import { Dog } from '../../types';
import { useBreeds, useKennels } from '../../hooks/useApi';
import apiService from '../../services/apiService';

interface RouteParams {
  litterId?: string;
  dogType?: 'parent' | 'puppy';
}

const CreateDogScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as RouteParams;

  const { data: breedsData } = useBreeds();
  // useKennels automatically filters to kennels where user is owner or manager
  const { data: kennelsData } = useKennels();

  const breeds = breedsData?.breeds || [];
  const kennels = kennelsData?.kennels || [];

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showBreedPicker, setShowBreedPicker] = useState(false);
  const [showKennelPicker, setShowKennelPicker] = useState(false);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [breedSearchQuery, setBreedSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    callName: '',
    breed: '',
    gender: 'male' as 'male' | 'female',
    birthDate: new Date(),
    weight: '',
    height: '',
    color: '',
    eyeColor: '',
    markings: '',
    description: '',
    temperament: '',
    specialNeeds: '',
    notes: '',
    breedingStatus: 'not_ready' as 'available' | 'retired' | 'not_ready',
    healthStatus: 'excellent' as 'excellent' | 'good' | 'fair' | 'poor',
    dogType: (params?.dogType || 'parent') as 'parent' | 'puppy',
    kennelId: kennels[0]?.id || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.breed.trim()) {
      newErrors.breed = 'Breed is required';
    }

    if (!formData.kennelId) {
      newErrors.kennelId = 'Kennel is required';
    }

    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.weight && isNaN(Number(formData.weight))) {
      newErrors.weight = 'Weight must be a number';
    }

    if (formData.height && isNaN(Number(formData.height))) {
      newErrors.height = 'Height must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoUpload = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      selectionLimit: 1,
    };

    launchImageLibrary(options, async result => {
      if (result.didCancel || result.errorCode) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset || !asset.uri) {
        return;
      }

      setPhotoUri(asset.uri);
    });
  };

  const uploadPhoto = async (uri: string): Promise<string | null> => {
    try {
      const fileName = `dog-${Date.now()}.jpg`;
      const uploadResponse = await apiService.getUploadUrl({
        fileName,
        contentType: 'image/jpeg',
        uploadPath: 'dogs',
      });

      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error(uploadResponse.error || 'Failed to get upload URL');
      }

      const { uploadUrl, photoUrl } = uploadResponse.data;

      const uploadResult = await fetch(uploadUrl, {
        method: 'PUT',
        body: { uri } as any,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });

      if (!uploadResult.ok) {
        throw new Error('Failed to upload photo');
      }

      return photoUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      let photoUrl = null;
      if (photoUri) {
        setUploading(true);
        photoUrl = await uploadPhoto(photoUri);
        setUploading(false);
      }

      const newDog: Partial<Dog> = {
        name: formData.name,
        callName: formData.callName || undefined,
        breed: formData.breed,
        gender: formData.gender,
        birthDate: formData.birthDate.toISOString().split('T')[0],
        weight: formData.weight ? Number(formData.weight) : 0,
        height: formData.height ? Number(formData.height) : undefined,
        color: formData.color,
        eyeColor: formData.eyeColor || undefined,
        markings: formData.markings || undefined,
        description: formData.description,
        temperament: formData.temperament || undefined,
        specialNeeds: formData.specialNeeds || undefined,
        notes: formData.notes || undefined,
        breedingStatus: formData.breedingStatus,
        healthStatus: formData.healthStatus,
        dogType: formData.dogType,
        kennelId: formData.kennelId || undefined,
        litterId: params?.litterId || undefined,
        photoUrl: photoUrl || undefined,
        healthTests: [],
      };

      const response = await apiService.createDog(newDog);

      if (response.success) {
        Alert.alert('Success', 'Dog added successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        throw new Error(response.error || 'Failed to add dog');
      }
    } catch (error) {
      console.error('Error adding dog:', error);
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Failed to add dog. Please try again.',
      );
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const onBirthDateChange = (event: any, selectedDate?: Date) => {
    setShowBirthDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, birthDate: selectedDate });
    }
  };

  const renderInput = (
    label: string,
    key: keyof typeof formData,
    placeholder: string,
    options?: {
      multiline?: boolean;
      keyboardType?: 'default' | 'numeric' | 'email-address';
      maxLength?: number;
      icon?: string;
    },
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
          value={formData[key] as string}
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

  const filteredBreeds = breeds.filter(breed =>
    breed.name.toLowerCase().includes(breedSearchQuery.toLowerCase()),
  );

  return (
    <View style={styles.keyboardAvoidingView}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          {/* Photo Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dog Photo</Text>
            <View style={styles.photoSection}>
              <TouchableOpacity
                style={styles.photoContainer}
                onPress={handlePhotoUpload}
                activeOpacity={0.8}
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.dogPhoto} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Icon
                      name="camera"
                      size={40}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                  </View>
                )}
                {uploading && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            {renderInput('Dog Name *', 'name', 'Enter dog name', {
              icon: 'paw',
            })}

            {renderInput('Call Name', 'callName', 'Nickname or call name', {
              icon: 'megaphone',
            })}

            {/* Breed Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Breed *</Text>
              <TouchableOpacity
                style={[styles.pickerButton, errors.breed && styles.inputError]}
                onPress={() => setShowBreedPicker(true)}
              >
                <Icon
                  name="search"
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <Text
                  style={[
                    styles.pickerButtonText,
                    !formData.breed && styles.placeholderText,
                  ]}
                >
                  {formData.breed || 'Select breed'}
                </Text>
                <Icon
                  name="chevron-down"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
              {errors.breed && (
                <Text style={styles.errorText}>{errors.breed}</Text>
              )}
            </View>

            {/* Kennel Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kennel *</Text>
              {kennels.length === 0 ? (
                <View style={styles.warningContainer}>
                  <Icon
                    name="warning"
                    size={20}
                    color={theme.colors.warning}
                    style={styles.inputIcon}
                  />
                  <Text style={styles.warningText}>
                    You need to create a kennel first before adding dogs.
                  </Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={[
                      styles.pickerButton,
                      errors.kennelId && styles.inputError,
                      kennels.length === 1 && styles.pickerButtonDisabled,
                    ]}
                    onPress={() => {
                      if (kennels.length > 1) {
                        setShowKennelPicker(true);
                      }
                    }}
                    disabled={kennels.length === 1}
                  >
                    <Icon
                      name="business"
                      size={20}
                      color={
                        kennels.length === 1
                          ? theme.colors.textTertiary
                          : theme.colors.textSecondary
                      }
                      style={styles.inputIcon}
                    />
                    <Text
                      style={[
                        styles.pickerButtonText,
                        !formData.kennelId && styles.placeholderText,
                        kennels.length === 1 && styles.disabledText,
                      ]}
                    >
                      {formData.kennelId
                        ? kennels.find(k => k.id === formData.kennelId)?.name ||
                          'Select kennel'
                        : 'Select kennel'}
                    </Text>
                    {kennels.length > 1 && (
                      <Icon
                        name="chevron-down"
                        size={20}
                        color={theme.colors.textSecondary}
                      />
                    )}
                    {kennels.length === 1 && (
                      <Icon
                        name="lock-closed"
                        size={16}
                        color={theme.colors.textTertiary}
                      />
                    )}
                  </TouchableOpacity>
                  {kennels.length === 1 && (
                    <Text style={styles.helperText}>
                      Only one kennel available. All dogs will be added to this
                      kennel.
                    </Text>
                  )}
                  {errors.kennelId && (
                    <Text style={styles.errorText}>{errors.kennelId}</Text>
                  )}
                </>
              )}
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender *</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.gender === 'male' && styles.genderButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, gender: 'male' })}
                >
                  <Icon
                    name="male"
                    size={20}
                    color={formData.gender === 'male' ? '#ffffff' : '#3b82f6'}
                  />
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.gender === 'male' &&
                        styles.genderButtonTextActive,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.gender === 'female' && styles.genderButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, gender: 'female' })}
                >
                  <Icon
                    name="female"
                    size={20}
                    color={formData.gender === 'female' ? '#ffffff' : '#ec4899'}
                  />
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.gender === 'female' &&
                        styles.genderButtonTextActive,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Birth Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Birth Date *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowBirthDatePicker(true)}
              >
                <Icon
                  name="calendar"
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <Text style={styles.dateButtonText}>
                  {formData.birthDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showBirthDatePicker && (
                <DateTimePicker
                  value={formData.birthDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onBirthDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            {/* Dog Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dog Type *</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.dogType === 'parent' && styles.genderButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, dogType: 'parent' })
                  }
                >
                  <Icon
                    name="shield-checkmark"
                    size={20}
                    color={
                      formData.dogType === 'parent'
                        ? '#ffffff'
                        : theme.colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.dogType === 'parent' &&
                        styles.genderButtonTextActive,
                    ]}
                  >
                    Parent Dog
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    formData.dogType === 'puppy' && styles.genderButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, dogType: 'puppy' })}
                >
                  <Icon
                    name="heart"
                    size={20}
                    color={formData.dogType === 'puppy' ? '#ffffff' : '#ec4899'}
                  />
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.dogType === 'puppy' &&
                        styles.genderButtonTextActive,
                    ]}
                  >
                    Puppy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {renderInput('Color *', 'color', 'e.g., Golden, Black, White', {
              icon: 'color-palette',
            })}

            {renderInput('Weight (lbs)', 'weight', 'Enter weight', {
              icon: 'fitness',
              keyboardType: 'numeric',
            })}

            {renderInput('Height (inches)', 'height', 'Enter height', {
              icon: 'resize',
              keyboardType: 'numeric',
            })}
          </View>

          {/* Physical Characteristics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Physical Characteristics</Text>

            {renderInput('Eye Color', 'eyeColor', 'e.g., Brown, Blue', {
              icon: 'eye',
            })}

            {renderInput('Markings', 'markings', 'Describe any markings', {
              icon: 'brush',
              multiline: true,
            })}
          </View>

          {/* Description & Temperament */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description & Temperament</Text>

            {renderInput(
              'Description *',
              'description',
              'Describe this dog...',
              {
                icon: 'document-text',
                multiline: true,
                maxLength: 500,
              },
            )}

            {renderInput(
              'Temperament',
              'temperament',
              'Describe temperament...',
              {
                icon: 'happy',
                multiline: true,
                maxLength: 300,
              },
            )}

            {renderInput(
              'Special Needs',
              'specialNeeds',
              'Any special needs or medical conditions',
              {
                icon: 'medical',
                multiline: true,
              },
            )}

            {renderInput('Notes', 'notes', 'Additional notes...', {
              icon: 'create',
              multiline: true,
            })}
          </View>

          {/* Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>

            {/* Breeding Status */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Breeding Status</Text>
              <View style={styles.statusButtons}>
                {['available', 'not_ready', 'retired'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      formData.breedingStatus === status &&
                        styles.statusButtonActive,
                    ]}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        breedingStatus: status as any,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        formData.breedingStatus === status &&
                          styles.statusButtonTextActive,
                      ]}
                    >
                      {status.replace('_', ' ').charAt(0).toUpperCase() +
                        status.slice(1).replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Health Status */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Health Status</Text>
              <View style={styles.statusButtons}>
                {['excellent', 'good', 'fair', 'poor'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      formData.healthStatus === status &&
                        styles.statusButtonActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, healthStatus: status as any })
                    }
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        formData.healthStatus === status &&
                          styles.statusButtonTextActive,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (loading || uploading) && styles.saveButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || uploading}
            >
              {loading || uploading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Icon name="checkmark" size={20} color="#ffffff" />
                  <Text style={styles.saveButtonText}>
                    {uploading ? 'Uploading...' : 'Add Dog'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={loading || uploading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Breed Picker Modal */}
          {showBreedPicker && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Breed</Text>
                  <TouchableOpacity onPress={() => setShowBreedPicker(false)}>
                    <Icon name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
                <View style={styles.searchContainer}>
                  <Icon
                    name="search"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <TextInput
                    style={styles.searchInput}
                    value={breedSearchQuery}
                    onChangeText={setBreedSearchQuery}
                    placeholder="Search breeds..."
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
                <ScrollView style={styles.modalBody}>
                  {filteredBreeds.map(breed => {
                    const breedImageUrl = `https://homeforpup.com/breeds/${breed.name}.jpg`;
                    return (
                      <TouchableOpacity
                        key={breed.id}
                        style={styles.breedItem}
                        onPress={() => {
                          setFormData({ ...formData, breed: breed.name });
                          setShowBreedPicker(false);
                          setBreedSearchQuery('');
                        }}
                      >
                        <Image
                          source={{ uri: breedImageUrl }}
                          style={styles.breedItemImage}
                        />
                        <Text style={styles.breedItemText}>{breed.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          )}

          {/* Kennel Picker Modal */}
          {showKennelPicker && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Kennel</Text>
                  <TouchableOpacity onPress={() => setShowKennelPicker(false)}>
                    <Icon name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalBody}>
                  {kennels.map(kennel => (
                    <TouchableOpacity
                      key={kennel.id}
                      style={[
                        styles.kennelItem,
                        formData.kennelId === kennel.id &&
                          styles.kennelItemSelected,
                      ]}
                      onPress={() => {
                        setFormData({ ...formData, kennelId: kennel.id });
                        setShowKennelPicker(false);
                        if (errors.kennelId) {
                          setErrors({ ...errors, kennelId: '' });
                        }
                      }}
                    >
                      <Icon
                        name="business"
                        size={24}
                        color={
                          formData.kennelId === kennel.id
                            ? theme.colors.primary
                            : theme.colors.textSecondary
                        }
                        style={styles.kennelItemIcon}
                      />
                      <View style={styles.kennelItemContent}>
                        <Text
                          style={[
                            styles.kennelItemText,
                            formData.kennelId === kennel.id &&
                              styles.kennelItemTextSelected,
                          ]}
                        >
                          {kennel.name}
                        </Text>
                        {kennel.location && (
                          <Text style={styles.kennelItemLocation}>
                            {kennel.location}
                          </Text>
                        )}
                      </View>
                      {formData.kennelId === kennel.id && (
                        <Icon
                          name="checkmark-circle"
                          size={24}
                          color={theme.colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
        </ScrollView>
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
  scrollContent: {
    paddingBottom: theme.spacing.xl * 3,
    flexGrow: 1,
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
  dogPhoto: {
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
  photoPlaceholderText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  genderButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  genderButtonTextActive: {
    color: '#ffffff',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statusButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  statusButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  statusButtonTextActive: {
    color: '#ffffff',
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  breedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  breedItemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.md,
  },
  breedItemText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    marginLeft: theme.spacing.sm,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  pickerButtonDisabled: {
    opacity: 0.6,
    backgroundColor: theme.colors.border,
  },
  disabledText: {
    color: theme.colors.textTertiary,
  },
  kennelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  kennelItemSelected: {
    backgroundColor: `${theme.colors.primary}10`,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  kennelItemIcon: {
    marginRight: theme.spacing.md,
  },
  kennelItemContent: {
    flex: 1,
  },
  kennelItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  kennelItemTextSelected: {
    color: theme.colors.primary,
  },
  kennelItemLocation: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});

export default CreateDogScreen;
