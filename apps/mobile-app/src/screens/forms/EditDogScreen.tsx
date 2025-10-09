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
  Platform,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import { Dog } from '../../types';
import apiService from '../../services/apiService';

interface EditDogRouteParams {
  dog: Dog;
}

interface FormErrors {
  [key: string]: string;
}

const EditDogScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { dog } = route.params as EditDogRouteParams;

  // Get health status from nested object or top-level field
  const initialHealthStatus = (dog as any)?.health?.currentHealthStatus || dog?.healthStatus || 'good';

  const [formData, setFormData] = useState({
    name: dog.name,
    callName: dog.callName || '',
    breed: dog.breed,
    gender: dog.gender,
    birthDate: new Date(dog.birthDate),
    weight: dog.weight?.toString() || '',
    color: dog.color || '',
    description: dog.description || '',
    dogType: dog.dogType,
    breedingStatus: dog.breedingStatus,
    healthStatus: initialHealthStatus,
  });

  // Initialize photos from photoGallery or photos array
  const initialPhotos = ((dog as any).photoGallery?.map((p: any) => p.url) || (dog as any).photos || []);
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.breed.trim()) {
      newErrors.breed = 'Breed is required';
    }

    if (formData.weight && isNaN(Number(formData.weight))) {
      newErrors.weight = 'Weight must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPhoto = async () => {
    if (photos.length >= 10) {
      Alert.alert('Maximum Photos', 'You can upload up to 10 photos');
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to select image');
        return;
      }

      const asset = result.assets?.[0];
      if (!asset || !asset.uri) {
        return;
      }

      setUploading(true);
      try {
        console.log('Starting photo upload...', { fileName: asset.fileName, type: asset.type });
        
        // Get presigned upload URL
        const uploadResponse = await apiService.getUploadUrl({
          fileName: asset.fileName || 'photo.jpg',
          contentType: asset.type || 'image/jpeg',
          uploadPath: 'dog-photos',
        });

        console.log('Upload URL response:', uploadResponse);

        if (!uploadResponse.success || !uploadResponse.data) {
          console.error('Failed to get upload URL:', uploadResponse.error);
          Alert.alert('Error', uploadResponse.error || 'Failed to get upload URL');
          return;
        }

        const { uploadUrl, photoUrl } = uploadResponse.data;
        console.log('Got upload URL and photo URL:', { uploadUrl: uploadUrl.substring(0, 50) + '...', photoUrl });

        // Read file as blob
        console.log('Reading file from URI:', asset.uri);
        const fileResponse = await fetch(asset.uri);
        const blob = await fileResponse.blob();
        console.log('File read as blob, size:', blob.size);

        // Upload to S3
        console.log('Uploading to S3...');
        const uploadSuccess = await apiService.uploadToS3(uploadUrl, blob, asset.type || 'image/jpeg');
        console.log('S3 upload result:', uploadSuccess);

        if (uploadSuccess) {
          setPhotos([...photos, photoUrl]);
          console.log('Photo added to array, new count:', photos.length + 1);
          Alert.alert('Success', 'Photo uploaded successfully');
        } else {
          console.error('S3 upload failed');
          Alert.alert('Error', 'Failed to upload photo to S3');
        }
      } catch (error) {
        console.error('Upload error:', error);
        Alert.alert('Error', `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setUploading(false);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to open image picker');
    }
  };

  const handleRemovePhoto = (index: number) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newPhotos = photos.filter((_, i) => i !== index);
            setPhotos(newPhotos);
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        name: formData.name.trim(),
        callName: formData.callName.trim() || undefined,
        breed: formData.breed.trim(),
        gender: formData.gender,
        birthDate: formData.birthDate.toISOString(),
        weight: formData.weight ? Number(formData.weight) : undefined,
        color: formData.color.trim() || undefined,
        description: formData.description.trim() || undefined,
        dogType: formData.dogType,
        breedingStatus: formData.breedingStatus,
        healthStatus: formData.healthStatus,
        photos: photos,
      };

      // Use dogId if available, fallback to id for backwards compatibility
      const dogIdentifier = (dog as any).dogId || dog.id;
      const response = await apiService.updateDog(dogIdentifier, updateData);

      if (response.success) {
        Alert.alert('Success', 'Dog updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to Dogs screen to refresh the list
              navigation.navigate('MainTabs' as never, { 
                screen: 'Dogs',
                params: { refresh: Date.now() }
              } as never);
            },
          },
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to update dog');
      }
    } catch (error) {
      console.error('Error updating dog:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, birthDate: selectedDate });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formSection}>
        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(text) => {
              setFormData({ ...formData, name: text });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder="Enter dog's registered name"
            placeholderTextColor={theme.colors.textTertiary}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Call Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Call Name</Text>
          <TextInput
            style={styles.input}
            value={formData.callName}
            onChangeText={(text) => setFormData({ ...formData, callName: text })}
            placeholder="Enter dog's call name"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        {/* Breed */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Breed <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.breed && styles.inputError]}
            value={formData.breed}
            onChangeText={(text) => {
              setFormData({ ...formData, breed: text });
              if (errors.breed) setErrors({ ...errors, breed: '' });
            }}
            placeholder="Enter breed"
            placeholderTextColor={theme.colors.textTertiary}
          />
          {errors.breed && <Text style={styles.errorText}>{errors.breed}</Text>}
        </View>

        {/* Gender */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonLeft,
                formData.gender === 'male' && styles.segmentButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, gender: 'male' })}
            >
              <Icon
                name="male"
                size={18}
                color={formData.gender === 'male' ? '#fff' : theme.colors.primary}
              />
              <Text
                style={[
                  styles.segmentButtonText,
                  formData.gender === 'male' && styles.segmentButtonTextActive,
                ]}
              >
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonRight,
                formData.gender === 'female' && styles.segmentButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, gender: 'female' })}
            >
              <Icon
                name="female"
                size={18}
                color={formData.gender === 'female' ? '#fff' : theme.colors.primary}
              />
              <Text
                style={[
                  styles.segmentButtonText,
                  formData.gender === 'female' && styles.segmentButtonTextActive,
                ]}
              >
                Female
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Birth Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birth Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar" size={20} color={theme.colors.primary} />
            <Text style={styles.dateButtonText}>
              {formData.birthDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.birthDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Weight */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight (lbs)</Text>
          <TextInput
            style={[styles.input, errors.weight && styles.inputError]}
            value={formData.weight}
            onChangeText={(text) => {
              setFormData({ ...formData, weight: text });
              if (errors.weight) setErrors({ ...errors, weight: '' });
            }}
            placeholder="Enter weight"
            placeholderTextColor={theme.colors.textTertiary}
            keyboardType="numeric"
          />
          {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
        </View>

        {/* Color */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Color</Text>
          <TextInput
            style={styles.input}
            value={formData.color}
            onChangeText={(text) => setFormData({ ...formData, color: text })}
            placeholder="Enter color"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        {/* Dog Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dog Type</Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonLeft,
                formData.dogType === 'parent' && styles.segmentButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, dogType: 'parent' })}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  formData.dogType === 'parent' && styles.segmentButtonTextActive,
                ]}
              >
                Parent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonRight,
                formData.dogType === 'puppy' && styles.segmentButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, dogType: 'puppy' })}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  formData.dogType === 'puppy' && styles.segmentButtonTextActive,
                ]}
              >
                Puppy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Breeding Status */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Breeding Status</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                formData.breedingStatus === 'available' && styles.pickerOptionActive,
              ]}
              onPress={() => setFormData({ ...formData, breedingStatus: 'available' })}
            >
              <View
                style={[
                  styles.radio,
                  formData.breedingStatus === 'available' && styles.radioActive,
                ]}
              />
              <Text style={styles.pickerOptionText}>Available</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                formData.breedingStatus === 'not_ready' && styles.pickerOptionActive,
              ]}
              onPress={() => setFormData({ ...formData, breedingStatus: 'not_ready' })}
            >
              <View
                style={[
                  styles.radio,
                  formData.breedingStatus === 'not_ready' && styles.radioActive,
                ]}
              />
              <Text style={styles.pickerOptionText}>Not Ready</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                formData.breedingStatus === 'retired' && styles.pickerOptionActive,
              ]}
              onPress={() => setFormData({ ...formData, breedingStatus: 'retired' })}
            >
              <View
                style={[
                  styles.radio,
                  formData.breedingStatus === 'retired' && styles.radioActive,
                ]}
              />
              <Text style={styles.pickerOptionText}>Retired</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Status */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Health Status</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                formData.healthStatus === 'good' && styles.pickerOptionActive,
              ]}
              onPress={() => setFormData({ ...formData, healthStatus: 'good' })}
            >
              <View
                style={[
                  styles.radio,
                  formData.healthStatus === 'good' && styles.radioActive,
                ]}
              />
              <Text style={styles.pickerOptionText}>Good</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                formData.healthStatus === 'fair' && styles.pickerOptionActive,
              ]}
              onPress={() => setFormData({ ...formData, healthStatus: 'fair' })}
            >
              <View
                style={[
                  styles.radio,
                  formData.healthStatus === 'fair' && styles.radioActive,
                ]}
              />
              <Text style={styles.pickerOptionText}>Fair</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pickerOption,
                formData.healthStatus === 'poor' && styles.pickerOptionActive,
              ]}
              onPress={() => setFormData({ ...formData, healthStatus: 'poor' })}
            >
              <View
                style={[
                  styles.radio,
                  formData.healthStatus === 'poor' && styles.radioActive,
                ]}
              />
              <Text style={styles.pickerOptionText}>Poor</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Enter description"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Photos */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Photos ({photos.length}/10)</Text>
          
          <TouchableOpacity
            style={[styles.addPhotoButton, uploading && styles.addPhotoButtonDisabled]}
            onPress={handleAddPhoto}
            disabled={uploading || photos.length >= 10}
          >
            {uploading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                <Icon name="camera" size={24} color={theme.colors.primary} />
                <Text style={styles.addPhotoText}>
                  {photos.length === 0 ? 'Add Photo' : 'Add Another Photo'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {photos.length > 0 && (
            <View style={styles.photosGrid}>
              {photos.map((photoUrl, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri: photoUrl }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <Icon name="close-circle" size={24} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.buttonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Icon name="close-circle-outline" size={20} color={theme.colors.text} />
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  formSection: {
    padding: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  textArea: {
    minHeight: 100,
    paddingTop: theme.spacing.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.xs,
  },
  segmentButtonLeft: {
    borderRightWidth: 1,
    borderRightColor: theme.colors.primary,
  },
  segmentButtonRight: {},
  segmentButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  segmentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  segmentButtonTextActive: {
    color: '#fff',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  dateButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  pickerContainer: {
    gap: theme.spacing.sm,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  pickerOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  pickerOptionText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  buttonContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md + 4,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.md,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButtonText: {
    color: theme.colors.text,
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  addPhotoButtonDisabled: {
    opacity: 0.5,
  },
  addPhotoText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  photoItem: {
    width: '47%',
    aspectRatio: 1,
    position: 'relative',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
});

export default EditDogScreen;
