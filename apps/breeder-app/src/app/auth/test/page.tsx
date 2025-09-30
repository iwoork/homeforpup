'use client';

import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { HomeOutlined, LoginOutlined } from '@ant-design/icons';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

const TestLoginPage: React.FC = () => {
  const handleSignIn = () => {
    signIn('cognito', { 
      callbackUrl: '/dashboard',
      redirect: true 
    });
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
            Test Login Page
          </Title>
          <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
            This page doesn't use AuthContext
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
            <Link href="/auth/login">
              <Button type="default">
                Go to Full Login Page
              </Button>
            </Link>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default TestLoginPage;

