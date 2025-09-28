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
import { useAuth } from '@homeforpup/shared-auth';
import { generateBreadcrumbSchema } from '@/lib/utils/seo';
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
    description: 'A caring platform for responsible breeders to manage their kennels, nurture healthy dogs, and connect with loving families seeking their perfect companion.',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free platform for responsible breeding and family connections'
    },
    featureList: [
      'Family-Focused Kennel Management',
      'Parent Dog Care & Health Tracking', 
      'Heartwarming Announcement System',
      'Memory & Photo Sharing',
      'Community Building Tools',
      'Trust & Transparency Features'
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
      title: 'Caring Kennel Management',
      description: 'Create warm, welcoming spaces for your dogs with complete information that helps families understand your commitment to their wellbeing.',
    },
    {
      icon: <TeamOutlined style={{ fontSize: '36px', color: '#FA8072' }} />,
      title: 'Parent Dog Care & Health',
      description: 'Track the health, happiness, and lineage of your parent dogs, ensuring every puppy comes from healthy, well-cared-for parents.',
    },
    {
      icon: <MessageOutlined style={{ fontSize: '36px', color: '#08979C' }} />,
      title: 'Heartwarming Announcements',
      description: 'Share the joy of new litters, heartwarming updates, and educational content that helps families prepare for their new companion.',
    },
    {
      icon: <CameraOutlined style={{ fontSize: '36px', color: '#FA8072' }} />,
      title: 'Memory & Photo Sharing',
      description: 'Capture and share precious moments of your dogs growing up, helping families see the love and care in your kennel.',
    },
    {
      icon: <ShareAltOutlined style={{ fontSize: '36px', color: '#08979C' }} />,
      title: 'Community Building',
      description: 'Connect with other responsible breeders and share your journey of helping families find their perfect furry companion.',
    },
    {
      icon: <HeartOutlined style={{ fontSize: '36px', color: '#FA8072' }} />,
      title: 'Trust & Transparency',
      description: 'Build lasting relationships with families through open communication, health records, and ongoing support.',
    },
  ];

  const announcementTypes = [
    {
      type: 'New Litters',
      color: 'green',
      description: 'Share the joy of new arrivals with families, including breed information and how to connect with you.',
    },
    {
      type: 'Kennel Stories',
      color: 'blue',
      description: 'Share heartwarming stories about your dogs, their personalities, and the love they bring to families.',
    },
    {
      type: 'Care Guides',
      color: 'purple',
      description: 'Write helpful content about puppy care, training tips, and preparing families for their new companion.',
    },
    {
      type: 'Meet & Greets',
      color: 'orange',
      description: 'Invite families to meet your dogs and learn about responsible breeding practices.',
    },
  ];

  const benefits = [
    'Warm, welcoming kennel profiles that help families connect with you',
    'Comprehensive care tracking for your dogs and their health',
    'Open, honest communication with families seeking companions',
    'Community sharing to build trust and relationships',
    'Transparent health records and breeding information',
    'Mobile-friendly design for staying connected anywhere',
    'Secure platform that protects your family\'s privacy',
    'Free platform dedicated to responsible breeding and family connections',
  ];

  return (
    <div style={{ minHeight: '100vh', width: '100%' }}>
      <StructuredData data={structuredData} />
      {/* Hero Section */}
      <section style={heroStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <HomeOutlined style={{ fontSize: '64px', marginBottom: '24px', display: 'block' }} />
          <Title level={1} style={{ color: 'white', marginBottom: '24px', fontSize: '48px', fontWeight: 'bold' }}>
            Caring Kennel Management
          </Title>
          <Paragraph style={{ fontSize: '20px', marginBottom: '32px', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '600px', margin: '0 auto 32px auto' }}>
            Everything you need to care for your dogs, connect with loving families, and help grow happy homes through responsible breeding and open communication.
          </Paragraph>
          <Row justify="center" gutter={[16, 12]}>
            <Col xs={24} sm={12} md={8}>
              {user ? (
                <Link href="http://localhost:3001/dashboard/kennels">
                  <Button 
                    size="large" 
                    block
                    style={{ 
                      height: '48px', 
                      fontSize: '18px',
                      fontWeight: '500'
                    }}
                  >
                    Care for My Kennels
                  </Button>
                </Link>
              ) : (
                <Link href="http://localhost:3001/auth/signup">
                  <Button 
                    size="large" 
                    block
                    style={{ 
                      height: '48px', 
                      fontSize: '18px',
                      fontWeight: '500'
                    }}
                  >
                    Start Caring Today
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
                  Find Caring Kennels
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
            How We Help You Care for Families
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
          <Title level={2} style={{ marginBottom: '48px' }}>Share Your Heartwarming Stories</Title>
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
            <Title level={2}>Why Families Trust Our Platform?</Title>
            <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '16px auto 0' }}>
              Join hundreds of caring breeders who use our platform to nurture healthy dogs and help families find their perfect companion.
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={12}>
              <div style={{ padding: '0 24px' }}>
                <Title level={3} style={{ marginBottom: '24px' }}>
                  Everything You Need to Care for Families
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
                    <Link href="http://localhost:3001/dashboard/kennels">
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
                        Start Caring for Families
                      </Button>
                    </Link>
                  ) : (
                    <Link href="http://localhost:3001/auth/signup">
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
                        Begin Your Journey
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
                    Caring Kennel Features
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
                        title="Story Types"
                        value="4"
                        prefix={<MessageOutlined />}
                        valueStyle={{ color: '#FA8072' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Community Tools"
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
            Ready to Help More Families Find Love?
          </Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '32px' }}>
            Join hundreds of caring breeders who use our platform to nurture healthy dogs and help families find their perfect companion.
          </Paragraph>
          <Row justify="center" gutter={16}>
            <Col>
              {user ? (
                <Link href="http://localhost:3001/dashboard/kennels">
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
                    Care for My Kennels
                  </Button>
                </Link>
              ) : (
                <Link href="http://localhost:3001/auth/signup">
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
                    Start Your Journey
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
                  Find Caring Kennels
                </Button>
              </Link>
            </Col>
          </Row>
        </div>
      </section>

      {/* Structured Data */}
      <StructuredData 
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Kennel Management', url: '/kennel-management' }
        ])} 
      />
    </div>
  );
};

export default KennelManagementLandingPage;
