// src/app/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth as useOidcAuth } from 'react-oidc-context';
import { Spin, Alert, Progress } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';

export default function AuthCallback() {
  const oidcAuth = useOidcAuth();
  const { syncUser } = useAuth();
  const router = useRouter();
  const [syncStatus, setSyncStatus] = useState<'pending' | 'syncing' | 'complete' | 'error'>('pending');
  const [syncProgress, setSyncProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (oidcAuth.isAuthenticated && oidcAuth.user) {
          console.log('Authentication successful, starting user sync...');
          setSyncStatus('syncing');
          setSyncProgress(25);

          // Extract user info from OIDC token
          const profile = oidcAuth.user.profile;
          const userId = profile.sub || '';
          const email = profile.email || '';
          const name = profile.name || profile.email?.split('@')[0] || 'User';

          setSyncProgress(50);

          // Check for pending user type from registration flow
          const pendingUserType = localStorage.getItem('pendingUserType') as 'breeder' | 'adopter' | null;
          
          setSyncProgress(75);

          // Sync user data with DynamoDB
          const syncedUser = await syncUser({
            userId,
            email,
            name,
            userType: pendingUserType || 'adopter'
          });

          setSyncProgress(100);

          if (syncedUser) {
            setSyncStatus('complete');
            
            // Clean up any pending user type
            if (pendingUserType) {
              localStorage.removeItem('pendingUserType');
            }

            // Small delay to show completion, then redirect
            setTimeout(() => {
              router.replace('/dashboard');
            }, 1000);
          } else {
            throw new Error('Failed to sync user data');
          }

        } else if (oidcAuth.error) {
          console.error('OIDC Authentication error:', oidcAuth.error);
          setSyncStatus('error');
          setErrorMessage(`Authentication failed: ${oidcAuth.error.message}`);
          
          // Redirect to home with error after delay
          setTimeout(() => {
            router.replace('/?error=auth_failed');
          }, 3000);
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        setSyncStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
        
        // Redirect to home with error after delay
        setTimeout(() => {
          router.replace('/?error=sync_failed');
        }, 3000);
      }
    };

    // Only run if we have the OIDC auth context and we're not already processing
    if (oidcAuth && syncStatus === 'pending') {
      handleAuthCallback();
    }
  }, [oidcAuth, syncUser, router, syncStatus]);

  const getStatusMessage = () => {
    switch (syncStatus) {
      case 'pending':
        return 'Completing sign in...';
      case 'syncing':
        return 'Setting up your account...';
      case 'complete':
        return 'Welcome! Redirecting to dashboard...';
      case 'error':
        return 'Something went wrong';
      default:
        return 'Processing...';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'complete':
        return '#52c41a'; // Success green
      case 'error':
        return '#f5222d'; // Error red
      default:
        return '#1890ff'; // Primary blue
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '24px',
      padding: '24px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        {/* Logo */}
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#08979C',
          marginBottom: '32px'
        }}>
          home for pup
        </div>

        {/* Spinner */}
        <Spin size="large" style={{ marginBottom: '24px' }} />
        
        {/* Status Message */}
        <p style={{ 
          fontSize: '16px', 
          color: '#666',
          marginBottom: '24px'
        }}>
          {getStatusMessage()}
        </p>

        {/* Progress Bar */}
        {syncStatus === 'syncing' && (
          <Progress 
            percent={syncProgress} 
            strokeColor={getStatusColor()}
            showInfo={false}
            style={{ marginBottom: '24px' }}
          />
        )}

        {/* Success Progress */}
        {syncStatus === 'complete' && (
          <Progress 
            percent={100} 
            strokeColor={getStatusColor()}
            showInfo={false}
            style={{ marginBottom: '24px' }}
          />
        )}

        {/* Error Alert */}
        {syncStatus === 'error' && errorMessage && (
          <Alert
            message="Authentication Error"
            description={errorMessage}
            type="error"
            showIcon
            style={{ textAlign: 'left' }}
          />
        )}

        {/* Status Details */}
        {syncStatus === 'syncing' && (
          <div style={{ 
            fontSize: '14px', 
            color: '#999',
            textAlign: 'left'
          }}>
            <p style={{ margin: '4px 0' }}>
              ✓ Verifying authentication...
            </p>
            {syncProgress >= 50 && (
              <p style={{ margin: '4px 0' }}>
                ✓ Processing user information...
              </p>
            )}
            {syncProgress >= 75 && (
              <p style={{ margin: '4px 0' }}>
                ✓ Setting up your profile...
              </p>
            )}
            {syncProgress >= 100 && (
              <p style={{ margin: '4px 0' }}>
                ✓ Account ready!
              </p>
            )}
          </div>
        )}

        {syncStatus === 'complete' && (
          <div style={{ 
            fontSize: '14px', 
            color: '#52c41a',
            textAlign: 'center'
          }}>
            <p>Your account has been set up successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
}