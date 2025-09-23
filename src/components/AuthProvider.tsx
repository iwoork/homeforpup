'use client';

import React, { useEffect, useState } from 'react';
import { AuthProvider as OidcAuthProvider } from 'react-oidc-context';
import { cognitoAuthConfig } from '@/lib';
import { Alert, Spin } from 'antd';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [configReady, setConfigReady] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for client-side hydration and check config
    const checkConfig = () => {
      try {
        if (!cognitoAuthConfig.authority || !cognitoAuthConfig.client_id) {
          setConfigError('Missing required environment variables for authentication. Please check your .env.local file.');
          return;
        }
        
        if (!cognitoAuthConfig.authority.includes('cognito-idp')) {
          setConfigError('Invalid authority URL in authentication configuration.');
          return;
        }
        
        setConfigError(null);
        setConfigReady(true);
      } catch (error) {
        setConfigError('Failed to initialize authentication configuration. Error: ' + error);
      }
    };

    // Small delay to ensure client-side hydration is complete
    const timer = setTimeout(checkConfig, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!configReady && !configError) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px' 
      }}>
        <Spin size="large" tip="Initializing authentication..." />
      </div>
    );
  }

  if (configError) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          message="Authentication Configuration Error"
          description={configError}
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
        />
        {children}
      </div>
    );
  }

  return (
    <OidcAuthProvider {...cognitoAuthConfig}>
      {children}
    </OidcAuthProvider>
  );
};