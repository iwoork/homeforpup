'use client';

import React from 'react';
import { Card, Typography, Button, Space, Alert } from 'antd';
import { HomeOutlined, LoginOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

const LoginPage: React.FC = () => {
  const router = useRouter();

  const handleSignIn = () => {
    // For now, just redirect to dashboard without authentication
    router.push('/dashboard');
  };

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
          maxWidth: '400px',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <HomeOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            HomeForPup Breeders
          </Title>
          <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
            Professional tools for dog breeders
          </Paragraph>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '16px' }}>
            Welcome Back
          </Title>
          <Paragraph style={{ textAlign: 'center', marginBottom: '24px' }}>
            Sign in to access your breeder dashboard and manage your kennels, dogs, and connect with potential families.
          </Paragraph>
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            onClick={handleSignIn}
            style={{ 
              width: '100%',
              height: '48px',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Sign In with AWS Cognito
          </Button>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Don't have an account?{' '}
              <Link href="/auth/signup" style={{ color: '#1890ff' }}>
                Sign up here
              </Link>
            </Text>
          </div>
        </Space>

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
          <Alert
            message="Breeder Account Required"
            description="This application is designed for professional dog breeders. You'll need a breeder account to access the full features."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              By signing in, you agree to our{' '}
              <Link href="/terms" style={{ color: '#1890ff' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" style={{ color: '#1890ff' }}>Privacy Policy</Link>
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
