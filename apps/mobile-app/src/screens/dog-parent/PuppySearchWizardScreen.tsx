import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import CountrySelector from '../../components/CountrySelector';
import BreedSelectorModal from '../../components/BreedSelectorModal';

const { width } = Dimensions.get('window');

// Available dog breeds
const AVAILABLE_BREEDS = [
  { id: '1', name: 'Golden Retriever', image: 'https://homeforpup.com/breeds/golden-retriever.jpg' },
  { id: '2', name: 'Labrador Retriever', image: 'https://homeforpup.com/breeds/labrador-retriever.jpg' },
  { id: '3', name: 'German Shepherd', image: 'https://homeforpup.com/breeds/german-shepherd.jpg' },
  { id: '4', name: 'French Bulldog', image: 'https://homeforpup.com/breeds/french-bulldog.jpg' },
  { id: '5', name: 'Bulldog', image: 'https://homeforpup.com/breeds/bulldog.jpg' },
  { id: '6', name: 'Poodle', image: 'https://homeforpup.com/breeds/poodle.jpg' },
  { id: '7', name: 'Beagle', image: 'https://homeforpup.com/breeds/beagle.jpg' },
  { id: '8', name: 'Rottweiler', image: 'https://homeforpup.com/breeds/rottweiler.jpg' },
  { id: '9', name: 'German Shorthaired Pointer', image: 'https://homeforpup.com/breeds/german-shorthaired-pointer.jpg' },
  { id: '10', name: 'Siberian Husky', image: 'https://homeforpup.com/breeds/siberian-husky.jpg' },
  { id: '11', name: 'Border Collie', image: 'https://homeforpup.com/breeds/border-collie.jpg' },
  { id: '12', name: 'Australian Shepherd', image: 'https://homeforpup.com/breeds/australian-shepherd.jpg' },
  { id: '13', name: 'Yorkshire Terrier', image: 'https://homeforpup.com/breeds/yorkshire-terrier.jpg' },
  { id: '14', name: 'Boston Terrier', image: 'https://homeforpup.com/breeds/boston-terrier.jpg' },
  { id: '15', name: 'Dachshund', image: 'https://homeforpup.com/breeds/dachshund.jpg' },
  { id: '16', name: 'Boxer', image: 'https://homeforpup.com/breeds/boxer.jpg' },
  { id: '17', name: 'Great Dane', image: 'https://homeforpup.com/breeds/great-dane.jpg' },
  { id: '18', name: 'Chihuahua', image: 'https://homeforpup.com/breeds/chihuahua.jpg' },
  { id: '19', name: 'Shih Tzu', image: 'https://homeforpup.com/breeds/shih-tzu.jpg' },
  { id: '20', name: 'Maltese', image: 'https://homeforpup.com/breeds/maltese.jpg' },
  { id: '21', name: 'Cocker Spaniel', image: 'https://homeforpup.com/breeds/cocker-spaniel.jpg' },
  { id: '22', name: 'Jack Russell Terrier', image: 'https://homeforpup.com/breeds/jack-russell-terrier.jpg' },
  { id: '23', name: 'Pomeranian', image: 'https://homeforpup.com/breeds/pomeranian.jpg' },
  { id: '24', name: 'Cavalier King Charles Spaniel', image: 'https://homeforpup.com/breeds/cavalier-king-charles-spaniel.jpg' },
  { id: '25', name: 'Shetland Sheepdog', image: 'https://homeforpup.com/breeds/shetland-sheepdog.jpg' },
  { id: '26', name: 'Doberman Pinscher', image: 'https://homeforpup.com/breeds/doberman-pinscher.jpg' },
  { id: '27', name: 'Weimaraner', image: 'https://homeforpup.com/breeds/weimaraner.jpg' },
  { id: '28', name: 'Mastiff', image: 'https://homeforpup.com/breeds/mastiff.jpg' },
  { id: '29', name: 'Saint Bernard', image: 'https://homeforpup.com/breeds/saint-bernard.jpg' },
  { id: '30', name: 'Basset Hound', image: 'https://homeforpup.com/breeds/basset-hound.jpg' },
];

interface SearchCriteria {
  breeds: string[];
  gender: string | null;
  ageRange: [number, number];
  size: string[];
  activityLevel: string;
  livingSpace: string;
  familySize: string;
  childrenAges: string[];
  experienceLevel: string;
  country: string;
  state: string[];
  maxDistance: number;
  shipping: boolean;
  verifiedOnly: boolean;
  minRating: number;
  minExperience: number;
  budgetRange: [number, number];
  timeline: string;
}

const PuppySearchWizardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [criteria, setCriteria] = useState<SearchCriteria>({
    breeds: [],
    gender: null,
    ageRange: [8, 16],
    size: [],
    activityLevel: '',
    livingSpace: '',
    familySize: '',
    childrenAges: [],
    experienceLevel: '',
    country: '+1',
    state: [],
    maxDistance: 100,
    shipping: false,
    verifiedOnly: false,
    minRating: 0,
    minExperience: 0,
    budgetRange: [1000, 5000],
    timeline: '',
  });


  const steps = [
    {
      key: 'breed-preference',
      title: 'Breed & Basic Info',
      description: 'Tell us about your ideal puppy',
      icon: 'heart-outline',
    },
    {
      key: 'lifestyle',
      title: 'Lifestyle & Family',
      description: 'Help us understand your home',
      icon: 'home-outline',
    },
    {
      key: 'location',
      title: 'Location & Travel',
      description: 'Where are you looking?',
      icon: 'location-outline',
    },
    {
      key: 'breeder-preferences',
      title: 'Breeder Standards',
      description: 'What matters most?',
      icon: 'shield-checkmark-outline',
    },
    {
      key: 'budget-timeline',
      title: 'Budget & Timeline',
      description: 'Plan your investment',
      icon: 'checkmark-circle-outline',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete wizard and navigate to search results
      navigation.navigate('SearchPuppies' as never, { criteria } as never);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBreedSelection = (breeds: string[]) => {
    setCriteria({ ...criteria, breeds });
  };

  const renderBreedPreferenceStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>What type of puppy are you looking for?</Text>
      <Text style={styles.stepDescription}>
        This helps us match you with the right breeders and puppies.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Preferred Breeds</Text>
        <BreedSelectorModal
          selectedBreeds={criteria.breeds}
          onBreedsChange={handleBreedSelection}
          availableBreeds={AVAILABLE_BREEDS}
          placeholder="Select preferred breeds"
          multiSelect={true}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Gender Preference</Text>
        <View style={styles.radioGroup}>
          {['Male', 'Female', 'No Preference'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioOption,
                criteria.gender === option.toLowerCase().replace(' ', '') && styles.radioOptionSelected
              ]}
              onPress={() => setCriteria({ 
                ...criteria, 
                gender: option === 'No Preference' ? null : option.toLowerCase().replace(' ', '')
              })}
            >
              <View style={[
                styles.radioCircle,
                criteria.gender === option.toLowerCase().replace(' ', '') && styles.radioCircleSelected
              ]} />
              <Text style={[
                styles.radioText,
                criteria.gender === option.toLowerCase().replace(' ', '') && styles.radioTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Preferred Age Range: {criteria.ageRange[0]}-{criteria.ageRange[1]} weeks</Text>
        <View style={styles.ageRangeContainer}>
          <Text style={styles.ageRangeLabel}>6 weeks</Text>
          <View style={styles.ageRangeSlider}>
            <View style={[
              styles.ageRangeTrack,
              { 
                left: `${((criteria.ageRange[0] - 6) / 14) * 100}%`,
                width: `${((criteria.ageRange[1] - criteria.ageRange[0]) / 14) * 100}%`
              }
            ]} />
            <TouchableOpacity
              style={[styles.ageRangeThumb, { left: `${((criteria.ageRange[0] - 6) / 14) * 100}%` }]}
              onPress={() => {/* Implement slider logic */}}
            />
            <TouchableOpacity
              style={[styles.ageRangeThumb, { left: `${((criteria.ageRange[1] - 6) / 14) * 100}%` }]}
              onPress={() => {/* Implement slider logic */}}
            />
          </View>
          <Text style={styles.ageRangeLabel}>20 weeks</Text>
        </View>
      </View>
    </View>
  );

  const renderLifestyleStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Tell us about your lifestyle and family</Text>
      <Text style={styles.stepDescription}>
        This information helps us ensure the puppy will be a great fit for your home.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Your Activity Level</Text>
        <View style={styles.radioGroup}>
          {[
            { value: 'low', label: 'Low - I prefer calm, relaxed activities' },
            { value: 'moderate', label: 'Moderate - I enjoy regular walks and play' },
            { value: 'high', label: 'High - I love hiking, running, and adventures' }
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.radioOption,
                criteria.activityLevel === option.value && styles.radioOptionSelected
              ]}
              onPress={() => setCriteria({ ...criteria, activityLevel: option.value })}
            >
              <View style={[
                styles.radioCircle,
                criteria.activityLevel === option.value && styles.radioCircleSelected
              ]} />
              <Text style={[
                styles.radioText,
                criteria.activityLevel === option.value && styles.radioTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Living Space</Text>
        <View style={styles.radioGroup}>
          {[
            { value: 'apartment', label: 'Apartment or Condo' },
            { value: 'house-small', label: 'Small House (under 1500 sq ft)' },
            { value: 'house-medium', label: 'Medium House (1500-2500 sq ft)' },
            { value: 'house-large', label: 'Large House (over 2500 sq ft)' }
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.radioOption,
                criteria.livingSpace === option.value && styles.radioOptionSelected
              ]}
              onPress={() => setCriteria({ ...criteria, livingSpace: option.value })}
            >
              <View style={[
                styles.radioCircle,
                criteria.livingSpace === option.value && styles.radioCircleSelected
              ]} />
              <Text style={[
                styles.radioText,
                criteria.livingSpace === option.value && styles.radioTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Family Size</Text>
        <View style={styles.radioGroup}>
          {[
            { value: 'single', label: 'Just me' },
            { value: 'couple', label: 'Couple' },
            { value: 'small-family', label: 'Small family (3-4 people)' },
            { value: 'large-family', label: 'Large family (5+ people)' }
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.radioOption,
                criteria.familySize === option.value && styles.radioOptionSelected
              ]}
              onPress={() => setCriteria({ ...criteria, familySize: option.value })}
            >
              <View style={[
                styles.radioCircle,
                criteria.familySize === option.value && styles.radioCircleSelected
              ]} />
              <Text style={[
                styles.radioText,
                criteria.familySize === option.value && styles.radioTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderLocationStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Location and travel preferences</Text>
      <Text style={styles.stepDescription}>
        Help us find breeders in your area or determine if shipping is needed.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Country</Text>
        <CountrySelector
          value={criteria.country}
          onCountrySelect={(country) => setCriteria({ ...criteria, country: country.dialCode })}
          style={styles.countrySelector}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Maximum Travel Distance: {criteria.maxDistance} miles</Text>
        <View style={styles.distanceSlider}>
          <View style={[
            styles.distanceTrack,
            { width: `${(criteria.maxDistance / 500) * 100}%` }
          ]} />
          <TouchableOpacity
            style={[styles.distanceThumb, { left: `${(criteria.maxDistance / 500) * 100}%` }]}
            onPress={() => {/* Implement slider logic */}}
          />
        </View>
        <View style={styles.distanceLabels}>
          <Text style={styles.distanceLabel}>0 miles</Text>
          <Text style={styles.distanceLabel}>500+ miles</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <TouchableOpacity
          style={[
            styles.checkboxOption,
            criteria.shipping && styles.checkboxOptionSelected
          ]}
          onPress={() => setCriteria({ ...criteria, shipping: !criteria.shipping })}
        >
          <View style={[
            styles.checkbox,
            criteria.shipping && styles.checkboxSelected
          ]}>
            {criteria.shipping && <Icon name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={[
            styles.checkboxText,
            criteria.shipping && styles.checkboxTextSelected
          ]}>
            I'm open to shipping options (additional cost may apply)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBreederPreferencesStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Breeder quality and standards</Text>
      <Text style={styles.stepDescription}>
        These preferences help us connect you with ethical, responsible breeders.
      </Text>

      <View style={styles.inputGroup}>
        <TouchableOpacity
          style={[
            styles.checkboxOption,
            criteria.verifiedOnly && styles.checkboxOptionSelected
          ]}
          onPress={() => setCriteria({ ...criteria, verifiedOnly: !criteria.verifiedOnly })}
        >
          <View style={[
            styles.checkbox,
            criteria.verifiedOnly && styles.checkboxSelected
          ]}>
            {criteria.verifiedOnly && <Icon name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={[
            styles.checkboxText,
            criteria.verifiedOnly && styles.checkboxTextSelected
          ]}>
            Show only verified breeders (recommended)
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Minimum Breeder Rating: {criteria.minRating} stars</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setCriteria({ ...criteria, minRating: star })}
            >
              <Icon
                name={star <= criteria.minRating ? 'star' : 'star-outline'}
                size={32}
                color={star <= criteria.minRating ? '#fbbf24' : '#d1d5db'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Minimum Experience: {criteria.minExperience} years</Text>
        <View style={styles.experienceSlider}>
          <View style={[
            styles.experienceTrack,
            { width: `${(criteria.minExperience / 20) * 100}%` }
          ]} />
          <TouchableOpacity
            style={[styles.experienceThumb, { left: `${(criteria.minExperience / 20) * 100}%` }]}
            onPress={() => {/* Implement slider logic */}}
          />
        </View>
        <View style={styles.experienceLabels}>
          <Text style={styles.experienceLabel}>0 years</Text>
          <Text style={styles.experienceLabel}>20+ years</Text>
        </View>
      </View>
    </View>
  );

  const renderBudgetTimelineStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Budget and timeline considerations</Text>
      <Text style={styles.stepDescription}>
        Understanding costs and timing helps set realistic expectations.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Budget Range: ${criteria.budgetRange[0]} - ${criteria.budgetRange[1]}
        </Text>
        <View style={styles.budgetSlider}>
          <View style={[
            styles.budgetTrack,
            { 
              left: `${((criteria.budgetRange[0] - 500) / 9500) * 100}%`,
              width: `${((criteria.budgetRange[1] - criteria.budgetRange[0]) / 9500) * 100}%`
            }
          ]} />
          <TouchableOpacity
            style={[styles.budgetThumb, { left: `${((criteria.budgetRange[0] - 500) / 9500) * 100}%` }]}
            onPress={() => {/* Implement slider logic */}}
          />
          <TouchableOpacity
            style={[styles.budgetThumb, { left: `${((criteria.budgetRange[1] - 500) / 9500) * 100}%` }]}
            onPress={() => {/* Implement slider logic */}}
          />
        </View>
        <View style={styles.budgetLabels}>
          <Text style={styles.budgetLabel}>$500</Text>
          <Text style={styles.budgetLabel}>$10,000+</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>When do you want to bring home a puppy?</Text>
        <View style={styles.radioGroup}>
          {[
            { value: 'asap', label: 'As soon as possible' },
            { value: '1-3-months', label: 'Within 1-3 months' },
            { value: '3-6-months', label: 'Within 3-6 months' },
            { value: '6-12-months', label: 'Within 6-12 months' },
            { value: 'flexible', label: "I'm flexible on timing" }
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.radioOption,
                criteria.timeline === option.value && styles.radioOptionSelected
              ]}
              onPress={() => setCriteria({ ...criteria, timeline: option.value })}
            >
              <View style={[
                styles.radioCircle,
                criteria.timeline === option.value && styles.radioCircleSelected
              ]} />
              <Text style={[
                styles.radioText,
                criteria.timeline === option.value && styles.radioTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderBreedPreferenceStep();
      case 1:
        return renderLifestyleStep();
      case 2:
        return renderLocationStep();
      case 3:
        return renderBreederPreferencesStep();
      case 4:
        return renderBudgetTimelineStep();
      default:
        return renderBreedPreferenceStep();
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {steps.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepIconContainer}>
              <Icon name={steps[currentStep].icon} size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
              <Text style={styles.stepDescription}>{steps[currentStep].description}</Text>
            </View>
          </View>

          {renderCurrentStep()}
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <Button
              title="Previous"
              onPress={handlePrevious}
              variant="outline"
              style={styles.previousButton}
            />
          )}
          <Button
            title={currentStep === steps.length - 1 ? 'Start Search' : 'Next'}
            onPress={handleNext}
            style={styles.nextButton}
            icon={currentStep === steps.length - 1 ? 'search' : 'chevron-forward'}
          />
        </View>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  progressContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  stepCard: {
    marginBottom: theme.spacing.lg,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  stepIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  stepDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  stepContent: {
    // Content styles are defined in individual step renderers
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  radioGroup: {
    gap: theme.spacing.sm,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  radioOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  radioCircleSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  radioText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  radioTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  ageRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  ageRangeLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    width: 60,
    textAlign: 'center',
  },
  ageRangeSlider: {
    flex: 1,
    height: 20,
    marginHorizontal: theme.spacing.sm,
    position: 'relative',
  },
  ageRangeTrack: {
    position: 'absolute',
    top: 8,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  ageRangeThumb: {
    position: 'absolute',
    top: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
  },
  countrySelector: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  distanceSlider: {
    height: 20,
    marginVertical: theme.spacing.sm,
    position: 'relative',
  },
  distanceTrack: {
    position: 'absolute',
    top: 8,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  distanceThumb: {
    position: 'absolute',
    top: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
  },
  distanceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distanceLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checkboxOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  checkboxText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  checkboxTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  experienceSlider: {
    height: 20,
    marginVertical: theme.spacing.sm,
    position: 'relative',
  },
  experienceTrack: {
    position: 'absolute',
    top: 8,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  experienceThumb: {
    position: 'absolute',
    top: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
  },
  experienceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  experienceLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  budgetSlider: {
    height: 20,
    marginVertical: theme.spacing.sm,
    position: 'relative',
  },
  budgetTrack: {
    position: 'absolute',
    top: 8,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  budgetThumb: {
    position: 'absolute',
    top: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
  },
  budgetLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  previousButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});

export default PuppySearchWizardScreen;
