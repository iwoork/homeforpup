'use client';

import React from 'react';
import { Button, Card, Row, Col, Typography, Space, Statistic } from 'antd';
import { 
  HomeOutlined, 
  TeamOutlined, 
  MessageOutlined, 
  BarChartOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function BreederDashboard() {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={1}>Breeder Dashboard</Title>
        <Paragraph style={{ fontSize: '1.1rem' }}>
          Manage your kennel, dogs, and connect with potential families
        </Paragraph>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Active Kennels" value={2} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Total Dogs" value={8} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Available Puppies" value={3} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="New Messages" value={5} />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} md={12}>
          <Card 
            title="Kennel Management" 
            extra={<HomeOutlined style={{ fontSize: '24px' }} />}
            hoverable
          >
            <Paragraph>
              Manage your kennels, update information, and create announcements
            </Paragraph>
            <Space>
              <Link href="/kennels">
                <Button type="primary" icon={<HomeOutlined />}>
                  View Kennels
                </Button>
              </Link>
              <Link href="/kennels/new">
                <Button icon={<PlusOutlined />}>
                  Add Kennel
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title="Dog Management" 
            extra={<TeamOutlined style={{ fontSize: '24px' }} />}
            hoverable
          >
            <Paragraph>
              Add and manage your dogs, track litters, and update health records
            </Paragraph>
            <Space>
              <Link href="/dogs">
                <Button type="primary" icon={<TeamOutlined />}>
                  View Dogs
                </Button>
              </Link>
              <Link href="/dogs/new">
                <Button icon={<PlusOutlined />}>
                  Add Dog
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title="Messages" 
            extra={<MessageOutlined style={{ fontSize: '24px' }} />}
            hoverable
          >
            <Paragraph>
              Respond to inquiries from potential families and manage conversations
            </Paragraph>
            <Link href="/messages">
              <Button type="primary" icon={<MessageOutlined />}>
                View Messages
              </Button>
            </Link>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title="Analytics" 
            extra={<BarChartOutlined style={{ fontSize: '24px' }} />}
            hoverable
          >
            <Paragraph>
              Track your business performance, profile views, and engagement
            </Paragraph>
            <Link href="/analytics">
              <Button type="primary" icon={<BarChartOutlined />}>
                View Analytics
              </Button>
            </Link>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card title="Recent Activity" style={{ marginBottom: '32px' }}>
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Paragraph>No recent activity</Paragraph>
          <Link href="/announcements/new">
            <Button type="primary" icon={<PlusOutlined />}>
              Create Your First Announcement
            </Button>
          </Link>
        </div>
      </Card>

      {/* Settings */}
      <Card title="Account Settings" extra={<SettingOutlined />}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Link href="/profile">
              <Button block>Edit Profile</Button>
            </Link>
          </Col>
          <Col xs={24} sm={12}>
            <Link href="/settings">
              <Button block>App Settings</Button>
            </Link>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
