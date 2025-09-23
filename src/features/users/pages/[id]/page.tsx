'use client';

import React, { useState } from 'react';
import { 
  Card, Row, Col, Typography, Button, Tabs, Tag, Space, 
   Spin, Alert, Progress, List
} from 'antd';
import { 
  CalendarOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, 
  HeartOutlined, TeamOutlined, 
  LoadingOutlined, UserOutlined, SafetyOutlined,
  HomeOutlined, PlusOutlined, MessageOutlined, EyeOutlined, EditOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@/hooks';
import { ProfileHeader } from '@/features/users';
import { ComposeMessage } from '@/features/messaging';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// Adopter interface based on your user table structure
interface AdopterUser {
  userId: string;
  name: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  profileImage?: string;
  verified: boolean;
  userType: 'adopter' | 'both';
  accountStatus: 'active' | 'inactive' | 'pending';
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      showEmail: boolean;
      showPhone: boolean;
      showLocation: boolean;
    };
  };
  adopterInfo: {
    housingType?: 'house' | 'apartment' | 'condo' | 'townhouse' | 'farm';
    yardSize?: 'none' | 'small' | 'medium' | 'large' | 'acreage';
    hasOtherPets: boolean;
    experienceLevel: 'first-time' | 'some-experience' | 'very-experienced';
    preferredBreeds: string[];
    agePreference?: 'puppy' | 'young' | 'adult' | 'senior' | 'any';
    sizePreference?: 'toy' | 'small' | 'medium' | 'large' | 'giant' | 'any';
    activityLevel?: 'low' | 'moderate' | 'high' | 'very-high';
    familySituation?: string;
    workSchedule?: string;
    previousPets?: string[];
    dealBreakers?: string[];
    specialRequirements?: string[];
  };
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
}


// SWR fetchers
const fetcher = async (url: string): Promise<{ user: AdopterUser }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch adopter profile');
  }
  return response.json();
};


