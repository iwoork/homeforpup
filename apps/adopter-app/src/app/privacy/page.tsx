'use client';

import React from 'react';
import { 
  Card, Typography, Space, Divider, Alert, Button, Row, Col,
  Timeline, Tag, List, Table
} from 'antd';
import { 
  SafetyOutlined, LockOutlined, EyeOutlined, UserOutlined,
  CheckCircleOutlined, InfoCircleOutlined, WarningOutlined,
  HeartOutlined, TeamOutlined, DatabaseOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { generateBreadcrumbSchema } from '@/lib/utils/seo';
import StructuredData from '@/components/StructuredData';

const { Title, Paragraph, Text } = Typography;

const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = 'September 28, 2024';

  const quickLinks = [
    { title: 'Terms of Service', href: '/terms' },
    { title: 'FAQ', href: '/faq' },
    { title: 'Contact Support', href: 'mailto:support@homeforpup.com' },
    { title: 'About Us', href: '/about' }
  ];

  const dataTypes = [
    {
      category: 'Account Information',
      data: ['Name', 'Email address', 'User type (adopter/breeder/both)', 'Profile photos', 'Contact information'],
      purpose: 'Account creation, authentication, and profile management'
    },
    {
      category: 'Breeder Information',
      data: ['Breeding credentials', 'Kennel information', 'Health clearances', 'Breeding practices', 'Facility details'],
      purpose: 'Verification, transparency, and community trust'
    },
    {
      category: 'Family Preferences',
      data: ['Preferred breeds', 'Lifestyle information', 'Location', 'Experience level', 'Family composition'],
      purpose: 'Matching families with suitable breeders and breeds'
    },
    {
      category: 'Communication Data',
      data: ['Messages between users', 'Contact requests', 'Platform interactions', 'Support communications'],
      purpose: 'Facilitating connections and providing support'
    },
    {
      category: 'Usage Analytics',
      data: ['Page views', 'Feature usage', 'Search queries', 'Platform interactions', 'Device information'],
      purpose: 'Platform improvement and user experience optimization'
    }
  ];

  const dataRetention = [
    { data: 'Account Information', retention: 'Until account deletion + 30 days' },
    { data: 'Communication Data', retention: 'Until account deletion + 90 days' },
    { data: 'Usage Analytics', retention: '2 years (anonymized after 1 year)' },
    { data: 'Health Information', retention: 'Until account deletion + 1 year' },
    { data: 'Support Communications', retention: '3 years' }
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
              <SafetyOutlined style={{ marginRight: '12px' }} />
              Privacy Policy
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
                  At HomeForPup, we are committed to protecting your privacy and personal information. This Privacy Policy 
                  explains how we collect, use, disclose, and safeguard your information when you use our platform to 
                  connect families with ethical breeders.
                </Paragraph>
                <Alert
                  message="Your Privacy Matters"
                  description="We believe in transparency and giving you control over your personal information. This policy explains exactly what we do with your data and why."
                  type="info"
                  icon={<InfoCircleOutlined />}
                  style={{ marginTop: '16px' }}
                />
              </Card>

              {/* Information We Collect */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <DatabaseOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                  Information We Collect
                </Title>
                <Paragraph>
                  We collect information you provide directly to us, information we obtain automatically when you use our platform, 
                  and information from third parties. Here's a detailed breakdown:
                </Paragraph>
                
                {dataTypes.map((type, index) => (
                  <div key={index} style={{ marginBottom: '24px' }}>
                    <Title level={4}>
                      <Tag color="blue">{type.category}</Tag>
                    </Title>
                    <List
                      size="small"
                      dataSource={type.data}
                      renderItem={(item) => (
                        <List.Item>
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                          {item}
                        </List.Item>
                      )}
                    />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      <strong>Purpose:</strong> {type.purpose}
                    </Text>
                  </div>
                ))}

                <Alert
                  message="Health Information"
                  description="We collect detailed health information about parent dogs to ensure transparency and promote ethical breeding practices. This information is crucial for helping families make informed decisions."
                  type="warning"
                  icon={<WarningOutlined />}
                  style={{ marginTop: '16px' }}
                />
              </Card>

              {/* How We Use Information */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <EyeOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
                  How We Use Your Information
                </Title>
                <Paragraph>
                  We use the information we collect for the following purposes:
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "Facilitate connections between families and ethical breeders",
                    "Provide personalized breed recommendations and matching services",
                    "Verify breeder credentials and maintain platform integrity",
                    "Send important updates about your account and our services",
                    "Improve our platform functionality and user experience",
                    "Provide customer support and respond to your inquiries",
                    "Ensure compliance with our Terms of Service",
                    "Protect against fraud, abuse, and other harmful activities",
                    "Conduct research and analytics to improve our services",
                    "Comply with legal obligations and regulatory requirements"
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>

              {/* Information Sharing */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <TeamOutlined style={{ marginRight: '8px', color: '#13c2c2' }} />
                  Information Sharing and Disclosure
                </Title>
                <Paragraph>
                  We do not sell, trade, or rent your personal information to third parties. We may share your information 
                  in the following limited circumstances:
                </Paragraph>
                
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4}>With Other Users:</Title>
                  <List
                    size="small"
                    dataSource={[
                      "Profile information visible to other users (as you choose)",
                      "Messages and communications between connected users",
                      "Breeder information and health clearances (for transparency)",
                      "Public reviews and ratings (if you choose to provide them)"
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
                  <Title level={4}>With Service Providers:</Title>
                  <List
                    size="small"
                    dataSource={[
                      "Cloud hosting and data storage providers",
                      "Email and communication services",
                      "Analytics and performance monitoring tools",
                      "Customer support platforms",
                      "Payment processors (if applicable)"
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
                  <Title level={4}>Legal Requirements:</Title>
                  <List
                    size="small"
                    dataSource={[
                      "When required by law or legal process",
                      "To protect our rights, property, or safety",
                      "To protect the rights, property, or safety of our users",
                      "In connection with a business transfer or acquisition"
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </div>

                <Alert
                  message="We Never Sell Your Data"
                  description="We do not sell, rent, or trade your personal information to third parties for marketing purposes. Your privacy is our priority."
                  type="success"
                  icon={<CheckCircleOutlined />}
                  style={{ marginTop: '16px' }}
                />
              </Card>

              {/* Data Security */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <LockOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
                  Data Security
                </Title>
                <Paragraph>
                  We implement appropriate technical and organizational measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction.
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "Encryption of data in transit and at rest",
                    "Regular security assessments and updates",
                    "Access controls and authentication measures",
                    "Secure data centers and infrastructure",
                    "Employee training on data protection",
                    "Incident response and breach notification procedures"
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      {item}
                    </List.Item>
                  )}
                />
                <Alert
                  message="Security Notice"
                  description="While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but are committed to using industry-standard practices."
                  type="warning"
                  icon={<WarningOutlined />}
                  style={{ marginTop: '16px' }}
                />
              </Card>

              {/* Data Retention */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <DatabaseOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
                  Data Retention
                </Title>
                <Paragraph>
                  We retain your personal information for as long as necessary to provide our services and fulfill the purposes 
                  outlined in this policy. Here's our data retention schedule:
                </Paragraph>
                <Table
                  dataSource={dataRetention}
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: 'Data Type',
                      dataIndex: 'data',
                      key: 'data',
                    },
                    {
                      title: 'Retention Period',
                      dataIndex: 'retention',
                      key: 'retention',
                    }
                  ]}
                />
                <Paragraph style={{ marginTop: '16px', fontSize: '14px' }}>
                  <strong>Note:</strong> You can request deletion of your data at any time. We will honor such requests 
                  within 30 days, subject to legal and regulatory requirements.
                </Paragraph>
              </Card>

              {/* Your Rights */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <UserOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                  Your Rights and Choices
                </Title>
                <Paragraph>
                  You have certain rights regarding your personal information. Here's what you can do:
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "Access your personal information and request a copy",
                    "Correct or update inaccurate information",
                    "Delete your account and associated data",
                    "Opt out of certain communications and data processing",
                    "Request data portability (export your data)",
                    "Object to certain uses of your information",
                    "Withdraw consent where applicable"
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      {item}
                    </List.Item>
                  )}
                />
                <Alert
                  message="How to Exercise Your Rights"
                  description="To exercise any of these rights, contact us at support@homeforpup.com or use the settings in your account dashboard. We will respond to your request within 30 days."
                  type="info"
                  icon={<InfoCircleOutlined />}
                  style={{ marginTop: '16px' }}
                />
              </Card>

              {/* Cookies and Tracking */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <EyeOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
                  Cookies and Tracking Technologies
                </Title>
                <Paragraph>
                  We use cookies and similar technologies to enhance your experience and analyze platform usage:
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "Essential cookies for platform functionality",
                    "Analytics cookies to understand usage patterns",
                    "Preference cookies to remember your settings",
                    "Security cookies to protect against fraud"
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      {item}
                    </List.Item>
                  )}
                />
                <Paragraph style={{ marginTop: '16px' }}>
                  You can control cookie settings through your browser preferences. Note that disabling certain cookies 
                  may affect platform functionality.
                </Paragraph>
              </Card>

              {/* Children's Privacy */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <SafetyOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
                  Children's Privacy
                </Title>
                <Paragraph>
                  Our platform is not intended for children under 18 years of age. We do not knowingly collect personal 
                  information from children under 18. If we become aware that we have collected personal information 
                  from a child under 18, we will take steps to delete such information.
                </Paragraph>
                <Alert
                  message="Age Requirement"
                  description="You must be at least 18 years old to use our platform. If you are under 18, please do not provide any personal information to us."
                  type="warning"
                  icon={<WarningOutlined />}
                  style={{ marginTop: '16px' }}
                />
              </Card>

              {/* International Users */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <HeartOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
                  International Users
                </Title>
                <Paragraph>
                  If you are accessing our platform from outside the United States, please be aware that your information 
                  may be transferred to, stored, and processed in the United States where our servers are located.
                </Paragraph>
                <Paragraph>
                  We comply with applicable data protection laws, including GDPR for European users. If you have questions 
                  about how your data is handled, please contact us.
                </Paragraph>
              </Card>

              {/* Changes to Privacy Policy */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <SafetyOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  Changes to This Privacy Policy
                </Title>
                <Paragraph>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by:
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "Posting the updated policy on our platform",
                    "Sending you an email notification",
                    "Displaying a prominent notice on our platform",
                    "Updating the 'Last Updated' date at the top of this policy"
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      {item}
                    </List.Item>
                  )}
                />
                <Paragraph style={{ marginTop: '16px' }}>
                  <strong>Last Updated:</strong> {lastUpdated}
                </Paragraph>
              </Card>

              {/* Contact Information */}
              <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <Title level={2}>
                  <SafetyOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                  Contact Us
                </Title>
                <Paragraph>
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "Email: support@homeforpup.com",
                    "Subject Line: Privacy Policy Inquiry",
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

              {/* Privacy Highlights */}
              <Card 
                title="Privacy Highlights" 
                style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>We don't sell your data</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>You control your information</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Secure data storage</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Transparent practices</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Easy data deletion</Text>
                  </div>
                </Space>
              </Card>

              {/* Data Rights */}
              <Card 
                title="Your Data Rights" 
                style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EyeOutlined style={{ color: '#1890ff' }} />
                    <Text>Access your data</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <Text>Update information</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DatabaseOutlined style={{ color: '#1890ff' }} />
                    <Text>Export your data</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LockOutlined style={{ color: '#1890ff' }} />
                    <Text>Delete your account</Text>
                  </div>
                </Space>
              </Card>

              {/* Legal Notice */}
              <Card 
                title="Legal Notice" 
                style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              >
                <Paragraph style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                  This Privacy Policy is effective as of {lastUpdated} and governs our collection, use, and protection of your personal information.
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
          { name: 'Privacy Policy', url: '/privacy' }
        ])} 
      />
    </div>
  );
};

export default PrivacyPolicyPage;