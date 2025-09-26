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

// Puppy Parent interface based on your user table structure
interface PuppyParentUser {
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
  userType: 'puppy-parent' | 'both';
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
  puppyParentInfo: {
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
const fetcher = async (url: string): Promise<{ user: PuppyParentUser }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch puppy parent profile');
  }
  return response.json();
};


const PuppyParentProfilePage: React.FC = () => {
  const params = useParams();
  const puppyParentId = params?.id as string;
  const [activeTab, setActiveTab] = useState("about");
  const [composeVisible, setComposeVisible] = useState(false);

  // Fetch puppy parent data
  const { data, error, isLoading } = useSWR<{ user: PuppyParentUser }>(
    puppyParentId ? `/api/users/${puppyParentId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Use global auth for current user
  const { user: authUser, getToken } = useAuth();

  const puppyParent = data?.user;
  const isOwnProfile = authUser && puppyParent && authUser.userId === puppyParent.userId;

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    marginBottom: '16px',
    border: '1px solid #f1f5f9'
  };

  const getCardStyleWithPattern = (patternType: string): React.CSSProperties => {
    return cardStyle;
  };

  // Helper functions
  const getExperienceBadgeColor = (level: string) => {
    switch (level) {
      case 'first-time': return { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#bfdbfe' };
      case 'some-experience': return { backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' };
      case 'very-experienced': return { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' };
      default: return { backgroundColor: '#f3f4f6', color: '#6b7280', borderColor: '#e5e7eb' };
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
        paddingTop: '100px',
        background: 'transparent'
      }}>
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
        />
      </div>
    );
  }

  // Error state
  if (error || !puppyParent) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px', background: 'transparent' }}>
        <Alert
          message="Profile Not Found"
          description="The puppy parent profile you're looking for doesn't exist or couldn't be loaded."
          type="error"
          showIcon
          style={{ marginTop: '50px' }}
          action={
            <Link href="/users">
              <Button type="primary">Browse All Puppy Parents</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '10px auto', padding: '16px', background: 'transparent' }}>
      {/* Profile Header */}
      <ProfileHeader 
        user={{
          userId: puppyParent.userId,
          displayName: puppyParent.displayName,
          name: puppyParent.name,
          verified: puppyParent.verified,
          profileImage: puppyParent.profileImage,
          location: puppyParent.location,
          lastActiveAt: puppyParent.lastActiveAt,
          puppyParentInfo: { experienceLevel: puppyParent.puppyParentInfo.experienceLevel },
          preferences: puppyParent.preferences,
        }}
        isOwnProfile={Boolean(isOwnProfile)}
        onMessageClick={() => setComposeVisible(true)}
      />

      <Row gutter={[24, 24]}>
        {/* Left Sidebar - Adopter Info */}
        <Col xs={24} lg={8}>
          {/* Quick Info */}
          <Card title="At a Glance" style={getCardStyleWithPattern('dots')}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {puppyParent.preferences?.privacy?.showLocation && puppyParent.location && (
                <div>
                  <Space>
                    <EnvironmentOutlined style={{ color: '#7dd3fc' }} />
                    <Text strong>{puppyParent.location}</Text>
                  </Space>
                </div>
              )}
              
              <div>
                <Space>
                  <UserOutlined style={{ color: '#a5b4fc' }} />
                  <Text strong>
                    {puppyParent.puppyParentInfo.experienceLevel?.replace('-', ' ')} owner
                  </Text>
                </Space>
              </div>

              <div>
                <Space>
                  <HomeOutlined style={{ color: '#86efac' }} />
                  <Text strong>
                    {puppyParent.puppyParentInfo.housingType} 
                    {puppyParent.puppyParentInfo.yardSize && puppyParent.puppyParentInfo.yardSize !== 'none' && 
                      ` with ${puppyParent.puppyParentInfo.yardSize} yard`
                    }
                  </Text>
                </Space>
              </div>

              {puppyParent.puppyParentInfo.hasOtherPets && (
                <div>
                  <Space>
                    <TeamOutlined style={{ color: '#fbbf24' }} />
                    <Text strong>Has other pets</Text>
                  </Space>
                </div>
              )}

              <div>
                <Space>
                  <CalendarOutlined style={{ color: '#c4b5fd' }} />
                  <Text strong>Member since {new Date(puppyParent.createdAt).getFullYear()}</Text>
                </Space>
              </div>
            </Space>
          </Card>

          {/* About */}
          {puppyParent.bio && (
            <Card title="About Me" style={getCardStyleWithPattern('waves')}>
              <Paragraph style={{ fontSize: '14px' }}>{puppyParent.bio}</Paragraph>
            </Card>
          )}

          {/* Contact Information */}
          <Card 
            title="Contact Information" 
            style={getCardStyleWithPattern('lines')}
            extra={isOwnProfile && (
              <Link href={`/users/${puppyParent.userId}/edit`}>
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
              {puppyParent.preferences?.privacy?.showEmail && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <MailOutlined style={{ color: '#7dd3fc', marginRight: '8px' }} />
                  <a href={`mailto:${puppyParent.email}`} style={{ textDecoration: 'none' }}>
                    <Text>{puppyParent.email}</Text>
                  </a>
                </div>
              )}
              
              {puppyParent.preferences?.privacy?.showPhone && puppyParent.phone && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneOutlined style={{ color: '#7dd3fc', marginRight: '8px' }} />
                  <a href={`tel:${puppyParent.phone}`} style={{ textDecoration: 'none' }}>
                    <Text>{puppyParent.phone}</Text>
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
            style={getCardStyleWithPattern('grid')}
            extra={isOwnProfile && (
              <Link href={`/users/${puppyParent.userId}/edit`}>
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
                <Tag style={{ backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#bfdbfe' }}>
                  {getHousingSizeIcon(puppyParent.puppyParentInfo.yardSize)} {puppyParent.puppyParentInfo.housingType}
                </Tag>
              </div>
              
              <div>
                <Text strong>Yard Size: </Text>
                <Tag style={{ backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }}>{puppyParent.puppyParentInfo.yardSize || 'Not specified'}</Tag>
              </div>
              
              <div>
                <Text strong>Other Pets: </Text>
                <Tag style={{ 
                  backgroundColor: puppyParent.puppyParentInfo.hasOtherPets ? '#fef3c7' : '#f3f4f6', 
                  color: puppyParent.puppyParentInfo.hasOtherPets ? '#92400e' : '#6b7280',
                  borderColor: puppyParent.puppyParentInfo.hasOtherPets ? '#fde68a' : '#e5e7eb'
                }}>
                  {puppyParent.puppyParentInfo.hasOtherPets ? 'Yes' : 'No'}
                </Tag>
              </div>

              <div>
                <Text strong>Experience Level: </Text>
                <Tag style={getExperienceBadgeColor(puppyParent.puppyParentInfo.experienceLevel)}>
                  {puppyParent.puppyParentInfo.experienceLevel?.replace('-', ' ')}
                </Tag>
              </div>

              {puppyParent.puppyParentInfo.familySituation && (
                <div style={{ marginTop: '8px' }}>
                  <Text strong>Family Situation: </Text>
                  <br />
                  <Text style={{ fontSize: '13px' }}>{puppyParent.puppyParentInfo.familySituation}</Text>
                </div>
              )}

              {puppyParent.puppyParentInfo.workSchedule && (
                <div style={{ marginTop: '8px' }}>
                  <Text strong>Work Schedule: </Text>
                  <br />
                  <Text style={{ fontSize: '13px' }}>{puppyParent.puppyParentInfo.workSchedule}</Text>
                </div>
              )}
            </Space>
          </Card>

          {/* Preferred Breeds */}
          {puppyParent.puppyParentInfo.preferredBreeds && puppyParent.puppyParentInfo.preferredBreeds.length > 0 && (
            <Card 
              title="Interested Breeds" 
              style={getCardStyleWithPattern('diagonal')}
              extra={isOwnProfile && (
                <Link href={`/users/${puppyParent.userId}/edit`}>
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
                {puppyParent.puppyParentInfo.preferredBreeds.map(breed => (
                  <Tag key={breed} style={{ 
                    marginBottom: '4px', 
                    backgroundColor: '#e6d7ff', 
                    color: '#6b46c1', 
                    borderColor: '#d1c4e9' 
                  }}>
                    {breed}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {/* Preferences */}
          <Card 
            title="Dog Preferences" 
            style={getCardStyleWithPattern('subtle')}
            extra={isOwnProfile && (
              <Link href={`/users/${puppyParent.userId}/edit`}>
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
              {puppyParent.puppyParentInfo.agePreference && (
                <div>
                  <Text strong>Age Preference: </Text>
                  <Tag style={{ backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#bfdbfe' }}>{puppyParent.puppyParentInfo.agePreference}</Tag>
                </div>
              )}
              
              {puppyParent.puppyParentInfo.sizePreference && (
                <div>
                  <Text strong>Size Preference: </Text>
                  <Tag style={{ backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }}>{puppyParent.puppyParentInfo.sizePreference}</Tag>
                </div>
              )}
              
              {puppyParent.puppyParentInfo.activityLevel && (
                <div>
                  <Text strong>Activity Level: </Text>
                  <Tag style={{ backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>{puppyParent.puppyParentInfo.activityLevel}</Tag>
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
                {puppyParent.puppyParentInfo.previousPets && puppyParent.puppyParentInfo.previousPets.length > 0 && (
                  <Col span={24}>
                    <Card title="Previous Pet Experience" style={getCardStyleWithPattern('dots')}>
                      <List
                        dataSource={puppyParent.puppyParentInfo.previousPets}
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
                {puppyParent.puppyParentInfo.specialRequirements && puppyParent.puppyParentInfo.specialRequirements.length > 0 && (
                  <Col span={24}>
                    <Card title="Special Requirements" style={getCardStyleWithPattern('lines')}>
                      <Space wrap>
                        {puppyParent.puppyParentInfo.specialRequirements.map((req, index) => (
                          <Tag key={index} style={{ backgroundColor: '#cffafe', color: '#0e7490', borderColor: '#a5f3fc' }} icon={<SafetyOutlined />}>
                            {req}
                          </Tag>
                        ))}
                      </Space>
                    </Card>
                  </Col>
                )}

                {/* Deal Breakers */}
                {puppyParent.puppyParentInfo.dealBreakers && puppyParent.puppyParentInfo.dealBreakers.length > 0 && (
                  <Col span={24}>
                    <Card title="Important Considerations" style={getCardStyleWithPattern('waves')}>
                      <Alert
                        message="Things to Note"
                        description={
                          <List
                            dataSource={puppyParent.puppyParentInfo.dealBreakers}
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
                  <Card title="Adoption Readiness" style={getCardStyleWithPattern('grid')}>
                    <Row gutter={16}>
                      <Col xs={24} sm={8}>
                        <div style={{ textAlign: 'center', padding: '16px' }}>
                          <Progress
                            type="circle"
                            percent={puppyParent.puppyParentInfo.experienceLevel === 'very-experienced' ? 100 : 
                                   puppyParent.puppyParentInfo.experienceLevel === 'some-experience' ? 75 : 50}
                            strokeColor={puppyParent.puppyParentInfo.experienceLevel === 'very-experienced' ? '#86efac' : 
                                       puppyParent.puppyParentInfo.experienceLevel === 'some-experience' ? '#fbbf24' : '#a5b4fc'}
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
                            percent={puppyParent.puppyParentInfo.yardSize === 'acreage' ? 100 :
                                   puppyParent.puppyParentInfo.yardSize === 'large' ? 85 :
                                   puppyParent.puppyParentInfo.yardSize === 'medium' ? 70 :
                                   puppyParent.puppyParentInfo.yardSize === 'small' ? 50 : 25}
                            strokeColor="#86efac"
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
                            percent={puppyParent.verified ? 100 : 50}
                            strokeColor={puppyParent.verified ? '#86efac' : '#fbbf24'}
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
              <Card style={getCardStyleWithPattern('diagonal')}>
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Title level={4}>Photo Gallery</Title>
                  <Paragraph>
                    Photos and updates from this puppyParent&apos;s journey will appear here.
                  </Paragraph>
                  <Button type="primary" icon={<EyeOutlined />}>
                    View Gallery
                  </Button>
                </div>
              </Card>
            </TabPane>

            <TabPane tab="Adoption Journey" key="journey">
              <Card style={getCardStyleWithPattern('subtle')}>
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Title level={4}>Adoption Journey</Title>
                  <Paragraph>
                    Track this puppyParent&apos;s progress and milestones in finding their perfect companion.
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
      <Card style={{ marginTop: '24px', ...getCardStyleWithPattern('waves') }}>
        <Row gutter={[16, 16]} justify="center">
          {isOwnProfile ? (
            // Show profile management actions for own profile
            <>
              <Col xs={24} sm={8}>
                <Link href={`/users/${puppyParent.userId}/edit`}>
                  <Button 
                    type="primary" 
                    block 
                    size="large"
                    icon={<EditOutlined />}
                    style={{ background: '#86efac', borderColor: '#86efac', color: '#166534' }}
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
                  style={{ background: '#a5b4fc', borderColor: '#a5b4fc', color: '#3730a3' }}
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
        defaultRecipientId={puppyParent.userId}
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

export default PuppyParentProfilePage;