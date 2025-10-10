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
  padding: '60px 16px',
  textAlign: 'center',
  minHeight: '400px',
  display: 'flex',
  alignItems: 'center',
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
  const [newsletterMessage, setNewsletterMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleJoinCommunity = () => {
    if (user) {
      // User is already logged in, redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      // Show user type selection modal for signup
      setUserTypeModalVisible(true);
    }
  };

  const handleUserTypeSelection = (_userType: 'breeder' | 'dog-parent') => {
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
    setNewsletterMessage(null);
    
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
        setNewsletterMessage({ type: 'success', text: 'Successfully subscribed to our newsletter! 🎉' });
        newsletterForm.resetFields();
      } else {
        const errorData = await response.json();
        setNewsletterMessage({ type: 'error', text: errorData.message || 'Failed to subscribe. Please try again.' });
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setNewsletterMessage({ type: 'error', text: 'Something went wrong. Please try again later.' });
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
          .hero-title {
            font-size: 28px !important;
            line-height: 1.2 !important;
            margin-bottom: 16px !important;
          }
          .hero-paragraph {
            font-size: 16px !important;
            line-height: 1.5 !important;
            margin-bottom: 24px !important;
            padding: 0 8px !important;
          }
          .hero-container {
            padding: 40px 16px !important;
          }
          .section-padding {
            padding: 40px 16px !important;
          }
          .feature-card {
            margin-bottom: 24px !important;
          }
          .cta-buttons .ant-col {
            width: 100% !important;
            margin-bottom: 12px !important;
          }
          .cta-buttons .ant-col:last-child {
            margin-bottom: 0 !important;
          }
          .ant-typography-h2 {
            font-size: 24px !important;
          }
          .ant-typography-h3 {
            font-size: 18px !important;
          }
          .ant-typography-h4 {
            font-size: 16px !important;
          }
          .ant-btn-lg {
            height: 44px !important;
            font-size: 16px !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .hero-title {
            font-size: 42px !important;
          }
          .hero-paragraph {
            font-size: 18px !important;
          }
          .section-padding {
            padding: 50px 24px !important;
          }
        }
        @media (min-width: 1024px) {
          .hero-container {
            padding: 60px 24px !important;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section style={heroStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }} className="hero-container">
          <Title level={1} className="hero-title" style={{ color: 'white', marginBottom: '24px', fontSize: '48px', fontWeight: 'bold' }}>
            Professional Kennel Management Platform
          </Title>
          <Paragraph className="hero-paragraph" style={{ fontSize: '20px', marginBottom: '32px', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '600px', margin: '0 auto 32px auto' }}>
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
      <section style={{ padding: '64px 24px', background: 'white' }} className="section-padding">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px', fontSize: '32px' }}>
            Why Choose Our Platform?
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card style={cardStyle} className="feature-card">
                <ShopOutlined style={{ fontSize: '36px', color: '#FA8072', marginBottom: '16px', display: 'block' }} />
                <Title level={3} style={{ fontSize: '20px' }}>Kennel Management</Title>
                <Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  Complete tools to manage your breeding business, track litters, manage puppy listings, and connect with potential families.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle} className="feature-card">
                <TeamOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px', display: 'block' }} />
                <Title level={3} style={{ fontSize: '20px' }}>Verified Network</Title>
                <Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  Join a trusted network of professional breeders and connect with responsible families who are committed to providing excellent homes.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle} className="feature-card">
                <TrophyOutlined style={{ fontSize: '36px', color: '#FA8072', marginBottom: '16px', display: 'block' }} />
                <Title level={3} style={{ fontSize: '20px' }}>Professional Tools</Title>
                <Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  Access professional breeding tools, health tracking, pedigree management, and business analytics to grow your kennel.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '64px 24px', background: '#F5F5F5' }} className="section-padding">
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '48px', fontSize: '32px' }}>Your Journey to Professional Breeding</Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <CheckCircleOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4} style={{ fontSize: '18px', marginBottom: '12px' }}>1. Set Up Your Kennel</Title>
              <Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>Create your professional kennel profile, showcase your breeding program, and establish your reputation in the community.</Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <UserOutlined style={{ fontSize: '36px', color: '#FA8072', marginBottom: '16px' }} />
              <Title level={4} style={{ fontSize: '18px', marginBottom: '12px' }}>2. Connect with Families</Title>
              <Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>Meet responsible families looking for their perfect companion and build lasting relationships with puppy parents.</Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <HomeOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4} style={{ fontSize: '18px', marginBottom: '12px' }}>3. Grow Your Business</Title>
              <Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>Use our professional tools to manage your breeding program, track health records, and grow your kennel business.</Paragraph>
            </Col>
          </Row>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '64px 24px', background: 'white' }} className="section-padding">
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '48px', fontSize: '32px' }}>Success Stories from Our Breeders</Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card style={cardStyle} className="feature-card">
                <Paragraph style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>&ldquo;This platform has transformed my breeding business. The tools are professional and the families I meet are truly committed to responsible pet ownership.&rdquo;</Paragraph>
                <Title level={4} style={{ fontSize: '16px', margin: 0 }}>&mdash; Sarah Johnson, Golden Dreams Kennel</Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle} className="feature-card">
                <Paragraph style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>&ldquo;The kennel management features are incredible. I can track everything from health records to family communications all in one place.&rdquo;</Paragraph>
                <Title level={4} style={{ fontSize: '16px', margin: 0 }}>&mdash; Mike Chen, Vancouver Labs</Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle} className="feature-card">
                <Paragraph style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>&ldquo;The community here is amazing. I've built lasting relationships with families and other breeders who share my passion for responsible breeding.&rdquo;</Paragraph>
                <Title level={4} style={{ fontSize: '16px', margin: 0 }}>&mdash; Lisa Rodriguez, Montreal Frenchies</Title>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Newsletter Section */}
      <section style={{ padding: '64px 24px', background: '#E6F7F7', textAlign: 'center' }} className="section-padding">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Title level={2} style={{ marginBottom: '24px', fontSize: '28px' }}>Stay Updated on Breeding Best Practices</Title>
          <Paragraph style={{ fontSize: '16px', marginBottom: '32px', lineHeight: '1.6' }}>
            Join our breeder newsletter for industry insights, health tips, business advice, and community updates.
          </Paragraph>
          
          {/* Newsletter Message Display */}
          {newsletterMessage && (
            <div 
              style={{
                marginBottom: '24px',
                padding: '12px 24px',
                borderRadius: '8px',
                backgroundColor: newsletterMessage.type === 'success' ? '#f6ffed' : '#fff2f0',
                border: `1px solid ${newsletterMessage.type === 'success' ? '#b7eb8f' : '#ffccc7'}`,
                color: newsletterMessage.type === 'success' ? '#52c41a' : '#ff4d4f',
                fontSize: '16px',
                fontWeight: '500',
                textAlign: 'center'
              }}
            >
              {newsletterMessage.text}
            </div>
          )}
          
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
      <section style={{ padding: '64px 24px', background: '#fdf6e3', textAlign: 'center' }} className="section-padding">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={2} style={{ marginBottom: '24px', fontSize: '28px' }}>
            Ready to Grow Your Breeding Business?
          </Title>
          <Paragraph style={{ fontSize: '16px', marginBottom: '32px', lineHeight: '1.6' }}>
            Join our professional breeder community and access the tools you need to build a successful, ethical breeding business.
          </Paragraph>
          <Row justify="center" gutter={16} className="cta-buttons">
            <Col xs={24} sm={12}>
              <Link href="/kennel-management">
                <Button 
                  type="primary" 
                  size="large" 
                  block
                  style={{ 
                    height: '48px', 
                    fontSize: '16px', 
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
              <Col xs={24} sm={12}>
                <Button 
                  size="large" 
                  block
                  onClick={handleLogin}
                  style={{ 
                    height: '48px', 
                    fontSize: '16px',
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