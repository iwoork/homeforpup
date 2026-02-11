'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Tag, Segmented } from 'antd';
import { CheckOutlined, CrownOutlined, RocketOutlined, StarOutlined, ThunderboltOutlined } from '@ant-design/icons';
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
  pro: '#08979C',
  premium: '#1890ff',
  enterprise: '#722ed1',
};

const breederAppUrl = process.env.NEXT_PUBLIC_BREEDER_APP_URL || 'http://localhost:3001';

export default function PricingPage() {
  const [interval, setInterval] = useState<BillingInterval>('monthly');

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #08979C 0%, #006d75 100%)',
        padding: '80px 24px 60px',
        textAlign: 'center',
      }}>
        <Title level={1} style={{ color: 'white', marginBottom: '16px', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
          Breeder Subscription Plans
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 32px' }}>
          Our breeder partners use these plans to manage their breeding operations on HomeForPup.
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
                    boxShadow: isPopular ? '0 8px 32px rgba(8, 151, 156, 0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
                    border: isPopular ? '2px solid #08979C' : '1px solid #f0f0f0',
                    height: '100%',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                  styles={{ body: { padding: '32px 24px' } }}
                >
                  {tier.badge && (
                    <Tag
                      color="cyan"
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
                      <Tag color="cyan" style={{ marginTop: '8px' }}>
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
                        <CheckOutlined style={{ color: '#08979C', flexShrink: 0 }} />
                        <Text style={{ fontSize: '14px' }}>{feature}</Text>
                      </div>
                    ))}
                  </div>

                  <Button
                    type={isPopular ? 'primary' : 'default'}
                    size="large"
                    block
                    href={`${breederAppUrl}/pricing`}
                    style={{
                      height: '48px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      ...(isPopular && {
                        background: '#08979C',
                        borderColor: '#08979C',
                      }),
                    }}
                  >
                    {tierId === 'free' ? 'Get Started' : 'Learn More'}
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* Info Section */}
      <div style={{ maxWidth: '800px', margin: '64px auto', padding: '0 24px 80px', textAlign: 'center' }}>
        <Title level={3}>Are you a breeder?</Title>
        <Paragraph style={{ fontSize: '1.1rem', marginBottom: '24px' }}>
          Visit the breeder portal to sign up and choose a plan that fits your needs.
        </Paragraph>
        <Button
          type="primary"
          size="large"
          href={`${breederAppUrl}/pricing`}
          style={{ height: '48px', borderRadius: '8px', fontWeight: 600, background: '#08979C', borderColor: '#08979C' }}
        >
          Go to Breeder Portal
        </Button>
      </div>
    </div>
  );
}
