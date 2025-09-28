'use client';

import React from 'react';
import { Layout, Row, Col, Typography, Space, Button, Divider } from 'antd';
import { 
  HeartOutlined, 
  MailOutlined, 
  UserOutlined, 
  TeamOutlined, 
  HomeOutlined,
  QuestionCircleOutlined,
  GlobalOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Footer: AntFooter } = Layout;
const { Text, Title } = Typography;

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerStyle = {
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    padding: '64px 0 24px',
    marginTop: 'auto',
    borderTop: '1px solid #e8e8e8',
  };

  const linkStyle = {
    color: '#666',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s ease',
  };

  const hoverLinkStyle = {
    ...linkStyle,
    color: '#08979C',
  };

  const sectionTitleStyle = {
    color: '#2c3e50',
    marginBottom: '20px',
    fontSize: '16px',
    fontWeight: '600',
  };

  return (
    <AntFooter style={footerStyle}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Main Footer Content */}
        <Row gutter={[32, 32]}>
          {/* Company Branding */}
          <Col xs={24} lg={6}>
            <div style={{ marginBottom: '24px' }}>
              <Title level={3} style={{ color: '#08979C', marginBottom: '16px', fontSize: '24px' }}>
                <HeartOutlined style={{ marginRight: '8px' }} />
                HomeForPup
              </Title>
              <Text style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px', display: 'block' }}>
                Connecting loving families with ethical breeders to create perfect puppy matches and lifelong friendships.
              </Text>
              <div style={{ marginBottom: '16px' }}>
                <Text style={{ color: '#999', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                  🇨🇦 Proudly made in Canada
                </Text>
                <Text style={{ color: '#999', fontSize: '12px' }}>
                  Made with <HeartOutlined style={{ color: '#FA8072' }} /> for dog lovers
                </Text>
              </div>
            </div>
          </Col>

          {/* For Families (General Users) */}
          <Col xs={24} sm={12} lg={5}>
            <div style={{ marginBottom: '24px' }}>
              <Title level={5} style={sectionTitleStyle}>
                <UserOutlined style={{ marginRight: '8px', color: '#08979C' }} />
                For Families
              </Title>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Link href="/browse" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#08979C'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Browse Available Puppies
                </Link>
                <Link href="/breeds" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#08979C'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Learn About Dog Breeds
                </Link>
                <Link href="/breeders" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#08979C'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Find Ethical Breeders
                </Link>
                <Link href="/adoption-guide" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#08979C'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Adoption Guide
                </Link>
                <Link href="/dashboard" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#08979C'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  My Dashboard
                </Link>
                <Link href="/dashboard/favorites" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#08979C'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  My Favorites
                </Link>
                <Link href="/dashboard/messages" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#08979C'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Messages
                </Link>
                <Link href="/ethical-guidelines" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#08979C'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Ethical Guidelines
                </Link>
              </Space>
            </div>
          </Col>

          {/* For Breeders */}
          <Col xs={24} sm={12} lg={5}>
            <div style={{ marginBottom: '24px' }}>
              <Title level={5} style={sectionTitleStyle}>
                <TeamOutlined style={{ marginRight: '8px', color: '#FA8072' }} />
                For Breeders
              </Title>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Link href="/kennel-management" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#FA8072'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Kennel Management
                </Link>
                <Link href="/dashboard/kennels" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#FA8072'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  My Kennels
                </Link>
                <Link href="/dashboard/messages" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#FA8072'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Breeder Messages
                </Link>
                <Link href="/breeder-resources" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#FA8072'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Breeder Resources
                </Link>
                <Link href="/ethical-guidelines" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#FA8072'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Ethical Guidelines
                </Link>
                <Link href="/breeder-support" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#FA8072'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Breeder Support
                </Link>
              </Space>
            </div>
          </Col>

          {/* Company & Support */}
          <Col xs={24} sm={12} lg={4}>
            <div style={{ marginBottom: '24px' }}>
              <Title level={5} style={sectionTitleStyle}>
                <HomeOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                Company
              </Title>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Link href="/about" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#52c41a'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  About Us
                </Link>
                <Link href="/faq" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#52c41a'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  FAQ
                </Link>
                <Link href="/contact" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#52c41a'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Contact Us
                </Link>
                <Link href="/careers" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#52c41a'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Careers
                </Link>
                <Link href="/press" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#52c41a'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Press
                </Link>
              </Space>
            </div>
          </Col>

          {/* Legal & Support */}
          <Col xs={24} sm={12} lg={4}>
            <div style={{ marginBottom: '24px' }}>
              <Title level={5} style={sectionTitleStyle}>
                <QuestionCircleOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
                Legal & Support
              </Title>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Link href="/terms" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#722ed1'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Terms of Service
                </Link>
                <Link href="/privacy" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#722ed1'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Privacy Policy
                </Link>
                <Link href="/cookies" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#722ed1'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Cookie Policy
                </Link>
                <Link href="/accessibility" style={linkStyle} onMouseEnter={(e) => e.currentTarget.style.color = '#722ed1'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
                  Accessibility
                </Link>
                <div style={{ marginTop: '12px' }}>
                  <Text style={{ color: '#666', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                    Need help?
                  </Text>
                  <Button
                    type="link"
                    href="mailto:support@homeforpup.com"
                    icon={<MailOutlined />}
                    style={{
                      color: '#722ed1',
                      padding: 0,
                      height: 'auto',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    support@homeforpup.com
                  </Button>
                </div>
              </Space>
            </div>
          </Col>
        </Row>

        {/* Social Media & Contact */}
        <Divider style={{ margin: '32px 0 24px 0', borderColor: '#e8e8e8' }} />
        <Row gutter={[32, 16]} align="middle">
          <Col xs={24} md={12}>
            <div>
              <Text style={{ color: '#666', fontSize: '14px', marginBottom: '12px', display: 'block' }}>
                Follow us for updates and adorable puppy content:
              </Text>
              <Space size="middle">
                <Button
                  type="link"
                  href="https://facebook.com/homeforpup"
                  target="_blank"
                  icon={<FacebookOutlined />}
                  style={{ color: '#4267B2', fontSize: '18px' }}
                />
                <Button
                  type="link"
                  href="https://instagram.com/homeforpup"
                  target="_blank"
                  icon={<InstagramOutlined />}
                  style={{ color: '#E4405F', fontSize: '18px' }}
                />
                <Button
                  type="link"
                  href="https://twitter.com/homeforpup"
                  target="_blank"
                  icon={<TwitterOutlined />}
                  style={{ color: '#1DA1F2', fontSize: '18px' }}
                />
              </Space>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ textAlign: 'right' }}>
              <Text style={{ color: '#666', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                <MailOutlined style={{ marginRight: '6px' }} />
                support@homeforpup.com
              </Text>
              <Text style={{ color: '#999', fontSize: '12px' }}>
                We'll get back to you within 24 hours
              </Text>
            </div>
          </Col>
        </Row>

        {/* Copyright */}
        <Divider style={{ margin: '24px 0 16px 0', borderColor: '#e8e8e8' }} />
        <Row justify="space-between" align="middle">
          <Col xs={24} sm={12}>
            <Text style={{ color: '#999', fontSize: '12px' }}>
              © {currentYear} HomeForPup. All rights reserved.
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ textAlign: 'right' }}>
              <Text style={{ color: '#999', fontSize: '12px' }}>
                Version 2.0.1 • Last updated: {new Date().toLocaleDateString()}
              </Text>
            </div>
          </Col>
        </Row>
      </div>
    </AntFooter>
  );
};

export default Footer;