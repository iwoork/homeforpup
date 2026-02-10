'use client';

import React, { useState } from 'react';
import { Button, Typography, Card, Row, Col, Form, Input, message } from 'antd';
import { HeartOutlined, SafetyOutlined, UserOutlined, SmileOutlined, HomeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@homeforpup/shared-auth';
import UserTypeModal from '@/components/UserTypeModal';
import { generateBreadcrumbSchema } from '@/lib/utils/seo';
import StructuredData from '@/components/StructuredData';
import DogGallery from '@/components/DogGallery';

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
  const [newsletterForm] = Form.useForm();
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);


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
            margin-bottom: 16px;
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
        
        /* Enhanced button hover effects */
        .hero-buttons .ant-btn {
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        
        .hero-buttons .ant-btn:hover {
          transform: translateY(-2px) !important;
        }
        
        .hero-buttons .ant-btn:active {
          transform: translateY(0) !important;
        }
        
        /* Smooth transitions for all button states */
        .hero-buttons .ant-btn * {
          transition: all 0.3s ease;
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
          <Row justify="center" gutter={[24, 12]} className="hero-buttons">
            <Col xs={24} sm={12} md={8}>
              <Link href="/puppy-journey">
                <Button
                  size="large"
                  block
                  style={{
                    height: '56px',
                    fontSize: '20px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #E8A87C 0%, #D4A574 50%, #E8A87C 100%)',
                    borderColor: 'transparent',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(232, 168, 124, 0.3)',
                    transition: 'all 0.3s ease',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #D49A6B 0%, #C4965F 50%, #D49A6B 100%)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(232, 168, 124, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #E8A87C 0%, #D4A574 50%, #E8A87C 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(232, 168, 124, 0.3)';
                  }}
                >
                  Looking for a Puppy?
                </Button>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link href="/auth/signup?role=breeder">
                <Button
                  size="large"
                  block
                  style={{
                    height: '56px',
                    fontSize: '20px',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #6B9BD2 0%, #5A8BC2 50%, #6B9BD2 100%)',
                    color: 'white',
                    borderColor: 'transparent',
                    boxShadow: '0 4px 15px rgba(107, 155, 210, 0.3)',
                    transition: 'all 0.3s ease',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #5A8BC2 0%, #4A7BB2 50%, #5A8BC2 100%)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(107, 155, 210, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #6B9BD2 0%, #5A8BC2 50%, #6B9BD2 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(107, 155, 210, 0.3)';
                  }}
                >
                  Are You a Breeder?
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

      {/* For Breeders Section */}
      <section style={{ padding: '64px 24px', background: 'linear-gradient(135deg, #E6F7F7 0%, #f0fafa 100%)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '16px' }}>
            For Breeders
          </Title>
          <Paragraph style={{ textAlign: 'center', fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto 48px auto' }}>
            Professional tools to manage your breeding program and connect with loving families.
          </Paragraph>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={6}>
              <Card style={cardStyle}>
                <HomeOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px', display: 'block' }} />
                <Title level={4}>Kennel Management</Title>
                <Paragraph>Organize your kennel profile, showcase your facilities, and build trust with prospective families.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card style={cardStyle}>
                <SafetyOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px', display: 'block' }} />
                <Title level={4}>Litter Tracking</Title>
                <Paragraph>Track litters from birth to placement, with health records and photo galleries.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card style={cardStyle}>
                <UserOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px', display: 'block' }} />
                <Title level={4}>Waitlist Management</Title>
                <Paragraph>Manage applicant waitlists, deposits, and preferences all in one place.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card style={cardStyle}>
                <CheckCircleOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px', display: 'block' }} />
                <Title level={4}>Verified Badge</Title>
                <Paragraph>Earn verification status to stand out and build confidence with potential puppy parents.</Paragraph>
              </Card>
            </Col>
          </Row>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/auth/signup?role=breeder">
              <Button
                type="primary"
                size="large"
                style={{ height: '48px', fontSize: '16px', background: '#08979C', borderColor: '#08979C' }}
              >
                Join as a Breeder
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Dog Gallery Section */}
      <section style={{ padding: '64px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Title level={2}>Meet Our Adorable Community</Title>
            <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '16px auto 0' }}>
              Browse through our gallery of beautiful dogs from our community. Each one represents a potential new family member waiting to bring joy to your home.
            </Paragraph>
          </div>
          
          <DogGallery 
            style={{ maxWidth: '100%' }}
          />
          
        </div>
      </section>

      {/* AI Matching Section */}
      <section style={{ padding: '64px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Title level={2}>Smart Matching with AI Technology</Title>
            <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '16px auto 0' }}>
              Our advanced AI technology analyzes compatibility factors to help connect families with their ideal puppy companions.
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={12}>
              <div style={{ padding: '0 24px' }}>
                <Title level={3} style={{ marginBottom: '24px' }}>
                  How Our AI Creates Perfect Matches
                </Title>
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4} style={{ color: '#08979C', marginBottom: '8px' }}>
                    🏠 Lifestyle Compatibility
                  </Title>
                  <Paragraph>
                    Our AI considers your living space, activity level, work schedule, and family situation to recommend breeds and individual puppies that will thrive in your home.
                  </Paragraph>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4} style={{ color: '#FA8072', marginBottom: '8px' }}>
                    🧬 Personality Profiling
                  </Title>
                  <Paragraph>
                    Each puppy&apos;s temperament, energy level, and social tendencies are assessed and matched with families seeking complementary traits for harmonious relationships.
                  </Paragraph>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4} style={{ color: '#08979C', marginBottom: '8px' }}>
                    🎯 Preference Learning
                  </Title>
                  <Paragraph>
                    The system learns from your interactions and feedback to continuously improve recommendations, ensuring better matches over time.
                  </Paragraph>
                </div>
              </div>
            </Col>
            
            <Col xs={24} lg={12}>
              <div style={{ 
                background: 'linear-gradient(135deg, #E6F7F7 0%, #FFF5F5 100%)', 
                borderRadius: '16px', 
                padding: '32px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  padding: '24px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  marginBottom: '24px'
                }}>
                  <Title level={4} style={{ color: '#08979C', marginBottom: '16px' }}>
                    Match Compatibility Score
                  </Title>
                  <div style={{ 
                    fontSize: '48px', 
                    fontWeight: 'bold', 
                    color: '#FA8072',
                    marginBottom: '8px'
                  }}>
                    94%
                  </div>
                  <Paragraph style={{ margin: 0, color: '#666' }}>
                    Excellent match based on your preferences
                  </Paragraph>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#08979C' }}>🏃‍♂️</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Energy Level</div>
                    <div style={{ fontWeight: 'bold' }}>High</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FA8072' }}>👨‍👩‍👧‍👦</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Family Size</div>
                    <div style={{ fontWeight: 'bold' }}>4+ Members</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#08979C' }}>🏡</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Living Space</div>
                    <div style={{ fontWeight: 'bold' }}>Large Yard</div>
                  </div>
                </div>
              </div>
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


      {/* User Type Selection Modal */}
      <UserTypeModal
        visible={userTypeModalVisible}
        onClose={() => setUserTypeModalVisible(false)}
        onUserTypeSelect={handleUserTypeSelection}
        onLogin={handleLogin}
      />

      {/* Structured Data */}
      <StructuredData 
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' }
        ])} 
      />
    </div>
  );
};

export default HomePage;