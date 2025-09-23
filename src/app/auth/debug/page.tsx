'use client';

import { useEffect, useState } from 'react';
import { Card, Typography, Space, Button, Alert } from 'antd';
import { useRouter } from 'next/navigation';

const { Title, Text, Paragraph } = Typography;

export default function AuthDebugPage() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const info = {
      currentUrl: window.location.href,
      origin: window.location.origin,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      userAgent: navigator.userAgent,
      environment: {
        NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
        NEXT_PUBLIC_AWS_USER_POOL_ID: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
        NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
        NEXT_PUBLIC_COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
        NEXT_PUBLIC_COGNITO_AUTHORITY: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY,
      }
    };
    setDebugInfo(info);
  }, []);

  const testCognitoRedirect = () => {
    const clientId = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    
    if (!clientId || !cognitoDomain) {
      alert('Missing environment variables');
      return;
    }

    const authUrl = `${cognitoDomain}/oauth2/authorize?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${redirectUri}`;
    
    console.log('Testing Cognito redirect with URL:', authUrl);
    window.open(authUrl, '_blank');
  };

  const testSignupRedirect = () => {
    const clientId = process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID;
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    
    if (!clientId || !cognitoDomain) {
      alert('Missing environment variables');
      return;
    }

    const signupUrl = `${cognitoDomain}/signup?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${redirectUri}`;
    
    console.log('Testing Cognito signup redirect with URL:', signupUrl);
    window.open(signupUrl, '_blank');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Authentication Debug Page</Title>
      
      <Alert
        message="Debug Information"
        description="This page helps debug authentication issues by showing current environment and testing Cognito redirects."
        type="info"
        style={{ marginBottom: '24px' }}
      />

      <Card title="Current Environment" style={{ marginBottom: '24px' }}>
        <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </Card>

      <Card title="Cognito Configuration Test" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="middle">
          <div>
            <Text strong>Expected Redirect URI:</Text>
            <br />
            <Text code>{window.location.origin}/auth/callback</Text>
          </div>
          
          <div>
            <Text strong>Test OAuth2 Authorization Flow:</Text>
            <br />
            <Button type="primary" onClick={testCognitoRedirect}>
              Test Login Redirect
            </Button>
          </div>
          
          <div>
            <Text strong>Test Signup Flow:</Text>
            <br />
            <Button onClick={testSignupRedirect}>
              Test Signup Redirect
            </Button>
          </div>
        </Space>
      </Card>

      <Card title="Troubleshooting Steps">
        <Space direction="vertical" size="small">
          <Paragraph>
            <Text strong>1. Check Cognito User Pool Configuration:</Text>
            <br />
            - Go to AWS Cognito Console
            <br />
            - Select your User Pool
            <br />
            - Go to &quot;App integration&quot; → &quot;App client list&quot;
            <br />
            - Select your app client
            <br />
            - In &quot;Hosted authentication pages&quot; section, add this URL to &quot;Allowed callback URLs&quot;:
            <br />
            <Text code>{window.location.origin}/auth/callback</Text>
          </Paragraph>
          
          <Paragraph>
            <Text strong>2. Check OAuth2 Configuration:</Text>
            <br />
            - In the same app client settings
            <br />
            - Go to &quot;Hosted authentication pages&quot; tab
            <br />
            - Make sure &quot;Authorization code grant&quot; is enabled
            <br />
            - Make sure &quot;openid&quot;, &quot;email&quot;, &quot;profile&quot; scopes are selected
          </Paragraph>
          
          <Paragraph>
            <Text strong>3. Test the redirects above:</Text>
            <br />
            - Click the test buttons above
            <br />
            - Check if you get redirected to the callback page with a &quot;code&quot; parameter
            <br />
            - If not, the Cognito configuration needs to be updated
          </Paragraph>
        </Space>
      </Card>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Button onClick={() => router.push('/')}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}
