'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Space, Statistic, Spin, Tag, Empty } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  MessageOutlined,
  BarChartOutlined,
  PlusOutlined,
  TrophyOutlined,
  LoginOutlined,
  CrownOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@homeforpup/shared-types';

const { Title, Paragraph, Text } = Typography;

const tierColors: Record<SubscriptionTier, string> = {
  free: '#8c8c8c',
  pro: '#52c41a',
  premium: '#1890ff',
  enterprise: '#722ed1',
};

const litterStatusColors: Record<string, string> = {
  expected: 'blue',
  born: 'green',
  weaned: 'orange',
  ready_for_homes: 'cyan',
  sold: 'default',
  completed: 'default',
};

const ACTIVE_LITTER_STATUSES = ['expected', 'born', 'weaned', 'ready_for_homes'];

interface VetVisitInfo {
  dogName: string;
  dogId: string;
  visitType: string;
  followUpDate: string;
  vetName: string;
  reason: string;
}

const safeFetcher = async (url: string) => {
  try {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
};

const BreederDashboard: React.FC = () => {
  const { status } = useSession();
  const [upcomingVetVisits, setUpcomingVetVisits] = useState<VetVisitInfo[]>([]);
  const [vetVisitsLoading, setVetVisitsLoading] = useState(false);

  const isAuthenticated = status === 'authenticated';
  const loading = status === 'loading';

  // Data fetching
  const { data: kennelsData } = useSWR('/api/kennels', safeFetcher);
  const { data: parentDogsData } = useSWR('/api/dogs?type=parent', safeFetcher);
  const { data: puppiesData } = useSWR('/api/dogs?type=puppy&breedingStatus=available', safeFetcher);
  const { data: littersData } = useSWR('/api/litters', safeFetcher);
  const { data: subscriptionData } = useSWR(
    isAuthenticated ? '/api/billing/subscription' : null,
    safeFetcher
  );

  // Computed stats
  const activeKennels = kennelsData?.kennels?.length ?? 0;
  const parentDogs = parentDogsData?.dogs?.length ?? 0;
  const availablePuppies = puppiesData?.dogs?.length ?? 0;
  const allLitters = littersData?.litters ?? [];
  const activeLitters = allLitters.filter((l: any) => ACTIVE_LITTER_STATUSES.includes(l.status));
  const activeLitterCount = activeLitters.length;

  // Subscription
  const currentTier: SubscriptionTier = subscriptionData?.tier || 'free';
  const tierDef = SUBSCRIPTION_TIERS[currentTier];
  const tierColor = tierColors[currentTier];

  // Fetch vet visits for parent dogs (limit to 5 dogs to avoid N+1)
  useEffect(() => {
    const fetchVetVisits = async () => {
      const dogs = parentDogsData?.dogs;
      if (!dogs || dogs.length === 0) {
        setUpcomingVetVisits([]);
        return;
      }

      setVetVisitsLoading(true);
      try {
        const dogsToCheck = dogs.slice(0, 5);
        const results = await Promise.all(
          dogsToCheck.map(async (dog: any) => {
            try {
              const res = await fetch(`/api/dogs/${dog.id}/vet-visits`, { credentials: 'include' });
              if (!res.ok) return [];
              const data = await res.json();
              return (data.vetVisits ?? [])
                .filter((v: any) => v.followUpRequired && v.followUpDate)
                .map((v: any) => ({
                  dogName: dog.name,
                  dogId: dog.id,
                  visitType: v.visitType,
                  followUpDate: v.followUpDate,
                  vetName: v.veterinarian?.name ?? 'Unknown',
                  reason: v.reason,
                }));
            } catch {
              return [];
            }
          })
        );
        const allVisits = results
          .flat()
          .sort((a, b) => new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime());
        setUpcomingVetVisits(allVisits.slice(0, 5));
      } finally {
        setVetVisitsLoading(false);
      }
    };

    fetchVetVisits();
  }, [parentDogsData]);

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f1f5f9',
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

      {/* Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={12} sm={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Active Kennels"
              value={activeKennels}
              prefix={<HomeOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Parent Dogs"
              value={parentDogs}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Active Litters"
              value={activeLitterCount}
              prefix={<HeartOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Available Puppies"
              value={availablePuppies}
              prefix={<TrophyOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Subscription Status */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card style={{ ...cardStyle, borderLeft: `4px solid ${tierColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CrownOutlined style={{ fontSize: '24px', color: tierColor }} />
                <div>
                  <Text strong style={{ fontSize: '16px' }}>{tierDef.name} Plan</Text>
                  <br />
                  <Text type="secondary">
                    {currentTier === 'free'
                      ? 'Upgrade to unlock more features and higher limits'
                      : tierDef.tagline}
                  </Text>
                </div>
              </div>
              <Space>
                <Link href="/dashboard/billing">
                  <Button>Manage Billing</Button>
                </Link>
                {currentTier === 'free' && (
                  <Link href="/pricing">
                    <Button type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                      Upgrade Plan
                    </Button>
                  </Link>
                )}
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Active Litters Section */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card
            title="Active Litters"
            style={cardStyle}
            extra={
              <Space>
                <Link href="/litters/new">
                  <Button type="primary" icon={<PlusOutlined />} size="small">Create Litter</Button>
                </Link>
                <Link href="/litters">
                  <Button size="small">View All</Button>
                </Link>
              </Space>
            }
          >
            {activeLitters.length === 0 ? (
              <Empty description="No active litters" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Link href="/litters/new">
                  <Button type="primary" icon={<PlusOutlined />}>Create Your First Litter</Button>
                </Link>
              </Empty>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeLitters.map((litter: any) => (
                  <div
                    key={litter.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#fafafa',
                      borderRadius: '8px',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ minWidth: '150px' }}>
                      <Text strong>{litter.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '13px' }}>
                        {litter.sireName} &times; {litter.damName}
                      </Text>
                    </div>
                    <Space wrap>
                      <Tag color={litterStatusColors[litter.status] ?? 'default'}>
                        {litter.status.replace(/_/g, ' ')}
                      </Tag>
                      <Text type="secondary">
                        {litter.actualPuppyCount ?? litter.expectedPuppyCount ?? 0} puppies
                      </Text>
                      {litter.birthDate && (
                        <Text type="secondary">
                          <CalendarOutlined /> {new Date(litter.birthDate).toLocaleDateString()}
                        </Text>
                      )}
                    </Space>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Two-Column Row: Vet Visits + Quick Actions */}
      <Row gutter={[24, 24]}>
        {/* Upcoming Vet Visits */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span><MedicineBoxOutlined style={{ marginRight: '8px' }} />Upcoming Vet Visits</span>
            }
            style={cardStyle}
          >
            {vetVisitsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
              </div>
            ) : upcomingVetVisits.length === 0 ? (
              <Empty description="No upcoming vet visits" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Text type="secondary">
                  Follow-up visits will appear here when scheduled
                </Text>
              </Empty>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcomingVetVisits.map((visit, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '12px 16px',
                      background: '#fafafa',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <Text strong>{visit.dogName}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          {visit.visitType} &mdash; {visit.reason}
                        </Text>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Text type="secondary">
                          <CalendarOutlined /> {new Date(visit.followUpDate).toLocaleDateString()}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {visit.vetName}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col xs={24} lg={12}>
          <Card title="Quick Actions" style={cardStyle}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
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
              <Link href="/dogs/new">
                <Button
                  block
                  size="large"
                  icon={<PlusOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  Add Dog
                </Button>
              </Link>
              <Link href="/litters/new">
                <Button
                  block
                  size="large"
                  icon={<PlusOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  Create Litter
                </Button>
              </Link>
              <Link href="/kennels">
                <Button
                  block
                  size="large"
                  icon={<HomeOutlined />}
                  style={{ height: '48px', fontSize: '16px' }}
                >
                  Manage Kennels
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
    </div>
  );
};

export default BreederDashboard;
