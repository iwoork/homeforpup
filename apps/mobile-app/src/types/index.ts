// Re-export shared types
export * from '@homeforpup/shared-types';

// App-specific types
export interface AppState {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface ScreenProps extends NavigationProps {
  // Add any screen-specific props here
}

// Theme types
export interface Theme {
  colors: {
    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    
    // Background colors
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceElevated: string;
    
    // Text colors
    text: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    
    // Status colors
    error: string;
    errorLight: string;
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    info: string;
    infoLight: string;
    
    // Border and divider colors
    border: string;
    borderLight: string;
    divider: string;
    
    // Overlay colors
    overlay: string;
    overlayLight: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  borderRadius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    full: number;
  };
  shadows: {
    sm: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    md: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    lg: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    xl: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: '700' | '600' | '400' | 'bold' | 'normal';
      lineHeight: number;
    };
    h2: {
      fontSize: number;
      fontWeight: '700' | '600' | '400' | 'bold' | 'normal';
      lineHeight: number;
    };
    h3: {
      fontSize: number;
      fontWeight: '700' | '600' | '400' | 'bold' | 'normal';
      lineHeight: number;
    };
    h4: {
      fontSize: number;
      fontWeight: '700' | '600' | '400' | 'bold' | 'normal';
      lineHeight: number;
    };
    h5: {
      fontSize: number;
      fontWeight: '700' | '600' | '400' | 'bold' | 'normal';
      lineHeight: number;
    };
    h6: {
      fontSize: number;
      fontWeight: '700' | '600' | '400' | 'bold' | 'normal';
      lineHeight: number;
    };
    body: {
      fontSize: number;
      fontWeight: '700' | '600' | '400' | 'bold' | 'normal';
      lineHeight: number;
    };
    bodySmall: {
      fontSize: number;
      fontWeight: '700' | '600' | '400' | 'bold' | 'normal';
      lineHeight: number;
    };
    caption: {
      fontSize: number;
      fontWeight: '700' | '600' | '400' | 'bold' | 'normal';
      lineHeight: number;
    };
    button: {
      fontSize: number;
      fontWeight: '700' | '600' | '400' | 'bold' | 'normal';
      lineHeight: number;
    };
  };
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'multiselect' | 'textarea' | 'date' | 'image';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormData {
  [key: string]: any;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

