'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Typography, Tag, Space, Button, Tabs, List, Avatar, Statistic, Divider, Spin, Alert } from 'antd';
import { 
  EnvironmentOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  GlobalOutlined,
  CalendarOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  YoutubeOutlined,
  UserOutlined,
  HeartOutlined,
  ShareAltOutlined,
  MessageOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Kennel, KennelAnnouncement } from '@/types';
import { useKennelAnnouncements } from '@/hooks/useKennelAnnouncements';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// SWR fetcher for kennel data
const fetcher = async (url: string): Promise<{ kennel: Kennel }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch kennel profile');
  }
  return response.json();
};

const KennelProfilePage: React.FC = () => {
  const params = useParams();
  const kennelId = params?.id as string;
  const [activeTab, setActiveTab] = useState("about");

  // Fetch kennel data
  const { data, error, isLoading } = useSWR<{ kennel: Kennel }>(
    kennelId ? `/api/kennels/${kennelId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Fetch announcements for this kennel
  const { announcements, isLoading: announcementsLoading } = useKennelAnnouncements(kennelId);

  const kennel = data?.kennel;

  const getBusinessTypeColor = (type?: string) => {
    switch (type) {
      case 'hobby': return 'blue';
      case 'commercial': return 'green';
      case 'show': return 'purple';
      case 'working': return 'orange';
      default: return 'default';
    }
  };

  const getBusinessTypeLabel = (type?: string) => {
    switch (type) {
      case 'hobby': return 'Hobby Breeder';
      case 'commercial': return 'Commercial Breeder';
      case 'show': return 'Show Kennel';
      case 'working': return 'Working Dog Kennel';
      default: return 'Unknown';
    }
  };

  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case 'litter_available': return 'green';
      case 'update': return 'blue';
      case 'blog': return 'purple';
      case 'event': return 'orange';
      default: return 'default';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '16px',
        textAlign: 'center',
        paddingTop: '100px'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (error || !kennel) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <Alert
          message="Kennel Not Found"
          description="The kennel profile you're looking for doesn't exist or couldn't be loaded."
          type="error"
          showIcon
          style={{ marginTop: '50px' }}
          action={
            <Link href="/browse">
              <Button type="primary">Browse Kennels</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '10px auto', padding: '16px' }}>
      {/* Kennel Header */}
      <Card 
        style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden' }}
        bodyStyle={{ padding: 0 }}
      >
        <div 
          style={{
            height: '300px',
            background: kennel.coverPhoto 
              ? `url(${kennel.coverPhoto}) center/cover`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '24px',
            right: '24px'
          }}>
            <Row align="bottom" justify="space-between">
              <Col>
                <Space align="end" size={16}>
                  <Avatar 
                    size={120} 
                    src={kennel.photoUrl}
                    icon={<UserOutlined />}
                    style={{ border: '4px solid white' }}
                  />
                  <div>
                    <Title level={1} style={{ 
                      margin: 0, 
                      color: 'white', 
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)' 
                    }}>
                      {kennel.name}
                    </Title>
                    <Space style={{ marginTop: '8px' }}>
                      <Tag 
                        color={getBusinessTypeColor(kennel.businessType)}
                        style={{ fontSize: '14px' }}
                      >
                        {getBusinessTypeLabel(kennel.businessType)}
                      </Tag>
                      <Tag color={kennel.isActive ? 'green' : 'red'} style={{ fontSize: '14px' }}>
                        {kennel.isActive ? 'Active' : 'Inactive'}
                      </Tag>
                    </Space>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<HeartOutlined />}
                    style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }}
                  >
                    Follow
                  </Button>
                  <Button 
                    size="large" 
                    icon={<ShareAltOutlined />}
                  >
                    Share
                  </Button>
                  <Button 
                    size="large" 
                    icon={<MessageOutlined />}
                  >
                    Contact
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Left Sidebar - Kennel Info */}
        <Col xs={24} lg={8}>
          {/* About */}
          <Card title="About" style={{ marginBottom: '16px' }}>
            <Paragraph>{kennel.description}</Paragraph>
            
            {kennel.establishedDate && (
              <Space>
                <CalendarOutlined />
                <Text>Established {new Date(kennel.establishedDate).getFullYear()}</Text>
              </Space>
            )}
          </Card>

          {/* Contact Information */}
          <Card title="Contact Information" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {kennel.address && (
                <Space>
                  <EnvironmentOutlined />
                  <div>
                    <Text strong>{kennel.address.street}</Text><br />
                    <Text>{kennel.address.city}, {kennel.address.state} {kennel.address.zipCode}</Text>
                  </div>
                </Space>
              )}
              
              {kennel.phone && (
                <Space>
                  <PhoneOutlined />
                  <Text>{kennel.phone}</Text>
                </Space>
              )}
              
              {kennel.email && (
                <Space>
                  <MailOutlined />
                  <Text>{kennel.email}</Text>
                </Space>
              )}
              
              {kennel.website && (
                <Space>
                  <GlobalOutlined />
                  <a href={kennel.website} target="_blank" rel="noopener noreferrer">
                    <Text>Visit Website</Text>
                  </a>
                </Space>
              )}
            </Space>
          </Card>

          {/* Specialties */}
          {kennel.specialties && kennel.specialties.length > 0 && (
            <Card title="Specialties" style={{ marginBottom: '16px' }}>
              <Space wrap>
                {kennel.specialties.map((specialty, index) => (
                  <Tag key={index} color="blue">
                    {specialty}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {/* Social Links */}
          {kennel.socialLinks && (
            <Card title="Follow Us" style={{ marginBottom: '16px' }}>
              <Space>
                {kennel.socialLinks.facebook && (
                  <Button 
                    type="text" 
                    icon={<FacebookOutlined />} 
                    href={kennel.socialLinks.facebook}
                    target="_blank"
                  />
                )}
                {kennel.socialLinks.instagram && (
                  <Button 
                    type="text" 
                    icon={<InstagramOutlined />} 
                    href={kennel.socialLinks.instagram}
                    target="_blank"
                  />
                )}
                {kennel.socialLinks.twitter && (
                  <Button 
                    type="text" 
                    icon={<TwitterOutlined />} 
                    href={kennel.socialLinks.twitter}
                    target="_blank"
                  />
                )}
                {kennel.socialLinks.youtube && (
                  <Button 
                    type="text" 
                    icon={<YoutubeOutlined />} 
                    href={kennel.socialLinks.youtube}
                    target="_blank"
                  />
                )}
              </Space>
            </Card>
          )}

          {/* Statistics */}
          <Card title="Statistics">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Dogs"
                  value={kennel.totalDogs || 0}
                  valueStyle={{ fontSize: '20px' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Litters"
                  value={kennel.totalLitters || 0}
                  valueStyle={{ fontSize: '20px' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Avg. Litter"
                  value={kennel.averageLitterSize || 0}
                  valueStyle={{ fontSize: '20px' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Main Content */}
        <Col xs={24} lg={16}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            size="large"
          >
            <TabPane tab="Announcements" key="announcements">
              {announcementsLoading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                  <Spin size="large" />
                </div>
              ) : announcements.length > 0 ? (
                <List
                  dataSource={announcements}
                  renderItem={(announcement) => (
                    <List.Item>
                      <Card style={{ width: '100%' }}>
                        <Card.Meta
                          title={
                            <Space>
                              <Text strong>{announcement.title}</Text>
                              <Tag color={getAnnouncementTypeColor(announcement.type)}>
                                {announcement.type.replace('_', ' ').toUpperCase()}
                              </Tag>
                              {announcement.isPinned && <Tag color="red">PINNED</Tag>}
                            </Space>
                          }
                          description={
                            <div>
                              <Paragraph>{announcement.content}</Paragraph>
                              {announcement.tags && announcement.tags.length > 0 && (
                                <Space wrap>
                                  {announcement.tags.map((tag, index) => (
                                    <Tag key={index}>{tag}</Tag>
                                  ))}
                                </Space>
                              )}
                              <div style={{ marginTop: '8px' }}>
                                <Text type="secondary">
                                  {new Date(announcement.createdAt).toLocaleDateString()}
                                </Text>
                              </div>
                            </div>
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                <Card>
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Text type="secondary">No announcements yet</Text>
                  </div>
                </Card>
              )}
            </TabPane>
            
            <TabPane tab="Dogs" key="dogs">
              <Card>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Title level={4}>Parent Dogs</Title>
                  <Paragraph>
                    Information about parent dogs will be displayed here.
                  </Paragraph>
                  <Button type="primary">View Dogs</Button>
                </div>
              </Card>
            </TabPane>

            <TabPane tab="Litters" key="litters">
              <Card>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Title level={4}>Available Litters</Title>
                  <Paragraph>
                    Information about available litters will be displayed here.
                  </Paragraph>
                  <Button type="primary">View Litters</Button>
                </div>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};

export default KennelProfilePage;
