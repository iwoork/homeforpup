'use client';

import React from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { HeartOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Footer: AntFooter } = Layout;
const { Text, Title } = Typography;

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerStyle = {
    background: '#f8f9fa',
    padding: '48px 0 24px',
    marginTop: 'auto',
  };

  const linkStyle = {
    color: '#666',
    textDecoration: 'none',
    fontSize: '14px',
  };

  return (
    <AntFooter style={footerStyle}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8}>
            <div style={{ marginBottom: '24px' }}>
              <Title level={4} style={{ color: '#08979C', marginBottom: '16px' }}>
                <HeartOutlined style={{ marginRight: '8px' }} />
                Home for Pup
              </Title>
              <Text style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                Connecting loving families with ethical breeders to create perfect puppy matches.
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Title level={5} style={{ color: '#333', marginBottom: '16px' }}>
              Quick Links
            </Title>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Link href="/browse" style={linkStyle}>Browse Puppies</Link>
              <Link href="/breeders" style={linkStyle}>Find Breeders</Link>
              <Link href="/breeds" style={linkStyle}>Dog Breeds</Link>
              <Link href="/about" style={linkStyle}>About Us</Link>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Title level={5} style={{ color: '#333', marginBottom: '16px' }}>
              Community
            </Title>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Link href="/dashboard" style={linkStyle}>Dashboard</Link>
              <Link href="/dashboard/messages" style={linkStyle}>Messages</Link>
              <Link href="/users" style={linkStyle}>Find Users</Link>
            </Space>
          </Col>
        </Row>
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e8e8e8' }}>
          <Row justify="space-between" align="middle">
            <Col xs={24} sm={12}>
              <Text style={{ color: '#999', fontSize: '12px' }}>
                © {currentYear} Home for Pup. All rights reserved.
              </Text>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ textAlign: 'right' }}>
                <Text style={{ color: '#999', fontSize: '12px' }}>
                  Made with <HeartOutlined style={{ color: '#FA8072' }} /> for dog lovers
                </Text>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;