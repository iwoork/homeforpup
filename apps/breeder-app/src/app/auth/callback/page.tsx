'use client';

import React, { useEffect } from 'react';
import { Card, Typography, Spin, Alert } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';

const { Title, Paragraph, Text } = Typography;

const AuthCallbackPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      // Handle error case
      console.error('OAuth error:', error);
      setTimeout(() => {
        router.push('/auth/error?error=Verification');
      }, 2000);
    } else if (code) {
      // Handle success case - redirect to NextAuth callback
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
      window.location.href = `/api/auth/callback/cognito?code=${code}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback')}&callbackUrl=${encodeURIComponent(callbackUrl)}`;
    } else {
      // No code or error, redirect to login
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    }
  }, [code, error, router, searchParams]);

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Card style={{ 
          width: '100%',
          maxWidth: '400px',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
          <Title level={3} style={{ color: '#ff4d4f' }}>
            Authentication Error
          </Title>
          <Paragraph>
            There was an error during the authentication process. Redirecting you back to the login page...
          </Paragraph>
          <Spin size="large" />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card style={{ 
        width: '100%',
        maxWidth: '400px',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
        <Title level={3} style={{ color: '#52c41a' }}>
          Completing Authentication
        </Title>
        <Paragraph>
          Please wait while we complete your authentication...
        </Paragraph>
        <Spin size="large" />
      </Card>
    </div>
  );
};

export default AuthCallbackPage;
