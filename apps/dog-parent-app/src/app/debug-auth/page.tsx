'use client';

import React, { useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { Card, Typography, Space, Tag, Button, Alert } from 'antd';

const { Title, Text } = Typography;

const DebugAuthPage: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkVerificationStatus = async () => {
    setLoading(true);
    try {
      if (user) {
        setVerificationStatus({
          success: true,
          isVerified: user.primaryEmailAddress?.verification?.status === 'verified',
          email: user.primaryEmailAddress?.emailAddress,
          userType: (user.publicMetadata?.userType as string) || 'N/A',
        });
      } else {
        setVerificationStatus({
          success: false,
          error: 'No user found',
        });
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      setVerificationStatus({
        success: false,
        error: 'Failed to check verification status',
      });
    } finally {
      setLoading(false);
    }
  };

  const status = !isLoaded ? 'loading' : isSignedIn ? 'authenticated' : 'unauthenticated';

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Authentication Debug</Title>

      <Card style={{ marginBottom: '20px' }}>
        <Title level={4}>Session Status</Title>
        <Space direction="vertical" size="small">
          <Text>Status: <Tag color={status === 'loading' ? 'blue' : status === 'authenticated' ? 'green' : 'red'}>{status}</Tag></Text>
          <Text>Has User: {user ? 'Yes' : 'No'}</Text>
        </Space>
      </Card>

      {user && (
        <Card>
          <Title level={4}>User Data</Title>
          <Space direction="vertical" size="small">
            <Text>User ID: {user.id || 'N/A'}</Text>
            <Text>Email: {user.primaryEmailAddress?.emailAddress || 'N/A'}</Text>
            <Text>Name: {user.fullName || user.firstName || 'N/A'}</Text>
            <Text>User Type: {(user.publicMetadata?.userType as string) || 'N/A'}</Text>
            <Text>Email Verified: <Tag color={user.primaryEmailAddress?.verification?.status === 'verified' ? 'green' : 'red'}>{user.primaryEmailAddress?.verification?.status === 'verified' ? 'Yes' : 'No'}</Tag></Text>
          </Space>

          <div style={{ marginTop: '20px' }}>
            <Title level={5}>Public Metadata</Title>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(user.publicMetadata, null, 2)}
            </pre>
          </div>

          <div style={{ marginTop: '20px' }}>
            <Title level={5}>Unsafe Metadata</Title>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(user.unsafeMetadata, null, 2)}
            </pre>
          </div>
        </Card>
      )}

      <Card style={{ marginTop: '20px' }}>
        <Title level={4}>Verification Status Check</Title>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Button
            type="primary"
            onClick={checkVerificationStatus}
            loading={loading}
          >
            Check Verification Status
          </Button>

          {verificationStatus && (
            <Alert
              message={verificationStatus.success ? 'Verification Status Retrieved' : 'Error'}
              description={
                verificationStatus.success ? (
                  <div>
                    <p><strong>Is Verified:</strong> <Tag color={verificationStatus.isVerified ? 'green' : 'red'}>{verificationStatus.isVerified ? 'Yes' : 'No'}</Tag></p>
                    <p><strong>Email:</strong> {verificationStatus.email}</p>
                    <p><strong>User Type:</strong> {verificationStatus.userType}</p>
                  </div>
                ) : (
                  verificationStatus.error
                )
              }
              type={verificationStatus.success ? 'success' : 'error'}
            />
          )}

          {user && (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Alert
                message="Refresh Page"
                description="Reload the page to get fresh auth data from Clerk."
                type="info"
                action={
                  <Button onClick={() => window.location.reload()} loading={loading} type="primary">
                    Refresh
                  </Button>
                }
              />

              <Alert
                message="Bypass Confirmation"
                description="If you're still stuck on the confirmation page, you can bypass it here."
                type="warning"
                action={
                  <Button onClick={() => {
                    localStorage.removeItem('pendingEmail');
                    window.location.href = '/dashboard';
                  }} type="primary" danger>
                    Bypass Confirmation
                  </Button>
                }
              />
            </Space>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default DebugAuthPage;
