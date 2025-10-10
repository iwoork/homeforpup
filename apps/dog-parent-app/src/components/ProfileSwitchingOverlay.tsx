'use client';

import React from 'react';
import { Spin } from 'antd';

interface ProfileSwitchingOverlayProps {
  isSwitching: boolean;
  targetProfile: 'breeder' | 'dog-parent';
}

const ProfileSwitchingOverlay: React.FC<ProfileSwitchingOverlayProps> = ({ 
  isSwitching, 
  targetProfile 
}) => {
  if (!isSwitching) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(3px)'
    }}>
      <Spin size="large" />
      <div style={{ 
        marginTop: '20px', 
        fontSize: '18px', 
        color: '#333',
        textAlign: 'center',
        fontWeight: '500'
      }}>
        Switching to {targetProfile === 'breeder' ? 'Breeder' : 'Puppy Parent'} Profile...
      </div>
      <div style={{ 
        marginTop: '8px', 
        fontSize: '14px', 
        color: '#666',
        textAlign: 'center'
      }}>
        Please wait while we update your dashboard
      </div>
    </div>
  );
};

export default ProfileSwitchingOverlay;
