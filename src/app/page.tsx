'use client';

import React from 'react';
import { Button, Typography, Card, Row, Col, Form, Input } from 'antd';
import { HeartOutlined, SafetyOutlined, UserOutlined, SmileOutlined, HomeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

const heroStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #08979C 0%, #FA8072 100%)',
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
          <Title level={1} style={{ color: 'white', marginBottom: '24px', fontSize: '48px', fontWeight: 'bold' }}>
            Find Your Perfect Puppy Companion
          </Title>
          <Paragraph style={{ fontSize: '20px', marginBottom: '32px', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '600px', margin: '0 auto 32px auto' }}>
            Connect with verified ethical breeders committed to raising healthy, well-socialized puppies in loving family environments.
          </Paragraph>
          <Row justify="center" gutter={16}>
            <Col>
              <Link href="/browse">
                <Button size="large" style={{ height: '48px', padding: '0 32px', fontSize: '18px' }}>
                  Browse Available Puppies
                </Button>
              </Link>
            </Col>
            <Col>
              <Link href="/auth/register">
                <Button size="large" style={{ height: '48px', padding: '0 32px', fontSize: '18px', background: 'white', color: '#08979C', borderColor: 'white' }}>
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
                <HeartOutlined style={{ fontSize: '36px', color: '#FA8072', marginBottom: '16px', display: 'block' }} />
                <Title level={3}>Ethical Breeding</Title>
                <Paragraph>
                  All our breeders are committed to ethical practices, focusing on health, temperament, and responsible breeding standards.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <SafetyOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px', display: 'block' }} />
                <Title level={3}>Health Guaranteed</Title>
                <Paragraph>
                  Every puppy comes with health testing documentation, vaccination records, and health guarantees from verified breeders.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <UserOutlined style={{ fontSize: '36px', color: '#FA8072', marginBottom: '16px', display: 'block' }} />
                <Title level={3}>Verified Breeders</Title>
                <Paragraph>
                  Our platform carefully vets all breeders to ensure they meet our high standards for animal welfare and breeding practices.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '64px 24px', background: '#F5F5F5' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '48px' }}>How It Works</Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <SmileOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4}>1. Browse Puppies</Title>
              <Paragraph>Search through a wide variety of breeds and find puppies that fit your lifestyle.</Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <CheckCircleOutlined style={{ fontSize: '36px', color: '#FA8072', marginBottom: '16px' }} />
              <Title level={4}>2. Connect with Breeders</Title>
              <Paragraph>Message ethical breeders directly and learn more about their puppies.</Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <HomeOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4}>3. Welcome Home</Title>
              <Paragraph>Bring your new furry friend home and start making lifelong memories.</Paragraph>
            </Col>
          </Row>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '64px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '48px' }}>Happy Families</Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <Paragraph>&ldquo;We found our Cavapoo through HomeForPup and couldn&rsquo;t be happier. The breeder was amazing and supportive!&rdquo;</Paragraph>
                <Title level={4}>&mdash; Sarah & Max</Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <Paragraph>&ldquo;Our golden retriever came home healthy and happy. The process was seamless and stress-free.&rdquo;</Paragraph>
                <Title level={4}>&mdash; Daniel Family</Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <Paragraph>&ldquo;We loved the transparency. Seeing health records and breeder info made us confident in our choice.&rdquo;</Paragraph>
                <Title level={4}>&mdash; Priya & Amit</Title>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Newsletter Section */}
      <section style={{ padding: '64px 24px', background: '#E6F7F7', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Title level={2} style={{ marginBottom: '24px' }}>Stay Updated</Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '32px' }}>
            Subscribe to get the latest puppy listings, breeder updates, and tips for new dog owners.
          </Paragraph>
          <Form layout="inline" style={{ justifyContent: 'center' }}>
            <Form.Item name="email" style={{ flex: 1 }}>
              <Input placeholder="Enter your email" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" size="large" style={{ background: '#08979C', borderColor: '#08979C' }}>
                Subscribe
              </Button>
            </Form.Item>
          </Form>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '64px 24px', background: '#fdf6e3', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={2} style={{ marginBottom: '24px' }}>
            Ready to Find Your Perfect Puppy?
          </Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '32px' }}>
            Join thousands of happy families who found their beloved companions through HomeForPup.
          </Paragraph>
          <Link href="/browse">
            <Button type="primary" size="large" style={{ height: '48px', padding: '0 32px', fontSize: '18px', background: '#FA8072', borderColor: '#FA8072' }}>
              Start Your Search
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;