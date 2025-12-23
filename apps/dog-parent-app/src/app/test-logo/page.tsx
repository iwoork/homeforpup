'use client';

import React from 'react';
import Image from 'next/image';
import { Card, Typography, Space } from 'antd';

const { Title, Text } = Typography;

export default function TestLogoPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Logo Test Page</Title>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Next.js Image Component" size="small">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Image
              src="/logo.png"
              alt="Home for Pup Logo"
              width={100}
              height={100}
              priority
              onError={() => {
                console.error('Logo failed to load with Next.js Image');
              }}
              onLoad={() => {
                console.log('Logo loaded successfully with Next.js Image');
              }}
            />
            <div>
              <Text strong>Next.js Image Component</Text>
              <br />
              <Text type="secondary">This should show the logo if it's working</Text>
            </div>
          </div>
        </Card>

        <Card title="Regular img tag" size="small">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src="/logo.png"
              alt="Home for Pup Logo"
              style={{ width: '100px', height: '100px' }}
              onError={(e) => {
                console.error('Logo failed to load with img tag:', e);
                (e.target as HTMLImageElement).style.border = '2px solid red';
              }}
              onLoad={() => {
                console.log('Logo loaded successfully with img tag');
              }}
            />
            <div>
              <Text strong>Regular img tag</Text>
              <br />
              <Text type="secondary">This should show the logo if it's working</Text>
            </div>
          </div>
        </Card>

        <Card title="Debug Information" size="small">
          <Text>
            <strong>Logo file path:</strong> /logo.png<br />
            <strong>Expected location:</strong> public/logo.png<br />
            <strong>File size:</strong> 690KB<br />
            <strong>Dimensions:</strong> 1024x1024px<br />
            <strong>Format:</strong> PNG
          </Text>
        </Card>
      </Space>
    </div>
  );
}

