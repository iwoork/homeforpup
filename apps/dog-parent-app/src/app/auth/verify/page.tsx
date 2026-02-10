'use client';

import React, { useState } from 'react';
import { Card, Button, Typography, Input, Form, Alert, Space } from 'antd';
import { MailOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const { Title, Paragraph } = Typography;

const VerifyPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form] = Form.useForm();

  const handleVerify = async (values: { code: string }) => {
    const email = emailParam || localStorage.getItem('pendingEmail') || '';
    if (!email) {
      setError('Email address not found. Please go back and sign up again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: values.code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // If user signed up as a breeder, assign them to the breeders group
      const pendingUserType = localStorage.getItem('pendingUserType');
      if (pendingUserType === 'breeder') {
        try {
          await fetch('/api/auth/assign-group', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, group: 'breeders' }),
          });
        } catch (groupErr) {
          console.error('Failed to assign breeder group:', groupErr);
          // Non-blocking - user can still log in
        }
      }

      setSuccess(true);
      localStorage.removeItem('pendingEmail');
      localStorage.removeItem('pendingUserType');

      // Redirect to login after short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const email = emailParam || localStorage.getItem('pendingEmail') || '';
    if (!email) {
      setError('Email address not found.');
      return;
    }

    setResending(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend code');
      }

      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #08979C 0%, #0E6B6E 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          {success ? (
            <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
          ) : (
            <MailOutlined style={{ fontSize: '48px', color: '#08979C', marginBottom: '16px' }} />
          )}
          <Title level={2} style={{ margin: 0, color: '#262626' }}>
            {success ? 'Email Verified!' : 'Verify Your Email'}
          </Title>
          <Paragraph style={{ color: '#8c8c8c', margin: '8px 0 0 0' }}>
            {success
              ? 'Redirecting you to sign in...'
              : `We sent a verification code to ${emailParam || 'your email'}`}
          </Paragraph>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: '16px' }}
          />
        )}

        {!success && (
          <>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleVerify}
              requiredMark={false}
            >
              <Form.Item
                name="code"
                label="Verification Code"
                rules={[
                  { required: true, message: 'Please enter the verification code' },
                  { len: 6, message: 'Code must be 6 digits' },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px' }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  style={{ height: '48px', background: '#08979C', borderColor: '#08979C' }}
                >
                  Verify Email
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center' }}>
              <Space direction="vertical" size="small">
                <Paragraph style={{ color: '#8c8c8c', margin: 0 }}>
                  Didn't receive the code?
                </Paragraph>
                <Button type="link" onClick={handleResend} loading={resending} style={{ color: '#08979C' }}>
                  Resend Code
                </Button>
              </Space>
            </div>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link href="/auth/login" style={{ color: '#08979C' }}>
            Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default VerifyPage;
