'use client';

import React, { useState, useEffect } from 'react';
import { ConfigProvider, App, Spin } from 'antd';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';

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
        <Spin size="large" />
      </div>
    );
  }

  return (
    <NextAuthProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#52c41a',
          },
        }}
      >
        <App>
          {children}
        </App>
      </ConfigProvider>
    </NextAuthProvider>
  );
}
