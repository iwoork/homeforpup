'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, Typography, Space, Tag, Button, Alert } from 'antd';

const { Title, Paragraph, Text } = Typography;

const DebugAuthPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkVerificationStatus = async () => {
    setLoading(true);
    try {
      // Use NextAuth session directly - no custom API needed
      if (session?.user) {
        setVerificationStatus({
          success: true,
          isVerified: session.user.isVerified !== false,
          email: session.user.email,
          userType: session.user.userType,
        });
      } else {
        setVerificationStatus({
          success: false,
          error: 'No session found',
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

  const refreshSession = async () => {
    setLoading(true);
    try {
      // Use NextAuth's built-in session refresh
      // Clear any cached session data
      if (typeof window !== 'undefined') {
        // Clear NextAuth session storage
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('nextauth')) {
            sessionStorage.removeItem(key);
          }
        });
        
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('nextauth') || key.startsWith('pendingEmail')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Reload the page to get fresh session data from NextAuth
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Authentication Debug</Title>
      
      <Card style={{ marginBottom: '20px' }}>
        <Title level={4}>Session Status</Title>
        <Space direction="vertical" size="small">
          <Text>Status: <Tag color={status === 'loading' ? 'blue' : status === 'authenticated' ? 'green' : 'red'}>{status}</Tag></Text>
          <Text>Has Session: {session ? 'Yes' : 'No'}</Text>
        </Space>
      </Card>

      {session && (
        <Card>
          <Title level={4}>Session Data</Title>
          <Space direction="vertical" size="small">
            <Text>User ID: {session.user?.id || 'N/A'}</Text>
            <Text>Email: {session.user?.email || 'N/A'}</Text>
            <Text>Name: {session.user?.name || 'N/A'}</Text>
            <Text>User Type: {session.user?.userType || 'N/A'}</Text>
            <Text>Is Verified: <Tag color={session.user?.isVerified ? 'green' : 'red'}>{session.user?.isVerified ? 'Yes' : 'No'}</Tag></Text>
            <Text>Has Access Token: {session.accessToken ? 'Yes' : 'No'}</Text>
          </Space>
          
          <div style={{ marginTop: '20px' }}>
            <Title level={5}>Raw Session Object</Title>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(session, null, 2)}
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
          
          {session && (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Alert
                message="Refresh Session"
                description="Clear cached session data and refresh with new verification logic."
                type="info"
                action={
                  <Button onClick={refreshSession} loading={loading} type="primary">
                    Refresh Session
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
