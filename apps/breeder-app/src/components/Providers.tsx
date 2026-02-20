'use client';

import React, { useState, useEffect } from 'react';
import { ConfigProvider, App } from 'antd';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '@homeforpup/shared-auth';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent FOUC by not rendering until mounted
  if (!mounted) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#52c41a',
        },
      }}
    >
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#52c41a',
          },
        }}
      >
        <App>
          <AuthProvider>
            {children}
          </AuthProvider>
        </App>
      </ConfigProvider>
    </ClerkProvider>
  );
}
