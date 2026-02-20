'use client';

import React, { useEffect, useState } from 'react';
import { ConfigProvider, message, App } from 'antd';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '@homeforpup/shared-auth';

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

  useEffect(() => {
    // Ensure we're on the client side
    setMounted(true);

    // Configure message globally
    message.config({
      top: 100,
      duration: 3,
      maxCount: 3,
    });
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
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#08979C',
        },
      }}
    >
      <ConfigProvider theme={theme}>
        <App>
          <AuthProvider>
            {children}
          </AuthProvider>
        </App>
      </ConfigProvider>
    </ClerkProvider>
  );
};
