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
} from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@/hooks';

const { Title, Paragraph, Text } = Typography;

const KennelManagementLandingPage: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <HomeOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      title: 'Multiple Kennel Management',
      description: 'Create and manage multiple kennels with complete business information, addresses, and contact details.',
    },
    {
      icon: <TeamOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      title: 'Parent Dog Management',
      description: 'Add and manage parent dogs within each kennel, track breeding status, health records, and pedigrees.',
    },
    {
      icon: <MessageOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      title: 'Announcement System',
      description: 'Post announcements about litters, updates, events, and blog posts to engage with potential puppy parents.',
    },
    {
      icon: <CameraOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      title: 'Photo & Media Management',
      description: 'Upload cover photos, gallery images, and media content to showcase your kennel and dogs.',
    },
    {
      icon: <ShareAltOutlined style={{ fontSize: '24px', color: '#eb2f96' }} />,
      title: 'Social Media Integration',
      description: 'Connect your social media accounts and share your kennel updates across platforms.',
    },
    {
      icon: <TrophyOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />,
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '60px 40px',
        textAlign: 'center',
        color: 'white',
        marginBottom: '60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <HomeOutlined style={{ fontSize: '64px', marginBottom: '24px' }} />
          <Title level={1} style={{ color: 'white', marginBottom: '16px', fontSize: '48px' }}>
            Professional Kennel Management
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '20px', marginBottom: '32px' }}>
            Everything you need to manage your breeding business, connect with puppy parents, and grow your kennel.
          </Paragraph>
          <Space size="large">
            {user ? (
              <Link href="/dashboard/kennels">
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<HomeOutlined />}
                  style={{ 
                    height: '50px', 
                    fontSize: '18px',
                    background: 'white',
                    color: '#667eea',
                    borderColor: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  Manage My Kennels
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signup">
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<PlusOutlined />}
                  style={{ 
                    height: '50px', 
                    fontSize: '18px',
                    background: 'white',
                    color: '#667eea',
                    borderColor: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  Get Started Free
                </Button>
              </Link>
            )}
            <Link href="/browse">
              <Button 
                size="large" 
                icon={<EyeOutlined />}
                style={{ 
                  height: '50px', 
                  fontSize: '18px',
                  background: 'transparent',
                  color: 'white',
                  borderColor: 'white',
                  fontWeight: 'bold'
                }}
              >
                Browse Kennels
              </Button>
            </Link>
          </Space>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ marginBottom: '60px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
          Complete Kennel Management Solution
        </Title>
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} md={12} lg={8} key={index}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  border: '1px solid #f0f0f0'
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  {feature.icon}
                </div>
                <Title level={4} style={{ textAlign: 'center', marginBottom: '12px' }}>
                  {feature.title}
                </Title>
                <Paragraph style={{ textAlign: 'center', color: '#666' }}>
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Announcement Types Section */}
      <div style={{ marginBottom: '60px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
          Powerful Announcement System
        </Title>
        <Row gutter={[24, 24]}>
          {announcementTypes.map((announcement, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                style={{
                  textAlign: 'center',
                  borderRadius: '12px',
                  border: `2px solid ${announcement.color === 'green' ? '#52c41a' : 
                    announcement.color === 'blue' ? '#1890ff' : 
                    announcement.color === 'purple' ? '#722ed1' : '#fa8c16'}20`
                }}
              >
                <Tag 
                  color={announcement.color} 
                  style={{ 
                    fontSize: '14px', 
                    padding: '4px 12px',
                    marginBottom: '16px'
                  }}
                >
                  {announcement.type}
                </Tag>
                <Paragraph style={{ margin: 0, color: '#666' }}>
                  {announcement.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Benefits Section */}
      <div style={{ marginBottom: '60px' }}>
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} lg={12}>
            <Title level={2} style={{ marginBottom: '24px' }}>
              Why Choose Our Kennel Management?
            </Title>
            <List
              dataSource={benefits}
              renderItem={(benefit) => (
                <List.Item style={{ border: 'none', padding: '8px 0' }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '12px' }} />
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
                    icon={<HomeOutlined />}
                    style={{ height: '50px', fontSize: '18px' }}
                  >
                    Start Managing Your Kennels
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<PlusOutlined />}
                    style={{ height: '50px', fontSize: '18px' }}
                  >
                    Get Started Today
                  </Button>
                </Link>
              )}
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
                border: '1px solid #b7eb8f',
                borderRadius: '16px',
                padding: '40px'
              }}
            >
              <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
                Kennel Management Features
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Multiple Kennels"
                    value="∞"
                    prefix={<HomeOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Announcement Types"
                    value="4"
                    prefix={<MessageOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Social Platforms"
                    value="4"
                    prefix={<ShareAltOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Free Forever"
                    value="100%"
                    prefix={<StarOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Call to Action Section */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '16px',
          textAlign: 'center',
          color: 'white',
          padding: '60px 40px'
        }}
      >
        <Title level={2} style={{ color: 'white', marginBottom: '16px' }}>
          Ready to Take Your Kennel to the Next Level?
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px' }}>
          Join thousands of dog professionals who trust our platform to manage their kennels and connect with puppy parents.
        </Paragraph>
        <Space size="large">
          {user ? (
            <Link href="/dashboard/kennels">
              <Button 
                type="primary" 
                size="large" 
                icon={<ArrowRightOutlined />}
                style={{ 
                  height: '50px', 
                  fontSize: '18px',
                  background: 'white',
                  color: '#667eea',
                  borderColor: 'white',
                  fontWeight: 'bold'
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
                icon={<PlusOutlined />}
                style={{ 
                  height: '50px', 
                  fontSize: '18px',
                  background: 'white',
                  color: '#667eea',
                  borderColor: 'white',
                  fontWeight: 'bold'
                }}
              >
                Create Free Account
              </Button>
            </Link>
          )}
          <Link href="/browse">
            <Button 
              size="large" 
              icon={<EyeOutlined />}
              style={{ 
                height: '50px', 
                fontSize: '18px',
                background: 'transparent',
                color: 'white',
                borderColor: 'white',
                fontWeight: 'bold'
              }}
            >
              Explore Kennels
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
};

export default KennelManagementLandingPage;
