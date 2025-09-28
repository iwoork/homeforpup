'use client';

import React from 'react';
import {
  Card,
  Typography,
  List,
  Space,
  Divider,
  Alert,
  Button,
} from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import StructuredData from '@/components/StructuredData';

const { Title, Paragraph, Text } = Typography;

const CookiesPage: React.FC = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Cookie Policy | HomeForPup",
    "description": "Learn about how HomeForPup uses cookies to enhance your experience, ensure security, and provide personalized services for pet adoption.",
    "url": "https://homeforpup.com/cookies",
    "mainEntity": {
      "@type": "Article",
      "headline": "Cookie Policy for HomeForPup",
      "author": {
        "@type": "Organization",
        "name": "HomeForPup"
      },
      "publisher": {
        "@type": "Organization",
        "name": "HomeForPup",
        "logo": {
          "@type": "ImageObject",
          "url": "https://homeforpup.com/logo.png"
        }
      },
      "datePublished": "2024-01-01",
      "dateModified": "2024-01-01",
      "description": "Comprehensive information about cookie usage on HomeForPup platform",
      "articleSection": "Privacy & Legal",
      "keywords": [
        "cookie policy",
        "privacy",
        "data protection",
        "pet adoption",
        "HomeForPup",
        "website cookies",
        "user preferences"
      ]
    }
  };

  const cookieTypes = [
    {
      type: "Essential Cookies",
      description: "These cookies are necessary for the website to function and cannot be switched off in our systems.",
      examples: [
        "Authentication and login status",
        "Shopping cart and favorites",
        "Security and fraud prevention",
        "Basic website functionality"
      ],
      required: true
    },
    {
      type: "Performance Cookies",
      description: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.",
      examples: [
        "Google Analytics for website usage",
        "Page load times and performance metrics",
        "User interaction tracking",
        "Error reporting and debugging"
      ],
      required: false
    },
    {
      type: "Functional Cookies",
      description: "These cookies enable the website to provide enhanced functionality and personalization.",
      examples: [
        "Language and region preferences",
        "User interface customizations",
        "Remembered search filters",
        "Personalized content recommendations"
      ],
      required: false
    },
    {
      type: "Marketing Cookies",
      description: "These cookies may be set through our site by our advertising partners to build a profile of your interests.",
      examples: [
        "Social media integration",
        "Advertising personalization",
        "Email marketing preferences",
        "Third-party advertising networks"
      ],
      required: false
    }
  ];

  const cookiePurposes = [
    "To ensure our website functions properly and securely",
    "To remember your preferences and settings",
    "To provide personalized content and recommendations",
    "To analyze how our website is used and improve performance",
    "To enable social media features and sharing",
    "To prevent fraud and ensure account security",
    "To provide customer support and assistance",
    "To comply with legal and regulatory requirements"
  ];

  const thirdPartyCookies = [
    {
      name: "Google Analytics",
      purpose: "Website analytics and performance monitoring",
      duration: "2 years",
      moreInfo: "https://policies.google.com/privacy"
    },
    {
      name: "NextAuth.js",
      purpose: "Authentication and session management",
      duration: "Session",
      moreInfo: "https://next-auth.js.org/"
    },
    {
      name: "AWS Cognito",
      purpose: "User authentication and account management",
      duration: "Session",
      moreInfo: "https://aws.amazon.com/privacy/"
    },
    {
      name: "Ant Design",
      purpose: "User interface components and styling",
      duration: "Session",
      moreInfo: "https://ant.design/"
    }
  ];

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#f8f9fa' }}>
      <StructuredData data={structuredData} />
      
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, #08979C 0%, #FA8072 100%)',
        color: 'white',
        padding: '4rem 0',
        textAlign: 'center',
        width: '100%'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <InfoCircleOutlined style={{ fontSize: '48px', marginBottom: '24px', display: 'block' }} />
          <Title level={1} style={{ color: 'white', marginBottom: '16px', fontSize: '42px' }}>
            Cookie Policy
          </Title>
          <Paragraph style={{ 
            fontSize: '18px', 
            color: 'rgba(255, 255, 255, 0.9)', 
            maxWidth: '600px', 
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Learn about how we use cookies to enhance your experience on HomeForPup and help you find your perfect furry companion.
          </Paragraph>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* Introduction */}
          <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
            <Title level={2} style={{ color: '#08979C', marginBottom: '16px' }}>
              What Are Cookies?
            </Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '16px' }}>
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, keeping you logged in, and understanding how you use our site.
            </Paragraph>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
              At HomeForPup, we use cookies responsibly to help you find your perfect pet companion while protecting your privacy and ensuring the security of your information.
            </Paragraph>
          </Card>

          {/* Cookie Types */}
          <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
            <Title level={2} style={{ color: '#08979C', marginBottom: '24px' }}>
              Types of Cookies We Use
            </Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {cookieTypes.map((cookie, index) => (
                <div key={index} style={{ 
                  border: '1px solid #e8e8e8', 
                  borderRadius: '8px', 
                  padding: '20px',
                  backgroundColor: cookie.required ? '#f6ffed' : '#fafafa'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <Title level={4} style={{ margin: 0, color: cookie.required ? '#52c41a' : '#1890ff' }}>
                      {cookie.type}
                    </Title>
                    {cookie.required && (
                      <Text style={{ 
                        marginLeft: '12px', 
                        color: '#52c41a', 
                        fontSize: '12px',
                        background: '#f6ffed',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid #b7eb8f'
                      }}>
                        Required
                      </Text>
                    )}
                  </div>
                  <Paragraph style={{ marginBottom: '12px', color: '#666' }}>
                    {cookie.description}
                  </Paragraph>
                  <div>
                    <Text strong style={{ color: '#333' }}>Examples:</Text>
                    <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                      {cookie.examples.map((example, idx) => (
                        <li key={idx} style={{ color: '#666', marginBottom: '4px' }}>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </Space>
          </Card>

          {/* Why We Use Cookies */}
          <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
            <Title level={2} style={{ color: '#08979C', marginBottom: '24px' }}>
              Why We Use Cookies
            </Title>
            <List
              dataSource={cookiePurposes}
              renderItem={(purpose) => (
                <List.Item style={{ border: 'none', padding: '8px 0' }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '12px', fontSize: '16px' }} />
                  <Text style={{ fontSize: '16px' }}>{purpose}</Text>
                </List.Item>
              )}
            />
          </Card>

          {/* Third Party Cookies */}
          <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
            <Title level={2} style={{ color: '#08979C', marginBottom: '24px' }}>
              Third-Party Cookies
            </Title>
            <Paragraph style={{ marginBottom: '20px', color: '#666' }}>
              We work with trusted third-party services that may set cookies on our website to provide enhanced functionality and analytics.
            </Paragraph>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d9d9d9' }}>Service</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d9d9d9' }}>Purpose</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d9d9d9' }}>Duration</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d9d9d9' }}>More Info</th>
                  </tr>
                </thead>
                <tbody>
                  {thirdPartyCookies.map((cookie, index) => (
                    <tr key={index}>
                      <td style={{ padding: '12px', border: '1px solid #d9d9d9' }}>
                        <Text strong>{cookie.name}</Text>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #d9d9d9', color: '#666' }}>
                        {cookie.purpose}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #d9d9d9', color: '#666' }}>
                        {cookie.duration}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #d9d9d9' }}>
                        <a 
                          href={cookie.moreInfo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#1890ff' }}
                        >
                          Learn More
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Cookie Management */}
          <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
            <Title level={2} style={{ color: '#08979C', marginBottom: '24px' }}>
              Managing Your Cookie Preferences
            </Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4} style={{ color: '#333', marginBottom: '12px' }}>
                  Browser Settings
                </Title>
                <Paragraph style={{ color: '#666', marginBottom: '16px' }}>
                  You can control and delete cookies through your browser settings. However, please note that disabling certain cookies may affect the functionality of our website.
                </Paragraph>
                <List
                  dataSource={[
                    'Chrome: Settings > Privacy and security > Cookies and other site data',
                    'Firefox: Options > Privacy & Security > Cookies and Site Data',
                    'Safari: Preferences > Privacy > Manage Website Data',
                    'Edge: Settings > Cookies and site permissions > Cookies and site data'
                  ]}
                  renderItem={(item) => (
                    <List.Item style={{ border: 'none', padding: '4px 0' }}>
                      <Text style={{ color: '#666' }}>{item}</Text>
                    </List.Item>
                  )}
                />
              </div>

              <Alert
                message="Important Note"
                description="Disabling essential cookies will prevent you from using certain features of our website, including logging in, saving favorites, and accessing your account."
                type="warning"
                icon={<ExclamationCircleOutlined />}
                style={{ borderRadius: '8px' }}
              />

              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<SettingOutlined />}
                  style={{ 
                    background: '#08979C',
                    borderColor: '#08979C',
                    height: '48px',
                    padding: '0 32px',
                    fontSize: '16px'
                  }}
                >
                  Manage Cookie Preferences
                </Button>
              </div>
            </Space>
          </Card>

          {/* Contact Information */}
          <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
            <Title level={2} style={{ color: '#08979C', marginBottom: '24px' }}>
              Questions About Cookies?
            </Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '16px' }}>
              If you have any questions about our use of cookies or this Cookie Policy, please don't hesitate to contact us.
            </Paragraph>
            <Space direction="vertical" size="middle">
              <div>
                <Text strong>Email:</Text> <a href="mailto:privacy@homeforpup.com" style={{ color: '#1890ff' }}>privacy@homeforpup.com</a>
              </div>
              <div>
                <Text strong>Phone:</Text> <a href="tel:+1-555-HOMEPUP" style={{ color: '#1890ff' }}>+1 (555) HOME-PUP</a>
              </div>
              <div>
                <Text strong>Address:</Text> 123 Pet Street, Animal City, AC 12345
              </div>
            </Space>
          </Card>

          {/* Last Updated */}
          <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px', textAlign: 'center' }}>
            <Text style={{ color: '#666', fontSize: '14px' }}>
              Last updated: January 1, 2024
            </Text>
            <Divider style={{ margin: '16px 0' }} />
            <Space>
              <Link href="/privacy" style={{ color: '#1890ff' }}>
                Privacy Policy
              </Link>
              <Text style={{ color: '#ccc' }}>|</Text>
              <Link href="/terms" style={{ color: '#1890ff' }}>
                Terms of Service
              </Link>
              <Text style={{ color: '#ccc' }}>|</Text>
              <Link href="/" style={{ color: '#1890ff' }}>
                Home
              </Link>
            </Space>
          </Card>
        </Space>
      </div>
    </div>
  );
};

export default CookiesPage;
