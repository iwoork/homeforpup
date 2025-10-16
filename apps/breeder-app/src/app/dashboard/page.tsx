'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Space, Statistic, Spin, Alert } from 'antd';
import { 
  HomeOutlined, 
  TeamOutlined, 
  MessageOutlined, 
  BarChartOutlined,
  PlusOutlined,
  TrophyOutlined,
  BookOutlined,
  LogoutOutlined,
  UserOutlined,
  LoginOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
// import { ActivityFeed, ActivityStats, activityTracker } from '@homeforpup/shared-activity'; // Temporarily disabled
import useSWR from 'swr';

const { Title, Paragraph, Text } = Typography;

interface BreederStats {
  activeKennels: number;
  totalDogs: number;
  availablePuppies: number;
  newMessages: number;
  profileViews: number;
  totalFavorites: number;
}

const BreederDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<BreederStats>({
    activeKennels: 2,
    totalDogs: 8,
    availablePuppies: 3,
    newMessages: 5,
    profileViews: 42,
    totalFavorites: 12
  });

  const user = session?.user;
  const isAuthenticated = status === 'authenticated';
  const loading = status === 'loading';

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Fetch breeder data (simplified without auth)
  const { data: kennelsData } = useSWR(
    '/api/kennels',
    async (url) => {
      try {
        const response = await fetch(url);
        return response.json();
      } catch (error) {
        console.log('Kennels API not available, using mock data');
        return { kennels: [] };
      }
    }
  );

  const { data: dogsData } = useSWR(
    '/api/dogs',
    async (url) => {
      try {
        const response = await fetch(url);
        return response.json();
      } catch (error) {
        console.log('Dogs API not available, using mock data');
        return { dogs: [] };
      }
    }
  );

  // Calculate stats
  useEffect(() => {
    if (kennelsData && dogsData) {
      setStats({
        activeKennels: kennelsData.kennels?.length || 2,
        totalDogs: dogsData.dogs?.length || 8,
        availablePuppies: dogsData.dogs?.filter((dog: any) => dog.dogType === 'puppy' && dog.breedingStatus === 'available').length || 3,
        newMessages: 5, // Mock data
        profileViews: 42, // Mock data
        totalFavorites: 12 // Mock data
      });
    }
  }, [kennelsData, dogsData]);

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f1f5f9'
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <Card>
          <Title level={3}>Authentication Required</Title>
          <Paragraph>Please sign in to access the dashboard.</Paragraph>
          <Link href="/auth/login">
            <Button type="primary" icon={<LoginOutlined />}>Sign In</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
  
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 16px !important;
          }
          .ant-col {
            margin-bottom: 16px !important;
          }
          .ant-card {
            margin-bottom: 16px !important;
          }
          .ant-card-head {
            padding: 0 16px !important;
            min-height: 48px !important;
          }
          .ant-card-head-title {
            font-size: 16px !important;
            padding: 12px 0 !important;
          }
          .ant-card-body {
            padding: 16px !important;
          }
          .ant-statistic-title {
            font-size: 12px !important;
          }
          .ant-statistic-content {
            font-size: 20px !important;
          }
          .ant-btn {
            height: 44px !important;
            font-size: 14px !important;
          }
          .ant-typography h1 {
            font-size: 24px !important;
          }
          .ant-typography h4 {
            font-size: 16px !important;
          }
        }
        @media (max-width: 480px) {
          .dashboard-container {
            padding: 12px !important;
          }
          .ant-card-body {
            padding: 12px !important;
          }
          .ant-card-head {
            padding: 0 12px !important;
            min-height: 44px !important;
          }
          .ant-card-head-title {
            font-size: 14px !important;
            padding: 8px 0 !important;
          }
          .ant-btn {
            height: 40px !important;
            font-size: 13px !important;
          }
          .ant-typography h1 {
            font-size: 20px !important;
          }
          .ant-typography h4 {
            font-size: 14px !important;
          }
        }
        `
      }} />
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

      {/* Activity Stats - Temporarily disabled */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="Activity Overview" style={cardStyle}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <Title level={4}>Activity Tracking</Title>
              <Paragraph>
                Activity tracking will be available once authentication is enabled.
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Recent Activity - Temporarily disabled */}
        <Col xs={24} lg={12}>
          <Card title="Recent Activity" style={cardStyle}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
              <Title level={4}>Activity Feed</Title>
              <Paragraph>
                Recent activity will be displayed here once authentication is enabled.
              </Paragraph>
            </div>
          </Card>
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
              
              <Link href="/docs">
                <Button 
                  block 
                  size="large"
                  icon={<BookOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  Help & Documentation
                </Button>
              </Link>
              
              <Link href="/profile/edit">
                <Button 
                  block 
                  size="large"
                  icon={<UserOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  Edit Profile
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
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>👤</div>
                  <Title level={4}>Personal Profile</Title>
                  <Paragraph>
                    Update your personal information, contact details, and preferences
                  </Paragraph>
                  <Link href="/profile/edit">
                    <Button type="primary">Edit Profile</Button>
                  </Link>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏠</div>
                  <Title level={4}>Manage Your Kennel Profile</Title>
                  <Paragraph>
                    Your kennel profile contains all your business information including contact details, social media, facilities, and breeding specialties
                  </Paragraph>
                  <Link href="/kennels">
                    <Button type="primary">Manage Kennels</Button>
                  </Link>
                </div>
              </Col>
              <Col xs={24} sm={8}>
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
