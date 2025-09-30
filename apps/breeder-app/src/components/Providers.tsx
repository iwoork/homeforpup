'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';
// import { AuthProvider } from '@homeforpup/shared-auth'; // Temporarily disabled

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <NextAuthProvider>
      {/* <AuthProvider> Temporarily disabled */}
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#52c41a',
            },
          }}
        >
          {children}
        </ConfigProvider>
      {/* </AuthProvider> */}
    </NextAuthProvider>
  );
}
