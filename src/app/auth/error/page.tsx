'use client';

import React from 'react';
import { Card, Button, Typography, Result } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const { Title } = Typography;

const AuthErrorPage: React.FC = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      default:
        return 'An error occurred during authentication. Please try again.';
    }
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
          maxWidth: 500,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
      >
        <Result
          status="error"
          title="Authentication Error"
          subTitle={getErrorMessage(error)}
          extra={[
            <Link key="home" href="/">
              <Button type="primary" icon={<HomeOutlined />}>
                Go Home
              </Button>
            </Link>,
            <Link key="retry" href="/auth/login">
              <Button icon={<ReloadOutlined />}>
                Try Again
              </Button>
            </Link>,
          ]}
        />
      </Card>
    </div>
  );
};

export default AuthErrorPage;
