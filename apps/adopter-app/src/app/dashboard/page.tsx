'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Space, Statistic, List, Avatar, Tag, Spin, Alert } from 'antd';
import { 
  HeartOutlined, 
  MessageOutlined, 
  EyeOutlined, 
  UserOutlined,
  SearchOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@homeforpup/shared-auth';
import { ActivityFeed, activityTracker } from '@homeforpup/shared-activity';
import useSWR from 'swr';

const { Title, Paragraph, Text } = Typography;

interface DashboardStats {
  totalFavorites: number;
  totalMessages: number;
  profileViews: number;
  activeThreads: number;
}


const AdopterDashboard: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalFavorites: 0,
    totalMessages: 0,
    profileViews: 0,
    activeThreads: 0
  });

  // Fetch user's favorites
  const { data: favoritesData } = useSWR(
    isAuthenticated ? '/api/favorites' : null,
    async (url) => {
      const response = await fetch(url);
      return response.json();
    }
  );

  // Fetch user's message threads
  const { data: threadsData } = useSWR(
    isAuthenticated ? '/api/messages/threads' : null,
    async (url) => {
      const response = await fetch(url);
      return response.json();
    }
  );

  // Calculate stats
  useEffect(() => {
    if (favoritesData && threadsData && user) {
      setStats({
        totalFavorites: favoritesData.favorites?.length || 0,
        totalMessages: threadsData.threads?.reduce((total: number, thread: any) => 
          total + (thread.unreadCount?.[user.userId] || 0), 0) || 0,
        profileViews: user.profileViews || 0,
        activeThreads: threadsData.threads?.length || 0
      });
    }
  }, [favoritesData, threadsData, user]);

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
          description="Please sign in to access your dashboard."
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

  // Track page view activity
  useEffect(() => {
    if (user?.userId) {
      activityTracker.trackPageView(user.userId, 'dashboard');
    }
  }, [user?.userId]);

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f1f5f9'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
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
          .ant-typography h2 {
            font-size: 20px !important;
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
          .ant-typography h2 {
            font-size: 18px !important;
          }
          .ant-typography h4 {
            font-size: 14px !important;
          }
        }
        `
      }} />
      {/* Welcome Header */}
      <Card style={{ marginBottom: '24px', ...cardStyle }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0, color: '#08979C' }}>
              Welcome back, {user.displayName || user.name}!
            </Title>
            <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
              Here's what's happening with your adoption journey
            </Paragraph>
          </Col>
          <Col>
            <Space>
              <Link href="/browse">
                <Button type="primary" icon={<SearchOutlined />}>
                  Browse Puppies
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
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Favorites"
              value={stats.totalFavorites}
              prefix={<HeartOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Unread Messages"
              value={stats.totalMessages}
              prefix={<MessageOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Profile Views"
              value={stats.profileViews}
              prefix={<EyeOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Active Conversations"
              value={stats.activeThreads}
              prefix={<TeamOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>


      <Row gutter={[24, 24]}>
        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <ActivityFeed
            userId={user.userId}
            userType="adopter"
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
              <Link href="/browse">
                <Button 
                  type="primary" 
                  block 
                  size="large"
                  icon={<SearchOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  Browse Available Puppies
                </Button>
              </Link>
              
              <Link href="/breeds">
                <Button 
                  block 
                  size="large"
                  icon={<TrophyOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  Explore Dog Breeds
                </Button>
              </Link>
              
              <Link href="/dashboard/favorites">
                <Button 
                  block 
                  size="large"
                  icon={<HeartOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  View My Favorites
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
              
              <Link href="/breeders">
                <Button 
                  block 
                  size="large"
                  icon={<TeamOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  Connect with Breeders
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
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>📝</div>
                  <Title level={4}>Complete Your Profile</Title>
                  <Paragraph>
                    Add more details to help breeders understand your preferences
                  </Paragraph>
                  <Link href={`/users/${user.userId}/edit`}>
                    <Button type="primary">Edit Profile</Button>
                  </Link>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎯</div>
                  <Title level={4}>Set Preferences</Title>
                  <Paragraph>
                    Tell us about your ideal dog to get better matches
                  </Paragraph>
                  <Link href={`/users/${user.userId}/edit`}>
                    <Button type="primary">Set Preferences</Button>
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

export default AdopterDashboard;
