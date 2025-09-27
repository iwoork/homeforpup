'use client';

import React from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  List,
  Avatar,
  Tag,
  Statistic,
  Divider,
  Alert,
} from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  MessageOutlined,
  CalendarOutlined,
  CameraOutlined,
  ShareAltOutlined,
  TrophyOutlined,
  StarOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  SettingOutlined,
  EyeOutlined,
  HeartOutlined,
  GlobalOutlined,
  PhoneOutlined,
  MailOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  YoutubeOutlined,
  SafetyOutlined,
  UserOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@/hooks';
import StructuredData from '@/components/StructuredData';

const { Title, Paragraph, Text } = Typography;

// Style constants matching home page
const heroStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #08979C 0%, #FA8072 100%)',
  color: 'white',
  padding: '80px 0',
  textAlign: 'center',
  width: '100%',
};

const cardStyle: React.CSSProperties = {
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  height: '100%',
  textAlign: 'center',
};

const KennelManagementLandingPage: React.FC = () => {
  const { user } = useAuth();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HomeForPup Kennel Management',
    description: 'Professional kennel management platform for dog professionals to manage kennels, track dogs, and connect with puppy parents.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free kennel management platform'
    },
    featureList: [
      'Multiple Kennel Management',
      'Parent Dog Management', 
      'Announcement System',
      'Photo & Media Management',
      'Social Media Integration',
      'Professional Tools'
    ],
    provider: {
      '@type': 'Organization',
      name: 'HomeForPup',
      url: 'https://homeforpup.com'
    }
  };

  const features = [
    {
      icon: <HomeOutlined style={{ fontSize: '36px', color: '#08979C' }} />,
      title: 'Multiple Kennel Management',
      description: 'Create and manage multiple kennels with complete business information, addresses, and contact details.',
    },
    {
      icon: <TeamOutlined style={{ fontSize: '36px', color: '#FA8072' }} />,
      title: 'Parent Dog Management',
      description: 'Add and manage parent dogs within each kennel, track breeding status, health records, and pedigrees.',
    },
    {
      icon: <MessageOutlined style={{ fontSize: '36px', color: '#08979C' }} />,
      title: 'Announcement System',
      description: 'Post announcements about litters, updates, events, and blog posts to engage with potential puppy parents.',
    },
    {
      icon: <CameraOutlined style={{ fontSize: '36px', color: '#FA8072' }} />,
      title: 'Photo & Media Management',
      description: 'Upload cover photos, gallery images, and media content to showcase your kennel and dogs.',
    },
    {
      icon: <ShareAltOutlined style={{ fontSize: '36px', color: '#08979C' }} />,
      title: 'Social Media Integration',
      description: 'Connect your social media accounts and share your kennel updates across platforms.',
    },
    {
      icon: <TrophyOutlined style={{ fontSize: '36px', color: '#FA8072' }} />,
      title: 'Business Analytics',
      description: 'Track statistics, profile views, and engagement metrics to grow your breeding business.',
    },
  ];

  const announcementTypes = [
    {
      type: 'Litter Available',
      color: 'green',
      description: 'Announce new litters with breed information, available puppies, and pricing.',
    },
    {
      type: 'Kennel Updates',
      color: 'blue',
      description: 'Share news, achievements, and updates about your breeding program.',
    },
    {
      type: 'Blog Posts',
      color: 'purple',
      description: 'Write educational content about dog care, breeding, and training.',
    },
    {
      type: 'Events',
      color: 'orange',
      description: 'Promote shows, meetups, and special events at your kennel.',
    },
  ];

  const benefits = [
    'Professional kennel profiles that attract serious puppy parents',
    'Comprehensive dog and litter management system',
    'Direct communication with potential puppy parents',
    'Social media integration for marketing',
    'Business analytics and performance tracking',
    'Mobile-responsive design for on-the-go management',
    'Secure and reliable platform',
    'Free to use for all dog professionals',
  ];

  return (
    <div style={{ minHeight: '100vh', width: '100%' }}>
      <StructuredData data={structuredData} />
      {/* Hero Section */}
      <section style={heroStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <HomeOutlined style={{ fontSize: '64px', marginBottom: '24px', display: 'block' }} />
          <Title level={1} style={{ color: 'white', marginBottom: '24px', fontSize: '48px', fontWeight: 'bold' }}>
            Professional Kennel Management
          </Title>
          <Paragraph style={{ fontSize: '20px', marginBottom: '32px', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '600px', margin: '0 auto 32px auto' }}>
            Everything you need to manage your breeding business, connect with puppy parents, and grow your kennel with professional tools and community support.
          </Paragraph>
          <Row justify="center" gutter={[16, 12]}>
            <Col xs={24} sm={12} md={8}>
              {user ? (
                <Link href="/dashboard/kennels">
                  <Button 
                    size="large" 
                    block
                    style={{ 
                      height: '48px', 
                      fontSize: '18px',
                      fontWeight: '500'
                    }}
                  >
                    Manage My Kennels
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button 
                    size="large" 
                    block
                    style={{ 
                      height: '48px', 
                      fontSize: '18px',
                      fontWeight: '500'
                    }}
                  >
                    Get Started Free
                  </Button>
                </Link>
              )}
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link href="/browse">
                <Button 
                  size="large" 
                  block
                  style={{ 
                    height: '48px', 
                    fontSize: '18px', 
                    background: 'white', 
                    color: '#08979C', 
                    borderColor: 'white',
                    fontWeight: '500'
                  }}
                >
                  Browse Kennels
                </Button>
              </Link>
            </Col>
          </Row>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '64px 0', background: 'white', width: '100%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
            What Makes Our Kennel Management Special?
          </Title>
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} md={8} key={index}>
                <Card style={cardStyle}>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    {feature.icon}
                  </div>
                  <Title level={3}>{feature.title}</Title>
                  <Paragraph>
                    {feature.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Announcement Types Section */}
      <section style={{ padding: '64px 0', background: '#F5F5F5', width: '100%' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: '48px' }}>Powerful Announcement System</Title>
          <Row gutter={[32, 32]}>
            {announcementTypes.map((announcement, index) => (
              <Col xs={24} md={8} key={index}>
                <div style={{ textAlign: 'center' }}>
                  <Tag 
                    color={announcement.color} 
                    style={{ 
                      fontSize: '16px', 
                      padding: '8px 16px',
                      marginBottom: '16px',
                      borderRadius: '20px'
                    }}
                  >
                    {announcement.type}
                  </Tag>
                  <Paragraph style={{ margin: 0, color: '#666' }}>
                    {announcement.description}
                  </Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{ padding: '64px 0', background: 'white', width: '100%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Title level={2}>Why Choose Our Platform?</Title>
            <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '16px auto 0' }}>
              Join hundreds of dog professionals who trust our platform to manage their kennels and connect with puppy parents.
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={12}>
              <div style={{ padding: '0 24px' }}>
                <Title level={3} style={{ marginBottom: '24px' }}>
                  Everything You Need to Succeed
                </Title>
                <List
                  dataSource={benefits}
                  renderItem={(benefit) => (
                    <List.Item style={{ border: 'none', padding: '8px 0' }}>
                      <CheckCircleOutlined style={{ color: '#08979C', marginRight: '12px', fontSize: '16px' }} />
                      <Text style={{ fontSize: '16px' }}>{benefit}</Text>
                    </List.Item>
                  )}
                />
                <div style={{ marginTop: '32px' }}>
                  {user ? (
                    <Link href="/dashboard/kennels">
                      <Button 
                        type="primary" 
                        size="large" 
                        style={{ 
                          height: '48px', 
                          padding: '0 32px', 
                          fontSize: '18px',
                          background: '#08979C',
                          borderColor: '#08979C',
                          fontWeight: '500'
                        }}
                      >
                        Start Managing Your Kennels
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/signup">
                      <Button 
                        type="primary" 
                        size="large" 
                        style={{ 
                          height: '48px', 
                          padding: '0 32px', 
                          fontSize: '18px',
                          background: '#08979C',
                          borderColor: '#08979C',
                          fontWeight: '500'
                        }}
                      >
                        Get Started Today
                      </Button>
                    </Link>
                  )}
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
                    Kennel Management Features
                  </Title>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="Multiple Kennels"
                        value="∞"
                        prefix={<HomeOutlined />}
                        valueStyle={{ color: '#08979C' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Announcement Types"
                        value="4"
                        prefix={<MessageOutlined />}
                        valueStyle={{ color: '#FA8072' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Social Platforms"
                        value="4"
                        prefix={<ShareAltOutlined />}
                        valueStyle={{ color: '#08979C' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Free Forever"
                        value="100%"
                        prefix={<StarOutlined />}
                        valueStyle={{ color: '#FA8072' }}
                      />
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '64px 0', background: '#fdf6e3', textAlign: 'center', width: '100%' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          <Title level={2} style={{ marginBottom: '24px' }}>
            Ready to Take Your Kennel to the Next Level?
          </Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '32px' }}>
            Join thousands of dog professionals who trust our platform to manage their kennels and connect with puppy parents.
          </Paragraph>
          <Row justify="center" gutter={16}>
            <Col>
              {user ? (
                <Link href="/dashboard/kennels">
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
                    Go to Kennel Management
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
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
                    Create Free Account
                  </Button>
                </Link>
              )}
            </Col>
            <Col>
              <Link href="/browse">
                <Button 
                  size="large" 
                  style={{ 
                    height: '48px', 
                    padding: '0 32px', 
                    fontSize: '18px',
                    fontWeight: '500'
                  }}
                >
                  Explore Kennels
                </Button>
              </Link>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default KennelManagementLandingPage;
