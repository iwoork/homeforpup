'use client';

import React from 'react';
import { ConfigProvider } from 'antd';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#52c41a',
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
