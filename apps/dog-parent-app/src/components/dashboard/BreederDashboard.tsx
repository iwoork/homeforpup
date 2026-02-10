'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Space, Statistic, List, Avatar, Tag, Spin, Alert, Badge } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  MessageOutlined,
  UserOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  OrderedListOutlined,
  EyeOutlined,
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

  const { data: verificationData } = useSWR(
    isAuthenticated ? '/api/verification/status' : null,
    (url) => fetch(url, { credentials: 'include' }).then(res => res.ok ? res.json() : null)
  );

  const { data: contractsData } = useSWR(
    isAuthenticated && user?.userId ? `/api/contracts?breederId=${user.userId}` : null,
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

  const kennels = kennelsData?.kennels || kennelsData || [];
  const kennelCount = Array.isArray(kennels) ? kennels.length : 0;
  const dogs = dogsData?.dogs || dogsData || [];
  const dogCount = Array.isArray(dogs) ? dogs.length : 0;
  const litters = littersData?.litters || littersData || [];
  const litterCount = Array.isArray(litters) ? litters.length : 0;
  const contracts = contractsData?.contracts || contractsData || [];
  const contractCount = Array.isArray(contracts) ? contracts.length : 0;
  const threads = threadsData?.threads || [];
  const unreadMessages = threads.reduce((total: number, thread: any) =>
    total + (thread.unreadCount?.[user.userId] || 0), 0) || 0;

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
          .ant-card { margin-bottom: 16px !important; }
          .ant-card-body { padding: 16px !important; }
          .ant-statistic-title { font-size: 11px !important; }
          .ant-statistic-content-value { font-size: 18px !important; }
          .ant-btn { height: 44px !important; font-size: 14px !important; }
        }
        `
      }} />

      {/* Welcome Header */}
      <Card style={{ marginBottom: '24px', ...cardStyle }}>
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Title level={2} style={{ margin: 0, color: '#08979C' }}>
              Welcome back, {user.displayName || user.name}!
            </Title>
            <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
              Here's an overview of your breeding operation
            </Paragraph>
          </Col>
          <Col xs={24} md={10} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Link href="/kennel-management">
                <Button type="primary" icon={<HomeOutlined />}>
                  Manage Kennels
                </Button>
              </Link>
              <Link href="/dogs">
                <Button icon={<TeamOutlined />}>
                  My Dogs
                </Button>
              </Link>
              <Link href="/litters">
                <Button icon={<UnorderedListOutlined />}>
                  My Litters
                </Button>
              </Link>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Verification Status */}
      {verificationData && (() => {
        const vStatus = verificationData.status;
        const vRequest = verificationData.verificationRequest;

        if (vStatus === 'none' || !vStatus) {
          return (
            <Card style={{ marginBottom: '24px', ...cardStyle, borderLeft: '4px solid #08979C' }}>
              <Row align="middle" gutter={24}>
                <Col xs={24} md={16}>
                  <Space align="start" size={16}>
                    <SafetyCertificateOutlined style={{ fontSize: '36px', color: '#08979C' }} />
                    <div>
                      <Title level={4} style={{ margin: 0, color: '#08979C' }}>Get Verified</Title>
                      <Paragraph style={{ margin: '8px 0 12px 0', color: '#666' }}>
                        Earn a verified badge and build trust with potential families. Verified breeders receive more inquiries.
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
            <Card style={{ marginBottom: '24px', ...cardStyle, borderLeft: '4px solid #faad14' }}>
              <Row align="middle" gutter={24}>
                <Col xs={24}>
                  <Space align="start" size={16}>
                    <ClockCircleOutlined style={{ fontSize: '36px', color: '#faad14' }} />
                    <div>
                      <Title level={4} style={{ margin: 0, color: '#faad14' }}>Verification In Progress</Title>
                      <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
                        Your verification request is being reviewed. This typically takes 2-3 business days.
                      </Paragraph>
                      {vRequest?.submittedAt && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
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
          return (
            <Card style={{ marginBottom: '24px', ...cardStyle, borderLeft: '4px solid #52c41a' }}>
              <Row align="middle" gutter={24}>
                <Col xs={24}>
                  <Space align="start" size={16}>
                    <CheckCircleOutlined style={{ fontSize: '36px', color: '#52c41a' }} />
                    <div>
                      <Title level={4} style={{ margin: 0, color: '#52c41a' }}>Verified Breeder</Title>
                      <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
                        Your breeder profile is verified. Families can see your verified badge.
                      </Paragraph>
                      <Tag color="green">Verified</Tag>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>
          );
        }

        if (vStatus === 'rejected') {
          return (
            <Card style={{ marginBottom: '24px', ...cardStyle, borderLeft: '4px solid #ff4d4f' }}>
              <Row align="middle" gutter={24}>
                <Col xs={24} md={16}>
                  <Space align="start" size={16}>
                    <ExclamationCircleOutlined style={{ fontSize: '36px', color: '#ff4d4f' }} />
                    <div>
                      <Title level={4} style={{ margin: 0, color: '#ff4d4f' }}>Verification Needs Attention</Title>
                      <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
                        Please review the feedback and resubmit your verification.
                      </Paragraph>
                    </div>
                  </Space>
                </Col>
                <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                  <Link href="/verification">
                    <Button type="primary" danger icon={<SafetyCertificateOutlined />}>
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

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={8} lg={4}>
          <Card style={cardStyle} hoverable>
            <Link href="/kennel-management">
              <Statistic
                title="Kennels"
                value={kennelCount}
                prefix={<HomeOutlined style={{ color: '#08979C' }} />}
                valueStyle={{ color: '#08979C' }}
              />
            </Link>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card style={cardStyle} hoverable>
            <Link href="/dogs">
              <Statistic
                title="Dogs"
                value={dogCount}
                prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Link>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card style={cardStyle} hoverable>
            <Link href="/litters">
              <Statistic
                title="Litters"
                value={litterCount}
                prefix={<UnorderedListOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Link>
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card style={cardStyle}>
            <Statistic
              title="Contracts"
              value={contractCount}
              prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card style={cardStyle}>
            <Statistic
              title="Messages"
              value={unreadMessages}
              prefix={<MessageOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
              suffix={unreadMessages > 0 ? <Tag color="blue" style={{ fontSize: '11px', marginLeft: 4 }}>new</Tag> : undefined}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card style={cardStyle}>
            <Statistic
              title="Profile Views"
              value={user.profileViews || 0}
              prefix={<EyeOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Quick Actions */}
        <Col xs={24} lg={12}>
          <Card title="Breeder Tools" style={cardStyle}>
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
                <Badge count={unreadMessages} offset={[-12, 0]} style={{ boxShadow: 'none' }}>
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

              <Link href="/verification">
                <Button
                  block
                  size="large"
                  icon={<SafetyCertificateOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  Verification Status
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
      </Row>

      {/* Recent Messages */}
      {threads.length > 0 && (
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
                dataSource={threads.slice(0, 5)}
                renderItem={(thread: any) => {
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
                            {unread > 0 && <Tag color="blue">{unread} new</Tag>}
                          </Space>
                        }
                        description={
                          <Space>
                            <Text type="secondary">{otherName}</Text>
                            <Text type="secondary">&middot;</Text>
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

      {/* Getting Started (for new breeders) */}
      {kennelCount === 0 && (
        <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Card title="Getting Started" style={{ ...cardStyle, borderLeft: '4px solid #08979C' }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <HomeOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '12px', display: 'block' }} />
                    <Title level={4}>1. Create a Kennel</Title>
                    <Paragraph style={{ color: '#666' }}>
                      Set up your kennel profile with your name, location, and photos.
                    </Paragraph>
                    <Link href="/kennel-management">
                      <Button type="primary" style={{ background: '#08979C', borderColor: '#08979C' }}>Create Kennel</Button>
                    </Link>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <TeamOutlined style={{ fontSize: '36px', color: '#52c41a', marginBottom: '12px', display: 'block' }} />
                    <Title level={4}>2. Add Your Dogs</Title>
                    <Paragraph style={{ color: '#666' }}>
                      Register your breeding dogs with breed info, health records, and photos.
                    </Paragraph>
                    <Link href="/dogs">
                      <Button>Add Dogs</Button>
                    </Link>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <UnorderedListOutlined style={{ fontSize: '36px', color: '#fa8c16', marginBottom: '12px', display: 'block' }} />
                    <Title level={4}>3. List a Litter</Title>
                    <Paragraph style={{ color: '#666' }}>
                      Create a litter listing to connect with prospective puppy parents.
                    </Paragraph>
                    <Link href="/litters">
                      <Button>Create Litter</Button>
                    </Link>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default BreederDashboard;
