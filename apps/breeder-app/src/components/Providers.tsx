'use client';

import React from 'react';
import { ConfigProvider, App } from 'antd';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
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
