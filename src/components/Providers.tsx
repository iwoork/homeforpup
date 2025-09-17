'use client';

import React, { useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';
import { AuthProvider as OidcAuthProvider } from 'react-oidc-context';
import { cognitoAuthConfig } from '@/lib/auth-config';
import { Alert, Spin } from 'antd';

interface ProvidersProps {
  children: React.ReactNode;
}

const theme = {
  token: {
    colorPrimary: '#08979C',
    colorSuccess: '#52C41A',
    colorWarning: '#FAAD14',
    colorError: '#F5222D',
    colorInfo: '#1890FF',
    borderRadius: 8,
  },
  components: {
    Layout: {
      bodyBg: '#fafafa',
      headerBg: '#ffffff',
    },
    Card: {
      borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    Button: {
      borderRadius: 6,
    },
  },
};

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure we're on the client side
    setMounted(true);
    
    // Validate auth configuration
    if (!cognitoAuthConfig.authority || !cognitoAuthConfig.client_id) {
      setConfigError('Missing required authentication configuration.');
      return;
    }
    
    console.log('Auth config:', {
      authority: cognitoAuthConfig.authority,
      client_id: cognitoAuthConfig.client_id ? 'Set' : 'Not set',
      redirect_uri: cognitoAuthConfig.redirect_uri
    });
    
    setConfigError(null);
  }, []);

  if (!mounted) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <div>Loading...</div>
      </div>
    );
  }

  if (configError) {
    return (
      <ConfigProvider theme={theme}>
        <div style={{ padding: '20px' }}>
          <Alert
            message="Configuration Error"
            description={configError}
            type="error"
            showIcon
          />
          {children}
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={theme}>
      <OidcAuthProvider {...cognitoAuthConfig}>
        {children}
      </OidcAuthProvider>
    </ConfigProvider>
  );
};