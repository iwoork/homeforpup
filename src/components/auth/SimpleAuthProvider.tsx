// components/auth/SimpleAuthProvider.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useHostedAuth } from '@/hooks/auth/useHostedAuth';

interface AuthContextType {
  // State
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Auth methods
  login: () => void;
  signUp: () => void;
  logout: () => void;
  handleCallback: (code: string) => Promise<boolean>;
  
  // Utility methods
  getToken: () => string | null;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface SimpleAuthProviderProps {
  children: ReactNode;
}

export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({ children }) => {
  const auth = useHostedAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SimpleAuthProvider');
  }
  return context;
};
