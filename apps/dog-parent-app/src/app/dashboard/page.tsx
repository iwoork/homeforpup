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
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { MessageThread } from '@homeforpup/shared-types';
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

  // Fetch verification status
  const { data: verificationData } = useSWR(
    isAuthenticated ? '/api/verification/status' : null,
    async (url) => {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    }
  );

  // Fetch trust score when verified
  const { data: trustScoreData } = useSWR(
    isAuthenticated && verificationData?.status === 'approved' && user?.userId
      ? `/api/breeders/${user.userId}/trust-score`
      : null,
    async (url) => {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
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

  // Track page view activity
  useEffect(() => {
    if (user?.userId) {
      activityTracker.trackPageView(user.userId, 'dashboard');
    }
  }, [user?.userId]);

  // If not authenticated and not loading, show auth required message
  // Give it a moment for user data to load after session is established
  // IMPORTANT: This hook must be called before any early returns to follow Rules of Hooks
  useEffect(() => {
    if (!isAuthenticated || !user) {
      const timer = setTimeout(() => {
        setWaitingForUser(false);
      }, 2000); // Wait 2 seconds for user data to load
      
      return () => clearTimeout(timer);
    } else {
      setWaitingForUser(false);
    }
  }, [isAuthenticated, user]);

  // Show loading state while checking authentication or fetching user data
  // All hooks must be called before any conditional returns
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

      {/* Verification Status Card */}
      {verificationData && (() => {
        const vStatus = verificationData.status;
        const vRequest = verificationData.verificationRequest;

        if (vStatus === 'none' || !vStatus) {
          // Not verified - show CTA
          return (
            <Card
              style={{ marginBottom: '24px', ...cardStyle, borderLeft: '4px solid #08979C' }}
            >
              <Row align="middle" gutter={24}>
                <Col xs={24} md={16}>
                  <Space align="start" size={16}>
                    <SafetyCertificateOutlined style={{ fontSize: '36px', color: '#08979C' }} />
                    <div>
                      <Title level={4} style={{ margin: 0, color: '#08979C' }}>Get Verified</Title>
                      <Paragraph style={{ margin: '8px 0 12px 0', color: '#666' }}>
                        Earn a verified badge and build trust with potential families.
                      </Paragraph>
                      <Space direction="vertical" size={4}>
                        <Text><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />Trust badge on your profile</Text>
                        <Text><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />Higher search ranking</Text>
                        <Text><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />More inquiries from families</Text>
                      </Space>
                    </div>
                  </Space>
                </Col>
                <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                  <Link href="/verification">
                    <Button type="primary" size="large" icon={<SafetyCertificateOutlined />}>
                      Start Verification
                    </Button>
                  </Link>
                </Col>
              </Row>
            </Card>
          );
        }

        if (vStatus === 'pending' || vStatus === 'in_review') {
          return (
            <Card
              style={{ marginBottom: '24px', ...cardStyle, borderLeft: '4px solid #faad14' }}
            >
              <Row align="middle" gutter={24}>
                <Col xs={24} md={16}>
                  <Space align="start" size={16}>
                    <ClockCircleOutlined style={{ fontSize: '36px', color: '#faad14' }} />
                    <div>
                      <Title level={4} style={{ margin: 0, color: '#faad14' }}>Verification In Progress</Title>
                      <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
                        Your verification request is being reviewed. This typically takes 2-3 business days.
                      </Paragraph>
                      {vRequest?.submittedAt && (
                        <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
                          Submitted: {new Date(vRequest.submittedAt).toLocaleDateString()}
                        </Text>
                      )}
                      <Tag color={vStatus === 'pending' ? 'orange' : 'blue'} style={{ marginTop: 8 }}>
                        {vStatus === 'pending' ? 'Pending Review' : 'In Review'}
                      </Tag>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>
          );
        }

        if (vStatus === 'approved') {
          const trustScore = trustScoreData?.total;
          const badgeLevel = trustScore && trustScore >= 80 ? 'Premium Verified' : 'Verified';
          return (
            <Card
              style={{ marginBottom: '24px', ...cardStyle, borderLeft: '4px solid #52c41a' }}
            >
              <Row align="middle" gutter={24}>
                <Col xs={24} md={16}>
                  <Space align="start" size={16}>
                    <CheckCircleOutlined style={{ fontSize: '36px', color: '#52c41a' }} />
                    <div>
                      <Title level={4} style={{ margin: 0, color: '#52c41a' }}>Verified Breeder</Title>
                      <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
                        Your breeder profile has been verified by HomeForPup.
                      </Paragraph>
                      {vRequest?.reviewedAt && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                          Verified on: {new Date(vRequest.reviewedAt).toLocaleDateString()}
                        </Text>
                      )}
                      <Space style={{ marginTop: 8 }}>
                        <Tag color="green">{badgeLevel}</Tag>
                        {trustScore !== undefined && trustScore !== null && (
                          <Tag color={trustScore >= 80 ? 'gold' : trustScore >= 60 ? 'blue' : 'default'}>
                            Trust Score: {trustScore}
                          </Tag>
                        )}
                      </Space>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>
          );
        }

        if (vStatus === 'rejected') {
          return (
            <Card
              style={{ marginBottom: '24px', ...cardStyle, borderLeft: '4px solid #ff4d4f' }}
            >
              <Row align="middle" gutter={24}>
                <Col xs={24} md={16}>
                  <Space align="start" size={16}>
                    <ExclamationCircleOutlined style={{ fontSize: '36px', color: '#ff4d4f' }} />
                    <div>
                      <Title level={4} style={{ margin: 0, color: '#ff4d4f' }}>Verification Needs Attention</Title>
                      <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
                        Your verification request was not approved. Please review the feedback and resubmit.
                      </Paragraph>
                      {vRequest?.reviewerNotes && (
                        <Alert
                          type="warning"
                          message="Reviewer Feedback"
                          description={vRequest.reviewerNotes}
                          style={{ marginTop: 8 }}
                        />
                      )}
                    </div>
                  </Space>
                </Col>
                <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                  <Link href="/verification">
                    <Button type="primary" danger size="large" icon={<SafetyCertificateOutlined />}>
                      Resubmit
                    </Button>
                  </Link>
                </Col>
              </Row>
            </Card>
          );
        }

        return null;
      })()}

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
              // Handle activity click - could navigate to relevant page
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
