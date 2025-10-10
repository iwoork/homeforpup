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
  Row,
  Col,
  Tag,
} from 'antd';
import {
  CheckCircleOutlined,
  EyeOutlined,
  SoundOutlined,
  BulbOutlined,
  HeartOutlined,
  MailOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import StructuredData from '@/components/StructuredData';

const { Title, Paragraph, Text } = Typography;

const AccessibilityPage: React.FC = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Accessibility Statement | HomeForPup",
    "description": "HomeForPup is committed to making pet adoption accessible to everyone. Learn about our accessibility features, compliance standards, and how we ensure an inclusive experience.",
    "url": "https://homeforpup.com/accessibility",
    "mainEntity": {
      "@type": "Article",
      "headline": "Accessibility Statement for HomeForPup",
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
      "description": "Comprehensive accessibility information for HomeForPup platform",
      "articleSection": "Accessibility & Inclusion",
      "keywords": [
        "accessibility",
        "inclusive design",
        "WCAG compliance",
        "assistive technology",
        "pet adoption",
        "HomeForPup",
        "web accessibility",
        "disability support"
      ]
    }
  };

  const accessibilityFeatures = [
    {
      category: "Visual Accessibility",
      icon: <EyeOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      features: [
        "High contrast mode for better visibility",
        "Scalable text and interface elements",
        "Alternative text for all images",
        "Color-blind friendly color schemes",
        "Clear visual hierarchy and typography",
        "Focus indicators for keyboard navigation"
      ]
    },
    {
      category: "Auditory Accessibility",
      icon: <SoundOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      features: [
        "Text alternatives for audio content",
        "Visual notifications for important alerts",
        "Captions and transcripts for videos",
        "Clear text descriptions for sound-based features"
      ]
    },
    {
      category: "Motor Accessibility",
      icon: <SettingOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      features: [
        "Full keyboard navigation support",
        "Large clickable areas for buttons and links",
        "Customizable keyboard shortcuts",
        "Voice control compatibility",
        "Switch navigation support",
        "Touch-friendly interface design"
      ]
    },
    {
      category: "Cognitive Accessibility",
      icon: <ThunderboltOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      features: [
        "Clear and simple language",
        "Consistent navigation patterns",
        "Progress indicators for multi-step processes",
        "Error prevention and clear error messages",
        "Helpful tooltips and guidance",
        "Customizable interface complexity"
      ]
    }
  ];

  const assistiveTechnologies = [
    {
      name: "Screen Readers",
      description: "Compatible with NVDA, JAWS, VoiceOver, and other screen reading software",
      examples: ["NVDA (Windows)", "JAWS (Windows)", "VoiceOver (Mac/iOS)", "TalkBack (Android)"]
    },
    {
      name: "Voice Control",
      description: "Works with voice recognition software for hands-free navigation",
      examples: ["Dragon NaturallySpeaking", "Windows Speech Recognition", "Voice Control (Mac)"]
    },
    {
      name: "Switch Navigation",
      description: "Supports switch-based navigation for users with limited mobility",
      examples: ["Single switch scanning", "Multi-switch navigation", "Bluetooth switch devices"]
    },
    {
      name: "Magnification Software",
      description: "Compatible with screen magnification tools and browser zoom",
      examples: ["ZoomText", "MAGic", "Browser zoom up to 400%", "Windows Magnifier"]
    }
  ];

  const wcagCompliance = [
    {
      level: "Level A",
      status: "Fully Compliant",
      color: "green",
      description: "Basic accessibility requirements met"
    },
    {
      level: "Level AA",
      status: "Fully Compliant", 
      color: "green",
      description: "Enhanced accessibility standards achieved"
    },
    {
      level: "Level AAA",
      status: "Partially Compliant",
      color: "orange",
      description: "Working towards full compliance"
    }
  ];

  const browserSupport = [
    { name: "Chrome", version: "90+", status: "Fully Supported" },
    { name: "Firefox", version: "88+", status: "Fully Supported" },
    { name: "Safari", version: "14+", status: "Fully Supported" },
    { name: "Edge", version: "90+", status: "Fully Supported" },
    { name: "Internet Explorer", version: "11", status: "Limited Support" }
  ];

  const accessibilityTips = [
    "Use keyboard navigation (Tab, Enter, Arrow keys) to navigate the site",
    "Enable high contrast mode in your browser or operating system",
    "Use browser zoom (Ctrl/Cmd + Plus) to increase text size",
    "Enable screen reader announcements for dynamic content",
    "Use voice commands if your device supports them",
    "Customize your browser's accessibility settings for optimal experience"
  ];

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#f8f9fa' }}>
      <StructuredData data={structuredData} />
      
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, #722ed1 0%, #1890ff 100%)',
        color: 'white',
        padding: '4rem 0',
        textAlign: 'center',
        width: '100%'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <InfoCircleOutlined style={{ fontSize: '48px', marginBottom: '24px', display: 'block' }} />
          <Title level={1} style={{ color: 'white', marginBottom: '16px', fontSize: '42px' }}>
            Accessibility Statement
          </Title>
          <Paragraph style={{ 
            fontSize: '18px', 
            color: 'rgba(255, 255, 255, 0.9)', 
            maxWidth: '600px', 
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            HomeForPup is committed to making pet adoption accessible to everyone. We believe every family deserves to find their perfect companion, regardless of ability.
          </Paragraph>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* Our Commitment */}
          <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
            <Title level={2} style={{ color: '#722ed1', marginBottom: '16px' }}>
              Our Accessibility Commitment
            </Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '16px' }}>
              At HomeForPup, we believe that finding the perfect pet companion should be accessible to everyone. We are committed to providing an inclusive, barrier-free experience that allows all users to browse, search, and connect with their ideal furry friend.
            </Paragraph>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
              We continuously work to improve our platform&apos;s accessibility and comply with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards, ensuring our website is usable by people with diverse abilities and assistive technologies.
            </Paragraph>
          </Card>

          {/* Accessibility Features */}
          <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
            <Title level={2} style={{ color: '#722ed1', marginBottom: '24px' }}>
              Accessibility Features
            </Title>
            <Row gutter={[24, 24]} align="stretch">
              {accessibilityFeatures.map((category, index) => (
                <Col xs={24} md={12} key={index} style={{ display: 'flex' }}>
                  <div style={{ 
                    border: '1px solid #e8e8e8', 
                    borderRadius: '8px', 
                    padding: '20px',
                    width: '100%',
                    backgroundColor: '#fafafa',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
                      {category.icon}
                      <Title level={4} style={{ margin: '0 0 0 12px', color: '#333' }}>
                        {category.category}
                      </Title>
                    </div>
                    <div style={{ flex: 1 }}>
                      <List
                        dataSource={category.features}
                        renderItem={(feature) => (
                          <List.Item style={{ border: 'none', padding: '4px 0', alignItems: 'flex-start' }}>
                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px', fontSize: '14px', marginTop: '2px', flexShrink: 0 }} />
                            <Text style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>{feature}</Text>
                          </List.Item>
                        )}
                      />
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* WCAG Compliance */}
          <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
            <Title level={2} style={{ color: '#722ed1', marginBottom: '24px' }}>
              WCAG Compliance Status
            </Title>
            <Row gutter={[16, 16]}>
              {wcagCompliance.map((level, index) => (
                <Col xs={24} sm={8} key={index}>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '20px',
                    border: '1px solid #e8e8e8',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa'
                  }}>
                    <Title level={3} style={{ marginBottom: '8px' }}>{level.level}</Title>
                    <Tag color={level.color} style={{ marginBottom: '8px', fontSize: '12px' }}>
                      {level.status}
                    </Tag>
                    <Text style={{ color: '#666', fontSize: '14px' }}>{level.description}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Assistive Technologies */}
          <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
            <Title level={2} style={{ color: '#722ed1', marginBottom: '24px' }}>
              Supported Assistive Technologies
            </Title>
            <Row gutter={[24, 24]} align="stretch">
              {assistiveTechnologies.map((tech, index) => (
                <Col xs={24} md={12} key={index} style={{ display: 'flex' }}>
                  <div style={{ 
                    border: '1px solid #e8e8e8', 
                    borderRadius: '8px', 
                    padding: '20px',
                    width: '100%',
                    backgroundColor: '#fafafa',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Title level={4} style={{ color: '#333', marginBottom: '8px', flexShrink: 0 }}>
                      {tech.name}
                    </Title>
                    <Paragraph style={{ color: '#666', marginBottom: '12px', flexShrink: 0 }}>
                      {tech.description}
                    </Paragraph>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ color: '#333', fontSize: '14px' }}>Examples:</Text>
                      <ul style={{ marginTop: '8px', marginBottom: 0 }}>
                        {tech.examples.map((example, idx) => (
                          <li key={idx} style={{ color: '#666', fontSize: '14px', marginBottom: '2px', lineHeight: '1.4' }}>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Browser Support */}
          <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
            <Title level={2} style={{ color: '#722ed1', marginBottom: '24px' }}>
              Browser Compatibility
            </Title>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d9d9d9' }}>Browser</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d9d9d9' }}>Minimum Version</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d9d9d9' }}>Accessibility Support</th>
                  </tr>
                </thead>
                <tbody>
                  {browserSupport.map((browser, index) => (
                    <tr key={index}>
                      <td style={{ padding: '12px', border: '1px solid #d9d9d9' }}>
                        <Text strong>{browser.name}</Text>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #d9d9d9', color: '#666' }}>
                        {browser.version}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #d9d9d9' }}>
                        <Tag color={browser.status === 'Fully Supported' ? 'green' : 'orange'}>
                          {browser.status}
                        </Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Accessibility Tips */}
          <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
            <Title level={2} style={{ color: '#722ed1', marginBottom: '24px' }}>
              Tips for Better Accessibility
            </Title>
            <List
              dataSource={accessibilityTips}
              renderItem={(tip) => (
                <List.Item style={{ border: 'none', padding: '8px 0' }}>
                  <BulbOutlined style={{ color: '#fa8c16', marginRight: '12px', fontSize: '16px' }} />
                  <Text style={{ fontSize: '16px' }}>{tip}</Text>
                </List.Item>
              )}
            />
          </Card>

          {/* Feedback and Support */}
          <Card style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '12px' }}>
            <Title level={2} style={{ color: '#722ed1', marginBottom: '24px' }}>
              Accessibility Feedback & Support
            </Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4} style={{ color: '#333', marginBottom: '12px' }}>
                  We Value Your Feedback
                </Title>
                <Paragraph style={{ color: '#666', marginBottom: '16px' }}>
                  If you encounter any accessibility barriers or have suggestions for improvement, we want to hear from you. Your feedback helps us make HomeForPup more inclusive for everyone.
                </Paragraph>
              </div>

              <Alert
                message="Accessibility Support Available"
                description="Our team is trained to assist users with accessibility needs. We provide personalized support to help you navigate our platform and find your perfect pet companion."
                type="info"
                icon={<HeartOutlined />}
                style={{ borderRadius: '8px' }}
              />

              <div style={{ 
                border: '1px solid #e8e8e8', 
                borderRadius: '8px', 
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#fafafa',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                <MailOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '12px' }} />
                <Title level={4} style={{ color: '#333', marginBottom: '8px' }}>Email Support</Title>
                <Text style={{ color: '#666', display: 'block', marginBottom: '12px' }}>
                  Send us your accessibility feedback
                </Text>
                <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                  support@homeforpup.com
                </Text>
              </div>

              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<InfoCircleOutlined />}
                  style={{ 
                    background: '#722ed1',
                    borderColor: '#722ed1',
                    height: '48px',
                    padding: '0 32px',
                    fontSize: '16px'
                  }}
                >
                  Report Accessibility Issue
                </Button>
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
              <Link href="/cookies" style={{ color: '#1890ff' }}>
                Cookie Policy
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

export default AccessibilityPage;
