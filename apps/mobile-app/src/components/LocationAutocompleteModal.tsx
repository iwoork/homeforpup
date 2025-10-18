import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../utils/theme';

interface LocationAutocompleteModalProps {
  value: string;
  onLocationSelect: (address: string, details?: any) => void;
  placeholder?: string;
  error?: boolean;
  editable?: boolean;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

// Simpler approach - use a predefined list of US/Canadian cities or manual input
const LocationAutocompleteModal: React.FC<LocationAutocompleteModalProps> = ({
  value,
  onLocationSelect,
  placeholder = 'City, State',
  error = false,
  editable = true,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    setSearchText(value);
  }, [value]);

  // Listen to keyboard events
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Simplified city database for common locations
  const generateCityPredictions = (input: string): PlacePrediction[] => {
    if (input.length < 2) return [];

    const cities = [
      // Major US cities
      { city: 'New York', state: 'NY', country: 'US' },
      { city: 'Los Angeles', state: 'CA', country: 'US' },
      { city: 'Chicago', state: 'IL', country: 'US' },
      { city: 'Houston', state: 'TX', country: 'US' },
      { city: 'Phoenix', state: 'AZ', country: 'US' },
      { city: 'Philadelphia', state: 'PA', country: 'US' },
      { city: 'San Antonio', state: 'TX', country: 'US' },
      { city: 'San Diego', state: 'CA', country: 'US' },
      { city: 'Dallas', state: 'TX', country: 'US' },
      { city: 'San Jose', state: 'CA', country: 'US' },
      { city: 'Austin', state: 'TX', country: 'US' },
      { city: 'Jacksonville', state: 'FL', country: 'US' },
      { city: 'Fort Worth', state: 'TX', country: 'US' },
      { city: 'Columbus', state: 'OH', country: 'US' },
      { city: 'San Francisco', state: 'CA', country: 'US' },
      { city: 'Charlotte', state: 'NC', country: 'US' },
      { city: 'Indianapolis', state: 'IN', country: 'US' },
      { city: 'Seattle', state: 'WA', country: 'US' },
      { city: 'Denver', state: 'CO', country: 'US' },
      { city: 'Boston', state: 'MA', country: 'US' },
      { city: 'Nashville', state: 'TN', country: 'US' },
      { city: 'Portland', state: 'OR', country: 'US' },
      { city: 'Miami', state: 'FL', country: 'US' },
      { city: 'Atlanta', state: 'GA', country: 'US' },
      { city: 'Las Vegas', state: 'NV', country: 'US' },
      { city: 'Detroit', state: 'MI', country: 'US' },
      { city: 'Memphis', state: 'TN', country: 'US' },
      { city: 'Louisville', state: 'KY', country: 'US' },
      { city: 'Baltimore', state: 'MD', country: 'US' },
      { city: 'Milwaukee', state: 'WI', country: 'US' },
      { city: 'Albuquerque', state: 'NM', country: 'US' },
      { city: 'Tucson', state: 'AZ', country: 'US' },
      { city: 'Fresno', state: 'CA', country: 'US' },
      { city: 'Sacramento', state: 'CA', country: 'US' },
      { city: 'Kansas City', state: 'MO', country: 'US' },
      { city: 'Mesa', state: 'AZ', country: 'US' },
      { city: 'Virginia Beach', state: 'VA', country: 'US' },
      { city: 'Omaha', state: 'NE', country: 'US' },
      { city: 'Colorado Springs', state: 'CO', country: 'US' },
      { city: 'Raleigh', state: 'NC', country: 'US' },
      { city: 'Long Beach', state: 'CA', country: 'US' },
      { city: 'Oakland', state: 'CA', country: 'US' },
      { city: 'Minneapolis', state: 'MN', country: 'US' },
      { city: 'Tulsa', state: 'OK', country: 'US' },
      { city: 'Tampa', state: 'FL', country: 'US' },
      { city: 'Arlington', state: 'TX', country: 'US' },
      { city: 'New Orleans', state: 'LA', country: 'US' },
      { city: 'Cleveland', state: 'OH', country: 'US' },
      { city: 'Honolulu', state: 'HI', country: 'US' },
      { city: 'Anaheim', state: 'CA', country: 'US' },
      { city: 'Orlando', state: 'FL', country: 'US' },
      { city: 'St. Louis', state: 'MO', country: 'US' },
      { city: 'Riverside', state: 'CA', country: 'US' },
      { city: 'Pittsburgh', state: 'PA', country: 'US' },
      { city: 'Cincinnati', state: 'OH', country: 'US' },
      { city: 'Anchorage', state: 'AK', country: 'US' },
      { city: 'Stockton', state: 'CA', country: 'US' },
      { city: 'Toledo', state: 'OH', country: 'US' },
      { city: 'St. Paul', state: 'MN', country: 'US' },
      { city: 'Newark', state: 'NJ', country: 'US' },
      { city: 'Buffalo', state: 'NY', country: 'US' },
      { city: 'Fort Wayne', state: 'IN', country: 'US' },
      { city: 'Jersey City', state: 'NJ', country: 'US' },
      { city: 'Lincoln', state: 'NE', country: 'US' },
      { city: 'Madison', state: 'WI', country: 'US' },
      { city: 'Gilbert', state: 'AZ', country: 'US' },
      { city: 'Glendale', state: 'AZ', country: 'US' },
      { city: 'Scottsdale', state: 'AZ', country: 'US' },
      { city: 'Chandler', state: 'AZ', country: 'US' },
      { city: 'Boise', state: 'ID', country: 'US' },
      { city: 'Salt Lake City', state: 'UT', country: 'US' },
      { city: 'Spokane', state: 'WA', country: 'US' },
      { city: 'Richmond', state: 'VA', country: 'US' },
      { city: 'Des Moines', state: 'IA', country: 'US' },
      // Canadian cities
      { city: 'Toronto', state: 'ON', country: 'CA' },
      { city: 'Vancouver', state: 'BC', country: 'CA' },
      { city: 'Montreal', state: 'QC', country: 'CA' },
      { city: 'Calgary', state: 'AB', country: 'CA' },
      { city: 'Edmonton', state: 'AB', country: 'CA' },
      { city: 'Ottawa', state: 'ON', country: 'CA' },
      { city: 'Winnipeg', state: 'MB', country: 'CA' },
      { city: 'Quebec City', state: 'QC', country: 'CA' },
      { city: 'Hamilton', state: 'ON', country: 'CA' },
      { city: 'Kitchener', state: 'ON', country: 'CA' },
      { city: 'London', state: 'ON', country: 'CA' },
      { city: 'Victoria', state: 'BC', country: 'CA' },
      { city: 'Halifax', state: 'NS', country: 'CA' },
      { city: 'Oshawa', state: 'ON', country: 'CA' },
      { city: 'Windsor', state: 'ON', country: 'CA' },
      { city: 'Saskatoon', state: 'SK', country: 'CA' },
      { city: 'Regina', state: 'SK', country: 'CA' },
      { city: 'St. John\'s', state: 'NL', country: 'CA' },
    ];

    const searchLower = input.toLowerCase();
    const matches = cities.filter(
      (location) =>
        location.city.toLowerCase().includes(searchLower) ||
        location.state.toLowerCase().includes(searchLower)
    );

    return matches.slice(0, 10).map((location, index) => ({
      place_id: `${location.city}-${location.state}-${index}`,
      description: `${location.city}, ${location.state}${location.country === 'CA' ? ', Canada' : ''}`,
      structured_formatting: {
        main_text: location.city,
        secondary_text: `${location.state}${location.country === 'CA' ? ', Canada' : ', United States'}`,
      },
    }));
  };

