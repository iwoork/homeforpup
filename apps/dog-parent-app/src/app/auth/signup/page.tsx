'use client';

import React, { useState } from 'react';
import { Card, Button, Typography, Space, Input, Form, Alert } from 'antd';
import { UserAddOutlined, LoginOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

const breederAppUrl = process.env.NEXT_PUBLIC_BREEDER_APP_URL || 'http://localhost:3001';

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleSignup = async (values: { name: string; email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          userType: 'dog-parent',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      localStorage.setItem('pendingEmail', values.email);
      localStorage.setItem('pendingUserType', 'dog-parent');
      router.push(`/auth/verify?email=${encodeURIComponent(values.email)}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
          maxWidth: 480,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <UserAddOutlined style={{ fontSize: '48px', color: '#08979C', marginBottom: '16px' }} />
          <Title level={2} style={{ margin: 0, color: '#262626' }}>
            Create Your Account
          </Title>
          <Paragraph style={{ color: '#8c8c8c', margin: '8px 0 0 0' }}>
            Find your perfect puppy on Home for Pup
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

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSignup}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input size="large" placeholder="Your full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input size="large" placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password size="large" placeholder="Min 8 characters" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Re-enter your password" />
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
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <Paragraph style={{ color: '#8c8c8c' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#08979C', fontWeight: 500 }}>
              Sign In
            </Link>
          </Paragraph>
        </div>

        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #f0f0f0',
          textAlign: 'center',
        }}>
          <Paragraph style={{ color: '#8c8c8c', marginBottom: 0 }}>
            Are you a breeder?{' '}
            <a href={`${breederAppUrl}/auth/signup`} style={{ color: '#08979C', fontWeight: 500 }}>
              Sign up on the Breeder Portal
            </a>
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default SignupPage;
