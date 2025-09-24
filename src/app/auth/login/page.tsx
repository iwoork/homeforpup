'use client';

import React from 'react';
import { Card, Button, Typography, Space, Divider } from 'antd';
import { UserOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();

  const handleLogin = () => {
    login();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <UserOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={2} style={{ margin: 0, color: '#262626' }}>
            Welcome Back
          </Title>
          <Paragraph style={{ color: '#8c8c8c', margin: '8px 0 0 0' }}>
            Sign in to your account to continue
          </Paragraph>
        </div>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            onClick={handleLogin}
            loading={loading}
            style={{ width: '100%', height: '48px' }}
          >
            Sign In with AWS Cognito
          </Button>

          <Divider style={{ margin: '16px 0' }}>
            <span style={{ color: '#8c8c8c' }}>New to Home for Pup?</span>
          </Divider>

          <Button
            size="large"
            icon={<UserAddOutlined />}
            onClick={handleLogin}
            loading={loading}
            style={{ width: '100%', height: '48px' }}
          >
            Create Account
          </Button>
        </Space>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Paragraph style={{ color: '#8c8c8c', fontSize: '12px' }}>
            By signing in, you agree to our{' '}
            <Link href="/terms" style={{ color: '#1890ff' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" style={{ color: '#1890ff' }}>Privacy Policy</Link>
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;