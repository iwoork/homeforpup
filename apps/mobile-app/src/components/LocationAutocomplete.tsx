import React, { useRef } from 'react';
import { View, StyleSheet, TextInput as RNTextInput, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../utils/theme';

interface LocationAutocompleteProps {
  value: string;
  onLocationSelect: (address: string, details?: any) => void;
  placeholder?: string;
  error?: boolean;
  editable?: boolean;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onLocationSelect,
  placeholder = 'City, State',
  error = false,
  editable = true,
}) => {
  const ref = useRef<any>(null);

  // Set initial text when value changes
  React.useEffect(() => {
    if (ref.current && value) {
      ref.current.setAddressText(value);
    }
  }, []);

  return (
    <View style={[
      styles.container,
      error && styles.containerError,
      !editable && styles.containerDisabled
    ]}>
      <Icon
        name="location"
        size={20}
        color={!editable ? theme.colors.textTertiary : theme.colors.textSecondary}
        style={styles.icon}
      />
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder={placeholder}
        enablePoweredByContainer={false}
        fetchDetails={true}
        onPress={(data, details = null) => {
          // Extract city and state from the address components
          let city = '';
          let state = '';
          let country = '';

          if (details?.address_components) {
            details.address_components.forEach((component: any) => {
              if (component.types.includes('locality')) {
                city = component.long_name;
              }
              if (component.types.includes('administrative_area_level_1')) {
                state = component.short_name;
              }
              if (component.types.includes('country')) {
                country = component.short_name;
              }
            });
          }

          // Format the address as "City, State" or use the full formatted address
          const formattedAddress = city && state 
            ? `${city}, ${state}${country && country !== 'US' ? ', ' + country : ''}`
            : data.description;

          onLocationSelect(formattedAddress, details);
        }}
        query={{
          key: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
          language: 'en',
          types: '(cities)',
        }}
        styles={{
          textInputContainer: styles.textInputContainer,
          textInput: [
            styles.textInput,
            !editable && styles.textInputDisabled
          ],
          listView: styles.listView,
          row: styles.row,
          description: styles.description,
          predefinedPlacesDescription: styles.predefinedPlacesDescription,
        }}
        textInputProps={{
          placeholderTextColor: theme.colors.textSecondary,
          editable: editable,
          defaultValue: value,
        }}
        debounce={300}
        minLength={2}
        nearbyPlacesAPI="GooglePlacesSearch"
        GooglePlacesSearchQuery={{
          rankby: 'distance',
        }}
        filterReverseGeocodingByTypes={[
          'locality',
          'administrative_area_level_1',
        ]}
        listViewDisplayed="auto"
        keyboardShouldPersistTaps="handled"
        renderRow={(data: any) => (
          <View style={styles.suggestionRow}>
            <Icon name="location-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.suggestionText}>{data.description}</Text>
          </View>
        )}
      />
    </View>
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
    position: 'relative',
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
    zIndex: 1,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'transparent',
    marginTop: 0,
    marginBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  textInputDisabled: {
    color: theme.colors.textSecondary,
  },
  listView: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: 250,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  description: {
    fontSize: 15,
    color: theme.colors.text,
  },
  predefinedPlacesDescription: {
    color: theme.colors.primary,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
  },
});

export default LocationAutocomplete;

