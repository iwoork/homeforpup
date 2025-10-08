import { Theme } from '../types';

export const theme: Theme = {
  colors: {
    // Primary colors
    primary: '#2563eb', // Modern blue
    primaryLight: '#60a5fa',
    primaryDark: '#1e40af',
    secondary: '#10b981', // Fresh green
    secondaryLight: '#34d399',
    secondaryDark: '#059669',
    
    // Background colors
    background: '#f8fafc', // Soft gray background
    backgroundSecondary: '#f1f5f9',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    
    // Text colors
    text: '#1e293b', // Deep slate
    textSecondary: '#64748b', // Muted slate
    textTertiary: '#94a3b8',
    textInverse: '#ffffff',
    
    // Status colors
    error: '#ef4444', // Vibrant red
    errorLight: '#fca5a5',
    success: '#10b981', // Fresh green
    successLight: '#6ee7b7',
    warning: '#f59e0b', // Warm amber
    warningLight: '#fbbf24',
    info: '#3b82f6',
    infoLight: '#93c5fd',
    
    // Border and divider colors
    border: '#e2e8f0', // Subtle border
    borderLight: '#f1f5f9',
    divider: '#e2e8f0',
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.2)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  borderRadius: {
    xs: 4,
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
    },
  },
};

export const darkTheme: Theme = {
  colors: {
    // Primary colors
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryDark: '#2563eb',
    secondary: '#10b981',
    secondaryLight: '#34d399',
    secondaryDark: '#059669',
    
    // Background colors
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    surface: '#1e293b',
    surfaceElevated: '#334155',
    
    // Text colors
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    textInverse: '#0f172a',
    
    // Status colors
    error: '#ef4444',
    errorLight: '#fca5a5',
    success: '#10b981',
    successLight: '#6ee7b7',
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    info: '#3b82f6',
    infoLight: '#93c5fd',
    
    // Border and divider colors
    border: '#334155',
    borderLight: '#475569',
    divider: '#334155',
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.4)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  borderRadius: {
    xs: 4,
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
    },
  },
};
