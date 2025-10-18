import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../utils/theme';
import LocationAutocompleteModal from './LocationAutocompleteModal';

interface LocationInputProps {
  label?: string;
  value: string;
  onLocationSelect: (address: string, details?: any) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  editable?: boolean;
  style?: any;
}

const LocationInput: React.FC<LocationInputProps> = ({
  label,
  value,
  onLocationSelect,
  placeholder = 'Search for your location',
  error,
  required = false,
  editable = true,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}
      
      <LocationAutocompleteModal
        value={value}
        onLocationSelect={onLocationSelect}
        placeholder={placeholder}
        error={!!error}
        editable={editable}
      />
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  labelContainer: {
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '600',
  },
  required: {
    color: theme.colors.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  errorIcon: {
    fontSize: 14,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginLeft: theme.spacing.xs,
  },
});

export default LocationInput;
