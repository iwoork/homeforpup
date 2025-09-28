'use client';

import React, { useState } from 'react';
import { Button, Typography, Card, Row, Col, Form, Input, message } from 'antd';
import { ShopOutlined, TeamOutlined, UserOutlined, CheckCircleOutlined, HomeOutlined, TrophyOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@homeforpup/shared-auth';
import { UserTypeModal } from '@/components';

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

const BreederHomePage: React.FC = () => {
  const { user, signIn } = useAuth();
  const [userTypeModalVisible, setUserTypeModalVisible] = useState(false);
  const [newsletterForm] = Form.useForm();
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const handleJoinCommunity = () => {
    if (user) {
      // User is already logged in, redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      // Show user type selection modal for signup
      setUserTypeModalVisible(true);
    }
  };

  const handleUserTypeSelection = (_userType: 'breeder' | 'adopter') => {
    setUserTypeModalVisible(false);
    // Call signIn without parameters to match Header component behavior
    signIn();
  };

  const handleLogin = () => {
    setUserTypeModalVisible(false);
    // Call signIn without parameters to match Header component behavior
    signIn();
  };

  const handleNewsletterSubmit = async (values: { email: string }) => {
    setNewsletterLoading(true);
    
    try {
      // Replace this with your actual API endpoint
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      });

      if (response.ok) {
        message.success('Successfully subscribed to our newsletter! 🎉');
        newsletterForm.resetFields();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      message.error('Something went wrong. Please try again later.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <style jsx global>{`
        @media (max-width: 767px) {
          .hero-buttons .ant-col {
            width: 100% !important;
            margin-bottom: 12px;
          }
          .hero-buttons .ant-col:last-child {
            margin-bottom: 0;
          }
          .newsletter-form {
            flex-direction: column !important;
          }
          .newsletter-form .ant-form-item {
            margin-bottom: 16px !important;
          }
          .newsletter-form .ant-form-item:last-child {
            margin-bottom: 0 !important;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section style={heroStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={1} style={{ color: 'white', marginBottom: '24px', fontSize: '48px', fontWeight: 'bold' }}>
            Professional Kennel Management Platform
          </Title>
          <Paragraph style={{ fontSize: '20px', marginBottom: '32px', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '600px', margin: '0 auto 32px auto' }}>
            Everything you need to manage your breeding business, connect with puppy parents, and grow your kennel with professional tools and community support.
          </Paragraph>
          <Row justify="center" gutter={[16, 12]} className="hero-buttons">
            <Col xs={24} sm={12} md={8}>
              <Link href="/kennel-management">
                <Button 
                  size="large" 
                  block
                  style={{ 
                    height: '48px', 
                    fontSize: '18px',
                    fontWeight: '500'
                  }}
                >
                  Manage Your Kennel
                </Button>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Button 
                size="large" 
                block
                onClick={handleJoinCommunity}
                style={{ 
                  height: '48px', 
                  fontSize: '18px', 
                  background: 'white', 
                  color: '#08979C', 
                  borderColor: 'white',
                  fontWeight: '500'
                }}
              >
                {user ? 'Go to Dashboard' : 'Join as Breeder'}
              </Button>
            </Col>
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '64px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            Why Choose Our Platform?
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <ShopOutlined style={{ fontSize: '36px', color: '#FA8072', marginBottom: '16px', display: 'block' }} />
                <Title level={3}>Kennel Management</Title>
                <Paragraph>
                  Complete tools to manage your breeding business, track litters, manage puppy listings, and connect with potential families.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <TeamOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px', display: 'block' }} />
                <Title level={3}>Verified Network</Title>
                <Paragraph>
                  Join a trusted network of professional breeders and connect with responsible families who are committed to providing excellent homes.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <TrophyOutlined style={{ fontSize: '36px', color: '#FA8072', marginBottom: '16px', display: 'block' }} />
                <Title level={3}>Professional Tools</Title>
                <Paragraph>
                  Access professional breeding tools, health tracking, pedigree management, and business analytics to grow your kennel.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '64px 24px', background: '#F5F5F5' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '48px' }}>Your Journey to Professional Breeding</Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <CheckCircleOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4}>1. Set Up Your Kennel</Title>
              <Paragraph>Create your professional kennel profile, showcase your breeding program, and establish your reputation in the community.</Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <UserOutlined style={{ fontSize: '36px', color: '#FA8072', marginBottom: '16px' }} />
              <Title level={4}>2. Connect with Families</Title>
              <Paragraph>Meet responsible families looking for their perfect companion and build lasting relationships with puppy parents.</Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <HomeOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4}>3. Grow Your Business</Title>
              <Paragraph>Use our professional tools to manage your breeding program, track health records, and grow your kennel business.</Paragraph>
            </Col>
          </Row>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '64px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '48px' }}>Success Stories from Our Breeders</Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <Paragraph>&ldquo;This platform has transformed my breeding business. The tools are professional and the families I meet are truly committed to responsible pet ownership.&rdquo;</Paragraph>
                <Title level={4}>&mdash; Sarah Johnson, Golden Dreams Kennel</Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <Paragraph>&ldquo;The kennel management features are incredible. I can track everything from health records to family communications all in one place.&rdquo;</Paragraph>
                <Title level={4}>&mdash; Mike Chen, Vancouver Labs</Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <Paragraph>&ldquo;The community here is amazing. I've built lasting relationships with families and other breeders who share my passion for responsible breeding.&rdquo;</Paragraph>
                <Title level={4}>&mdash; Lisa Rodriguez, Montreal Frenchies</Title>
              </Card>
          </Row>
        </div>
      </section>

      {/* Newsletter Section */}
      <section style={{ padding: '64px 24px', background: '#E6F7F7', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Title level={2} style={{ marginBottom: '24px' }}>Stay Updated on Breeding Best Practices</Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '32px' }}>
            Join our breeder newsletter for industry insights, health tips, business advice, and community updates.
          </Paragraph>
          <Form 
            form={newsletterForm}
            onFinish={handleNewsletterSubmit}
            className="newsletter-form" 
            style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}
          >
            <Form.Item 
              name="email" 
              style={{ flex: 1, marginBottom: 0 }}
              rules={[
                { required: true, message: 'Please enter your email address' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
            >
              <Input 
                placeholder="Enter your email" 
                size="large" 
                disabled={newsletterLoading}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button 
                type="primary" 
                size="large" 
                htmlType="submit"
                loading={newsletterLoading}
                block
                style={{ 
                  background: '#08979C', 
                  borderColor: '#08979C',
                  minWidth: '120px'
                }}
              >
                Join Us
              </Button>
            </Form.Item>
          </Form>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '64px 24px', background: '#fdf6e3', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={2} style={{ marginBottom: '24px' }}>
            Ready to Grow Your Breeding Business?
          </Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '32px' }}>
            Join our professional breeder community and access the tools you need to build a successful, ethical breeding business.
          </Paragraph>
          <Row justify="center" gutter={16}>
            <Col>
              <Link href="/kennel-management">
                <Button 
                  type="primary" 
                  size="large" 
                  style={{ 
                    height: '48px', 
                    padding: '0 32px', 
                    fontSize: '18px', 
                    background: '#FA8072', 
                    borderColor: '#FA8072',
                    fontWeight: '500'
                  }}
                >
                  Start Your Kennel
                </Button>
              </Link>
            </Col>
            {!user && (
              <Col>
                <Button 
                  size="large" 
                  onClick={handleLogin}
                  style={{ 
                    height: '48px', 
                    padding: '0 32px', 
                    fontSize: '18px',
                    fontWeight: '500'
                  }}
                >
                  Login
                </Button>
              </Col>
            )}
          </Row>
        </div>
      </section>

      {/* User Type Selection Modal */}
      <UserTypeModal
        visible={userTypeModalVisible}
        onClose={() => setUserTypeModalVisible(false)}
        onUserTypeSelect={handleUserTypeSelection}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default BreederHomePage;