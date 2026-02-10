'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Space, Statistic, List, Avatar, Spin, Alert } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  MessageOutlined,
  UserOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@homeforpup/shared-auth';
import { ActivityFeed, activityTracker } from '@homeforpup/shared-activity';
import useSWR from 'swr';

const { Title, Paragraph, Text } = Typography;

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.ok ? res.json() : null);

const BreederDashboard: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [waitingForUser, setWaitingForUser] = useState(true);

  const { data: kennelsData } = useSWR(
    isAuthenticated && user?.userId ? `/api/kennels?breederId=${user.userId}` : null,
    fetcher
  );

  const { data: dogsData } = useSWR(
    isAuthenticated && user?.userId ? `/api/dogs?breederId=${user.userId}` : null,
    fetcher
  );

  const { data: littersData } = useSWR(
    isAuthenticated && user?.userId ? `/api/litters?breederId=${user.userId}` : null,
    fetcher
  );

  const { data: threadsData } = useSWR(
    isAuthenticated ? '/api/messages/threads' : null,
    fetcher
  );

  useEffect(() => {
    if (user?.userId) {
      activityTracker.trackPageView(user.userId, 'breeder-dashboard');
    }
  }, [user?.userId]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      const timer = setTimeout(() => setWaitingForUser(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setWaitingForUser(false);
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <Spin size="large" />
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    if (waitingForUser) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
          <Spin size="large" />
          <div>Setting up your dashboard...</div>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <Alert
          message="Authentication Required"
          description="Please sign in to access your dashboard."
          type="warning"
          showIcon
          action={<Link href="/auth/login"><Button type="primary">Sign In</Button></Link>}
        />
      </div>
    );
  }

  const kennelCount = kennelsData?.kennels?.length || kennelsData?.length || 0;
  const dogCount = dogsData?.dogs?.length || dogsData?.length || 0;
  const litterCount = littersData?.litters?.length || littersData?.length || 0;
  const unreadMessages = threadsData?.threads?.reduce((total: number, thread: any) =>
    total + (thread.unreadCount?.[user.userId] || 0), 0) || 0;

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f1f5f9'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Welcome Header */}
      <Card style={{ marginBottom: '24px', ...cardStyle }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0, color: '#08979C' }}>
              Welcome back, {user.displayName || user.name}!
            </Title>
            <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
              Here's an overview of your breeding operation
            </Paragraph>
          </Col>
          <Col>
            <Space>
              <Link href="/kennel-management">
                <Button type="primary" icon={<HomeOutlined />}>
                  Manage Kennels
                </Button>
              </Link>
              <Link href={`/users/${user.userId}`}>
                <Button icon={<UserOutlined />}>
                  View Profile
                </Button>
              </Link>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Active Kennels"
              value={kennelCount}
              prefix={<HomeOutlined style={{ color: '#08979C' }} />}
              valueStyle={{ color: '#08979C' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Total Dogs"
              value={dogCount}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Active Litters"
              value={litterCount}
              prefix={<UnorderedListOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Unread Messages"
              value={unreadMessages}
              prefix={<MessageOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <ActivityFeed
            userId={user.userId}
            userType="breeder"
            limit={5}
            showFilters={false}
            showStats={false}
            onActivityClick={(activity) => {
              console.log('Activity clicked:', activity);
            }}
          />
        </Col>

        {/* Quick Actions */}
        <Col xs={24} lg={12}>
          <Card title="Quick Actions" style={cardStyle}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Link href="/kennel-management">
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<HomeOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  Manage Kennels
                </Button>
              </Link>

              <Link href="/dogs">
                <Button
                  block
                  size="large"
                  icon={<TeamOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  Manage Dogs
                </Button>
              </Link>

              <Link href="/litters">
                <Button
                  block
                  size="large"
                  icon={<UnorderedListOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  Manage Litters
                </Button>
              </Link>

              <Link href="/dashboard/messages">
                <Button
                  block
                  size="large"
                  icon={<MessageOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  View Messages
                </Button>
              </Link>

              <Link href={`/users/${user.userId}/edit`}>
                <Button
                  block
                  size="large"
                  icon={<SettingOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  Edit Profile
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BreederDashboard;
