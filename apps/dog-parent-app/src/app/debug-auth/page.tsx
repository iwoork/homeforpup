'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Card, Typography, Space, Tag } from 'antd';

const { Title, Paragraph, Text } = Typography;

const DebugAuthPage: React.FC = () => {
  const { data: session, status } = useSession();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Authentication Debug</Title>
      
      <Card style={{ marginBottom: '20px' }}>
        <Title level={4}>Session Status</Title>
        <Space direction="vertical" size="small">
          <Text>Status: <Tag color={status === 'loading' ? 'blue' : status === 'authenticated' ? 'green' : 'red'}>{status}</Tag></Text>
          <Text>Has Session: {session ? 'Yes' : 'No'}</Text>
        </Space>
      </Card>

      {session && (
        <Card>
          <Title level={4}>Session Data</Title>
          <Space direction="vertical" size="small">
            <Text>User ID: {session.user?.id || 'N/A'}</Text>
            <Text>Email: {session.user?.email || 'N/A'}</Text>
            <Text>Name: {session.user?.name || 'N/A'}</Text>
            <Text>User Type: {session.user?.userType || 'N/A'}</Text>
            <Text>Is Verified: <Tag color={session.user?.isVerified ? 'green' : 'red'}>{session.user?.isVerified ? 'Yes' : 'No'}</Tag></Text>
            <Text>Has Access Token: {session.accessToken ? 'Yes' : 'No'}</Text>
          </Space>
          
          <div style={{ marginTop: '20px' }}>
            <Title level={5}>Raw Session Object</Title>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DebugAuthPage;
