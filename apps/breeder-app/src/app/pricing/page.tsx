'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Space, Tag, Segmented, Collapse, message } from 'antd';
import { CheckOutlined, CrownOutlined, RocketOutlined, StarOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SUBSCRIPTION_TIERS, SubscriptionTier, BillingInterval } from '@homeforpup/shared-types';

const { Title, Paragraph, Text } = Typography;

const tierOrder: SubscriptionTier[] = ['free', 'pro', 'premium', 'enterprise'];

const tierIcons: Record<SubscriptionTier, React.ReactNode> = {
  free: <StarOutlined />,
  pro: <RocketOutlined />,
  premium: <CrownOutlined />,
  enterprise: <ThunderboltOutlined />,
};

const tierColors: Record<SubscriptionTier, string> = {
  free: '#8c8c8c',
  pro: '#52c41a',
  premium: '#1890ff',
  enterprise: '#722ed1',
};

const faqItems = [
  {
    key: '1',
    label: 'Can I change my plan at any time?',
    children: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, the credit will be applied to your next billing cycle.',
  },
  {
    key: '2',
    label: 'Is there a free trial?',
    children: 'Yes! All paid plans include a 14-day free trial. You won\'t be charged until the trial period ends, and you can cancel anytime during the trial.',
  },
  {
    key: '3',
    label: 'What happens to my data if I downgrade?',
    children: 'Your existing data is never deleted. If you downgrade, you\'ll keep all your current kennels, dogs, and litters, but you won\'t be able to create new ones above your plan\'s limits.',
  },
  {
    key: '4',
    label: 'How does annual billing work?',
    children: 'Annual billing is paid upfront for the full year at a discounted rate. You save up to $600/year compared to monthly billing depending on your plan.',
  },
  {
    key: '5',
    label: 'Can I cancel my subscription?',
    children: 'You can cancel your subscription at any time from the billing management page. You\'ll continue to have access to your paid features until the end of your current billing period.',
  },
];

