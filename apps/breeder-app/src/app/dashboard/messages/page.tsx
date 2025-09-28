'use client';

import React from 'react';
import { useAuth } from '@homeforpup/shared-auth';
import { MessagesPage } from '@homeforpup/shared-messaging';

const BreederMessagesPage: React.FC = () => {
  const { user, effectiveUserType } = useAuth();

  // Redirect non-breeders
  if (effectiveUserType === 'adopter') {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Messages are only available for breeders</h2>
          <p>Please switch to breeder mode to access messages.</p>
        </div>
      </div>
    );
  }

  return (
    <MessagesPage 
      userId={user?.id} 
      userType="breeder"
    />
  );
};

export default BreederMessagesPage;
