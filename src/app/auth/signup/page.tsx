// app/auth/signup/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Input, Button, Typography, Alert, Space, Divider, Radio, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuth } from '@/components/auth/SimpleAuthProvider';

const { Title, Text } = Typography;

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { signUp, error, clearError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (values: { email: string; password: string; confirmPassword: string; userType: 'breeder' | 'adopter' }) => {
    try {
      setLoading(true);
      clearError();
      
      if (values.password !== values.confirmPassword) {
        message.error('Passwords do not match');
        return;
      }

      // With Hosted UI, we just redirect to the signup page
      // The user will be redirected back after successful signup
      signUp();
    } catch (err) {
      console.error('Sign up error:', err);
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
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            Join Home for Pup
          </Title>
          <Text type="secondary">
            Create your account to get started
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
            closable
            onClose={clearError}
          />
        )}

        <Form
          form={form}
          name="signup"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="userType"
            label="I am a"
            rules={[{ required: true, message: 'Please select your role!' }]}
            initialValue="adopter"
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="adopter">
                  <Space>
                    <UserOutlined />
                    Pet Adopter - Looking to adopt a pet
                  </Space>
                </Radio>
                <Radio value="breeder">
                  <Space>
                    <HomeOutlined />
                    Breeder - Offering pets for adoption
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters!' },
              { 
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number!'
              }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Create a password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            rules={[
              { required: true, message: 'Please confirm your password!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ 
                height: '48px',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
          <Text type="secondary">
            Already have an account?{' '}
            <Button type="link" onClick={() => router.push('/auth/login')}>
              Sign in here
            </Button>
          </Text>
        </Space>
      </Card>
    </div>
  );
}