const featureComparisonRows = [
  { feature: 'Kennels', free: '1', pro: '1', premium: '5', enterprise: 'Unlimited' },
  { feature: 'Parent Dogs', free: '4', pro: '20', premium: '100', enterprise: 'Unlimited' },
  { feature: 'Active Litters', free: '2', pro: 'Unlimited', premium: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Waitlist Management', free: false, pro: true, premium: true, enterprise: true },
  { feature: 'AI Recommendations', free: false, pro: true, premium: true, enterprise: true },
  { feature: 'Advanced Analytics', free: false, pro: false, premium: true, enterprise: true },
  { feature: 'Contracts & Payments', free: false, pro: false, premium: true, enterprise: true },
  { feature: 'Branded Website', free: false, pro: false, premium: true, enterprise: true },
  { feature: 'Multi-Location', free: false, pro: false, premium: false, enterprise: true },
  { feature: 'API & Data Export', free: false, pro: false, premium: false, enterprise: true },
  { feature: 'Priority Support', free: false, pro: false, premium: false, enterprise: true },
];

export default function PricingPage() {
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const { data: session } = useSession();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (tier === 'free') {
      if (session) {
        router.push('/dashboard');
      } else {
        router.push('/auth/signup');
      }
      return;
    }

    if (!session) {
      router.push('/auth/signup');
      return;
    }

    setLoadingTier(tier);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, interval }),
      });
      const data = await res.json();
      if (!res.ok) {
        message.error(data.error || 'Failed to start checkout');
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        message.error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      message.error('Something went wrong. Please try again.');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #52c41a 0%, #237804 100%)',
        padding: '80px 24px 60px',
        textAlign: 'center',
      }}>
        <Title level={1} style={{ color: 'white', marginBottom: '16px', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          Simple, Transparent Pricing
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 32px' }}>
          Choose the plan that fits your breeding operation. Start free and upgrade as you grow.
        </Paragraph>

        <Segmented
          options={[
            { label: 'Monthly', value: 'monthly' },
            { label: 'Annual (Save up to 25%)', value: 'annual' },
          ]}
          value={interval}
          onChange={(val) => setInterval(val as BillingInterval)}
          size="large"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        />
      </div>

      {/* Pricing Cards */}
      <div style={{ maxWidth: '1200px', margin: '-40px auto 0', padding: '0 24px' }}>
        <Row gutter={[24, 24]}>
          {tierOrder.map((tierId) => {
            const tier = SUBSCRIPTION_TIERS[tierId];
            const isPopular = tierId === 'pro';
            const price = interval === 'monthly' ? tier.monthlyPrice : tier.annualPricePerMonth;

            return (
              <Col xs={24} sm={12} lg={6} key={tierId}>
                <Card
                  style={{
                    borderRadius: '16px',
                    boxShadow: isPopular ? '0 8px 32px rgba(82, 196, 26, 0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
                    border: isPopular ? '2px solid #52c41a' : '1px solid #f0f0f0',
                    height: '100%',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                  styles={{ body: { padding: '32px 24px' } }}
                >
                  {tier.badge && (
                    <Tag
                      color="green"
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '13px',
                        padding: '4px 16px',
                        borderRadius: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {tier.badge}
                    </Tag>
                  )}

                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '32px', color: tierColors[tierId], marginBottom: '8px' }}>
                      {tierIcons[tierId]}
                    </div>
                    <Title level={3} style={{ marginBottom: '4px' }}>{tier.name}</Title>
                    <Text type="secondary">{tier.tagline}</Text>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div>
                      <span style={{ fontSize: '40px', fontWeight: 700, color: tierColors[tierId] }}>
                        ${price}
                      </span>
                      {price > 0 && <span style={{ color: '#8c8c8c' }}>/mo</span>}
                    </div>
                    {interval === 'annual' && tier.annualSavings > 0 && (
                      <Tag color="green" style={{ marginTop: '8px' }}>
                        Save ${tier.annualSavings}/year
                      </Tag>
                    )}
                    {price === 0 && (
                      <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
                        Free forever
                      </Text>
                    )}
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    {tier.features.map((feature, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <CheckOutlined style={{ color: '#52c41a', flexShrink: 0 }} />
                        <Text style={{ fontSize: '14px' }}>{feature}</Text>
                      </div>
                    ))}
                  </div>

                  <Button
                    type={isPopular ? 'primary' : 'default'}
                    size="large"
                    block
                    loading={loadingTier === tierId}
                    onClick={() => handleSubscribe(tierId)}
                    style={{
                      height: '48px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      ...(isPopular && {
                        background: '#52c41a',
                        borderColor: '#52c41a',
                      }),
                    }}
                  >
                    {tierId === 'free' ? (session ? 'Current Plan' : 'Get Started Free') : 'Subscribe'}
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* Feature Comparison Table */}
      <div style={{ maxWidth: '1200px', margin: '64px auto 0', padding: '0 24px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
          Feature Comparison
        </Title>
        <Card style={{ borderRadius: '16px', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>Feature</th>
                {tierOrder.map((t) => (
                  <th key={t} style={{ textAlign: 'center', padding: '12px 16px', fontWeight: 600, color: tierColors[t] }}>
                    {SUBSCRIPTION_TIERS[t].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureComparisonRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{row.feature}</td>
                  {(['free', 'pro', 'premium', 'enterprise'] as const).map((t) => {
                    const val = row[t];
                    return (
                      <td key={t} style={{ textAlign: 'center', padding: '12px 16px' }}>
                        {typeof val === 'boolean' ? (
                          val ? <CheckOutlined style={{ color: '#52c41a' }} /> : <span style={{ color: '#d9d9d9' }}>—</span>
                        ) : (
                          <Text strong>{val}</Text>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: '800px', margin: '64px auto', padding: '0 24px 80px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
          Frequently Asked Questions
        </Title>
        <Collapse
          items={faqItems}
          bordered={false}
          style={{ background: 'white', borderRadius: '16px' }}
        />
      </div>
    </div>
  );
}
