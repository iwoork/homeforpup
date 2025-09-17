'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Typography, Avatar, Button, Tabs, Image, Tag, Divider, Space, Rate } from 'antd';
import { 
  HeartOutlined, 
  CalendarOutlined, 
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  MessageOutlined,
  ShareAltOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// Mock data for a breeder
const breederData = {
  id: 1,
  name: "Sarah Johnson",
  businessName: "Happy Tails Breeding",
  location: "Seattle, WA",
  phone: "(206) 555-0123",
  email: "sarah@happytails.com",
  experience: "15 years",
  specialties: ["Cavapoo", "Goldendoodle", "Bernedoodle"],
  rating: 4.9,
  reviewCount: 127,
  verified: true,
  profileImage: "https://images.unsplash.com/photo-1494790108755-2616c4e4a6b0?w=400",
  coverImage: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=400",
  about: "Welcome to Happy Tails! I've been breeding healthy, well-socialized puppies for over 15 years. My focus is on producing puppies with excellent temperaments that make wonderful family companions. All my breeding dogs undergo comprehensive health testing, and every puppy comes with a health guarantee.",
  certifications: ["AKC Breeder of Merit", "GANA Member", "Health Tested Lines"],
  totalLitters: 45,
  totalPuppies: 312,
  currentFamilies: 298
};

// Post interface for better type safety
interface Post {
  id: number;
  type: string;
  date: string;
  title: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  isFromFamily?: boolean;
  familyName?: string;
}

// Mock posts data
const posts: Post[] = [
  {
    id: 1,
    type: "litter_announcement",
    date: "2025-03-15",
    title: "New Cavapoo Litter Expected!",
    content: "Exciting news! Bella and Max are expecting their first litter together. Due date is April 20th. Both parents have passed all health clearances. Taking reservations now!",
    images: ["https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400", "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400"],
    likes: 24,
    comments: 8
  },
  {
    id: 2,
    type: "puppy_update",
    date: "2025-03-12",
    title: "Week 6 Update - Golden Retriever Litter",
    content: "The golden babies are 6 weeks old and personalities are really shining through! They've started basic potty training and are eating solid food. Vet check scheduled for this Friday.",
    images: ["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400", "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400", "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400"],
    likes: 45,
    comments: 12
  },
  {
    id: 3,
    type: "family_update",
    date: "2025-03-10",
    title: "Update from the Johnson Family",
    content: "Luna is doing amazing in her new home! She's already learned sit, stay, and come. The kids absolutely adore her. Thank you Sarah for this perfect addition to our family!",
    images: ["https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400"],
    likes: 38,
    comments: 6,
    isFromFamily: true,
    familyName: "Johnson Family"
  },
  {
    id: 4,
    type: "health_update",
    date: "2025-03-08",
    title: "Health Testing Complete",
    content: "Just received Rosie's latest health clearances - all clear for hips, elbows, eyes, and genetic testing. She's approved for breeding and we're planning her next litter for fall 2025.",
    images: ["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400"],
    likes: 22,
    comments: 4
  }
];

const BreederCommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("posts");

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginBottom: '16px'
  };

  const renderPost = (post: Post) => (
    <Card key={post.id} style={cardStyle}>
      <div style={{ marginBottom: '12px' }}>
        <Space align="center">
          <Avatar src={post.isFromFamily ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" : breederData.profileImage} />
          <div>
            <Text strong>{post.isFromFamily ? post.familyName : breederData.businessName}</Text>
            <br />
            <Text type="secondary">{post.date}</Text>
            {post.isFromFamily && <Tag color="blue" style={{ marginLeft: '8px' }}>Family Update</Tag>}
          </div>
        </Space>
      </div>
      
      <Title level={4} style={{ marginBottom: '8px' }}>{post.title}</Title>
      <Paragraph>{post.content}</Paragraph>
      
      {post.images && post.images.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <Image.PreviewGroup>
            <Row gutter={[8, 8]}>
              {post.images.map((img: string, idx: number) => (
                <Col key={idx} span={post.images!.length === 1 ? 24 : 8}>
                  <Image
                    src={img}
                    alt={`Post image ${idx + 1}`}
                    style={{ 
                      width: '100%', 
                      height: post.images!.length === 1 ? '300px' : '150px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </div>
      )}
      
      <Divider style={{ margin: '12px 0' }} />
      
      <Space>
        <Button type="text" icon={<HeartOutlined />} size="small">
          {post.likes} Likes
        </Button>
        <Button type="text" icon={<MessageOutlined />} size="small">
          {post.comments} Comments
        </Button>
        <Button type="text" icon={<ShareAltOutlined />} size="small">
          Share
        </Button>
      </Space>
    </Card>
  );

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
            backgroundImage: `url(${breederData.coverImage})`,
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
                    src={breederData.profileImage}
                    style={{ border: '4px solid white' }}
                  />
                  <div>
                    <Title level={2} style={{ color: 'white', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      {breederData.businessName}
                      {breederData.verified && (
                        <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: '8px' }} />
                      )}
                    </Title>
                    <Text style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                      by {breederData.name}
                    </Text>
                    <br />
                    <Space style={{ marginTop: '4px' }}>
                      <Rate disabled defaultValue={breederData.rating} style={{ fontSize: '14px' }} />
                      <Text style={{ color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {breederData.rating} ({breederData.reviewCount} reviews)
                      </Text>
                    </Space>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button type="primary" size="large" style={{ background: '#FA8072', borderColor: '#FA8072' }}>
                    Message Breeder
                  </Button>
                  <Button size="large">
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
          {/* About Card */}
          <Card title="About" style={cardStyle}>
            <Paragraph>{breederData.about}</Paragraph>
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <EnvironmentOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                <Text>{breederData.location}</Text>
              </div>
              <div>
                <CalendarOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                <Text>{breederData.experience} experience</Text>
              </div>
              <div>
                <PhoneOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                <Text>{breederData.phone}</Text>
              </div>
              <div>
                <MailOutlined style={{ color: '#08979C', marginRight: '8px' }} />
                <Text>{breederData.email}</Text>
              </div>
            </Space>
          </Card>

          {/* Specialties */}
          <Card title="Breeds We Specialize In" style={cardStyle}>
            <Space wrap>
              {breederData.specialties.map(breed => (
                <Tag key={breed} color="blue" style={{ marginBottom: '4px' }}>
                  {breed}
                </Tag>
              ))}
            </Space>
          </Card>

          {/* Certifications */}
          <Card title="Certifications & Memberships" style={cardStyle}>
            <Space direction="vertical">
              {breederData.certifications.map(cert => (
                <div key={cert}>
                  <TrophyOutlined style={{ color: '#FA8072', marginRight: '8px' }} />
                  <Text>{cert}</Text>
                </div>
              ))}
            </Space>
          </Card>

          {/* Stats */}
          <Card title="Breeding Statistics" style={cardStyle}>
            <Row gutter={[16, 16]}>
              <Col span={12} style={{ textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#08979C' }}>
                  {breederData.totalLitters}
                </Title>
                <Text type="secondary">Total Litters</Text>
              </Col>
              <Col span={12} style={{ textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#FA8072' }}>
                  {breederData.totalPuppies}
                </Title>
                <Text type="secondary">Puppies Placed</Text>
              </Col>
              <Col span={24} style={{ textAlign: 'center' }}>
                <Title level={3} style={{ margin: 0, color: '#08979C' }}>
                  {breederData.currentFamilies}
                </Title>
                <Text type="secondary">Happy Families</Text>
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
              <div>
                {posts.map(renderPost)}
              </div>
            </TabPane>
            
            <TabPane tab="Available Puppies" key="available">
              <Card style={cardStyle}>
                <Title level={4}>Current Available Puppies</Title>
                <Paragraph>Check back soon for available puppies from our upcoming litters!</Paragraph>
                <Button type="primary" style={{ background: '#08979C', borderColor: '#08979C' }}>
                  Join Waiting List
                </Button>
              </Card>
            </TabPane>
            
            <TabPane tab="Our Dogs" key="dogs">
              <Card style={cardStyle}>
                <Title level={4}>Meet Our Breeding Dogs</Title>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Card cover={<Image src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300" alt="Bella - F1 Cavapoo" />}>
                      <Title level={5}>Bella</Title>
                      <Text>F1 Cavapoo • Health Tested • Champion Bloodline</Text>
                    </Card>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Card cover={<Image src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300" alt="Max - Poodle Stud" />}>
                      <Title level={5}>Max</Title>
                      <Text>Poodle Stud • OFA Certified • Proven Producer</Text>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </TabPane>
            
            <TabPane tab="Reviews" key="reviews">
              <Card style={cardStyle}>
                <Title level={4}>Family Reviews</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '16px', marginBottom: '16px' }}>
                      <Space align="start">
                        <Avatar src={`https://images.unsplash.com/photo-150700321116${i}-0a1dd7228f2d?w=100`} />
                        <div style={{ flex: 1 }}>
                          <div>
                            <Text strong>The Martinez Family</Text>
                            <Rate disabled defaultValue={5} style={{ marginLeft: '8px', fontSize: '12px' }} />
                          </div>
                          <Text type="secondary">2 weeks ago</Text>
                          <Paragraph style={{ marginTop: '8px' }}>
                            &ldquo;Sarah was amazing throughout the entire process. Our goldendoodle Charlie is healthy, well-socialized, and has the most wonderful temperament. Highly recommend Happy Tails!&rdquo;
                          </Paragraph>
                        </div>
                      </Space>
                    </div>
                  ))}
                </Space>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};

export default BreederCommunityPage;