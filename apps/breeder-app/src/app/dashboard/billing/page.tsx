'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Space, Tag, Progress, Modal, Spin, Alert } from 'antd';
import {
  CrownOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  SwapOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { SUBSCRIPTION_TIERS, SubscriptionTier, TierLimits } from '@homeforpup/shared-types';

const { Title, Paragraph, Text } = Typography;

const tierColors: Record<SubscriptionTier, string> = {
  free: '#8c8c8c',
  pro: '#52c41a',
  premium: '#1890ff',
  enterprise: '#722ed1',
};

const statusColors: Record<string, string> = {
  active: 'green',
  trial: 'blue',
  past_due: 'orange',
  cancelled: 'red',
  expired: 'default',
};

interface SubscriptionData {
  tier: SubscriptionTier;
  tierName: string;
  status: string;
  isPremium: boolean;
  limits: TierLimits;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function BillingPage() {
  const { data: session, status: authStatus } = useSession();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const { data: subscription, isLoading } = useSWR<SubscriptionData>(
    session ? '/api/billing/subscription' : null,
    fetcher
  );

  const { data: kennelsData } = useSWR(session ? '/api/kennels' : null, fetcher);
  const { data: dogsData } = useSWR(session ? '/api/dogs' : null, fetcher);
  const { data: littersData } = useSWR(session ? '/api/litters' : null, fetcher);

  const handleManagePayment = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
    } finally {
      setPortalLoading(false);
    }
  };

  if (authStatus === 'loading' || isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Title level={3}>Please sign in to manage billing</Title>
      </div>
    );
  }

  const tier = subscription?.tier || 'free';
  const limits = subscription?.limits || SUBSCRIPTION_TIERS.free.limits;
  const tierDef = SUBSCRIPTION_TIERS[tier];

  const kennelCount = kennelsData?.kennels?.length || 0;
  const dogCount = dogsData?.dogs?.filter((d: any) => d.dogType === 'parent')?.length || 0;
  const litterCount = littersData?.litters?.filter((l: any) => ['planned', 'expecting', 'born', 'weaning'].includes(l.status))?.length || 0;

  const getUsagePercent = (current: number, max: number) => {
    if (max === -1) return 0; // unlimited
    return Math.min(Math.round((current / max) * 100), 100);
  };

  const getProgressStatus = (percent: number): 'success' | 'normal' | 'exception' => {
    if (percent >= 100) return 'exception';
    if (percent >= 80) return 'normal';
    return 'success';
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f1f5f9',
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2}>Billing & Subscription</Title>
        <Paragraph type="secondary">Manage your subscription plan and billing details</Paragraph>
      </div>

      {subscription?.status === 'past_due' && (
        <Alert
          message="Payment Past Due"
          description="Your most recent payment failed. Please update your payment method to avoid service interruption."
          type="warning"
          showIcon
          style={{ marginBottom: '24px', borderRadius: '12px' }}
          action={
            <Button onClick={handleManagePayment} loading={portalLoading}>
              Update Payment
            </Button>
          }
        />
      )}

      <Row gutter={[24, 24]}>
        {/* Current Plan */}
        <Col xs={24} md={12}>
          <Card style={{ ...cardStyle, borderLeft: `4px solid ${tierColors[tier]}` }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text type="secondary">Current Plan</Text>
                  <Title level={3} style={{ margin: '4px 0', color: tierColors[tier] }}>
                    <CrownOutlined style={{ marginRight: '8px' }} />
                    {tierDef.name}
                  </Title>
                </div>
                <Tag color={statusColors[subscription?.status || 'active']}>
                  {subscription?.status === 'trial' ? 'Free Trial' : (subscription?.status || 'active').toUpperCase()}
                </Tag>
              </div>

              {tier !== 'free' && subscription?.subscriptionEndDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarOutlined style={{ color: '#8c8c8c' }} />
                  <Text type="secondary">
                    Next billing: {new Date(subscription.subscriptionEndDate).toLocaleDateString()}
                  </Text>
                </div>
              )}

              <Space style={{ marginTop: '16px' }}>
                <Link href="/pricing">
                  <Button icon={<SwapOutlined />}>
                    {tier === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                  </Button>
                </Link>
                {subscription?.stripeCustomerId && (
                  <Button
                    icon={<CreditCardOutlined />}
                    onClick={handleManagePayment}
                    loading={portalLoading}
                  >
                    Manage Payment
                  </Button>
                )}
              </Space>
            </Space>
          </Card>
        </Col>

        {/* Plan Price */}
        <Col xs={24} md={12}>
          <Card style={cardStyle}>
            <Text type="secondary">Monthly Cost</Text>
            <div style={{ margin: '8px 0' }}>
              <span style={{ fontSize: '36px', fontWeight: 700, color: tierColors[tier] }}>
                ${tierDef.monthlyPrice}
              </span>
              {tierDef.monthlyPrice > 0 && <span style={{ color: '#8c8c8c' }}>/mo</span>}
            </div>
            {tier === 'free' ? (
              <Text type="secondary">Upgrade to unlock more features</Text>
            ) : (
              <Text type="secondary">{tierDef.tagline}</Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Usage Stats */}
      <Card title="Usage" style={{ ...cardStyle, marginTop: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <Text strong>Kennels</Text>
            <div style={{ marginTop: '8px' }}>
              {limits.maxKennels === -1 ? (
                <div>
                  <Text>{kennelCount} used</Text>
                  <Text type="secondary" style={{ marginLeft: '8px' }}>Unlimited</Text>
                </div>
              ) : (
                <>
                  <Progress
                    percent={getUsagePercent(kennelCount, limits.maxKennels)}
                    status={getProgressStatus(getUsagePercent(kennelCount, limits.maxKennels))}
                    size="small"
                  />
                  <Text type="secondary">{kennelCount} / {limits.maxKennels}</Text>
                </>
              )}
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <Text strong>Parent Dogs</Text>
            <div style={{ marginTop: '8px' }}>
              {limits.maxParentDogs === -1 ? (
                <div>
                  <Text>{dogCount} used</Text>
                  <Text type="secondary" style={{ marginLeft: '8px' }}>Unlimited</Text>
                </div>
              ) : (
                <>
                  <Progress
                    percent={getUsagePercent(dogCount, limits.maxParentDogs)}
                    status={getProgressStatus(getUsagePercent(dogCount, limits.maxParentDogs))}
                    size="small"
                  />
                  <Text type="secondary">{dogCount} / {limits.maxParentDogs}</Text>
                </>
              )}
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <Text strong>Active Litters</Text>
            <div style={{ marginTop: '8px' }}>
              {limits.maxActiveLitters === -1 ? (
                <div>
                  <Text>{litterCount} used</Text>
                  <Text type="secondary" style={{ marginLeft: '8px' }}>Unlimited</Text>
                </div>
              ) : (
                <>
                  <Progress
                    percent={getUsagePercent(litterCount, limits.maxActiveLitters)}
                    status={getProgressStatus(getUsagePercent(litterCount, limits.maxActiveLitters))}
                    size="small"
                  />
                  <Text type="secondary">{litterCount} / {limits.maxActiveLitters}</Text>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Cancel Subscription */}
      {tier !== 'free' && subscription?.stripeCustomerId && (
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Button
            type="text"
            danger
            onClick={() => setCancelModalVisible(true)}
          >
            Cancel Subscription
          </Button>

          <Modal
            title={<><ExclamationCircleOutlined style={{ color: '#faad14', marginRight: '8px' }} />Cancel Subscription</>}
            open={cancelModalVisible}
            onCancel={() => setCancelModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setCancelModalVisible(false)}>
                Keep Subscription
              </Button>,
              <Button key="cancel" danger onClick={handleManagePayment} loading={portalLoading}>
                Proceed to Cancel
              </Button>,
            ]}
          >
            <Paragraph>
              Are you sure you want to cancel your <strong>{tierDef.name}</strong> subscription?
            </Paragraph>
            <Paragraph type="secondary">
              You&apos;ll be redirected to the billing portal where you can manage or cancel your subscription.
              Your current features will remain active until the end of your billing period.
            </Paragraph>
          </Modal>
        </div>
      )}
    </div>
  );
}
