'use client';

import React from 'react';
import { useAuth } from '@homeforpup/shared-auth';
import { MessagesPage } from '@homeforpup/shared-messaging';

const AdopterMessagesPage: React.FC = () => {
  const { user, loading } = useAuth();

  console.log('AdopterMessagesPage: user data:', { user, loading });

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
      userType="adopter"
    />
  );
};

export default AdopterMessagesPage;
