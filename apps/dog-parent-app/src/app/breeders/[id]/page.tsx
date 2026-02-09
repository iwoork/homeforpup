'use client';

import React, { useState } from 'react';
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
import { useAuth } from '@homeforpup/shared-auth';
import { generateBreadcrumbSchema } from '@/lib/utils/seo';
import StructuredData from '@/components/StructuredData';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// Breeder interface
interface Breeder {
  id: number;
  name: string;
  businessName: string;
  location: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  email: string;
  website: string;
  experience: number;
  breeds: string[];
  breedIds: number[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  profileImage: string;
  coverImage: string;
  about: string;
  certifications: string[];
  healthTesting: string[];
  specialties: string[];
  currentLitters: number;
  availablePuppies: number;
  pricing: string;
  shipping: boolean;
  pickupAvailable: boolean;
  establishedYear?: number;
  businessHours: string;
  appointmentRequired: boolean;
  socialMedia: Record<string, string>;
  tags: string[];
  responseRate: number;
  avgResponseTime: string;
  lastUpdated: string;
  userId?: number;
  breederInfo?: {
    website?: string;
  };
}

// SWR fetcher
const fetcher = async (url: string): Promise<{ breeder: Breeder }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch breeder');
  }
  return response.json();
};

// Puppy type from the /api/puppies endpoint
interface PuppyFromApi {
  id: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  ageWeeks: number;
  price: number;
  location: string;
  image: string;
  description?: string;
  healthStatus: string;
}

// Fetcher for puppies API
const puppiesFetcher = async (url: string): Promise<{ puppies: PuppyFromApi[]; total: number }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch puppies');
  }
  return response.json();
};

const BreederPuppiesTab: React.FC<{ breederId: string; cardStyle: React.CSSProperties }> = ({ breederId, cardStyle }) => {
  const { data: puppiesData, error: puppiesError, isLoading: puppiesLoading } = useSWR(
    breederId ? `/api/puppies?breederId=${breederId}` : null,
    puppiesFetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const puppies = puppiesData?.puppies || [];

  if (puppiesLoading) {
    return (
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} tip="Loading puppies..." />
        </div>
      </Card>
    );
  }

  if (puppiesError) {
    return (
      <Card style={cardStyle}>
        <Alert
          message="Unable to load puppies"
          description="There was a problem fetching available puppies. Please try again later."
          type="error"
          showIcon
        />
      </Card>
    );
  }

  if (puppies.length === 0) {
    return (
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Title level={4}>No Puppies Available</Title>
          <Paragraph style={{ fontSize: '16px' }}>
            This breeder doesn&apos;t have any puppies available right now. Check back soon for upcoming litters!
          </Paragraph>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: '16px' }}>
        Available Puppies ({puppies.length})
      </Title>
      <Row gutter={[16, 16]}>
        {puppies.map((puppy) => (
          <Col xs={24} sm={12} md={12} key={puppy.id}>
            <Link href={`/puppies/${puppy.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <Card
                hoverable
                style={{ ...cardStyle, overflow: 'hidden' }}
                cover={
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <img
                      src={puppy.image}
                      alt={puppy.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.src = '/api/placeholder/400/200'; }}
                    />
                    <Tag color="blue" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      {puppy.ageWeeks} weeks
                    </Tag>
                  </div>
                }
              >
                <Title level={5} style={{ margin: 0, color: '#08979C' }}>{puppy.name}</Title>
                <Text type="secondary">{puppy.breed} &bull; {puppy.gender}</Text>
                <div style={{ marginTop: '8px' }}>
                  <Space>
                    <EnvironmentOutlined style={{ color: '#08979C', fontSize: '12px' }} />
                    <Text type="secondary" style={{ fontSize: '12px' }}>{puppy.location}</Text>
                  </Space>
                </div>
                {puppy.price > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <Text strong style={{ fontSize: '16px', color: '#08979C' }}>
                      ${puppy.price.toLocaleString()}
                    </Text>
                  </div>
                )}
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
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
  const { user: authUser } = useAuth();
  const isOwnProfile = authUser && breeder && authUser.userId === String(breeder.userId);

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
      {/* Profile Header */}
      <Card style={{ ...cardStyle, marginBottom: '24px' }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <img
                src={breeder.profileImage || '/api/placeholder/150/150'}
                alt={breeder.businessName}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #f0f0f0',
                  marginBottom: '16px'
                }}
                onError={(e) => {
                  e.currentTarget.src = '/api/placeholder/150/150';
                }}
              />
              <div>
                <Title level={3} style={{ margin: 0, color: '#08979C' }}>
                  {breeder.businessName}
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  {breeder.name}
                </Text>
                {breeder.verified && (
                  <div style={{ marginTop: '8px' }}>
                    <Tag color="green" icon={<StarOutlined />}>
                      Verified Breeder
                    </Tag>
                  </div>
                )}
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={18}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
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
              </Col>
              
              <Col xs={24} sm={12}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <Rate disabled value={breeder.rating} allowHalf />
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                      {breeder.rating.toFixed(1)} out of 5 ({breeder.reviewCount} reviews)
                    </div>
                  </div>
                  
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<MailOutlined />}
                      style={{ background: '#FA8072', borderColor: '#FA8072' }}
                    >
                      Send Message
                    </Button>
                    <Button 
                      icon={<PhoneOutlined />}
                      onClick={() => window.open(`tel:${breeder.phone}`)}
                    >
                      Call Now
                    </Button>
                    <Button 
                      icon={<HeartOutlined />}
                    >
                      Add to Favorites
                    </Button>
                  </Space>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Left Sidebar - Breeder Info */}
        <Col xs={24} lg={8}>
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
              <BreederPuppiesTab breederId={breederId} cardStyle={cardStyle} />
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

      {/* Structured Data */}
      <StructuredData 
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Breeders', url: '/breeders' },
          { name: breeder.businessName, url: `/breeders/${breeder.id}` }
        ])} 
      />
    </div>
  );
};

export default BreederProfilePage;
