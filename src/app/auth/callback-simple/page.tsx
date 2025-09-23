// app/auth/callback-simple/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Spin, Alert, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useHostedAuth } from '@/hooks/auth/useHostedAuth';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const { handleCallback, error } = useHostedAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(errorDescription || error);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          return;
        }

        setMessage('Exchanging code for tokens...');
        const success = await handleCallback(code);

        if (success) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Authentication failed');
        }
      } catch (err) {
        console.error('Callback processing error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred');
      }
    };

    processCallback();
  }, [searchParams, handleCallback, router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Spin size="large" />;
      case 'success':
        return <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return '#1890ff';
      case 'success':
        return '#52c41a';
      case 'error':
        return '#ff4d4f';
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
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          {getStatusIcon()}
        </div>

        <h2 style={{ 
          color: getStatusColor(), 
          marginBottom: '16px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          {status === 'loading' && 'Authenticating...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>

        <p style={{ 
          color: '#666', 
          marginBottom: '24px',
          fontSize: '16px'
        }}>
          {message}
        </p>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        {status === 'error' && (
          <Button 
            type="primary" 
            onClick={() => router.push('/auth/login')}
            style={{ marginTop: '16px' }}
          >
            Try Again
          </Button>
        )}

        {status === 'success' && (
          <div style={{ color: '#52c41a', fontSize: '14px' }}>
            You will be redirected automatically...
          </div>
        )}
      </Card>
    </div>
  );
}
