'use client';

import React, { useState } from 'react';
import { Button, Typography, Card, Row, Col, Form, Input } from 'antd';
import { HeartOutlined, SafetyOutlined, UserOutlined, SmileOutlined, HomeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import UserTypeModal from '@/components/UserTypeModal';

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
  const { user, signIn } = useAuth();
  const [userTypeModalVisible, setUserTypeModalVisible] = useState(false);

  const handleJoinCommunity = () => {
    if (user) {
      // User is already logged in, redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      // Show user type selection modal for signup
      setUserTypeModalVisible(true);
    }
  };

  const handleUserTypeSelection = (userType: 'breeder' | 'adopter') => {
    setUserTypeModalVisible(false);
    // Call signIn with 'signup' action and user type
    signIn('signup', userType);
  };

  const handleLogin = () => {
    setUserTypeModalVisible(false);
    // Call signIn with 'login' action for existing users
    signIn('login');
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
            Creating Paw-some Families, One Match at a Time
          </Title>
          <Paragraph style={{ fontSize: '20px', marginBottom: '32px', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '600px', margin: '0 auto 32px auto' }}>
            Discover a community where dog lovers and devoted breeders work together to create fur-ever bonds between families and their ideal companions.
          </Paragraph>
          <Row justify="center" gutter={[16, 12]} className="hero-buttons">
            <Col xs={24} sm={12} md={8}>
              <Link href="/browse">
                <Button 
                  size="large" 
                  block
                  style={{ 
                    height: '48px', 
                    fontSize: '18px',
                    fontWeight: '500'
                  }}
                >
                  Meet Available Puppies
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
                {user ? 'Go to Dashboard' : 'Join Our Community'}
              </Button>
            </Col>
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '64px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            What Makes Our Community Special?
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <HeartOutlined style={{ fontSize: '36px', color: '#FA8072', marginBottom: '16px', display: 'block' }} />
                <Title level={3}>Passionate Care</Title>
                <Paragraph>
                  Our community of dedicated breeders and enthusiasts prioritizes the wellbeing and happiness of every puppy, treating each one as a cherished family member.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <SafetyOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px', display: 'block' }} />
                <Title level={3}>Health & Happiness First</Title>
                <Paragraph>
                  Every puppy is raised with love and receives comprehensive health care, proper socialization, and nurturing to ensure they&apos;re ready for their forever homes.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <UserOutlined style={{ fontSize: '36px', color: '#FA8072', marginBottom: '16px', display: 'block' }} />
                <Title level={3}>Trusted Network</Title>
                <Paragraph>
                  Connect with a caring network of dog lovers who share knowledge, support each other, and are committed to responsible breeding and pet ownership.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '64px 24px', background: '#F5F5F5' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '48px' }}>Your Journey to Finding Your Paw-fect Match</Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <SmileOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4}>1. Explore & Learn</Title>
              <Paragraph>Discover different breeds, learn about their personalities, and find puppies who might be perfect additions to your family.</Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <CheckCircleOutlined style={{ fontSize: '36px', color: '#FA8072', marginBottom: '16px' }} />
              <Title level={4}>2. Connect & Build Relationships</Title>
              <Paragraph>Chat with caring breeders and fellow dog enthusiasts who share your passion and can guide you in your journey.</Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <HomeOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4}>3. Welcome Your New Family Member</Title>
              <Paragraph>Bring home your perfectly matched companion and join a community that supports your lifelong journey together.</Paragraph>
            </Col>
          </Row>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '64px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '48px' }}>Stories from Our Community</Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <Paragraph>&ldquo;The community here truly cares about matching families with their perfect companions. Our Cavapoo feels like she was meant to be with us from day one.&rdquo;</Paragraph>
                <Title level={4}>&mdash; Sarah & Max</Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <Paragraph>&ldquo;We found not just our golden retriever, but lifelong friends in the breeding community. The ongoing support has been incredible.&rdquo;</Paragraph>
                <Title level={4}>&mdash; Daniel Family</Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card style={cardStyle}>
                <Paragraph>&ldquo;The transparency and genuine care from everyone we met gave us complete confidence. Our pup came home healthy, happy, and perfectly socialized.&rdquo;</Paragraph>
                <Title level={4}>&mdash; Priya & Amit</Title>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Newsletter Section */}
      <section style={{ padding: '64px 24px', background: '#E6F7F7', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Title level={2} style={{ marginBottom: '24px' }}>Stay Connected with Our Community</Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '32px' }}>
            Join our newsletter to hear heartwarming puppy stories, get expert care tips, and be the first to meet new additions to our community family.
          </Paragraph>
          <Form className="newsletter-form" style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Form.Item name="email" style={{ flex: 1, marginBottom: 0 }}>
              <Input placeholder="Enter your email" size="large" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button 
                type="primary" 
                size="large" 
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
            Ready to Meet Your New Best Friend?
          </Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '32px' }}>
            Join our community of dog lovers and discover the joy of finding your perfect four-legged family member through meaningful connections.
          </Paragraph>
          <Row justify="center" gutter={16}>
            <Col>
              <Link href="/browse">
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
                  Meet Our Puppies
                </Button>
              </Link>
            </Col>
            {!user && (
              <Col>
                <Button 
                  size="large" 
                  onClick={() => signIn('login')}
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

export default HomePage;