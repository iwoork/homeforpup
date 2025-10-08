import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'medium',
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
    };

    // Variant styles
    switch (variant) {
      case 'elevated':
        baseStyle.backgroundColor = theme.colors.surfaceElevated;
        return { ...baseStyle, ...theme.shadows.lg };
      case 'outlined':
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = theme.colors.border;
        return { ...baseStyle, ...theme.shadows.sm };
      default: // default
        return { ...baseStyle, ...theme.shadows.md };
    }
  };

  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return {};
      case 'small':
        return { padding: theme.spacing.sm };
      case 'large':
        return { padding: theme.spacing.xl };
      default: // medium
        return { padding: theme.spacing.lg };
    }
  };

  const cardStyle = [getCardStyle(), getPaddingStyle(), style];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.95}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

export default Card;
