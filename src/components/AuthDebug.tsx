'use client';

import React from 'react';
import { useAuth as useOidcAuth } from 'react-oidc-context';
import { Card, Typography, Alert } from 'antd';
import { cognitoAuthConfig } from '@/lib/auth-config';

const { Title, Paragraph, Text } = Typography;

export const AuthDebug: React.FC = () => {
  const oidcAuth = useOidcAuth();

  return (
    <Card title="Authentication Debug Info" style={{ margin: '20px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Title level={4}>Environment Variables</Title>
        <Paragraph>
          <Text strong>Region:</Text> {process.env.NEXT_PUBLIC_AWS_REGION || 'Not set'}<br />
          <Text strong>User Pool ID:</Text> {process.env.NEXT_PUBLIC_AWS_USER_POOL_ID || 'Not set'}<br />
          <Text strong>Client ID:</Text> {process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID ? 'Set' : 'Not set'}<br />
          <Text strong>Cognito Domain:</Text> {process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'Not set'}
        </Paragraph>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Title level={4}>Cognito Config</Title>
        <Paragraph>
          <Text strong>Authority:</Text> {cognitoAuthConfig.authority}<br />
          <Text strong>Client ID:</Text> {cognitoAuthConfig.client_id ? 'Set' : 'Not set'}<br />
          <Text strong>Redirect URI:</Text> {cognitoAuthConfig.redirect_uri}
        </Paragraph>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Title level={4}>OIDC Auth State</Title>
        {oidcAuth ? (
          <Paragraph>
            <Text strong>Is Loading:</Text> {String(oidcAuth.isLoading)}<br />
            <Text strong>Is Authenticated:</Text> {String(oidcAuth.isAuthenticated)}<br />
            <Text strong>Has Error:</Text> {String(!!oidcAuth.error)}<br />
            {oidcAuth.error && (
              <>
                <Text strong>Error:</Text> {oidcAuth.error.message}<br />
              </>
            )}
            <Text strong>Has User:</Text> {String(!!oidcAuth.user)}
          </Paragraph>
        ) : (
          <Alert 
            message="OIDC Auth Context is undefined" 
            type="error" 
            description="The useAuth hook from react-oidc-context returned undefined. This suggests the AuthProvider is not wrapping this component properly."
          />
        )}
      </div>
    </Card>
  );
};