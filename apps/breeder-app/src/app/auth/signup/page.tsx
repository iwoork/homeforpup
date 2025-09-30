'use client';

import React, { useEffect } from 'react';
import { Card, Typography, Button, Space, Alert, Spin } from 'antd';
import { HomeOutlined, UserAddOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

const SignupPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

  const handleSignUp = () => {
    // Redirect to Cognito hosted UI for signup
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    
    const signupUrl = `${cognitoDomain}/signup?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${redirectUri}`;
    
    window.location.href = signupUrl;
  };

  if (status === 'loading') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <Text>Loading...</Text>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <Text>Redirecting to dashboard...</Text>
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
      <Card 
        style={{ 
          width: '100%',
          maxWidth: '500px',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <HomeOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            Join HomeForPup Breeders
          </Title>
          <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
            Professional tools for dog breeders
          </Paragraph>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '16px' }}>
            Create Your Breeder Account
          </Title>
          <Paragraph style={{ textAlign: 'center', marginBottom: '24px' }}>
            Join our community of professional dog breeders and access powerful tools to manage your kennels, dogs, and connect with potential families.
          </Paragraph>
        </div>

        <Alert
          message="Breeder Account Required"
          description="This application is designed for professional dog breeders. You'll need to create a breeder account to access the full features."
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Button
            type="primary"
            size="large"
            icon={<UserAddOutlined />}
            onClick={handleSignUp}
            style={{ 
              width: '100%',
              height: '48px',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Create Breeder Account
          </Button>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: '#1890ff' }}>
                Sign in here
              </Link>
            </Text>
          </div>
        </Space>

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
          <Title level={5}>What you'll get:</Title>
          <ul style={{ paddingLeft: '20px', margin: '16px 0' }}>
            <li>Manage multiple kennels and breeding programs</li>
            <li>Track your dogs, litters, and breeding records</li>
            <li>Connect with potential families and adopters</li>
            <li>Professional breeder tools and resources</li>
            <li>Secure messaging and communication</li>
          </ul>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              By creating an account, you agree to our{' '}
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

export default SignupPage;
