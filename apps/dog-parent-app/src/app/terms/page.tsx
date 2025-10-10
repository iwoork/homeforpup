'use client';

import React from 'react';
import { 
  Card, Typography, Space, Divider, Alert, Button, Row, Col,
  Timeline, Tag, List, Affix
} from 'antd';
import { 
  FileTextOutlined, SafetyOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, InfoCircleOutlined, WarningOutlined,
  HeartOutlined, TeamOutlined, LockOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { generateBreadcrumbSchema } from '@/lib/utils/seo';
import StructuredData from '@/components/StructuredData';

const { Title, Paragraph, Text } = Typography;

const TermsOfServicePage: React.FC = () => {
  const lastUpdated = 'September 28, 2024';

  const quickLinks = [
    { title: 'Privacy Policy', href: '/privacy' },
    { title: 'FAQ', href: '/faq' },
    { title: 'Contact Support', href: 'mailto:support@homeforpup.com' },
    { title: 'About Us', href: '/about' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '24px 0'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <Card 
          style={{ 
            marginBottom: '32px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '16px',
            color: 'white'
          }}
        >
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
              <FileTextOutlined style={{ marginRight: '12px' }} />
              Terms of Service
            </Title>
            <Paragraph style={{ color: 'white', fontSize: '18px', marginBottom: '0' }}>
              Last updated: {lastUpdated}
            </Paragraph>
          </div>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              
              {/* Introduction */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <InfoCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  Introduction
                </Title>
                <Paragraph>
                  Welcome to HomeForPup ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our platform 
                  that connects families with ethical breeders to create perfect puppy matches. By accessing or using our service, 
                  you agree to be bound by these Terms.
                </Paragraph>
                <Alert
                  message="Important Notice"
                  description="HomeForPup is not a marketplace for selling animals. We are a community platform focused on connecting families with ethical breeders and building lasting relationships."
                  type="info"
                  icon={<InfoCircleOutlined />}
                  style={{ marginTop: '16px' }}
                />
              </Card>

              {/* Acceptance of Terms */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <CheckCircleOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                  Acceptance of Terms
                </Title>
                <Paragraph>
                  By creating an account, accessing our platform, or using our services, you acknowledge that you have read, 
                  understood, and agree to be bound by these Terms and our Privacy Policy.
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "You must be at least 18 years old to use our platform",
                    "You must provide accurate and complete information",
                    "You are responsible for maintaining the security of your account",
                    "You agree to use our platform in compliance with all applicable laws"
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>

              {/* Platform Description */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <HeartOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
                  Our Platform
                </Title>
                <Paragraph>
                  HomeForPup is a community-driven platform that facilitates connections between families seeking puppies 
                  and ethical breeders. Our mission is to promote responsible dog ownership and ethical breeding practices.
                </Paragraph>
                <div style={{ marginTop: '16px' }}>
                  <Title level={4}>What We Do:</Title>
                  <List
                    size="small"
                    dataSource={[
                      "Facilitate connections between families and ethical breeders",
                      "Provide educational resources about dog breeds and responsible ownership",
                      "Maintain transparent health information for parent dogs",
                      "Foster ongoing relationships between breeders and families",
                      "Promote ethical breeding practices and discourage puppy mills"
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </div>
                <div style={{ marginTop: '16px' }}>
                  <Title level={4}>What We Don't Do:</Title>
                  <List
                    size="small"
                    dataSource={[
                      "Facilitate direct sales of animals",
                      "Process payments for puppies",
                      "Guarantee specific outcomes or matches",
                      "Endorse or support puppy mills or unethical breeding"
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <ExclamationCircleOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </div>
              </Card>

              {/* User Responsibilities */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <TeamOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
                  User Responsibilities
                </Title>
                
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4}>For All Users:</Title>
                  <List
                    size="small"
                    dataSource={[
                      "Provide accurate and truthful information in your profile",
                      "Respect other users and maintain professional communication",
                      "Report any suspicious or inappropriate behavior",
                      "Comply with all applicable local, state, and federal laws",
                      "Maintain the confidentiality of your account credentials"
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <Title level={4}>For Families Seeking Puppies:</Title>
                  <List
                    size="small"
                    dataSource={[
                      "Thoroughly research breeds and breeders before making decisions",
                      "Ask appropriate questions about health, temperament, and care requirements",
                      "Ensure you can provide a suitable home environment",
                      "Follow through on commitments made to breeders",
                      "Maintain ongoing communication as agreed upon"
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </div>

                <div>
                  <Title level={4}>For Breeders:</Title>
                  <List
                    size="small"
                    dataSource={[
                      "Provide transparent and accurate health information for parent dogs",
                      "Maintain ethical breeding practices and proper care standards",
                      "Comply with all applicable breeding regulations and licensing requirements",
                      "Provide ongoing support to families who adopt your puppies",
                      "Maintain detailed records of breeding activities and health clearances"
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </div>
              </Card>

              {/* Prohibited Activities */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <WarningOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
                  Prohibited Activities
                </Title>
                <Paragraph>
                  The following activities are strictly prohibited on our platform:
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "Engaging in or promoting puppy mill operations",
                    "Providing false or misleading information about dogs or breeding practices",
                    "Harassment, abuse, or inappropriate behavior toward other users",
                    "Attempting to circumvent our platform for direct transactions",
                    "Violating any applicable laws or regulations",
                    "Sharing personal information of other users without consent",
                    "Using automated systems to access our platform",
                    "Impersonating other users or entities"
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
                      {item}
                    </List.Item>
                  )}
                />
                <Alert
                  message="Consequences"
                  description="Violation of these terms may result in immediate account suspension or termination, and we reserve the right to take legal action when necessary."
                  type="warning"
                  icon={<WarningOutlined />}
                  style={{ marginTop: '16px' }}
                />
              </Card>

              {/* Privacy and Data */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <SafetyOutlined style={{ marginRight: '8px', color: '#13c2c2' }} />
                  Privacy and Data Protection
                </Title>
                <Paragraph>
                  We are committed to protecting your privacy and personal information. Our collection, use, and protection 
                  of your data is governed by our Privacy Policy, which is incorporated into these Terms by reference.
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "We collect only necessary information to provide our services",
                    "We do not sell or share your personal information with third parties",
                    "We implement appropriate security measures to protect your data",
                    "You have the right to access, update, or delete your personal information",
                    "We may use aggregated, anonymized data for platform improvement"
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>

              {/* Disclaimers */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <ExclamationCircleOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
                  Disclaimers and Limitations
                </Title>
                <Paragraph>
                  <strong>No Guarantees:</strong> We do not guarantee successful matches, specific outcomes, or the quality 
                  of any connections made through our platform. All interactions between users are at their own risk.
                </Paragraph>
                <Paragraph>
                  <strong>Third-Party Content:</strong> We are not responsible for content posted by users, including 
                  photos, descriptions, or health information. Users are solely responsible for the accuracy of their content.
                </Paragraph>
                <Paragraph>
                  <strong>Platform Availability:</strong> We strive to maintain platform availability but do not guarantee 
                  uninterrupted service. We may temporarily suspend service for maintenance or updates.
                </Paragraph>
                <Alert
                  message="Important"
                  description="We are not veterinarians or animal health professionals. All health information should be verified with qualified professionals."
                  type="warning"
                  icon={<ExclamationCircleOutlined />}
                  style={{ marginTop: '16px' }}
                />
              </Card>

              {/* Modifications */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <FileTextOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  Modifications to Terms
                </Title>
                <Paragraph>
                  We reserve the right to modify these Terms at any time. We will notify users of significant changes 
                  through our platform or via email. Continued use of our platform after changes constitutes acceptance 
                  of the modified Terms.
                </Paragraph>
                <Paragraph>
                  <strong>Last Updated:</strong> {lastUpdated}
                </Paragraph>
              </Card>

              {/* Contact Information */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <SafetyOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                  Contact Information
                </Title>
                <Paragraph>
                  If you have any questions about these Terms of Service, please contact us:
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "Email: support@homeforpup.com",
                    "Response Time: Within 24 hours",
                    "Platform: Use the contact form in your dashboard"
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>

            </Space>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Quick Links */}
              <Card 
                title="Quick Links" 
                style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {quickLinks.map((link, index) => (
                    <Link key={index} href={link.href}>
                      <Button 
                        type="link" 
                        style={{ 
                          width: '100%', 
                          textAlign: 'left',
                          height: 'auto',
                          padding: '8px 0'
                        }}
                      >
                        {link.title}
                      </Button>
                    </Link>
                  ))}
                </Space>
              </Card>

              {/* Key Points */}
              <Card 
                title="Key Points" 
                style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>18+ years old required</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Accurate information required</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>No direct sales facilitated</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Ethical breeding promoted</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Community-focused platform</Text>
                  </div>
                </Space>
              </Card>

              {/* Legal Notice */}
              <Card 
                title="Legal Notice" 
                style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              >
                <Paragraph style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                  These Terms of Service constitute a legal agreement between you and HomeForPup. 
                  Please read them carefully and contact us if you have any questions.
                </Paragraph>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Structured Data */}
      <StructuredData 
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Terms of Service', url: '/terms' }
        ])} 
      />
    </div>
  );
};

export default TermsOfServicePage;