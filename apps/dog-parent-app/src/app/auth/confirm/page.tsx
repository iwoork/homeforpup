'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Input, Space, Alert, Spin } from 'antd';
import { MailOutlined, CheckCircleOutlined, ReloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

interface ConfirmResponse {
  success: boolean;
  message: string;
  error?: string;
}

const ConfirmPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [confirmationCode, setConfirmationCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get('email');
    const storedEmail = localStorage.getItem('pendingEmail');
    
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('pendingEmail', emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email found, redirect to login
      router.push('/auth/login');
    }
  }, [searchParams, router]);

  const handleConfirm = async () => {
    if (!confirmationCode.trim()) {
      setMessage({ type: 'error', text: 'Please enter the confirmation code' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Note: Email confirmation should be handled through Cognito's hosted UI
      // or through the sign-in flow. This page should redirect users to sign in
      // after they confirm their email through Cognito's email link.
      setMessage({ 
        type: 'info', 
        text: 'Email confirmation is handled through Cognito. Please check your email for the confirmation link, or sign in to complete the process.' 
      });
      
      // Redirect to login after showing message
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error) {
      console.error('Confirmation error:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setMessage(null);

    try {
      // Note: Resending confirmation codes should be done through Cognito
      // Users should use the "Resend confirmation code" option in Cognito's hosted UI
      // or sign in again to trigger a new confirmation email
      setMessage({ 
        type: 'info', 
        text: 'Please sign in again to receive a new confirmation code, or use Cognito\'s hosted UI to resend the confirmation email.' 
      });
      
      // Redirect to login
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error) {
      console.error('Resend error:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setResendLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  if (confirmed) {
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
            borderRadius: '12px',
            textAlign: 'center'
          }}
        >
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }} />
          <Title level={2} style={{ color: '#52c41a', marginBottom: '16px' }}>
            Email Confirmed!
          </Title>
          <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
            Your email has been successfully verified. You can now access all features of HomeForPup.
          </Paragraph>
          <Spin size="large" />
          <Paragraph style={{ marginTop: '16px', color: '#8c8c8c' }}>
            Redirecting to your dashboard...
          </Paragraph>
        </Card>
      </div>
    );
  }

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
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <MailOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={2} style={{ margin: 0, color: '#262626' }}>
            Confirm Your Email
          </Title>
          <Paragraph style={{ color: '#8c8c8c', margin: '8px 0 0 0' }}>
            We've sent a confirmation code to
          </Paragraph>
          <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
            {email}
          </Text>
        </div>

        {message && (
          <Alert
            message={message.text}
            type={message.type}
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Confirmation Code
            </Text>
            <Input
              size="large"
              placeholder="Enter 6-digit code"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={6}
              style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '2px' }}
            />
          </div>

          <Button
            type="primary"
            size="large"
            onClick={handleConfirm}
            loading={loading}
            disabled={!confirmationCode.trim()}
            style={{ width: '100%', height: '48px' }}
          >
            Confirm Email
          </Button>

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#8c8c8c', marginRight: '8px' }}>
              Didn't receive the code?
            </Text>
            <Button
              type="link"
              onClick={handleResendCode}
              loading={resendLoading}
              style={{ padding: 0 }}
            >
              <ReloadOutlined /> Resend Code
            </Button>
          </div>
        </Space>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link href="/auth/login">
            <Button icon={<ArrowLeftOutlined />} type="text">
              Back to Login
            </Button>
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Paragraph style={{ color: '#8c8c8c', fontSize: '12px' }}>
            Check your spam folder if you don't see the email in your inbox.
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmPage;
