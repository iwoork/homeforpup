'use client';

import React from 'react';
import { Card, Typography, Button, Space, Row, Col, Alert } from 'antd';
import { PlusOutlined, HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import KennelDashboard from '@/components/dogs/KennelDashboard';
import { useAuth } from '@/hooks';

const { Title, Paragraph } = Typography;

const KennelManagementPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <Alert
          message="Authentication Required"
          description="Please log in to access kennel management."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  if (user.userType !== 'breeder' && user.userType !== 'both') {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <Alert
          message="Access Denied"
          description="This page is only available for breeders. Please update your profile to include breeder status."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              <HomeOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Kennel Management
                </Title>
                <Paragraph style={{ margin: 0, color: '#666' }}>
                  Manage your kennels, parent dogs, and announcements
                </Paragraph>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Link href="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Kennel Dashboard */}
      <KennelDashboard userId={user.userId} />
    </div>
  );
};

export default KennelManagementPage;
