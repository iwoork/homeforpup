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
  Tag,
  Divider,
  Alert
} from 'antd';
import { 
  BookOutlined, 
  RocketOutlined, 
  PictureOutlined, 
  QuestionCircleOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EyeOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

const DocsPage: React.FC = () => {
  const guides = [
    {
      title: 'Quick Start Guide',
      description: 'Get up and running in 5 minutes',
      icon: <RocketOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      href: '/docs/quick-start',
      time: '5 min read',
      difficulty: 'Beginner',
      color: 'blue'
    },
    {
      title: 'Complete User Guide',
      description: 'Detailed, step-by-step instructions for all features',
      icon: <BookOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      href: '/docs/complete-guide',
      time: '15 min read',
      difficulty: 'All Levels',
      color: 'green'
    },
    {
      title: 'Visual Step-by-Step Guide',
      description: 'Screenshots and visual instructions',
      icon: <PictureOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      href: '/docs/visual-guide',
      time: '10 min read',
      difficulty: 'Visual Learners',
      color: 'orange'
    },
    {
      title: 'Frequently Asked Questions',
      description: 'Quick answers to common questions',
      icon: <QuestionCircleOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      href: '/docs/faq',
      time: '5 min read',
      difficulty: 'Reference',
      color: 'purple'
    }
  ];

  const quickActions = [
    {
      title: 'Create Your First Kennel',
      description: 'Set up your breeding facility profile',
      href: '/kennels/new',
      icon: '🏠'
    },
    {
      title: 'Add Your Dogs',
      description: 'Record information about your breeding dogs',
      href: '/kennels',
      icon: '🐕'
    },
    {
      title: 'Track a Litter',
      description: 'Record when puppies are born',
      href: '/kennels',
      icon: '👶'
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={1} style={{ margin: 0 }}>
          📚 Kennel Management Documentation
        </Title>
        <Paragraph style={{ fontSize: '1.1rem', marginTop: '8px' }}>
          Learn how to use the kennel management system to organize your breeding business
        </Paragraph>
      </div>

      {/* Getting Started Alert */}
      <Alert
        message="New to the system?"
        description="Start with the Quick Start Guide to get up and running in just 5 minutes!"
        type="info"
        showIcon
        style={{ marginBottom: '32px' }}
        action={
          <Link href="/docs/quick-start">
            <Button type="primary" size="small">
              Get Started
            </Button>
          </Link>
        }
      />

      {/* Quick Actions */}
      <Card title="🚀 Quick Actions" style={{ marginBottom: '32px' }}>
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} md={8} key={index}>
              <Card 
                hoverable
                style={{ height: '100%' }}
                bodyStyle={{ textAlign: 'center', padding: '20px' }}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                  {action.icon}
                </div>
                <Title level={4} style={{ margin: '0 0 8px 0' }}>
                  {action.title}
                </Title>
                <Paragraph style={{ margin: '0 0 16px 0', color: '#666' }}>
                  {action.description}
                </Paragraph>
                <Link href={action.href}>
                  <Button type="primary" icon={<ArrowRightOutlined />}>
                    Get Started
                  </Button>
                </Link>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Documentation Guides */}
      <Card title="📖 Available Guides">
        <Row gutter={[24, 24]}>
          {guides.map((guide, index) => (
            <Col xs={24} lg={12} key={index}>
              <Card 
                hoverable
                style={{ height: '100%' }}
                actions={[
                  <Link href={guide.href} key="read">
                    <Button type="link" icon={<EyeOutlined />}>
                      Read Guide
                    </Button>
                  </Link>
                ]}
              >
                <Space align="start" style={{ width: '100%' }}>
                  <div style={{ marginRight: '16px' }}>
                    {guide.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Title level={4} style={{ margin: '0 0 8px 0' }}>
                      {guide.title}
                    </Title>
                    <Paragraph style={{ margin: '0 0 12px 0', color: '#666' }}>
                      {guide.description}
                    </Paragraph>
                    <Space wrap>
                      <Tag color={guide.color} icon={<ClockCircleOutlined />}>
                        {guide.time}
                      </Tag>
                      <Tag color="default" icon={<UserOutlined />}>
                        {guide.difficulty}
                      </Tag>
                    </Space>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Help Section */}
      <Card title="🆘 Need Help?" style={{ marginTop: '32px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Title level={4}>Can't Find What You're Looking For?</Title>
            <Paragraph>
              Try searching through our guides or check the FAQ for quick answers to common questions.
            </Paragraph>
            <Space>
              <Link href="/docs/faq">
                <Button icon={<QuestionCircleOutlined />}>
                  Browse FAQ
                </Button>
              </Link>
            </Space>
          </Col>
          <Col xs={24} md={12}>
            <Title level={4}>Still Need Help?</Title>
            <Paragraph>
              Our support team is here to help you succeed with your breeding program.
            </Paragraph>
            <Space direction="vertical">
              <Text>📧 support@homeforpup.com</Text>
              <Text>📞 1-800-HOMEFORPUP</Text>
              <Text>🕒 Monday-Friday, 9 AM - 5 PM</Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tips */}
      <Card title="💡 Pro Tips" style={{ marginTop: '32px' }}>
        <List
          dataSource={[
            'Bookmark this page for easy access to all guides',
            'Start with the Quick Start Guide if you\'re new to the system',
            'Keep the FAQ handy for quick answers to common questions',
            'Don\'t hesitate to ask for help - we\'re here to support you!'
          ]}
          renderItem={(item) => (
            <List.Item>
              <Text>• {item}</Text>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default DocsPage;
