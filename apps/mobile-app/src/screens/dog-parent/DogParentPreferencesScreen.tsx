import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';
import { LocationAutocompleteModal } from '../../components';

const DogParentPreferencesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Initialize with user's current preferences
  const [preferences, setPreferences] = useState({
    preferredBreeds: user?.puppyParentInfo?.preferredBreeds || [],
    experienceLevel: user?.puppyParentInfo?.experienceLevel || 'first-time',
    housingType: user?.puppyParentInfo?.housingType || 'house',
    yardSize: user?.puppyParentInfo?.yardSize || 'medium',
    hasOtherPets: user?.puppyParentInfo?.hasOtherPets || false,
    maxBudget: 3000,
    preferredGender: 'any' as 'male' | 'female' | 'any',
    preferredAge: 'puppy' as 'puppy' | 'young' | 'adult' | 'any',
    location: user?.location || '',
    maxDistance: 50, // miles
  });

  const popularBreeds = [
    'Golden Retriever',
    'Labrador Retriever',
    'German Shepherd',
    'French Bulldog',
    'Beagle',
    'Poodle',
    'Bulldog',
    'Rottweiler',
    'Yorkshire Terrier',
    'Boxer',
    'Dachshund',
    'Siberian Husky',
  ];

  const toggleBreed = (breed: string) => {
    setPreferences((prev) => ({
      ...prev,
      preferredBreeds: prev.preferredBreeds.includes(breed)
        ? prev.preferredBreeds.filter((b) => b !== breed)
        : [...prev.preferredBreeds, breed],
    }));
  };

  const handleSave = async () => {
    if (preferences.preferredBreeds.length === 0) {
      Alert.alert('Required', 'Please select at least one preferred breed');
      return;
    }

    setLoading(true);
    try {
      await updateUser({
        puppyParentInfo: {
          preferredBreeds: preferences.preferredBreeds,
          experienceLevel: preferences.experienceLevel as any,
          housingType: preferences.housingType as any,
          yardSize: preferences.yardSize as any,
          hasOtherPets: preferences.hasOtherPets,
        },
        location: preferences.location,
      });

      Alert.alert('Success', 'Your preferences have been saved!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
        {/* Preferred Breeds */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="paw" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Preferred Breeds</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select one or more breeds you're interested in
          </Text>
          <View style={styles.breedGrid}>
            {popularBreeds.map((breed) => (
              <TouchableOpacity
                key={breed}
                style={[
                  styles.breedChip,
                  preferences.preferredBreeds.includes(breed) && styles.breedChipSelected,
                ]}
                onPress={() => toggleBreed(breed)}
              >
                {preferences.preferredBreeds.includes(breed) && (
                  <Icon name="checkmark-circle" size={18} color="#ffffff" />
                )}
                <Text
                  style={[
                    styles.breedChipText,
                    preferences.preferredBreeds.includes(breed) &&
                      styles.breedChipTextSelected,
                  ]}
                >
                  {breed}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Experience Level */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="school" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Experience Level</Text>
          </View>
          <View style={styles.optionsRow}>
            {[
              { value: 'first-time', label: 'First Time', icon: 'leaf' },
              { value: 'some', label: 'Some Experience', icon: 'star-half' },
              { value: 'experienced', label: 'Experienced', icon: 'trophy' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  preferences.experienceLevel === option.value && styles.optionCardSelected,
                ]}
                onPress={() =>
                  setPreferences((prev) => ({ ...prev, experienceLevel: option.value as any }))
                }
              >
                <Icon
                  name={option.icon}
                  size={24}
                  color={
                    preferences.experienceLevel === option.value
                      ? '#ffffff'
                      : theme.colors.primary
                  }
                />
                <Text
                  style={[
                    styles.optionText,
                    preferences.experienceLevel === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Housing Type */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="home" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Housing Type</Text>
          </View>
          <View style={styles.optionsRow}>
            {[
              { value: 'house', label: 'House', icon: 'home' },
              { value: 'apartment', label: 'Apartment', icon: 'business' },
              { value: 'condo', label: 'Condo', icon: 'business-outline' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  preferences.housingType === option.value && styles.optionCardSelected,
                ]}
                onPress={() =>
                  setPreferences((prev) => ({ ...prev, housingType: option.value as any }))
                }
              >
                <Icon
                  name={option.icon}
                  size={24}
                  color={
                    preferences.housingType === option.value
                      ? '#ffffff'
                      : theme.colors.primary
                  }
                />
                <Text
                  style={[
                    styles.optionText,
                    preferences.housingType === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Yard Size */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="resize" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Yard Size</Text>
          </View>
          <View style={styles.optionsRow}>
            {[
              { value: 'none', label: 'No Yard' },
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCardSmall,
                  preferences.yardSize === option.value && styles.optionCardSelected,
                ]}
                onPress={() =>
                  setPreferences((prev) => ({ ...prev, yardSize: option.value as any }))
                }
              >
                <Text
                  style={[
                    styles.optionTextSmall,
                    preferences.yardSize === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Other Pets */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() =>
              setPreferences((prev) => ({ ...prev, hasOtherPets: !prev.hasOtherPets }))
            }
          >
            <View style={styles.toggleLabel}>
              <Icon name="fish" size={24} color={theme.colors.primary} />
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>I have other pets</Text>
                <Text style={styles.toggleDescription}>
                  We'll prioritize puppies good with other animals
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.toggle,
                preferences.hasOtherPets && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  preferences.hasOtherPets && styles.toggleThumbActive,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="location" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <LocationAutocompleteModal
            value={preferences.location}
            onLocationSelect={(address) => {
              console.log('Preference location selected:', address);
              setPreferences((prev) => ({ ...prev, location: address }));
            }}
            placeholder="City, State"
            error={false}
            editable={true}
          />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 4,
    flexGrow: 1,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  breedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  breedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  breedChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  breedChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  breedChipTextSelected: {
    color: '#ffffff',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  optionCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  optionCardSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  optionCardSmall: {
    flex: 1,
    minWidth: 70,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    alignItems: 'center',
  },
  optionTextSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.lg,
  },
  saveButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default DogParentPreferencesScreen;

