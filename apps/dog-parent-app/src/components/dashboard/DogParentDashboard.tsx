'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Space, Statistic, List, Avatar, Tag, Spin, Alert, Badge } from 'antd';
import {
  HeartOutlined,
  MessageOutlined,
  EyeOutlined,
  UserOutlined,
  SearchOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Progress } from 'antd';
import type { MessageThread } from '@homeforpup/shared-types';
import Link from 'next/link';
import { useAuth } from '@homeforpup/shared-auth';
import { ActivityFeed } from '@homeforpup/shared-activity';
import useSWR from 'swr';

const { Title, Paragraph, Text } = Typography;

interface DashboardStats {
  totalFavorites: number;
  totalMessages: number;
  profileViews: number;
  activeThreads: number;
}


const RecommendedForYou: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [recLoading, setRecLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const prefsRes = await fetch('/api/matching/preferences');
        if (!prefsRes.ok) { setRecLoading(false); return; }
        const { matchPreferences } = await prefsRes.json();
        if (!matchPreferences) { setRecLoading(false); return; }

        const res = await fetch('/api/matching/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(matchPreferences),
        });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setRecommendations(data);
      } catch {
        // No recommendations
      } finally {
        setRecLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (recLoading) return null;

  const rcStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f1f5f9',
    marginBottom: '24px',
  };

  if (!recommendations) {
    return (
      <Card
        title={<span><StarOutlined style={{ color: '#08979C', marginRight: '8px' }} />Find Your Perfect Match</span>}
        style={rcStyle}
      >
        <div style={{ textAlign: 'center', padding: '16px' }}>
          <Paragraph>Take our matching quiz to get personalized breed recommendations!</Paragraph>
          <Link href="/browse">
            <Button type="primary" style={{ background: '#08979C', borderColor: '#08979C' }}>
              Take the Quiz
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  const getColor = (s: number) => s >= 80 ? '#52c41a' : s >= 60 ? '#1890ff' : s >= 40 ? '#faad14' : '#ff4d4f';
  const top3 = recommendations.breeds?.slice(0, 3) || [];

  return (
    <Card
      title={<span><StarOutlined style={{ color: '#08979C', marginRight: '8px' }} />Recommended For You</span>}
      style={rcStyle}
      extra={
        <Link href="/recommendations">
          <Button type="link" size="small">View All Recommendations</Button>
        </Link>
      }
    >
      <Row gutter={[16, 16]}>
        {top3.map((breed: any) => (
          <Col xs={24} sm={8} key={breed.id}>
            <Card
              size="small"
              hoverable
              style={{ borderRadius: '8px', textAlign: 'center' }}
            >
              <Progress
                type="circle"
                percent={breed.score}
                size={48}
                strokeColor={getColor(breed.score)}
                format={(pct) => <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{pct}</span>}
              />
              <div style={{ marginTop: '8px' }}>
                <Text strong style={{ color: '#08979C' }}>{breed.name}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>{breed.size} &bull; {breed.category}</Text>
              </div>
              <Link href="/recommendations">
                <Button type="link" size="small" style={{ marginTop: '4px' }}>View Details</Button>
              </Link>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

const DogParentDashboard: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalFavorites: 0,
    totalMessages: 0,
    profileViews: 0,
    activeThreads: 0
  });
  const [waitingForUser, setWaitingForUser] = useState(true);

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

  useEffect(() => {
    if (!isAuthenticated || !user) {
      const timer = setTimeout(() => {
        setWaitingForUser(false);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setWaitingForUser(false);
    }
  }, [isAuthenticated, user]);

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

    if (waitingForUser) {
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
            font-size: 11px !important;
            line-height: 1.2 !important;
          }
          .ant-statistic-content {
            font-size: 18px !important;
          }
          .ant-statistic-content-value {
            font-size: 18px !important;
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
          .ant-statistic-title {
            font-size: 10px !important;
            line-height: 1.1 !important;
          }
          .ant-statistic-content {
            font-size: 16px !important;
          }
          .ant-statistic-content-value {
            font-size: 16px !important;
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
              <Link href="/puppy-journey">
                <Button type="primary" icon={<SearchOutlined />}>
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/browse">
                <Button icon={<SearchOutlined />}>
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
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Favorites"
              value={stats.totalFavorites}
              prefix={<HeartOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Unread Messages"
              value={stats.totalMessages}
              prefix={<MessageOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Profile Views"
              value={stats.profileViews}
              prefix={<EyeOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
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

      {/* Recommended For You */}
      <RecommendedForYou />

      <Row gutter={[24, 24]}>
        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <ActivityFeed
            userId={user.userId}
            userType="dog-parent"
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
              <Link href="/puppy-journey">
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<SearchOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  Start Your Puppy Journey
                </Button>
              </Link>

              <Link href="/browse">
                <Button
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
                <Badge count={stats.totalMessages} offset={[-12, 0]} style={{ boxShadow: 'none' }}>
                  <Button
                    block
                    size="large"
                    icon={<MessageOutlined />}
                    style={{ height: '48px', fontSize: '16px', width: '100%' }}
                  >
                    Messages
                  </Button>
                </Badge>
              </Link>

              <Link href="/dashboard/groups">
                <Button
                  block
                  size="large"
                  icon={<TeamOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  My Groups
                </Button>
              </Link>

              <Link href="/kennels">
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

      {/* Recent Messages */}
      {threadsData?.threads && threadsData.threads.length > 0 && (
        <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Card
              title="Recent Messages"
              style={cardStyle}
              extra={
                <Link href="/dashboard/messages">
                  <Button type="link" size="small">View All</Button>
                </Link>
              }
            >
              <List
                dataSource={(threadsData.threads as MessageThread[]).slice(0, 3)}
                renderItem={(thread: MessageThread) => {
                  const otherParticipantId = thread.participants?.find(
                    (id: string) => id !== user.userId
                  );
                  const otherName = otherParticipantId && thread.participantNames
                    ? thread.participantNames[otherParticipantId]
                    : 'Unknown';
                  const unread = thread.unreadCount?.[user.userId] || 0;
                  const timeAgo = thread.updatedAt
                    ? new Date(thread.updatedAt).toLocaleDateString()
                    : '';
                  return (
                    <List.Item
                      style={{ cursor: 'pointer' }}
                      onClick={() => window.location.href = '/dashboard/messages'}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge dot={unread > 0}>
                            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#08979C' }} />
                          </Badge>
                        }
                        title={
                          <Space>
                            <Text strong={unread > 0}>{thread.subject}</Text>
                            {unread > 0 && (
                              <Tag color="blue">{unread} new</Tag>
                            )}
                          </Space>
                        }
                        description={
                          <Space>
                            <Text type="secondary">{otherName}</Text>
                            <Text type="secondary">·</Text>
                            <Text type="secondary">{timeAgo}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            </Card>
          </Col>
        </Row>
      )}

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

export default DogParentDashboard;
