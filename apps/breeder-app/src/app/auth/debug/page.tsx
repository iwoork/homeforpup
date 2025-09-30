'use client';

import React from 'react';
import { Card, Typography, Button, Space, Alert } from 'antd';
import { useSession } from 'next-auth/react';

const { Title, Paragraph, Text } = Typography;

const DebugPage: React.FC = () => {
  const { data: session, status, error } = useSession();

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
          maxWidth: '600px',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <Title level={2}>Debug Authentication</Title>
        
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Status:</Text> <Text code>{status}</Text>
          </div>
          
          <div>
            <Text strong>Session:</Text>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
          
          <div>
            <Text strong>Error:</Text>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
          
          <div>
            <Text strong>Environment Variables:</Text>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {JSON.stringify({
                NEXTAUTH_URL: process.env.NEXT_PUBLIC_NEXTAUTH_URL,
                AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
                USER_POOL_ID: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
                CLIENT_ID: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
                COGNITO_AUTHORITY: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY,
                USERS_TABLE: process.env.USERS_TABLE_NAME
              }, null, 2)}
            </pre>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default DebugPage;

