import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../utils/theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  disabled?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  multiline = false,
  numberOfLines = 1,
  error,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    return {
      borderWidth: 1,
      borderColor: error
        ? theme.colors.error
        : isFocused
        ? theme.colors.primary
        : theme.colors.border,
      borderRadius: theme.borderRadius.md,
      backgroundColor: disabled ? theme.colors.backgroundSecondary : theme.colors.surface,
      flexDirection: 'row',
      alignItems: multiline ? 'flex-start' : 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: multiline ? theme.spacing.md : theme.spacing.sm,
      minHeight: multiline ? 80 : 48,
    };
  };

  const getInputStyle = (): TextStyle => {
    return {
      flex: 1,
      color: disabled ? theme.colors.textTertiary : theme.colors.text,
      ...theme.typography.body,
      textAlignVertical: multiline ? 'top' : 'center',
    };
  };

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
      
      <View style={getContainerStyle()}>
        {leftIcon && (
          <Text
            style={[
              styles.leftIcon,
              { color: isFocused ? theme.colors.primary : theme.colors.textSecondary },
            ]}
          >
            {leftIcon}
          </Text>
        )}
        
        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            <Text
              style={[
                styles.rightIconText,
                { color: isFocused ? theme.colors.primary : theme.colors.textSecondary },
              ]}
            >
              {rightIcon}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
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
  leftIcon: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  rightIconText: {
    fontSize: 18,
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

export default Input;
