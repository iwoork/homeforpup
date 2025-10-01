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
    <>
      {/* Hero Section with Video Background */}
      <section style={{ 
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {/* Overlay for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(82, 196, 26, 0.75) 0%, rgba(24, 144, 255, 0.75) 100%)',
          zIndex: 1,
        }} />

        {/* Hero Content */}
        <div style={{ 
          position: 'relative', 
          zIndex: 2, 
          textAlign: 'center',
          maxWidth: '1000px',
          width: '100%',
          margin: '0 auto'
        }}>
          
          {/* Hero Text */}
          <Title level={1} style={{ 
            color: 'white', 
            marginBottom: '24px',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            lineHeight: 1.2
          }}>
            Professional Breeding Management
          </Title>
          <Paragraph style={{ 
            color: 'white', 
            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', 
            marginBottom: '48px',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            lineHeight: 1.8,
            maxWidth: '800px',
            margin: '0 auto 48px'
          }}>
            Streamline your breeding operations with our comprehensive platform. Manage kennels, track breeding programs, and connect with families seeking their perfect companion.
          </Paragraph>
          
          {/* CTA Buttons */}
          <Space size="middle" wrap style={{ width: '100%', justifyContent: 'center' }}>
            <Link href="/auth/login">
              <Button 
                type="primary" 
                size="large" 
                icon={<LoginOutlined />}
                style={{ 
                  height: '60px', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  padding: '0 32px',
                  borderRadius: '12px',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                  background: '#52c41a',
                  borderColor: '#52c41a',
                  minWidth: '160px'
                }}
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button 
                size="large"
                icon={<UserAddOutlined />}
                style={{ 
                  height: '60px', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  padding: '0 32px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                  minWidth: '160px'
                }}
              >
                Create Account
              </Button>
            </Link>
          </Space>
        </div>
      </section>

      {/* Features Section */}
      <div style={{ 
        background: '#f5f5f5',
        padding: '80px 0px',
        width: '100%'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Row gutter={[24, 32]}>
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
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ 
        background: 'white',
        padding: '80px 0',
        width: '100%'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
          
          <Space size="middle" wrap style={{ width: '100%', justifyContent: 'center' }}>
            <Link href="/auth/signup">
              <Button 
                type="primary" 
                size="large" 
                icon={<UserAddOutlined />}
                style={{ height: '48px', fontSize: '16px', fontWeight: '500', minWidth: '180px' }}
              >
                Create Your Account
              </Button>
            </Link>
            <Link href="/docs">
              <Button 
                size="large" 
                icon={<BookOutlined />}
                style={{ height: '48px', fontSize: '16px', fontWeight: '500', minWidth: '140px' }}
              >
                Learn More
              </Button>
            </Link>
          </Space>
        </Card>
        </div>
      </div>
    </>
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
