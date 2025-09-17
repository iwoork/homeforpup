'use client';

import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { Spin } from 'antd';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.isAuthenticated) {
      // Redirect to dashboard after successful authentication
      router.replace('/dashboard');
    } else if (auth.error) {
      // Redirect to home with error
      console.error('Authentication error:', auth.error);
      router.replace('/?error=auth_failed');
    }
  }, [auth.isAuthenticated, auth.error, router]);

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
      <p>Completing sign in...</p>
    </div>
  );
}