const AdopterProfilePage: React.FC = () => {
  const params = useParams();
  const adopterId = params?.id as string;
  const [activeTab, setActiveTab] = useState("about");
  const [composeVisible, setComposeVisible] = useState(false);

  // Fetch adopter data
  const { data, error, isLoading } = useSWR<{ user: AdopterUser }>(
    adopterId ? `/api/users/${adopterId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Use global auth for current user
  const { user: authUser, getToken } = useAuth();

  const adopter = data?.user;
  const isOwnProfile = authUser && adopter && authUser.userId === adopter.userId;

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginBottom: '16px'
  };

  // Helper functions
  const getExperienceBadgeColor = (level: string) => {
    switch (level) {
      case 'first-time': return 'blue';
      case 'some-experience': return 'orange';
      case 'very-experienced': return 'green';
      default: return 'default';
    }
  };

  const getHousingSizeIcon = (yardSize?: string) => {
    switch (yardSize) {
      case 'none': return '🏢';
      case 'small': return '🏘️';
      case 'medium': return '🏡';
      case 'large': return '🏞️';
      case 'acreage': return '🚜';
      default: return '🏠';
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
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
        />
      </div>
    );
  }

  // Error state
  if (error || !adopter) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <Alert
          message="Profile Not Found"
          description="The adopter profile you're looking for doesn't exist or couldn't be loaded."
          type="error"
          showIcon
          style={{ marginTop: '50px' }}
          action={
            <Link href="/adopters">
              <Button type="primary">Browse All Adopters</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '10px auto', padding: '16px' }}>
      {/* Profile Header */}
      <ProfileHeader 
        user={{
          userId: adopter.userId,
          displayName: adopter.displayName,
          name: adopter.name,
          verified: adopter.verified,
          profileImage: adopter.profileImage,
          location: adopter.location,
          lastActiveAt: adopter.lastActiveAt,
          adopterInfo: { experienceLevel: adopter.adopterInfo.experienceLevel },
          preferences: adopter.preferences,
        }}
        isOwnProfile={Boolean(isOwnProfile)}
        onMessageClick={() => setComposeVisible(true)}
      />

      <Row gutter={[24, 24]}>
        {/* Left Sidebar - Adopter Info */}
        <Col xs={24} lg={8}>
          {/* Quick Info */}
          <Card title="At a Glance" style={cardStyle}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {adopter.preferences?.privacy?.showLocation && adopter.location && (
                <div>
                  <Space>
                    <EnvironmentOutlined style={{ color: '#08979C' }} />
                    <Text strong>{adopter.location}</Text>
                  </Space>
                </div>
              )}
              
              <div>
                <Space>
                  <UserOutlined style={{ color: '#667eea' }} />
                  <Text strong>
                    {adopter.adopterInfo.experienceLevel?.replace('-', ' ')} owner
                  </Text>
                </Space>
              </div>

              <div>
                <Space>
                  <HomeOutlined style={{ color: '#52c41a' }} />
                  <Text strong>
                    {adopter.adopterInfo.housingType} 
                    {adopter.adopterInfo.yardSize && adopter.adopterInfo.yardSize !== 'none' && 
                      ` with ${adopter.adopterInfo.yardSize} yard`
                    }
                  </Text>
                </Space>
              </div>

              {adopter.adopterInfo.hasOtherPets && (
                <div>
                  <Space>
                    <TeamOutlined style={{ color: '#fa8c16' }} />
                    <Text strong>Has other pets</Text>
                  </Space>
                </div>
              )}

              <div>
                <Space>
                  <CalendarOutlined style={{ color: '#722ed1' }} />
                  <Text strong>Member since {new Date(adopter.createdAt).getFullYear()}</Text>
                </Space>
              </div>
            </Space>
          </Card>

          {/* About */}
          {adopter.bio && (
            <Card title="About Me" style={cardStyle}>
              <Paragraph style={{ fontSize: '14px' }}>{adopter.bio}</Paragraph>
            </Card>
          )}

          {/* Contact Information */}
          <Card 
            title="Contact Information" 
            style={cardStyle}
            extra={isOwnProfile && (
              <Link href={`/users/${adopter.userId}/edit`}>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<EditOutlined />}
                  style={{ color: '#666' }}
                >
                  Edit
                </Button>
              </Link>
            )}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {adopter.preferences?.privacy?.showEmail && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <MailOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                  <a href={`mailto:${adopter.email}`} style={{ textDecoration: 'none' }}>
                    <Text>{adopter.email}</Text>
                  </a>
                </div>
              )}
              
              {adopter.preferences?.privacy?.showPhone && adopter.phone && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                  <a href={`tel:${adopter.phone}`} style={{ textDecoration: 'none' }}>
                    <Text>{adopter.phone}</Text>
                  </a>
                </div>
              )}
              
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Contact preferences managed by user privacy settings
              </Text>
            </Space>
          </Card>

          {/* Living Situation */}
          <Card 
            title="Living Situation" 
            style={cardStyle}
            extra={isOwnProfile && (
              <Link href={`/users/${adopter.userId}/edit`}>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<EditOutlined />}
                  style={{ color: '#666' }}
                >
                  Edit
                </Button>
              </Link>
            )}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <div>
                <Text strong>Housing: </Text>
                <Tag color="blue">
                  {getHousingSizeIcon(adopter.adopterInfo.yardSize)} {adopter.adopterInfo.housingType}
                </Tag>
              </div>
              
              <div>
                <Text strong>Yard Size: </Text>
                <Tag color="green">{adopter.adopterInfo.yardSize || 'Not specified'}</Tag>
              </div>
              
              <div>
                <Text strong>Other Pets: </Text>
                <Tag color={adopter.adopterInfo.hasOtherPets ? 'orange' : 'default'}>
                  {adopter.adopterInfo.hasOtherPets ? 'Yes' : 'No'}
                </Tag>
              </div>

              <div>
                <Text strong>Experience Level: </Text>
                <Tag color={getExperienceBadgeColor(adopter.adopterInfo.experienceLevel)}>
                  {adopter.adopterInfo.experienceLevel?.replace('-', ' ')}
                </Tag>
              </div>

              {adopter.adopterInfo.familySituation && (
                <div style={{ marginTop: '8px' }}>
                  <Text strong>Family Situation: </Text>
                  <br />
                  <Text style={{ fontSize: '13px' }}>{adopter.adopterInfo.familySituation}</Text>
                </div>
              )}

              {adopter.adopterInfo.workSchedule && (
                <div style={{ marginTop: '8px' }}>
                  <Text strong>Work Schedule: </Text>
                  <br />
                  <Text style={{ fontSize: '13px' }}>{adopter.adopterInfo.workSchedule}</Text>
                </div>
              )}
            </Space>
          </Card>

          {/* Preferred Breeds */}
          {adopter.adopterInfo.preferredBreeds && adopter.adopterInfo.preferredBreeds.length > 0 && (
            <Card 
              title="Interested Breeds" 
              style={cardStyle}
              extra={isOwnProfile && (
                <Link href={`/users/${adopter.userId}/edit`}>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<EditOutlined />}
                    style={{ color: '#666' }}
                  >
                    Edit
                  </Button>
                </Link>
              )}
            >
              <Space wrap>
                {adopter.adopterInfo.preferredBreeds.map(breed => (
                  <Tag key={breed} color="purple" style={{ marginBottom: '4px' }}>
                    {breed}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {/* Preferences */}
          <Card 
            title="Dog Preferences" 
            style={cardStyle}
            extra={isOwnProfile && (
              <Link href={`/users/${adopter.userId}/edit`}>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<EditOutlined />}
                  style={{ color: '#666' }}
                >
                  Edit
                </Button>
              </Link>
            )}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {adopter.adopterInfo.agePreference && (
                <div>
                  <Text strong>Age Preference: </Text>
                  <Tag color="blue">{adopter.adopterInfo.agePreference}</Tag>
                </div>
              )}
              
              {adopter.adopterInfo.sizePreference && (
                <div>
                  <Text strong>Size Preference: </Text>
                  <Tag color="green">{adopter.adopterInfo.sizePreference}</Tag>
                </div>
              )}
              
              {adopter.adopterInfo.activityLevel && (
                <div>
                  <Text strong>Activity Level: </Text>
                  <Tag color="orange">{adopter.adopterInfo.activityLevel}</Tag>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        {/* Main Content */}
        <Col xs={24} lg={16}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            size="large"
          >
            <TabPane tab="About & Preferences" key="about">
              <Row gutter={[16, 16]}>
                {/* Previous Pet Experience */}
                {adopter.adopterInfo.previousPets && adopter.adopterInfo.previousPets.length > 0 && (
                  <Col span={24}>
                    <Card title="Previous Pet Experience" style={cardStyle}>
                      <List
                        dataSource={adopter.adopterInfo.previousPets}
                        renderItem={(pet) => (
                          <List.Item>
                            <Text>• {pet}</Text>
                          </List.Item>
                        )}
                        size="small"
                      />
                    </Card>
                  </Col>
                )}

                {/* Special Requirements */}
                {adopter.adopterInfo.specialRequirements && adopter.adopterInfo.specialRequirements.length > 0 && (
                  <Col span={24}>
                    <Card title="Special Requirements" style={cardStyle}>
                      <Space wrap>
                        {adopter.adopterInfo.specialRequirements.map((req, index) => (
                          <Tag key={index} color="cyan" icon={<SafetyOutlined />}>
                            {req}
                          </Tag>
                        ))}
                      </Space>
                    </Card>
                  </Col>
                )}

                {/* Deal Breakers */}
                {adopter.adopterInfo.dealBreakers && adopter.adopterInfo.dealBreakers.length > 0 && (
                  <Col span={24}>
                    <Card title="Important Considerations" style={cardStyle}>
                      <Alert
                        message="Things to Note"
                        description={
                          <List
                            dataSource={adopter.adopterInfo.dealBreakers}
                            renderItem={(item) => (
                              <List.Item style={{ padding: '4px 0' }}>
                                <Text>• {item}</Text>
                              </List.Item>
                            )}
                            size="small"
                          />
                        }
                        type="info"
                        showIcon
                      />
                    </Card>
                  </Col>
                )}

                {/* Adoption Readiness */}
                <Col span={24}>
                  <Card title="Adoption Readiness" style={cardStyle}>
                    <Row gutter={16}>
                      <Col xs={24} sm={8}>
                        <div style={{ textAlign: 'center', padding: '16px' }}>
                          <Progress
                            type="circle"
                            percent={adopter.adopterInfo.experienceLevel === 'very-experienced' ? 100 : 
                                   adopter.adopterInfo.experienceLevel === 'some-experience' ? 75 : 50}
                            strokeColor={adopter.adopterInfo.experienceLevel === 'very-experienced' ? '#52c41a' : 
                                       adopter.adopterInfo.experienceLevel === 'some-experience' ? '#fa8c16' : '#1890ff'}
                            size={80}
                          />
                          <div style={{ marginTop: '8px' }}>
                            <Text strong>Experience</Text>
                          </div>
                        </div>
                      </Col>
                      
                      <Col xs={24} sm={8}>
                        <div style={{ textAlign: 'center', padding: '16px' }}>
                          <Progress
                            type="circle"
                            percent={adopter.adopterInfo.yardSize === 'acreage' ? 100 :
                                   adopter.adopterInfo.yardSize === 'large' ? 85 :
                                   adopter.adopterInfo.yardSize === 'medium' ? 70 :
                                   adopter.adopterInfo.yardSize === 'small' ? 50 : 25}
                            strokeColor="#52c41a"
                            size={80}
                          />
                          <div style={{ marginTop: '8px' }}>
                            <Text strong>Space</Text>
                          </div>
                        </div>
                      </Col>
                      
                      <Col xs={24} sm={8}>
                        <div style={{ textAlign: 'center', padding: '16px' }}>
                          <Progress
                            type="circle"
                            percent={adopter.verified ? 100 : 50}
                            strokeColor={adopter.verified ? '#52c41a' : '#fa8c16'}
                            size={80}
                          />
                          <div style={{ marginTop: '8px' }}>
                            <Text strong>Verification</Text>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </TabPane>
            
            <TabPane tab="Photos & Updates" key="photos">
              <Card style={cardStyle}>
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Title level={4}>Photo Gallery</Title>
                  <Paragraph>
                    Photos and updates from this adopter&apos;s journey will appear here.
                  </Paragraph>
                  <Button type="primary" icon={<EyeOutlined />}>
                    View Gallery
                  </Button>
                </div>
              </Card>
            </TabPane>

            <TabPane tab="Adoption Journey" key="journey">
              <Card style={cardStyle}>
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Title level={4}>Adoption Journey</Title>
                  <Paragraph>
                    Track this adopter&apos;s progress and milestones in finding their perfect companion.
                  </Paragraph>
                  <Space>
                    <Button type="primary">View Timeline</Button>
                    <Button>Share Story</Button>
                  </Space>
                </div>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card style={{ marginTop: '24px', ...cardStyle }}>
        <Row gutter={[16, 16]} justify="center">
          {isOwnProfile ? (
            // Show profile management actions for own profile
            <>
              <Col xs={24} sm={8}>
                <Link href={`/users/${adopter.userId}/edit`}>
                  <Button 
                    type="primary" 
                    block 
                    size="large"
                    icon={<EditOutlined />}
                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  >
                    Edit Profile
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={8}>
                <Link href="/profile/settings">
                  <Button 
                    block 
                    size="large"
                    icon={<SafetyOutlined />}
                  >
                    Privacy Settings
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={8}>
                <Link href="/dashboard">
                  <Button 
                    block 
                    size="large"
                    icon={<UserOutlined />}
                  >
                    View Dashboard
                  </Button>
                </Link>
              </Col>
            </>
          ) : (
            // Show contact actions for other profiles
            <>
              <Col xs={24} sm={8}>
                <Button 
                  type="primary" 
                  block 
                  size="large"
                  icon={<MessageOutlined />}
                  style={{ background: '#667eea', borderColor: '#667eea' }}
                  onClick={() => setComposeVisible(true)}
                >
                  Send Message
                </Button>
              </Col>
              <Col xs={24} sm={8}>
                <Button 
                  block 
                  size="large"
                  icon={<HeartOutlined />}
                >
                  Add to Favorites
                </Button>
              </Col>
              <Col xs={24} sm={8}>
                <Button 
                  block 
                  size="large"
                  icon={<PlusOutlined />}
                >
                  Connect
                </Button>
              </Col>
            </>
          )}
        </Row>
      </Card>
      {/* Compose Message Modal */}
      <ComposeMessage
        visible={composeVisible}
        onClose={() => setComposeVisible(false)}
        loading={false}
        defaultRecipientId={adopter.userId}
        onSend={async (values, recipientName) => {
          const token = getToken();
          if (!token) return;
          await fetch('/api/messages/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              recipientId: values.recipient,
              recipientName,
              subject: values.subject,
              content: values.content,
              messageType: values.messageType || 'general',
            }),
          });
          setComposeVisible(false);
        }}
      />
    </div>
  );
};

export default AdopterProfilePage;