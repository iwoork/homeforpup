'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Space, Statistic, Spin, Alert } from 'antd';
import { 
  HomeOutlined, 
  TeamOutlined, 
  MessageOutlined, 
  BarChartOutlined,
  PlusOutlined,
  SettingOutlined,
  BellOutlined,
  HeartOutlined,
  EyeOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@homeforpup/shared-auth';
import { ActivityFeed, ActivityStats, activityTracker } from '@homeforpup/shared-activity';
import useSWR from 'swr';

const { Title, Paragraph } = Typography;

interface BreederStats {
  activeKennels: number;
  totalDogs: number;
  availablePuppies: number;
  newMessages: number;
  profileViews: number;
  totalFavorites: number;
}

const BreederDashboard: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [stats, setStats] = useState<BreederStats>({
    activeKennels: 0,
    totalDogs: 0,
    availablePuppies: 0,
    newMessages: 0,
    profileViews: 0,
    totalFavorites: 0
  });

  // Fetch breeder data
  const { data: kennelsData } = useSWR(
    isAuthenticated ? '/api/kennels' : null,
    async (url) => {
      const response = await fetch(url);
      return response.json();
    }
  );

  const { data: dogsData } = useSWR(
    isAuthenticated ? '/api/dogs' : null,
    async (url) => {
      const response = await fetch(url);
      return response.json();
    }
  );

  const { data: threadsData } = useSWR(
    isAuthenticated ? '/api/messages/threads' : null,
    async (url) => {
      const response = await fetch(url);
      return response.json();
    }
  );

  // Calculate stats
  useEffect(() => {
    if (kennelsData && dogsData && threadsData && user) {
      setStats({
        activeKennels: kennelsData.kennels?.length || 0,
        totalDogs: dogsData.dogs?.length || 0,
        availablePuppies: dogsData.dogs?.filter((dog: any) => dog.dogType === 'puppy' && dog.breedingStatus === 'available').length || 0,
        newMessages: threadsData.threads?.reduce((total: number, thread: any) => 
          total + (thread.unreadCount?.[user.userId] || 0), 0) || 0,
        profileViews: user.profileViews || 0,
        totalFavorites: 0 // This would need to be fetched from a favorites API
      });
    }
  }, [kennelsData, dogsData, threadsData, user]);

  // Track page view activity
  useEffect(() => {
    if (user?.userId) {
      activityTracker.trackPageView(user.userId, 'breeder-dashboard');
    }
  }, [user?.userId]);

  if (loading) {
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
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <Alert
          message="Authentication Required"
          description="Please sign in to access your breeder dashboard."
          type="warning"
          showIcon
          action={
            <Link href="/auth/login">
              <Button type="primary">Sign In</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f1f5f9'
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={1}>Breeder Dashboard</Title>
        <Paragraph style={{ fontSize: '1.1rem' }}>
          Manage your kennel, dogs, and connect with potential families
        </Paragraph>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={12} sm={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Active Kennels"
              value={stats.activeKennels}
              prefix={<HomeOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Total Dogs"
              value={stats.totalDogs}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Available Puppies"
              value={stats.availablePuppies}
              prefix={<TrophyOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={cardStyle}>
            <Statistic
              title="New Messages"
              value={stats.newMessages}
              prefix={<MessageOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Activity Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <ActivityStats
            userId={user.userId}
            userType="breeder"
            period="week"
          />
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
              // Handle activity click - could navigate to relevant page
            }}
          />
        </Col>

        {/* Quick Actions */}
        <Col xs={24} lg={12}>
          <Card title="Quick Actions" style={cardStyle}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Link href="/kennels">
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
              
              <Link href="/announcements/new">
                <Button 
                  block 
                  size="large"
                  icon={<PlusOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  Create Announcement
                </Button>
              </Link>
              
              <Link href="/analytics">
                <Button 
                  block 
                  size="large"
                  icon={<BarChartOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  View Analytics
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Profile Completion */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Profile Completion" style={cardStyle}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏠</div>
                  <Title level={4}>Complete Your Kennel Profile</Title>
                  <Paragraph>
                    Add more details to help families understand your breeding practices
                  </Paragraph>
                  <Link href="/kennels">
                    <Button type="primary">Manage Kennels</Button>
                  </Link>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>🐕</div>
                  <Title level={4}>Add Your Dogs</Title>
                  <Paragraph>
                    Showcase your breeding dogs and their health clearances
                  </Paragraph>
                  <Link href="/dogs">
                    <Button type="primary">Manage Dogs</Button>
                  </Link>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BreederDashboard;
