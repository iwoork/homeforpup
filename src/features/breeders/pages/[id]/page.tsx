'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Typography, Button, Tabs, Image, Tag, Space, 
  Rate, Spin, Alert
} from 'antd';
import { 
  CalendarOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, 
  GlobalOutlined, ClockCircleOutlined, ShoppingOutlined,
  HomeOutlined, TrophyOutlined, HeartOutlined, TeamOutlined, StarOutlined, 
  LoadingOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Breeder } from '@/types';
import { useAuth, useProfileViews } from '@/hooks';
import { ProfileHeader } from '@/features/users';
import { ComposeMessage } from '@/features/messaging';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// SWR fetcher
const fetcher = async (url: string): Promise<{ breeder: Breeder }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch breeder');
  }
  return response.json();
};

const BreederProfilePage: React.FC = () => {
  const params = useParams();
  const breederId = params?.id as string;
  const [activeTab, setActiveTab] = useState("posts");
  const [composeVisible, setComposeVisible] = useState(false);

  // Fetch breeder data
  const { data, error, isLoading } = useSWR<{ breeder: Breeder }>(
    breederId ? `/api/breeders/${breederId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const breeder = data?.breeder;
  const { user: authUser, getToken } = useAuth();
  const isOwnProfile = authUser && breeder && authUser.userId === String(breeder.userId);
  
  // Profile view tracking
  const { trackProfileView } = useProfileViews();

  // Track profile view when component mounts and profile is loaded
  useEffect(() => {
    if (breederId && breeder && !isOwnProfile) {
      trackProfileView(String(breeder.userId));
    }
  }, [breederId, breeder, isOwnProfile, trackProfileView]);

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginBottom: '16px'
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
          tip="Loading breeder profile..."
        />
      </div>
    );
  }

  // Error state
  if (error || !breeder) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <Alert
          message="Breeder Not Found"
          description="The breeder profile you're looking for doesn't exist or couldn't be loaded."
          type="error"
          showIcon
          style={{ marginTop: '50px' }}
          action={
            <Link href="/breeders">
              <Button type="primary">Browse All Breeders</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      {/* Profile Header (re-using shared component) */}
      <ProfileHeader 
        user={{
          userId: String(breeder.userId),
          displayName: breeder.businessName,
          name: breeder.name,
          verified: breeder.verified,
          profileImage: breeder.profileImage,
          location: breeder.location,
          lastActiveAt: breeder.lastUpdated,
        }}
        isOwnProfile={Boolean(isOwnProfile)}
        editHref={`/breeders/${breeder.userId}/edit`}
        onMessageClick={() => setComposeVisible(true)}
      />

      <Row gutter={[24, 24]}>
        {/* Left Sidebar - Breeder Info */}
        <Col xs={24} lg={8}>
          {/* Quick Info */}
          <Card style={cardStyle}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Space>
                  <EnvironmentOutlined style={{ color: '#08979C' }} />
                  <Text strong>{breeder.location}</Text>
                </Space>
              </div>
              
              <div>
                <Space>
                  <TrophyOutlined style={{ color: '#FA8072' }} />
                  <Text strong>{breeder.experience} years experience</Text>
                </Space>
              </div>

              <div>
                <Space>
                  <TeamOutlined style={{ color: '#1890ff' }} />
                  <Text strong>
                    {breeder.currentLitters} active litter{breeder.currentLitters !== 1 ? 's' : ''}
                  </Text>
                </Space>
              </div>

              <div>
                <Space>
                  <StarOutlined style={{ color: '#52c41a' }} />
                  <Text strong>
                    {breeder.availablePuppies} available puppie{breeder.availablePuppies !== 1 ? 's' : ''}
                  </Text>
                </Space>
              </div>

              {breeder.establishedYear && (
                <div>
                  <Space>
                    <CalendarOutlined style={{ color: '#722ed1' }} />
                    <Text strong>Established {breeder.establishedYear}</Text>
                  </Space>
                </div>
              )}
            </Space>
          </Card>

          {/* About */}
          <Card title="About" style={cardStyle}>
            <Paragraph style={{ fontSize: '14px' }}>{breeder.about}</Paragraph>
          </Card>

          {/* Contact Information */}
          <Card title="Contact Information" style={cardStyle}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PhoneOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                <a href={`tel:${breeder.phone}`} style={{ textDecoration: 'none' }}>
                  <Text>{breeder.phone}</Text>
                </a>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <MailOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                <a href={`mailto:${breeder.email}`} style={{ textDecoration: 'none' }}>
                  <Text>{breeder.email}</Text>
                </a>
              </div>
              
              {breeder.breederInfo?.website && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <GlobalOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                  <a 
                    href={`https://${breeder.breederInfo?.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <Text>{breeder.breederInfo?.website}</Text>
                  </a>
                </div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ClockCircleOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                <Text>{breeder.businessHours}</Text>
              </div>
            </Space>
          </Card>

          {/* Breeds */}
          <Card title="Breeds We Specialize In" style={cardStyle}>
            <Space wrap>
              {breeder.breeds.map(breed => (
                <Tag key={breed} color="blue" style={{ marginBottom: '4px' }}>
                  {breed}
                </Tag>
              ))}
            </Space>
          </Card>

          {/* Specialties */}
          {breeder.specialties.length > 0 && (
            <Card title="Specialties" style={cardStyle}>
              <Space wrap>
                {breeder.specialties.map(specialty => (
                  <Tag key={specialty} color="purple" style={{ marginBottom: '4px' }}>
                    {specialty}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {/* Health Testing */}
          {breeder.healthTesting.length > 0 && (
            <Card title="Health Testing" style={cardStyle}>
              <Space wrap>
                {breeder.healthTesting.map(test => (
                  <Tag key={test} color="green" style={{ marginBottom: '4px' }}>
                    {test}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {/* Certifications */}
          {breeder.certifications.length > 0 && (
            <Card title="Certifications & Memberships" style={cardStyle}>
              <Space wrap>
                {breeder.certifications.map(cert => (
                  <Tag key={cert} color="cyan" style={{ marginBottom: '4px' }}>
                    {cert}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {/* Business Info */}
          <Card title="Business Information" style={cardStyle}>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <div>
                <Text strong>Pricing: </Text>
                <Text>{breeder.pricing}</Text>
              </div>
              
              <div>
                <Text strong>Response Rate: </Text>
                <Text>{Math.round(breeder.responseRate * 100)}%</Text>
              </div>
              
              <div>
                <Text strong>Avg Response Time: </Text>
                <Text>{breeder.avgResponseTime}</Text>
              </div>
              
              <div style={{ marginTop: '8px' }}>
                <Space wrap>
                  {breeder.shipping && (
                    <Tag color="blue" icon={<ShoppingOutlined />}>
                      Shipping Available
                    </Tag>
                  )}
                  {breeder.pickupAvailable && (
                    <Tag color="green" icon={<HomeOutlined />}>
                      Pickup Available
                    </Tag>
                  )}
                  {breeder.appointmentRequired && (
                    <Tag color="orange" icon={<ClockCircleOutlined />}>
                      Appointment Required
                    </Tag>
                  )}
                </Space>
              </div>
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
            <TabPane tab="Community Posts" key="posts">
              <Card style={cardStyle}>
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Title level={4}>Community Updates</Title>
                  <Paragraph>
                    Stay connected with our latest news, puppy updates, and family stories.
                  </Paragraph>
                  <Button type="primary" style={{ background: '#08979C', borderColor: '#08979C' }}>
                    View All Posts
                  </Button>
                </div>
              </Card>
            </TabPane>
            
            <TabPane tab="Available Puppies" key="available">
              <Card style={cardStyle}>
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Title level={4}>Current Available Puppies</Title>
                  {breeder.availablePuppies > 0 ? (
                    <div>
                      <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
                        We currently have <Text strong>{breeder.availablePuppies}</Text> puppies 
                        available from our recent litters!
                      </Paragraph>
                      <Space>
                        <Button 
                          type="primary" 
                          size="large"
                          style={{ background: '#08979C', borderColor: '#08979C' }}
                        >
                          View Available Puppies
                        </Button>
                        <Button size="large">
                          Join Waiting List
                        </Button>
                      </Space>
                    </div>
                  ) : (
                    <div>
                      <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
                        Check back soon for available puppies from our upcoming litters!
                      </Paragraph>
                      <Button 
                        type="primary" 
                        size="large"
                        style={{ background: '#08979C', borderColor: '#08979C' }}
                      >
                        Join Waiting List
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </TabPane>
            
            <TabPane tab="Reviews" key="reviews">
              <Card style={cardStyle}>
                <div style={{ marginBottom: '24px' }}>
                  <Title level={4}>Family Reviews</Title>
                  <Space>
                    <Rate disabled value={breeder.rating} allowHalf />
                    <Text strong>{breeder.rating.toFixed(1)} out of 5</Text>
                    <Text type="secondary">({breeder.reviewCount} reviews)</Text>
                  </Space>
                </div>
                
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Title level={5}>Reviews Coming Soon</Title>
                  <Paragraph>
                    Family reviews and testimonials will be displayed here once our review system is fully implemented.
                  </Paragraph>
                </div>
              </Card>
            </TabPane>

            <TabPane tab="Gallery" key="gallery">
              <Card style={cardStyle}>
                <Title level={4}>Photo Gallery</Title>
                <Row gutter={[16, 16]}>
                  {[1,2,3,4,5,6].map(i => (
                    <Col xs={12} sm={8} key={i}>
                      <Image
                        src={`https://picsum.photos/300/300?random=${(breederId || 'gallery') + i}`}
                        alt={`Gallery image ${i}`}
                        style={{ 
                          width: '100%', 
                          height: '150px', 
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    </Col>
                  ))}
                </Row>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      {/* Social Media Links */}
      {Object.keys(breeder.socialMedia).length > 0 && (
        <Card 
          title="Connect With Us" 
          style={{ marginTop: '24px', textAlign: 'center', ...cardStyle }}
        >
          <Space size="large">
            {Object.entries(breeder.socialMedia).map(([platform, url]) => (
              <Button
                key={platform}
                type="link"
                size="large"
                onClick={() => window.open(url, '_blank')}
                style={{ textTransform: 'capitalize' }}
              >
                {platform}
              </Button>
            ))}
          </Space>
        </Card>
      )}

      {/* Quick Actions */}
      <Card style={{ marginTop: '24px', ...cardStyle }}>
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} sm={8}>
            <Button 
              type="primary" 
              block 
              size="large"
              icon={<MailOutlined />}
              style={{ background: '#FA8072', borderColor: '#FA8072' }}
            >
              Send Message
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button 
              block 
              size="large"
              icon={<PhoneOutlined />}
              onClick={() => window.open(`tel:${breeder.phone}`)}
            >
              Call Now
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
        </Row>
      </Card>
      {/* Compose Message Modal */}
      <ComposeMessage
        visible={composeVisible}
        onClose={() => setComposeVisible(false)}
        loading={false}
        defaultRecipientId={String(breeder.userId)}
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

export default BreederProfilePage;