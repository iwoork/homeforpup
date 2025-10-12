import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import { Litter } from '../../types';
import { useBreeds, useDogs } from '../../hooks/useApi';
import apiService from '../../services/apiService';

type LitterStatus =
  | 'planned'
  | 'expecting'
  | 'born'
  | 'weaning'
  | 'ready'
  | 'sold_out';
type Season = 'spring' | 'summer' | 'fall' | 'winter';

const CreateLitterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: breedsData, loading: breedsLoading } = useBreeds({ limit: 200 });
  const { data: dogsData, loading: dogsLoading } = useDogs({ 
    type: 'parent',
    limit: 100 
  });

  const [formData, setFormData] = useState({
    breed: '',
    sireId: '',
    damId: '',
    breedingDate: new Date(),
    expectedDate: new Date(),
    birthDate: new Date(),
    season: 'spring' as Season,
    description: '',
    puppyCount: '',
    maleCount: '',
    femaleCount: '',
    availablePuppies: '',
    priceMin: '',
    priceMax: '',
    status: 'planned' as LitterStatus,
  });

  // Date picker states
  const [showBreedingDatePicker, setShowBreedingDatePicker] = useState(false);
  const [showExpectedDatePicker, setShowExpectedDatePicker] = useState(false);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Date picker handlers
  const onBreedingDateChange = (event: any, selectedDate?: Date) => {
    setShowBreedingDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, breedingDate: selectedDate });
    }
  };

  const onExpectedDateChange = (event: any, selectedDate?: Date) => {
    setShowExpectedDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, expectedDate: selectedDate });
    }
  };

  const onBirthDateChange = (event: any, selectedDate?: Date) => {
    setShowBirthDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, birthDate: selectedDate });
    }
  };
  const [showBreedPicker, setShowBreedPicker] = useState(false);
  const [showSirePicker, setShowSirePicker] = useState(false);
  const [showDamPicker, setShowDamPicker] = useState(false);
  const [breedSearchQuery, setBreedSearchQuery] = useState('');
  const [sireSearchQuery, setSireSearchQuery] = useState('');
  const [damSearchQuery, setDamSearchQuery] = useState('');

  const breeds = breedsData?.breeds || [];
  const filteredBreeds = breedSearchQuery
    ? breeds.filter(breed =>
        breed.name.toLowerCase().includes(breedSearchQuery.toLowerCase()),
      )
    : breeds;

  // Filter parent dogs by gender
  const allDogs = dogsData?.dogs || [];
  const maleDogs = allDogs.filter(dog => dog.gender === 'male');
  const femaleDogs = allDogs.filter(dog => dog.gender === 'female');
  
  const filteredSires = sireSearchQuery
    ? maleDogs.filter(dog =>
        dog.name.toLowerCase().includes(sireSearchQuery.toLowerCase()),
      )
    : maleDogs;
    
  const filteredDams = damSearchQuery
    ? femaleDogs.filter(dog =>
        dog.name.toLowerCase().includes(damSearchQuery.toLowerCase()),
      )
    : femaleDogs;

  // Get selected dog names for display
  const selectedSire = allDogs.find(dog => dog.id === formData.sireId);
  const selectedDam = allDogs.find(dog => dog.id === formData.damId);

  const seasons: Season[] = ['spring', 'summer', 'fall', 'winter'];
  const statuses: LitterStatus[] = [
    'planned',
    'expecting',
    'born',
    'weaning',
    'ready',
    'sold_out',
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.breed.trim()) {
      newErrors.breed = 'Breed is required';
    }

    if (!formData.sireId) {
      newErrors.sireId = 'Sire (father) is required';
    }

    if (!formData.damId) {
      newErrors.damId = 'Dam (mother) is required';
    }

    if (!formData.breedingDate) {
      newErrors.breedingDate = 'Breeding date is required';
    }

    if (!formData.expectedDate) {
      newErrors.expectedDate = 'Expected date is required';
    }

    if (formData.puppyCount && isNaN(Number(formData.puppyCount))) {
      newErrors.puppyCount = 'Must be a number';
    }

    if (formData.priceMin && isNaN(Number(formData.priceMin))) {
      newErrors.priceMin = 'Must be a number';
    }

    if (formData.priceMax && isNaN(Number(formData.priceMax))) {
      newErrors.priceMax = 'Must be a number';
    }

    if (formData.priceMin && formData.priceMax) {
      const min = Number(formData.priceMin);
      const max = Number(formData.priceMax);
      if (min > max) {
        newErrors.priceMax = 'Max price must be greater than min price';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    try {
        const newLitter: Partial<Litter> = {
          breed: formData.breed,
          sireId: formData.sireId,
          damId: formData.damId,
          breedingDate: formData.breedingDate.toISOString().split('T')[0],
          expectedDate: formData.expectedDate.toISOString().split('T')[0],
          birthDate: formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : undefined,
        season: formData.season,
        description: formData.description,
        puppyCount: formData.puppyCount
          ? Number(formData.puppyCount)
          : undefined,
        maleCount: formData.maleCount ? Number(formData.maleCount) : undefined,
        femaleCount: formData.femaleCount
          ? Number(formData.femaleCount)
          : undefined,
        availablePuppies: formData.availablePuppies
          ? Number(formData.availablePuppies)
          : undefined,
        status: formData.status,
        priceRange:
          formData.priceMin && formData.priceMax
            ? {
                min: Number(formData.priceMin),
                max: Number(formData.priceMax),
              }
            : undefined,
        photos: [],
        healthClearances: [],
      };

      const response = await apiService.createLitter(newLitter);

      if (response.success) {
        Alert.alert('Success', 'Litter created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        throw new Error(response.error || 'Failed to create litter');
      }
    } catch (error) {
      console.error('Error creating litter:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create litter. Please try again.',
      );
    }
  };

  const renderInput = (
    label: string,
    key: keyof typeof formData,
    placeholder: string,
    options?: {
      multiline?: boolean;
      keyboardType?: 'default' | 'numeric' | 'email-address';
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
        />
      </View>
      {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
    </View>
  );

  const renderPicker = (
    label: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.pickerOption,
              selectedValue === option && styles.pickerOptionSelected,
            ]}
            onPress={() => onSelect(option)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pickerOptionText,
                selectedValue === option && styles.pickerOptionTextSelected,
              ]}
            >
              {option.charAt(0).toUpperCase() +
                option.slice(1).replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDatePicker = (
    label: string,
    value: Date,
    onPress: () => void,
    showPicker: boolean,
    onChange: (event: any, selectedDate?: Date) => void,
    maxDate?: Date,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dateButton} onPress={onPress} activeOpacity={0.7}>
        <Icon name="calendar" size={20} color={theme.colors.primary} />
        <Text style={styles.dateButtonText}>
          {value.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={onChange}
          maximumDate={maxDate}
        />
      )}
    </View>
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
        <View style={styles.header}>
        <Icon name="albums" size={48} color={theme.colors.primary} />
        <Text style={styles.headerTitle}>Create New Litter</Text>
        <Text style={styles.headerSubtitle}>
          Add information about your new litter
        </Text>
      </View>

      <View style={styles.form}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          {/* Breed Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Breed *</Text>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                errors.breed && styles.inputError,
              ]}
              onPress={() => setShowBreedPicker(true)}
              activeOpacity={0.7}
            >
              <Icon
                name="paw"
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

          {/* Sire (Father) Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sire (Father) *</Text>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                errors.sireId && styles.inputError,
              ]}
              onPress={() => setShowSirePicker(true)}
              activeOpacity={0.7}
            >
              <Icon
                name="male"
                size={20}
                color="#3b82f6"
                style={styles.inputIcon}
              />
              <Text
                style={[
                  styles.pickerButtonText,
                  !formData.sireId && styles.placeholderText,
                ]}
              >
                {selectedSire?.name || 'Select sire (male parent)'}
              </Text>
              <Icon
                name="chevron-down"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
            {errors.sireId && (
              <Text style={styles.errorText}>{errors.sireId}</Text>
            )}
          </View>

          {/* Dam (Mother) Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dam (Mother) *</Text>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                errors.damId && styles.inputError,
              ]}
              onPress={() => setShowDamPicker(true)}
              activeOpacity={0.7}
            >
              <Icon
                name="female"
                size={20}
                color="#ec4899"
                style={styles.inputIcon}
              />
              <Text
                style={[
                  styles.pickerButtonText,
                  !formData.damId && styles.placeholderText,
                ]}
              >
                {selectedDam?.name || 'Select dam (female parent)'}
              </Text>
              <Icon
                name="chevron-down"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
            {errors.damId && (
              <Text style={styles.errorText}>{errors.damId}</Text>
            )}
          </View>

          {renderPicker('Season', seasons, formData.season, value =>
            setFormData({ ...formData, season: value as Season }),
          )}

          {renderPicker('Status', statuses, formData.status, value =>
            setFormData({ ...formData, status: value as LitterStatus }),
          )}

          {renderInput(
            'Description',
            'description',
            'Tell us about this litter...',
            { multiline: true, icon: 'document-text' },
          )}
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Dates</Text>

          {renderDatePicker(
            'Breeding Date *',
            formData.breedingDate,
            () => setShowBreedingDatePicker(true),
            showBreedingDatePicker,
            onBreedingDateChange,
          )}

          {renderDatePicker(
            'Expected Birth Date *',
            formData.expectedDate,
            () => setShowExpectedDatePicker(true),
            showExpectedDatePicker,
            onExpectedDateChange,
          )}

          {renderDatePicker(
            'Actual Birth Date',
            formData.birthDate,
            () => setShowBirthDatePicker(true),
            showBirthDatePicker,
            onBirthDateChange,
            new Date(), // Max date is today for birth date
          )}
        </View>

        {/* Puppy Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Puppy Details</Text>

          <View style={styles.row}>
            {renderInput('Total Puppies', 'puppyCount', '0', {
              keyboardType: 'numeric',
              icon: 'paw',
            })}
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              {renderInput('Males', 'maleCount', '0', {
                keyboardType: 'numeric',
              })}
            </View>
            <View style={styles.halfWidth}>
              {renderInput('Females', 'femaleCount', '0', {
                keyboardType: 'numeric',
              })}
            </View>
          </View>

          {renderInput('Available Puppies', 'availablePuppies', '0', {
            keyboardType: 'numeric',
            icon: 'checkmark-circle',
          })}
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing (Optional)</Text>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              {renderInput('Min Price', 'priceMin', '0', {
                keyboardType: 'numeric',
              })}
            </View>
            <View style={styles.halfWidth}>
              {renderInput('Max Price', 'priceMax', '0', {
                keyboardType: 'numeric',
              })}
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Icon name="checkmark" size={24} color="#ffffff" />
            <Text style={styles.submitButtonText}>Create Litter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sire Picker Modal */}
      <Modal
        visible={showSirePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSirePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sire (Father)</Text>
              <TouchableOpacity
                onPress={() => setShowSirePicker(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Icon
                name="search"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search male dogs..."
                placeholderTextColor={theme.colors.textSecondary}
                value={sireSearchQuery}
                onChangeText={setSireSearchQuery}
                autoFocus
              />
              {sireSearchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSireSearchQuery('')}
                  style={styles.searchClearButton}
                >
                  <Icon
                    name="close-circle"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {dogsLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading dogs...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredSires}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.breedItem}
                    onPress={() => {
                      setFormData({ ...formData, sireId: item.id });
                      setShowSirePicker(false);
                      setSireSearchQuery('');
                      if (errors.sireId) {
                        setErrors({ ...errors, sireId: '' });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    {item.photoUrl ? (
                      <Image
                        source={{ uri: item.photoUrl }}
                        style={styles.breedItemImage}
                      />
                    ) : (
                      <View style={styles.dogPlaceholder}>
                        <Icon name="male" size={24} color="#3b82f6" />
                      </View>
                    )}
                    <View style={styles.dogInfo}>
                      <Text style={styles.breedItemText}>{item.name}</Text>
                      <Text style={styles.dogBreed}>{item.breed}</Text>
                    </View>
                    {formData.sireId === item.id && (
                      <Icon
                        name="checkmark"
                        size={24}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyBreedList}>
                    <Icon name="male" size={48} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyBreedText}>
                      {sireSearchQuery
                        ? `No male dogs found matching "${sireSearchQuery}"`
                        : 'No male parent dogs available. Add parent dogs first.'}
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Dam Picker Modal */}
      <Modal
        visible={showDamPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDamPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Dam (Mother)</Text>
              <TouchableOpacity
                onPress={() => setShowDamPicker(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Icon
                name="search"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search female dogs..."
                placeholderTextColor={theme.colors.textSecondary}
                value={damSearchQuery}
                onChangeText={setDamSearchQuery}
                autoFocus
              />
              {damSearchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setDamSearchQuery('')}
                  style={styles.searchClearButton}
                >
                  <Icon
                    name="close-circle"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {dogsLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading dogs...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredDams}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.breedItem}
                    onPress={() => {
                      setFormData({ ...formData, damId: item.id });
                      setShowDamPicker(false);
                      setDamSearchQuery('');
                      if (errors.damId) {
                        setErrors({ ...errors, damId: '' });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    {item.photoUrl ? (
                      <Image
                        source={{ uri: item.photoUrl }}
                        style={styles.breedItemImage}
                      />
                    ) : (
                      <View style={styles.dogPlaceholder}>
                        <Icon name="female" size={24} color="#ec4899" />
                      </View>
                    )}
                    <View style={styles.dogInfo}>
                      <Text style={styles.breedItemText}>{item.name}</Text>
                      <Text style={styles.dogBreed}>{item.breed}</Text>
                    </View>
                    {formData.damId === item.id && (
                      <Icon
                        name="checkmark"
                        size={24}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyBreedList}>
                    <Icon name="female" size={48} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyBreedText}>
                      {damSearchQuery
                        ? `No female dogs found matching "${damSearchQuery}"`
                        : 'No female parent dogs available. Add parent dogs first.'}
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Breed Picker Modal */}
      <Modal
        visible={showBreedPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBreedPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Breed</Text>
              <TouchableOpacity
                onPress={() => setShowBreedPicker(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Icon
                name="search"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search breeds..."
                placeholderTextColor={theme.colors.textSecondary}
                value={breedSearchQuery}
                onChangeText={setBreedSearchQuery}
                autoFocus
              />
              {breedSearchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setBreedSearchQuery('')}
                  style={styles.searchClearButton}
                >
                  <Icon
                    name="close-circle"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Breed List */}
            {breedsLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading breeds...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredBreeds}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                  const breedImageUrl = 
                    item.image || `https://homeforpup.com/breeds/${item.name}.jpg`;
                  
                  return (
                    <TouchableOpacity
                      style={styles.breedItem}
                      onPress={() => {
                        setFormData({ ...formData, breed: item.name });
                        setShowBreedPicker(false);
                        setBreedSearchQuery('');
                        if (errors.breed) {
                          setErrors({ ...errors, breed: '' });
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={{ uri: breedImageUrl }}
                        style={styles.breedItemImage}
                      />
                      <Text style={styles.breedItemText}>{item.name}</Text>
                      {formData.breed === item.name && (
                        <Icon
                          name="checkmark"
                          size={24}
                          color={theme.colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyBreedList}>
                    <Icon
                      name="search"
                      size={48}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.emptyBreedText}>
                      No breeds found matching "{breedSearchQuery}"
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
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
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputIcon: {
    marginLeft: theme.spacing.md,
  },
  input: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginTop: theme.spacing.xs / 2,
    marginLeft: theme.spacing.xs,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  pickerOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  pickerOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  pickerOptionTextSelected: {
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md + 2,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  dateButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: theme.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalCloseButton: {
    padding: theme.spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    margin: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  searchClearButton: {
    padding: theme.spacing.xs,
  },
  breedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  breedItemImage: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  breedItemText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyBreedList: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyBreedText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  dogPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dogInfo: {
    flex: 1,
  },
  dogBreed: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});

export default CreateLitterScreen;
