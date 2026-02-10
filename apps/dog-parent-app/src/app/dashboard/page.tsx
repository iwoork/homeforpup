'use client';

import React from 'react';
import { Spin } from 'antd';
import { useAuth } from '@/hooks';
import DogParentDashboard from '@/components/dashboard/DogParentDashboard';

const BREEDER_APP_URL = process.env.NEXT_PUBLIC_BREEDER_APP_URL;

const DashboardPage: React.FC = () => {
  const { effectiveUserType, loading } = useAuth();

  // Redirect breeders to the dedicated breeder app (fallback if signIn callback didn't catch it)
  React.useEffect(() => {
    if (!loading && effectiveUserType === 'breeder' && BREEDER_APP_URL) {
      window.location.href = BREEDER_APP_URL;
    }
  }, [loading, effectiveUserType]);

  if (loading || (effectiveUserType === 'breeder' && BREEDER_APP_URL)) {
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
        <div>{effectiveUserType === 'breeder' ? 'Redirecting to breeder portal...' : 'Loading dashboard...'}</div>
      </div>
    );
  }

  return <DogParentDashboard />;
};

export default DashboardPage;
