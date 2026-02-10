'use client';

import React from 'react';
import { Spin } from 'antd';
import { useAuth } from '@/hooks';
import BreederDashboard from '@/components/dashboard/BreederDashboard';
import DogParentDashboard from '@/components/dashboard/DogParentDashboard';

const DashboardPage: React.FC = () => {
  const { effectiveUserType, loading } = useAuth();

  if (loading) {
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
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (effectiveUserType === 'breeder') {
    return <BreederDashboard />;
  }

  return <DogParentDashboard />;
};

export default DashboardPage;
