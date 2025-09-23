// app/auth/login/page.tsx
'use client';

import React from 'react';
import { Card, Button, Typography, Space, Divider } from 'antd';
import { LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAuth } from '@/components/auth/SimpleAuthProvider';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { login, signUp, clearError } = useAuth();

  const handleLogin = () => {
    clearError();
    login();
  };

  const handleSignUp = () => {
    clearError();
    signUp();
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
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            Welcome to Home for Pup
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Connect with breeders and find your perfect pet
          </Text>
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Button
            type="primary"
            size="large"
            block
            icon={<LoginOutlined />}
            onClick={handleLogin}
            style={{ 
              height: '56px',
              fontSize: '18px',
              fontWeight: '600'
            }}
          >
            Sign In
          </Button>

          <Button
            size="large"
            block
            icon={<UserAddOutlined />}
            onClick={handleSignUp}
            style={{ 
              height: '56px',
              fontSize: '18px',
              fontWeight: '500'
            }}
          >
            Create Account
          </Button>
        </Space>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </div>
      </Card>
    </div>
  );
}
