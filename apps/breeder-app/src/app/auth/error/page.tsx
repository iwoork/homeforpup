'use client';

import React, { Suspense } from 'react';
import { Card, Typography, Button, Alert, Space, Spin } from 'antd';
import { ExclamationCircleOutlined, HomeOutlined, LoginOutlined } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

const AuthErrorContent: React.FC = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return {
          title: 'Configuration Error',
          message: 'There is a problem with the server configuration. Please contact support.',
          type: 'error' as const
        };
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message: 'You do not have permission to sign in. Please contact your administrator.',
          type: 'error' as const
        };
      case 'Verification':
        return {
          title: 'Verification Error',
          message: 'The verification token has expired or has already been used. Please try signing in again.',
          type: 'warning' as const
        };
      case 'Default':
      default:
        return {
          title: 'Authentication Error',
          message: 'An error occurred during authentication. Please try again.',
          type: 'error' as const
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%',
          maxWidth: '500px',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
          <Title level={2} style={{ margin: 0, color: '#ff4d4f' }}>
            {errorInfo.title}
          </Title>
          <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
            HomeForPup Breeders
          </Paragraph>
        </div>

        <Alert
          message={errorInfo.title}
          description={errorInfo.message}
          type={errorInfo.type}
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <div style={{ marginBottom: '24px' }}>
          <Title level={4}>What can you do?</Title>
          <ul style={{ paddingLeft: '20px', margin: '16px 0' }}>
            <li>Check your internet connection and try again</li>
            <li>Clear your browser cache and cookies</li>
            <li>Make sure you're using a supported browser</li>
            <li>Contact support if the problem persists</li>
          </ul>
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            onClick={() => window.location.href = '/auth/login'}
            style={{ width: '100%' }}
          >
            Try Again
          </Button>

          <Button
            size="large"
            icon={<HomeOutlined />}
            onClick={() => window.location.href = '/'}
            style={{ width: '100%' }}
          >
            Go Home
          </Button>
        </Space>

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Need help?{' '}
              <Link href="/contact" style={{ color: '#1890ff' }}>
                Contact Support
              </Link>
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

const AuthErrorPage: React.FC = () => {
  return (
    <Suspense fallback={
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
          maxWidth: '500px',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>Loading...</Text>
          </div>
        </Card>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
};

export default AuthErrorPage;
