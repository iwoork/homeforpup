import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import { 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';


const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

const Footer: React.FC = () => {
  const linkStyle: React.CSSProperties = {
    color: '#666',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '8px',
    transition: 'color 0.3s ease'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '16px'
  };

  return (
    <AntFooter style={{ 
      background: '#f8f9fa', 
      padding: '48px 24px 24px'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Main Footer Content */}
        <Row gutter={[32, 32]}>
          {/* Brand Section */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: '24px' }}>
              <Image
                src="/logo.png"
                alt="HomeForPup Logo"
                width={80}
                height={80}
                style={{ flexShrink: 0 }}
              />
              <div style={{
                fontSize: "20px",
                fontWeight: "bold",
                background: 'linear-gradient(135deg, #08979C 0%, #FA8072 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '12px'
              }}>
                Home For Pup
              </div>
              <Text style={{ color: '#666', lineHeight: '1.6' }}>
                Creating paw-some families by connecting caring dog lovers and passionate breeders in a supportive community.
              </Text>
            </div>
            <Space size="middle">
              <FacebookOutlined style={{ fontSize: '20px', color: '#1877f2', cursor: 'pointer' }} />
              <TwitterOutlined style={{ fontSize: '20px', color: '#1da1f2', cursor: 'pointer' }} />
              <InstagramOutlined style={{ fontSize: '20px', color: '#e4405f', cursor: 'pointer' }} />
            </Space>
          </Col>

          {/* For Families */}
          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={sectionTitleStyle}>For Families</Title>
            <Link href="/browse" style={linkStyle}>Meet Available Puppies</Link>
            <Link href="/b" style={linkStyle}>Connect with Dog Families</Link>
            <Link href="/breeds" style={linkStyle}>Breed Guide</Link>
            <Link href="/adoption-guide" style={linkStyle}>Welcome Home Guide</Link>
            <Link href="/puppy-care" style={linkStyle}>New Puppy Tips</Link>
          </Col>

          {/* For Breeders */}
          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={sectionTitleStyle}>For Dog Lovers</Title>
            <Link href="/auth/register" style={linkStyle}>Join Our Community</Link>
            <Link href="/breeder-benefits" style={linkStyle}>Community Benefits</Link>
            <Link href="/verification-process" style={linkStyle}>Getting Started</Link>
            <Link href="/dashboard" style={linkStyle}>Your Dashboard</Link>
            <Link href="/breeder-resources" style={linkStyle}>Resources & Support</Link>
          </Col>

          {/* Company */}
          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={sectionTitleStyle}>Our Community</Title>
            <Link href="/about" style={linkStyle}>About Us</Link>
            <Link href="/contact" style={linkStyle}>Get in Touch</Link>
            <Link href="/careers" style={linkStyle}>Join Our Team</Link>
            <Link href="/success-stories" style={linkStyle}>Success Stories</Link>
            <Link href="/blog" style={linkStyle}>Community Stories</Link>
          </Col>
        </Row>

        <Divider style={{ margin: '32px 0 24px' }} />

        {/* Bottom Footer */}
        <Row justify="space-between" align="middle">
          <Col xs={24} md={12}>
            <Space direction="vertical" size="small">
              <div style={{ color: '#8b4513', fontSize: '14px' }}>
                © 2025 HomeForPup.com - Creating Paw-some Families, One Match at a Time
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                Bringing together dog lovers and caring breeders in a supportive community
              </div>
            </Space>
          </Col>
          
          <Col xs={24} md={12} style={{ textAlign: 'right', marginTop: '16px' }}>
            <Space size="middle">
              <Link href="/privacy" style={{ fontSize: '12px', color: '#666' }}>Privacy Policy</Link>
              <Link href="/terms" style={{ fontSize: '12px', color: '#666' }}>Terms of Service</Link>
              <Link href="/cookies" style={{ fontSize: '12px', color: '#666' }}>Cookie Policy</Link>
              <Link href="/sitemap" style={{ fontSize: '12px', color: '#666' }}>Sitemap</Link>
            </Space>
          </Col>
        </Row>

        {/* Contact Info Bar */}
        <div style={{ 
          marginTop: '24px',
          padding: '16px',
          background: 'linear-gradient(135deg, #08979C10 0%, #FA807210 100%)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <Space size="large" wrap>
            <Space>
              <MailOutlined style={{ color: '#08979C' }} />
              <Text style={{ fontSize: '12px' }}>support@homeforpup.com</Text>
            </Space>
            <Space>
              <PhoneOutlined style={{ color: '#08979C' }} />
              <Text style={{ fontSize: '12px' }}>1-800-PUP-LOVE</Text>
            </Space>
            <Space>
              <EnvironmentOutlined style={{ color: '#08979C' }} />
              <Text style={{ fontSize: '12px' }}>Connecting families across Canada</Text>
            </Space>
          </Space>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;