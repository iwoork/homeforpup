'use client';

import React, { useState } from 'react';
import { 
  Card, Row, Col, Typography, Avatar, Button, Tabs, Image, Tag, Space, 
  Rate, Spin, Alert, Statistic
} from 'antd';
import { 
  CalendarOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, 
  CheckCircleOutlined, GlobalOutlined, ClockCircleOutlined, ShoppingOutlined,
  HomeOutlined, TrophyOutlined, HeartOutlined, TeamOutlined, StarOutlined, 
  LoadingOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Breeder, BreederStats, BreederReview } from '@/types/breeder';
import AnnouncementsFeed from '@/components/AnnouncementsFeed';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// Mock data
const mockBreederStats: BreederStats = {
  totalLitters: 45,
  totalPuppies: 312,
  currentFamilies: 298,
  yearsActive: 15,
  satisfactionRate: 98
};

const mockReviews: BreederReview[] = [
  {
    id: 1,
    familyName: "The Martinez Family",
    rating: 5,
    date: "2 weeks ago",
    review: "Sarah was amazing throughout the entire process. Our goldendoodle Charlie is healthy, well-socialized, and has the most wonderful temperament. Highly recommend!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    puppyName: "Charlie",
    breed: "Goldendoodle"
  },
  {
    id: 2,
    familyName: "The Johnson Family", 
    rating: 5,
    date: "1 month ago",
    review: "Professional, caring, and transparent. Our Cavapoo Luna came with excellent health records and has been a perfect addition to our family.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    puppyName: "Luna",
    breed: "Cavapoo"
  },
  {
    id: 3,
    familyName: "The Chen Family",
    rating: 5,
    date: "2 months ago", 
    review: "Exceptional breeder with genuine care for their dogs and puppies. The health testing and socialization program is top-notch.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    puppyName: "Buddy",
    breed: "Bernedoodle"
  }
];

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
      {/* Cover Photo & Profile Header */}
      <Card 
        style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden' }}
        bodyStyle={{ padding: 0 }}
      >
        <div 
          style={{
            height: '300px',
            backgroundImage: `url(${breeder.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
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
                    src={breeder.profileImage}
                    style={{ border: '4px solid white' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Title level={2} style={{ 
                        margin: 0, 
                        color: 'white', 
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)' 
                      }}>
                        {breeder.businessName}
                      </Title>
                      {breeder.verified && (
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />
                      )}
                    </div>
                    <Text style={{ 
                      color: 'white', 
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      fontSize: '16px'
                    }}>
                      by {breeder.name}
                    </Text>
                    <br />
                    <Space style={{ marginTop: '8px' }}>
                      <Rate 
                        disabled 
                        value={breeder.rating} 
                        style={{ fontSize: '16px' }}
                        allowHalf
                      />
                      <Text style={{ 
                        color: 'white', 
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        fontSize: '14px'
                      }}>
                        {breeder.rating.toFixed(1)} ({breeder.reviewCount} reviews)
                      </Text>
                    </Space>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button 
                    type="primary" 
                    size="large" 
                    style={{ background: '#FA8072', borderColor: '#FA8072' }}
                    icon={<MailOutlined />}
                  >
                    Message Breeder
                  </Button>
                  <Button size="large" icon={<HeartOutlined />}>
                    Follow Updates
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>
        </div>
      </Card>

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
              
              {breeder.website && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <GlobalOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                  <a 
                    href={`https://${breeder.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <Text>{breeder.website}</Text>
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

          {/* Stats */}
          <Card title="Breeding Statistics" style={cardStyle}>
            <Row gutter={[16, 16]}>
              <Col span={12} style={{ textAlign: 'center' }}>
                <Statistic
                  title="Total Litters"
                  value={mockBreederStats.totalLitters}
                  valueStyle={{ color: '#08979C' }}
                />
              </Col>
              <Col span={12} style={{ textAlign: 'center' }}>
                <Statistic
                  title="Puppies Placed"
                  value={mockBreederStats.totalPuppies}
                  valueStyle={{ color: '#FA8072' }}
                />
              </Col>
              <Col span={24} style={{ textAlign: 'center' }}>
                <Statistic
                  title="Happy Families"
                  value={mockBreederStats.currentFamilies}
                  valueStyle={{ color: '#52c41a' }}
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
            <TabPane tab="Community Posts" key="posts">
              <AnnouncementsFeed />
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
            
            <TabPane tab="Our Dogs" key="dogs">
              <Card style={cardStyle}>
                <Title level={4}>Meet Our Breeding Dogs</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Card 
                      cover={
                        <Image 
                          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop" 
                          alt="Bella"
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      }
                    >
                      <Title level={5}>Bella</Title>
                      <Text>F1 Cavapoo • Health Tested • Champion Bloodline</Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card 
                      cover={
                        <Image 
                          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop" 
                          alt="Max"
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      }
                    >
                      <Title level={5}>Max</Title>
                      <Text>Poodle Stud • OFA Certified • Proven Producer</Text>
                    </Card>
                  </Col>
                </Row>
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
                
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  {mockReviews.map(review => (
                    <div 
                      key={review.id} 
                      style={{ 
                        borderBottom: '1px solid #f0f0f0', 
                        paddingBottom: '16px', 
                        marginBottom: '16px' 
                      }}
                    >
                      <Space align="start" style={{ width: '100%' }}>
                        <Avatar src={review.avatar} size={48} />
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: '8px' }}>
                            <Space align="center" style={{ marginBottom: '4px' }}>
                              <Text strong>{review.familyName}</Text>
                              <Rate disabled value={review.rating} style={{ fontSize: '12px' }} />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {review.date}
                              </Text>
                            </Space>
                            <div>
                              <Tag color="blue" style={{ fontSize: '11px' }}>
                                {review.breed} • {review.puppyName}
                              </Tag>
                            </div>
                          </div>
                          <Paragraph style={{ marginBottom: 0, fontSize: '14px' }}>
                            "{review.review}"
                          </Paragraph>
                        </div>
                      </Space>
                    </div>
                  ))}
                  
                  <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Button type="dashed" size="large">
                      Load More Reviews
                    </Button>
                  </div>
                </Space>
              </Card>
            </TabPane>

            <TabPane tab="Gallery" key="gallery">
              <Card style={cardStyle}>
                <Title level={4}>Photo Gallery</Title>
                <Row gutter={[16, 16]}>
                  {[1,2,3,4,5,6].map(i => (
                    <Col xs={12} sm={8} key={i}>
                      <Image
                        src={`https://images.unsplash.com/photo-${1587300003388 + i}-59208cc962cb?w=300&h=300&fit=crop`}
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
    </div>
  );
};

export default BreederProfilePage;