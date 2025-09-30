'use client';

import React, { useEffect, Suspense } from 'react';
import { Button, Card, Row, Col, Typography, Space, Spin, Alert } from 'antd';
import { 
  HomeOutlined, 
  TeamOutlined, 
  MessageOutlined, 
  BarChartOutlined,
  PlusOutlined,
  LoginOutlined,
  UserAddOutlined,
  BookOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const { Title, Paragraph } = Typography;

const BreederLandingContent: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const user = session?.user;
  const isAuthenticated = status === 'authenticated';
  const loading = status === 'loading';

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

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
        <div>Loading...</div>
      </div>
    );
  }

  if (isAuthenticated && user) {
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
        <div>Redirecting to dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <HomeOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }} />
          <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
            HomeForPup Breeders
          </Title>
          <Paragraph style={{ color: 'white', fontSize: '1.2rem', marginBottom: '32px' }}>
            Professional tools for dog breeders to manage kennels, dogs, and connect with potential families
          </Paragraph>
          
          <Space size="large">
            <Link href="/auth/login">
              <Button 
                type="primary" 
                size="large" 
                icon={<LoginOutlined />}
                style={{ height: '48px', fontSize: '16px', fontWeight: '500' }}
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button 
                size="large" 
                icon={<UserAddOutlined />}
                style={{ 
                  height: '48px', 
                  fontSize: '16px', 
                  fontWeight: '500',
                  background: 'white',
                  color: '#1890ff',
                  border: '2px solid white'
                }}
              >
                Create Account
              </Button>
            </Link>
          </Space>
        </div>

        {/* Features */}
        <Row gutter={[32, 32]} style={{ marginBottom: '60px' }}>
          <Col xs={24} md={8}>
            <Card 
              style={{ 
                height: '100%',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                background: 'white'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <HomeOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                <Title level={3}>Kennel Management</Title>
                <Paragraph>
                  Manage multiple kennels, update information, and create announcements for potential families.
                </Paragraph>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              style={{ 
                height: '100%',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                background: 'white'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <TeamOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                <Title level={3}>Dog & Litter Tracking</Title>
                <Paragraph>
                  Track your dogs, manage litters, and maintain comprehensive health and breeding records.
                </Paragraph>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              style={{ 
                height: '100%',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                background: 'white'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <MessageOutlined style={{ fontSize: '48px', color: '#fa8c16', marginBottom: '16px' }} />
                <Title level={3}>Connect with Families</Title>
                <Paragraph>
                  Communicate with potential families, answer questions, and build lasting relationships.
                </Paragraph>
              </div>
            </Card>
          </Col>
        </Row>

        {/* CTA Section */}
        <Card 
          style={{ 
            textAlign: 'center',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            background: 'white'
          }}
        >
          <Title level={2}>Ready to Get Started?</Title>
          <Paragraph style={{ fontSize: '1.1rem', marginBottom: '32px' }}>
            Join our community of professional dog breeders and start managing your breeding business more effectively.
          </Paragraph>
          
          <Space size="large">
            <Link href="/auth/signup">
              <Button 
                type="primary" 
                size="large" 
                icon={<UserAddOutlined />}
                style={{ height: '48px', fontSize: '16px', fontWeight: '500' }}
              >
                Create Your Account
              </Button>
            </Link>
            <Link href="/docs">
              <Button 
                size="large" 
                icon={<BookOutlined />}
                style={{ height: '48px', fontSize: '16px', fontWeight: '500' }}
              >
                Learn More
              </Button>
            </Link>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default function BreederLandingPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Card style={{ 
          width: '100%',
          maxWidth: '500px',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Paragraph>Loading...</Paragraph>
          </div>
        </Card>
      </div>
    }>
      <BreederLandingContent />
    </Suspense>
  );
}
