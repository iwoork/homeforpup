'use client';

import React from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  List,
  Tag,
  Space,
  Button,
  Divider,
  Alert,
  Timeline,
  Statistic,
  Steps
} from 'antd';
import {
  TeamOutlined,
  HeartOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  StarOutlined,
  HomeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  CalendarOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  ArrowRightOutlined,
  SettingOutlined,
  MessageOutlined,
  GiftOutlined,
  FormOutlined,
  EyeOutlined,
  BellOutlined,
  CustomerServiceOutlined,
  DatabaseOutlined,
  EditOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

const BreederResourcesPage: React.FC = () => {
  const heroStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '80px 24px',
    textAlign: 'center' as const,
    borderRadius: '12px',
    marginBottom: '48px'
  };

  const cardStyle = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    height: '100%'
  };

  const sectionStyle = {
    marginBottom: '64px'
  };

  const stats = [
    { title: 'Active Breeders', value: '500+', icon: <TeamOutlined /> },
    { title: 'Puppies Rehomed', value: '2,500+', icon: <HeartOutlined /> },
    { title: 'Waitlist Families', value: '1,200+', icon: <UserOutlined /> },
    { title: 'Success Rate', value: '98%', icon: <TrophyOutlined /> }
  ];

  const coreFeatures = [
    {
      title: 'Waitlist Management',
      description: 'Efficiently manage your puppy waitlist with automated notifications and family preferences',
      features: [
        'Automated waitlist notifications',
        'Family preference tracking',
        'Priority queue management',
        'Custom waitlist forms'
      ],
      icon: <UserOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Litter Announcements',
      description: 'Create beautiful, shareable announcements for new litters with photos and details',
      features: [
        'Custom announcement templates',
        'Photo galleries and videos',
        'Social media integration',
        'Automated family notifications'
      ],
      icon: <BellOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Custom Kennel Pages',
      description: 'Build professional kennel profiles that showcase your breeding program',
      features: [
        'Customizable kennel profiles',
        'Parent dog showcases',
        'Breeding philosophy section',
        'Photo and video galleries'
      ],
      icon: <HomeOutlined />,
      color: '#fa8c16'
    },
    {
      title: 'Family Updates',
      description: 'Keep families engaged with regular updates on puppy development and milestones',
      features: [
        'Weekly development updates',
        'Photo and video sharing',
        'Milestone tracking',
        'Automated update scheduling'
      ],
      icon: <MessageOutlined />,
      color: '#722ed1'
    },
    {
      title: 'Parent Showcases',
      description: 'Highlight your breeding dogs with detailed profiles and achievements',
      features: [
        'Detailed parent profiles',
        'Health testing documentation',
        'Show and competition records',
        'Pedigree information'
      ],
      icon: <EyeOutlined />,
      color: '#eb2f96'
    },
    {
      title: 'Puppy Applications',
      description: 'Streamline the application process with custom questionnaires and screening',
      features: [
        'Custom application forms',
        'Questionnaire builder',
        'Application scoring system',
        'Family matching algorithm'
      ],
      icon: <FormOutlined />,
      color: '#13c2c2'
    }
  ];

  const advancedFeatures = [
    {
      title: 'Guardianship Program',
      description: 'Manage co-ownership and guardian families with specialized tools',
      features: [
        'Guardian family contracts',
        'Breeding rights management',
        'Health monitoring tracking',
        'Return-to-breeder protocols'
      ],
      icon: <SafetyOutlined />,
      color: '#722ed1'
    },
    {
      title: 'Breed Information Hub',
      description: 'Comprehensive breed information and educational resources',
      features: [
        'Breed standard references',
        'Health information guides',
        'Training and care tips',
        'Breeder education materials'
      ],
      icon: <BookOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Puppy Freebies',
      description: 'Create and manage puppy packages and welcome gifts',
      features: [
        'Custom puppy packages',
        'Welcome gift management',
        'Supply tracking',
        'Delivery scheduling'
      ],
      icon: <GiftOutlined />,
      color: '#fa8c16'
    },
    {
      title: 'Unified Messaging',
      description: 'Centralized communication hub for all inquiries and updates',
      features: [
        'Unified inbox',
        'Message templates',
        'Automated responses',
        'Communication history'
      ],
      icon: <MessageOutlined />,
      color: '#1890ff'
    }
  ];

  const workflowSteps = [
    {
      title: 'Setup Your Kennel',
      description: 'Create your professional kennel profile and showcase your breeding program',
      icon: <SettingOutlined />
    },
    {
      title: 'Manage Waitlist',
      description: 'Build and maintain your puppy waitlist with family preferences and priorities',
      icon: <UserOutlined />
    },
    {
      title: 'Announce Litters',
      description: 'Create beautiful announcements and notify families about new litters',
      icon: <BellOutlined />
    },
    {
      title: 'Process Applications',
      description: 'Review applications, conduct interviews, and match families with puppies',
      icon: <FormOutlined />
    },
    {
      title: 'Provide Updates',
      description: 'Keep families engaged with regular updates on puppy development',
      icon: <MessageOutlined />
    },
    {
      title: 'Complete Rehoming',
      description: 'Finalize adoptions with contracts, health records, and welcome packages',
      icon: <CheckCircleOutlined />
    }
  ];

  const benefits = [
    'Streamlined puppy rehoming process',
    'Professional kennel presentation',
    'Automated family communication',
    'Comprehensive application management',
    'Built-in waitlist system',
    'Customizable questionnaires',
    'Guardianship program support',
    'Unified messaging platform'
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Title level={1} style={{ color: 'white', marginBottom: '24px', fontSize: '48px' }}>
            Breeder Resources & Tools
          </Title>
          <Paragraph style={{ color: 'white', fontSize: '20px', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            Comprehensive tools to help you manage your breeding program, rehome puppies, and build lasting relationships with families
          </Paragraph>
          <Space size="large">
            <Link href="/kennel-management">
              <Button size="large" type="primary" style={{ height: '48px', padding: '0 32px', fontSize: '16px' }}>
                Start Managing Your Kennel
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="large" ghost style={{ height: '48px', padding: '0 32px', fontSize: '16px', borderColor: 'white', color: 'white' }}>
                Get Support
              </Button>
            </Link>
          </Space>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Statistics Section */}
        <section style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Title level={2}>Platform Success Metrics</Title>
            <Paragraph style={{ fontSize: '18px', color: '#666' }}>
              Join successful breeders who have streamlined their operations
            </Paragraph>
          </div>
          <Row gutter={[32, 32]}>
            {stats.map((stat, index) => (
              <Col xs={12} md={6} key={index}>
                <Card style={cardStyle} bodyStyle={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }}>
                    {stat.icon}
                  </div>
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    valueStyle={{ color: '#1890ff', fontSize: '32px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Core Features */}
        <section style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Title level={2}>Core Breeding Tools</Title>
            <Paragraph style={{ fontSize: '18px', color: '#666' }}>
              Essential tools for managing your breeding program and puppy rehoming
            </Paragraph>
          </div>
          <Row gutter={[24, 24]}>
            {coreFeatures.map((feature, index) => (
              <Col xs={24} md={12} lg={8} key={index}>
                <Card
                  style={cardStyle}
                  hoverable
                  bodyStyle={{ padding: '24px' }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '48px', color: feature.color, marginBottom: '16px' }}>
                      {feature.icon}
                    </div>
                    <Title level={4} style={{ marginBottom: '12px' }}>
                      {feature.title}
                    </Title>
                    <Paragraph style={{ color: '#666', marginBottom: '16px' }}>
                      {feature.description}
                    </Paragraph>
                  </div>
                  <List
                    size="small"
                    dataSource={feature.features}
                    renderItem={(item) => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Advanced Features */}
        <section style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Title level={2}>Advanced Features</Title>
            <Paragraph style={{ fontSize: '18px', color: '#666' }}>
              Specialized tools for professional breeders and complex programs
            </Paragraph>
          </div>
          <Row gutter={[24, 24]}>
            {advancedFeatures.map((feature, index) => (
              <Col xs={24} md={12} key={index}>
                <Card
                  style={cardStyle}
                  hoverable
                  bodyStyle={{ padding: '24px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ fontSize: '32px', color: feature.color, marginRight: '16px', marginTop: '4px' }}>
                      {feature.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Title level={4} style={{ marginBottom: '8px' }}>
                        {feature.title}
                      </Title>
                      <Paragraph style={{ color: '#666', marginBottom: '16px' }}>
                        {feature.description}
                      </Paragraph>
                    </div>
                  </div>
                  <List
                    size="small"
                    dataSource={feature.features}
                    renderItem={(item) => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Workflow Process */}
        <section style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Title level={2}>Your Breeding Workflow</Title>
            <Paragraph style={{ fontSize: '18px', color: '#666' }}>
              Streamlined process from kennel setup to successful puppy rehoming
            </Paragraph>
          </div>
          <Card style={cardStyle}>
            <Steps
              direction="horizontal"
              size="small"
              items={workflowSteps.map((step, index) => ({
                title: step.title,
                description: step.description,
                icon: step.icon,
                status: 'process' as const
              }))}
            />
          </Card>
        </section>

        {/* Benefits Section */}
        <section style={sectionStyle}>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card style={cardStyle}>
                <Title level={3} style={{ marginBottom: '24px' }}>
                  Why Choose Our Platform?
                </Title>
                <List
                  dataSource={benefits}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card style={cardStyle}>
                <Title level={3} style={{ marginBottom: '24px' }}>
                  Get Started Today
                </Title>
                <Paragraph style={{ marginBottom: '24px' }}>
                  Join hundreds of successful breeders who have streamlined their operations and improved their puppy rehoming process.
                </Paragraph>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Link href="/kennel-management">
                    <Button type="primary" size="large" block style={{ height: '48px', fontSize: '16px' }}>
                      <SettingOutlined /> Setup Your Kennel
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="large" block style={{ height: '48px', fontSize: '16px' }}>
                      <CustomerServiceOutlined /> Contact Support
                    </Button>
                  </Link>
                </Space>
              </Card>
            </Col>
          </Row>
        </section>

        {/* CTA Section */}
        <section style={{ ...sectionStyle, textAlign: 'center' }}>
          <Card style={cardStyle}>
            <div style={{ padding: '48px 24px' }}>
              <TrophyOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '24px' }} />
              <Title level={2} style={{ marginBottom: '16px' }}>
                Ready to Transform Your Breeding Program?
              </Title>
              <Paragraph style={{ fontSize: '18px', color: '#666', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
                Join our platform and access professional tools designed specifically for breeders. Streamline your operations, improve family relationships, and focus on what you love most - breeding healthy, happy puppies.
              </Paragraph>
              <Space size="large">
                <Link href="/kennel-management">
                  <Button size="large" type="primary" style={{ height: '48px', padding: '0 32px', fontSize: '16px' }}>
                    Start Your Free Trial
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="large" style={{ height: '48px', padding: '0 32px', fontSize: '16px' }}>
                    Schedule Demo
                  </Button>
                </Link>
              </Space>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default BreederResourcesPage;
