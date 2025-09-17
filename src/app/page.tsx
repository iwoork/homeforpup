'use client';

import React from 'react';
import { Button, Typography, Card, Row, Col } from 'antd';
import { HeartOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

const heroStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #ff6b35 0%, #8b4513 100%)',
  color: 'white',
  padding: '80px 24px',
  textAlign: 'center',
};

const cardStyle: React.CSSProperties = {
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  height: '100%',
  textAlign: 'center',
};

const HomePage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh' }}>      
      {/* Hero Section */}
      <section style={heroStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title 
            level={1} 
            style={{ 
              color: 'white', 
              marginBottom: '24px', 
              fontSize: '48px', 
              fontWeight: 'bold' 
            }}
          >
            Find Your Perfect Puppy Companion
          </Title>
          <Paragraph 
            style={{ 
              fontSize: '20px', 
              marginBottom: '32px', 
              color: 'rgba(255, 255, 255, 0.9)', 
              maxWidth: '600px', 
              margin: '0 auto 32px auto' 
            }}
          >
            Connect with verified ethical breeders committed to raising healthy, 
            well-socialized puppies in loving family environments.
          </Paragraph>
          <Row justify="center" gutter={16}>
            <Col>
              <Link href="/browse">
                <Button 
                  size="large" 
                  style={{ 
                    height: '48px', 
                    padding: '0 32px', 
                    fontSize: '18px' 
                  }}
                >
                  Browse Available Puppies
                </Button>
              </Link>
            </Col>
            <Col>
              <Link href="/auth/register">
                <Button 
                  size="large" 
                  style={{ 
                    height: '48px', 
                    padding: '0 32px', 
                    fontSize: '18px',
                    background: 'white',
                    color: '#8b4513',
                    borderColor: 'white'
                  }}
                >
                  Join as a Breeder
                </Button>
              </Link>
            </Col>
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '64px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            Why Choose HomeForPup?
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <HeartOutlined 
                  style={{ 
                    fontSize: '36px', 
                    color: '#ff6b35', 
                    marginBottom: '16px',
                    display: 'block'
                  }} 
                />
                <Title level={3}>Ethical Breeding</Title>
                <Paragraph>
                  All our breeders are committed to ethical practices, 
                  focusing on health, temperament, and responsible breeding standards.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <SafetyOutlined 
                  style={{ 
                    fontSize: '36px', 
                    color: '#ff6b35', 
                    marginBottom: '16px',
                    display: 'block'
                  }} 
                />
                <Title level={3}>Health Guaranteed</Title>
                <Paragraph>
                  Every puppy comes with health testing documentation, 
                  vaccination records, and health guarantees from verified breeders.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <UserOutlined 
                  style={{ 
                    fontSize: '36px', 
                    color: '#ff6b35', 
                    marginBottom: '16px',
                    display: 'block'
                  }} 
                />
                <Title level={3}>Verified Breeders</Title>
                <Paragraph>
                  Our platform carefully vets all breeders to ensure they meet 
                  our high standards for animal welfare and breeding practices.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '64px 24px', 
        background: '#fdf6e3',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={2} style={{ marginBottom: '24px' }}>
            Ready to Find Your Perfect Puppy?
          </Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '32px' }}>
            Join thousands of happy families who found their beloved companions through HomeForPup.
          </Paragraph>
          <Link href="/browse">
            <Button 
              type="primary" 
              size="large" 
              style={{ 
                height: '48px', 
                padding: '0 32px', 
                fontSize: '18px',
                background: '#ff6b35',
                borderColor: '#ff6b35'
              }}
            >
              Start Your Search
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;