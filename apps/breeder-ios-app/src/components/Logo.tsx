import React from 'react';
import {
  Image,
  StyleSheet,
  ViewStyle,
  ImageStyle,
} from 'react-native';

interface LogoProps {
  size?: number;
  style?: ImageStyle;
  variant?: 'default' | 'small' | 'large';
}

const Logo: React.FC<LogoProps> = ({
  size,
  style,
  variant = 'default',
}) => {
  const getSize = (): number => {
    if (size) return size;
    
    switch (variant) {
      case 'small':
        return 32;
      case 'large':
        return 120;
      default: // default
        return 80;
    }
  };

  return (
    <Image
      source={require('../assets/logo.png')}
      style={[
        {
          width: getSize(),
          height: getSize(),
          resizeMode: 'contain',
        },
        style,
      ]}
    />
  );
};

export default Logo;
