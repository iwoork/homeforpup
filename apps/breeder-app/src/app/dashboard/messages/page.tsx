'use client';

import React, { Suspense } from 'react';
import { Spin } from 'antd';
import { useAuth } from '@homeforpup/shared-auth';
import { MessagesPage } from '@homeforpup/shared-messaging';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const MessagesContent: React.FC = () => {
  const { user, loading } = useAuth();

  console.log('BreederMessagesPage: user data:', { user, loading });

  if (loading) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!user?.userId) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>No user ID found</h2>
          <p>Please log in to access messages.</p>
        </div>
      </div>
    );
  }

  return (
    <MessagesPage 
      userId={user.userId} 
      userType="breeder"
    />
  );
};

const BreederMessagesPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <Spin size="large" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
};

export default BreederMessagesPage;
