'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Rate, 
  Avatar, 
  Tag, 
  Button, 
  Space, 
  List, 
  Badge,
  Progress,
  Timeline,
  Alert,
  Divider,
  Tooltip,
  Modal,
  Form,
  Input,
  message
} from 'antd';
import { 
  StarOutlined, 
  UserOutlined, 
  SafetyOutlined, 
  CheckCircleOutlined,
  EyeOutlined,
  MessageOutlined,
  HeartOutlined,
  TrophyOutlined,
  ShieldOutlined,
  FileTextOutlined,
  CameraOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  content: string;
  verified: boolean;
  helpful: number;
  puppyName?: string;
  breederName: string;
}

interface Testimonial {
  id: string;
  author: string;
  location: string;
  puppyName: string;
  breed: string;
  content: string;
  rating: number;
  date: string;
  image?: string;
}

interface BreederVerification {
  verified: boolean;
  verificationDate: string;
  checks: {
    healthTesting: boolean;
    homeVisit: boolean;
    references: boolean;
    contract: boolean;
    support: boolean;
  };
  score: number;
}

const TrustBuildingFeatures: React.FC = () => {
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewForm] = Form.useForm();

  const reviews: Review[] = [
    {
      id: '1',
      author: 'Sarah M.',
      rating: 5,
      date: '2024-01-15',
      content: 'Absolutely wonderful experience! The breeder was transparent, caring, and our puppy came home healthy and well-socialized. The health testing was comprehensive and the ongoing support has been incredible.',
      verified: true,
      helpful: 12,
      puppyName: 'Bella',
      breederName: 'Golden Dreams Kennel'
    },
    {
      id: '2',
      author: 'Michael R.',
      rating: 5,
      date: '2024-01-10',
      content: 'Professional, ethical breeding practices. We were able to visit the home, meet the parents, and see exactly how the puppies were raised. Our dog is healthy, happy, and perfectly socialized.',
      verified: true,
      helpful: 8,
      puppyName: 'Max',
      breederName: 'Mountain View Labradors'
    },
    {
      id: '3',
      author: 'Jennifer L.',
      rating: 4,
      date: '2024-01-05',
      content: 'Great breeder with excellent communication. The puppy was exactly as described and the health guarantee gave us peace of mind. Would definitely recommend to others.',
      verified: true,
      helpful: 6,
      puppyName: 'Luna',
      breederName: 'Sunny Acres Retrievers'
    }
  ];

  const testimonials: Testimonial[] = [
    {
      id: '1',
      author: 'The Johnson Family',
      location: 'Toronto, ON',
      puppyName: 'Charlie',
      breed: 'Golden Retriever',
      content: 'We found our perfect family member through HomeForPup. The breeder was amazing - transparent, caring, and provided excellent ongoing support.',
      rating: 5,
      date: '2024-01-20',
      image: '/testimonials/johnson-family.jpg'
    },
    {
      id: '2',
      author: 'Emma & David',
      location: 'Vancouver, BC',
      puppyName: 'Milo',
      breed: 'Labrador Mix',
      content: 'The verification process gave us confidence we were working with ethical breeders. Our puppy is healthy, happy, and perfectly matched to our lifestyle.',
      rating: 5,
      date: '2024-01-18'
    },
    {
      id: '3',
      author: 'The Chen Family',
      location: 'Calgary, AB',
      puppyName: 'Sophie',
      breed: 'Cavalier King Charles',
      content: 'From search to adoption, the entire process was smooth and transparent. The breeder education resources helped us make informed decisions.',
      rating: 5,
      date: '2024-01-12'
    }
  ];

  const breederVerification: BreederVerification = {
    verified: true,
    verificationDate: '2024-01-01',
    checks: {
      healthTesting: true,
      homeVisit: true,
      references: true,
      contract: true,
      support: true
    },
    score: 95
  };

  const handleReviewSubmit = async (values: any) => {
    try {
      // Here you would submit the review to your API
      console.log('Review submitted:', values);
      message.success('Thank you for your review! It will be published after moderation.');
      setReviewModalVisible(false);
      reviewForm.resetFields();
    } catch (error) {
      message.error('Failed to submit review. Please try again.');
    }
  };

  const verificationChecks = [
    { key: 'healthTesting', label: 'Health Testing', description: 'Comprehensive health clearances on parent dogs' },
    { key: 'homeVisit', label: 'Home Visit', description: 'Breeder allows home visits and transparency' },
    { key: 'references', label: 'References', description: 'Positive references from previous families' },
    { key: 'contract', label: 'Contract', description: 'Clear contract with health guarantee' },
    { key: 'support', label: 'Ongoing Support', description: 'Lifetime support and take-back policy' }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={1} style={{ color: '#08979C', marginBottom: '16px' }}>
          Building Trust Through Transparency
        </Title>
        <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
          We believe in complete transparency and accountability. Here's how we build trust and ensure you can make informed decisions about your puppy adoption.
        </Paragraph>
      </div>

      {/* Verification Badge */}
      <Card style={{ marginBottom: '24px', background: '#f6ffed', border: '1px solid #b7eb8f' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Badge 
                count={<CheckCircleOutlined style={{ color: 'white' }} />} 
                style={{ backgroundColor: '#52c41a' }}
              />
              <div>
                <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                  Verified Ethical Breeder
                </Title>
                <Text style={{ color: '#666' }}>
                  Verified on {breederVerification.verificationDate} • Score: {breederVerification.score}/100
                </Text>
              </div>
            </div>
          </Col>
          <Col>
            <Progress 
              type="circle" 
              percent={breederVerification.score} 
              size={60}
              strokeColor="#52c41a"
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Reviews Section */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <StarOutlined style={{ color: '#faad14' }} />
                Customer Reviews
                <Badge count={reviews.length} style={{ backgroundColor: '#08979C' }} />
              </Space>
            }
            extra={
              <Button 
                type="primary" 
                size="small"
                onClick={() => setReviewModalVisible(true)}
              >
                Write Review
              </Button>
            }
            style={{ height: '100%' }}
          >
            <List
              dataSource={reviews}
              renderItem={(review) => (
                <List.Item style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<UserOutlined />} 
                        style={{ backgroundColor: '#08979C' }}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong>{review.author}</Text>
                        {review.verified && (
                          <Tag color="green" icon={<CheckCircleOutlined />} size="small">
                            Verified
                          </Tag>
                        )}
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {review.date}
                        </Text>
                      </div>
                    }
                    description={
                      <div>
                        <Rate disabled value={review.rating} style={{ fontSize: '14px', marginBottom: '8px' }} />
                        <Paragraph style={{ margin: '8px 0', fontSize: '14px' }}>
                          {review.content}
                        </Paragraph>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Puppy: {review.puppyName} • Breeder: {review.breederName}
                          </Text>
                          <Button type="text" size="small" icon={<HeartOutlined />}>
                            Helpful ({review.helpful})
                          </Button>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Testimonials Section */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <TrophyOutlined style={{ color: '#fa8c16' }} />
                Success Stories
              </Space>
            }
            style={{ height: '100%' }}
          >
            <Timeline>
              {testimonials.map((testimonial) => (
                <Timeline.Item
                  key={testimonial.id}
                  dot={<HeartOutlined style={{ color: '#08979C' }} />}
                >
                  <Card size="small" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <Avatar 
                        size={40}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#08979C' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Text strong>{testimonial.author}</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {testimonial.location}
                          </Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                          {testimonial.puppyName} • {testimonial.breed} • {testimonial.date}
                        </Text>
                        <Paragraph style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                          "{testimonial.content}"
                        </Paragraph>
                        <Rate disabled value={testimonial.rating} style={{ fontSize: '12px' }} />
                      </div>
                    </div>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* Verification Details */}
      <Card 
        title={
          <Space>
            <ShieldOutlined style={{ color: '#08979C' }} />
            Verification Details
          </Space>
        }
        style={{ marginTop: '24px' }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Title level={4}>Verification Checklist</Title>
            <List
              dataSource={verificationChecks}
              renderItem={(check) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                    <CheckCircleOutlined 
                      style={{ 
                        color: breederVerification.checks[check.key as keyof typeof breederVerification.checks] ? '#52c41a' : '#d9d9d9',
                        fontSize: '16px'
                      }} 
                    />
                    <div style={{ flex: 1 }}>
                      <Text strong>{check.label}</Text>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {check.description}
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Col>
          <Col xs={24} md={12}>
            <Title level={4}>Transparency Features</Title>
            <List
              dataSource={[
                { icon: <EyeOutlined />, feature: 'Live Puppy Updates', description: 'See real-time photos and videos' },
                { icon: <FileTextOutlined />, feature: 'Health Records', description: 'Complete health documentation' },
                { icon: <CameraOutlined />, feature: 'Home Tours', description: 'Virtual tours of breeding facilities' },
                { icon: <MessageOutlined />, feature: 'Direct Communication', description: 'Chat directly with breeders' },
                { icon: <PhoneOutlined />, feature: 'Video Calls', description: 'Face-to-face conversations' },
                { icon: <GlobalOutlined />, feature: 'Social Media', description: 'Follow breeders on social platforms' }
              ]}
              renderItem={(item) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '16px', color: '#08979C' }}>
                      {item.icon}
                    </div>
                    <div>
                      <Text strong>{item.feature}</Text>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </Card>

      {/* Trust Indicators */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', height: '100%' }}>
            <SafetyOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
            <Title level={4}>100% Verified</Title>
            <Paragraph>
              Every breeder on our platform undergoes comprehensive verification including health testing, home visits, and reference checks.
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', height: '100%' }}>
            <CheckCircleOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={4}>Health Guarantee</Title>
            <Paragraph>
              All breeders provide comprehensive health guarantees and ongoing support for the lifetime of your dog.
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', height: '100%' }}>
            <HeartOutlined style={{ fontSize: '48px', color: '#fa8c16', marginBottom: '16px' }} />
            <Title level={4}>Community Driven</Title>
            <Paragraph>
              Join a community of responsible dog owners and ethical breeders committed to animal welfare.
            </Paragraph>
          </Card>
        </Col>
      </Row>

      {/* Review Modal */}
      <Modal
        title="Write a Review"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={handleReviewSubmit}
        >
          <Form.Item
            name="rating"
            label="Overall Rating"
            rules={[{ required: true, message: 'Please provide a rating' }]}
          >
            <Rate />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="Your Review"
            rules={[{ required: true, message: 'Please write your review' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Share your experience with this breeder..."
            />
          </Form.Item>
          
          <Form.Item
            name="puppyName"
            label="Puppy Name"
          >
            <Input placeholder="Name of your puppy (optional)" />
          </Form.Item>
          
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setReviewModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Submit Review
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default TrustBuildingFeatures;