  const fetchPredictions = async (input: string) => {
    if (input.length < 2) {
      setPredictions([]);
      setManualEntry(false);
      return;
    }

    setLoading(true);
    
    // Use local city database
    const localPredictions = generateCityPredictions(input);
    setPredictions(localPredictions);
    
    // Allow manual entry option if no exact matches
    if (localPredictions.length === 0) {
      setManualEntry(true);
    } else {
      setManualEntry(false);
    }
    
    setLoading(false);
  };

  const handleOpenModal = () => {
    if (editable) {
      setSearchText(value);
      setIsModalVisible(true);
      if (value) {
        fetchPredictions(value);
      }
    }
  };

  const handleSelectLocation = (prediction: PlacePrediction) => {
    const formattedAddress = prediction.description;
    
    // Update the form value
    onLocationSelect(formattedAddress, null);
    
    // Close modal and cleanup
    setIsModalVisible(false);
    setPredictions([]);
    setManualEntry(false);
    
    // Dismiss keyboard
    setTimeout(() => {
      Keyboard.dismiss();
    }, 100);
  };

  const handleManualEntry = () => {
    if (searchText.trim()) {
      // Dismiss keyboard first
      Keyboard.dismiss();
      
      // Update the form value
      onLocationSelect(searchText.trim(), null);
      
      // Close modal and cleanup
      setIsModalVisible(false);
      setPredictions([]);
      setManualEntry(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    fetchPredictions(text);
  };

  const handleCancel = () => {
    // Dismiss keyboard
    Keyboard.dismiss();
    
    // Reset to original value and close
    setSearchText(value);
    setIsModalVisible(false);
    setPredictions([]);
    setManualEntry(false);
  };

  return (
    <>
      {/* Input Field */}
      <TouchableOpacity
        style={[
          styles.container,
          error && styles.containerError,
          !editable && styles.containerDisabled,
        ]}
        onPress={handleOpenModal}
        activeOpacity={editable ? 0.7 : 1}
      >
        <Icon
          name="location"
          size={20}
          color={!editable ? theme.colors.textTertiary : theme.colors.textSecondary}
          style={styles.icon}
        />
        <Text
          style={[
            styles.valueText,
            !value && styles.placeholderText,
            !editable && styles.disabledText,
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        {editable && (
          <Icon
            name="chevron-down"
            size={20}
            color={theme.colors.textSecondary}
          />
        )}
      </TouchableOpacity>

      {/* Modal with Suggestions */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
        presentationStyle="overFullScreen"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.overlayTouchable}
            activeOpacity={1} 
            onPress={handleCancel}
          />
          <View style={[
            styles.modalContent,
            keyboardHeight > 0 && {
              marginBottom: keyboardHeight,
              maxHeight: Dimensions.get('window').height - keyboardHeight - 100,
            }
          ]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={handleSearchChange}
                placeholder="Type city name..."
                placeholderTextColor={theme.colors.textSecondary}
                autoFocus
                autoCorrect={false}
              />
              {loading && <ActivityIndicator size="small" color={theme.colors.primary} />}
            </View>

            {/* Suggestions List */}
            <FlatList
              data={predictions}
              keyExtractor={(item) => item.place_id}
              keyboardShouldPersistTaps="always"
              scrollEnabled={true}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.predictionItem}
                  onPress={() => handleSelectLocation(item)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name="location-outline"
                    size={20}
                    color={theme.colors.primary}
                    style={styles.predictionIcon}
                  />
                  <View style={styles.predictionTextContainer}>
                    <Text style={styles.predictionMainText}>
                      {item.structured_formatting.main_text}
                    </Text>
                    <Text style={styles.predictionSecondaryText}>
                      {item.structured_formatting.secondary_text}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="search" size={48} color={theme.colors.textTertiary} />
                  <Text style={styles.emptyText}>
                    {searchText.length < 2
                      ? 'Type at least 2 characters to search'
                      : loading
                      ? 'Searching...'
                      : 'No matches in common cities'}
                  </Text>
                  {manualEntry && searchText.length >= 2 && (
                    <TouchableOpacity
                      style={styles.manualEntryButton}
                      onPress={handleManualEntry}
                    >
                      <Icon name="create" size={20} color="#ffffff" />
                      <Text style={styles.manualEntryText}>
                        Use "{searchText}" as location
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              }
              contentContainerStyle={styles.listContent}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  containerError: {
    borderColor: theme.colors.error,
  },
  containerDisabled: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderColor: theme.colors.borderLight,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  valueText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 9999,
    elevation: 9999,
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : theme.spacing.lg,
    zIndex: 10000,
    elevation: 10000,
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
  closeButton: {
    padding: theme.spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
    marginLeft: theme.spacing.sm,
  },
  listContent: {
    flexGrow: 1,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  predictionIcon: {
    marginRight: theme.spacing.md,
  },
  predictionTextContainer: {
    flex: 1,
  },
  predictionMainText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  predictionSecondaryText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  manualEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  manualEntryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default LocationAutocompleteModal;

