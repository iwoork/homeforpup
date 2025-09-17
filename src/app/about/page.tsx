'use client';

import React from 'react';
import { Card, Row, Col, Typography, Button, Timeline, Statistic, Space, Divider } from 'antd';
import { 
  HeartOutlined, 
  SafetyOutlined, 
  UserOutlined, 
  MessageOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  HomeOutlined,
  StarOutlined,
  TrophyOutlined,
  BulbOutlined,
  RocketOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

const AboutPage: React.FC = () => {
  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    height: '100%',
    textAlign: 'center',
  };

  const sectionStyle: React.CSSProperties = {
    padding: '64px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{
        background: 'white',
        padding: '80px 24px 64px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-block',
            padding: '8px 24px',
            background: 'linear-gradient(135deg, #08979C 0%, #FA8072 100%)',
            borderRadius: '24px',
            marginBottom: '24px'
          }}>
            <Text style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
              ABOUT HOMEFORPUP
            </Text>
          </div>
          <Title level={1} style={{ color: '#2c3e50', marginBottom: '24px', fontSize: '42px', fontWeight: '700' }}>
            Reimagining the Future of <br />
            <span style={{ 
              background: 'linear-gradient(135deg, #08979C 0%, #FA8072 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Ethical Dog Breeding
            </span>
          </Title>
          <Paragraph style={{ 
            fontSize: '18px', 
            color: '#5a6c7d', 
            lineHeight: '1.7',
            maxWidth: '600px',
            margin: '0 auto 48px'
          }}>
            We're building a trusted community where ethical breeders and loving families connect through 
            transparency, shared values, and lifelong relationships that extend far beyond adoption day.
          </Paragraph>
          
          <Row gutter={[32, 16]} justify="center">
            <Col xs={12} sm={8} md={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #08979C 0%, #FA8072 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <UserOutlined style={{ fontSize: '24px', color: 'white' }} />
                </div>
                <Text strong style={{ display: 'block', fontSize: '24px', color: '#08979C' }}>250+</Text>
                <Text style={{ color: '#666', fontSize: '12px' }}>Verified Breeders</Text>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #FA8072 0%, #08979C 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <HeartOutlined style={{ fontSize: '24px', color: 'white' }} />
                </div>
                <Text strong style={{ display: 'block', fontSize: '24px', color: '#FA8072' }}>1.2k+</Text>
                <Text style={{ color: '#666', fontSize: '12px' }}>Happy Families</Text>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #08979C 0%, #FA8072 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <SafetyOutlined style={{ fontSize: '24px', color: 'white' }} />
                </div>
                <Text strong style={{ display: 'block', fontSize: '24px', color: '#08979C' }}>100%</Text>
                <Text style={{ color: '#666', fontSize: '12px' }}>Health Guaranteed</Text>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #FA8072 0%, #08979C 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <StarOutlined style={{ fontSize: '24px', color: 'white' }} />
                </div>
                <Text strong style={{ display: 'block', fontSize: '24px', color: '#FA8072' }}>4.9</Text>
                <Text style={{ color: '#666', fontSize: '12px' }}>Average Rating</Text>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Problem Statement */}
      <section style={{ ...sectionStyle, background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Title level={2}>The Challenge in Puppy Adoption</Title>
          <Paragraph style={{ fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
            Finding ethical breeders and building trust in the puppy adoption process has always been challenging. 
            Families struggle to verify breeder credentials, while ethical breeders find it difficult to showcase 
            their commitment and maintain relationships with puppy families.
          </Paragraph>
        </div>
      </section>

      {/* For Puppy Seekers */}
      <section style={{ ...sectionStyle, background: '#F5F5F5' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '48px', color: '#08979C' }}>
          For Puppy Seekers
        </Title>
        
        <Row gutter={[32, 32]} style={{ marginBottom: '48px' }}>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <SafetyOutlined style={{ fontSize: '48px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4}>Verified Ethical Breeders</Title>
              <Paragraph>
                Every breeder is thoroughly vetted for ethical practices, health testing protocols, and commitment to puppy welfare.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <BulbOutlined style={{ fontSize: '48px', color: '#FA8072', marginBottom: '16px' }} />
              <Title level={4}>Transparent Breeding Practices</Title>
              <Paragraph>
                See detailed health records, facility photos, parent dog information, and breeding philosophies before making decisions.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <MessageOutlined style={{ fontSize: '48px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4}>Direct Breeder Communication</Title>
              <Paragraph>
                Connect directly with breeders, ask questions, and build relationships before and after bringing your puppy home.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Card style={{ padding: '32px', background: 'white', borderRadius: '12px' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '24px', color: '#08979C' }}>
            Your Journey to Finding the Perfect Puppy
          </Title>
          <Timeline
            mode="left"
            items={[
              {
                dot: <SafetyOutlined style={{ fontSize: '16px', color: '#08979C' }} />,
                children: (
                  <div>
                    <Text strong>Research & Discovery</Text>
                    <Paragraph style={{ margin: '4px 0 0 0' }}>
                      Browse verified breeders, read their stories, and learn about their breeding practices and philosophies.
                    </Paragraph>
                  </div>
                )
              },
              {
                dot: <HeartOutlined style={{ fontSize: '16px', color: '#FA8072' }} />,
                children: (
                  <div>
                    <Text strong>Connect & Build Trust</Text>
                    <Paragraph style={{ margin: '4px 0 0 0' }}>
                      Follow breeder updates, see upcoming litters, and communicate directly to build confidence in your choice.
                    </Paragraph>
                  </div>
                )
              },
              {
                dot: <HomeOutlined style={{ fontSize: '16px', color: '#08979C' }} />,
                children: (
                  <div>
                    <Text strong>Welcome Home & Beyond</Text>
                    <Paragraph style={{ margin: '4px 0 0 0' }}>
                      Stay connected with your breeder community, share updates, and receive ongoing support for your puppy's journey.
                    </Paragraph>
                  </div>
                )
              }
            ]}
          />
        </Card>
      </section>

      {/* For Breeders */}
      <section style={{ ...sectionStyle, background: 'white' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '48px', color: '#FA8072' }}>
          For Ethical Breeders
        </Title>
        
        <Row gutter={[32, 32]} style={{ marginBottom: '48px' }}>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <TeamOutlined style={{ fontSize: '48px', color: '#FA8072', marginBottom: '16px' }} />
              <Title level={4}>Build Your Community</Title>
              <Paragraph>
                Create a professional profile that showcases your commitment to ethical breeding and connects you with the right families.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <RocketOutlined style={{ fontSize: '48px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4}>Streamlined Communication</Title>
              <Paragraph>
                Manage all family communications in one place, from initial inquiries to lifelong relationships with puppy families.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <TrophyOutlined style={{ fontSize: '48px', color: '#FA8072', marginBottom: '16px' }} />
              <Title level={4}>Showcase Your Standards</Title>
              <Paragraph>
                Display health testing, certifications, and breeding achievements to attract families who value ethical practices.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Card style={{ padding: '32px', background: '#F8F9FA', borderRadius: '12px' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '24px', color: '#FA8072' }}>
            How HomeForPup Transforms Your Breeding Business
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Title level={5}>Before HomeForPup</Title>
                  <ul style={{ color: '#666', lineHeight: '1.8' }}>
                    <li>Scattered communication across multiple platforms</li>
                    <li>Difficulty showcasing breeding standards</li>
                    <li>Limited ongoing connection with puppy families</li>
                    <li>Time-consuming manual updates to interested families</li>
                    <li>Challenges proving credibility to new families</li>
                  </ul>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Title level={5}>With HomeForPup</Title>
                  <ul style={{ color: '#08979C', lineHeight: '1.8' }}>
                    <li>Centralized communication hub for all families</li>
                    <li>Professional profile highlighting your expertise</li>
                    <li>Ongoing community with puppy families</li>
                    <li>Automated updates and litter announcements</li>
                    <li>Verified breeder badge and testimonials</li>
                  </ul>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>
      </section>

      {/* Value Propositions */}
      <section style={{ ...sectionStyle, background: '#E6F7F7' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
          Why HomeForPup Works
        </Title>
        
        <Row gutter={[32, 32]}>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Statistic
                title="Verified Breeders"
                value={250}
                suffix="+"
                valueStyle={{ color: '#08979C', fontSize: '32px' }}
              />
              <Paragraph style={{ marginTop: '8px', fontSize: '14px' }}>
                Thoroughly vetted for ethical practices
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Statistic
                title="Happy Families"
                value={1200}
                suffix="+"
                valueStyle={{ color: '#FA8072', fontSize: '32px' }}
              />
              <Paragraph style={{ marginTop: '8px', fontSize: '14px' }}>
                Successfully matched with perfect puppies
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Statistic
                title="Health Guarantee"
                value={100}
                suffix="%"
                valueStyle={{ color: '#08979C', fontSize: '32px' }}
              />
              <Paragraph style={{ marginTop: '8px', fontSize: '14px' }}>
                All puppies come with health guarantees
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Statistic
                title="Satisfaction Rate"
                value={98}
                suffix="%"
                valueStyle={{ color: '#FA8072', fontSize: '32px' }}
              />
              <Paragraph style={{ marginTop: '8px', fontSize: '14px' }}>
                Families would recommend HomeForPup
              </Paragraph>
            </div>
          </Col>
        </Row>
      </section>

      {/* Trust & Safety */}
      <section style={{ ...sectionStyle, background: 'white' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
          Built on Trust & Safety
        </Title>
        
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <CheckCircleOutlined style={{ fontSize: '36px', color: '#52c41a', marginBottom: '16px' }} />
              <Title level={4}>Rigorous Verification</Title>
              <Paragraph>
                Every breeder undergoes comprehensive screening including facility inspections, health testing verification, and reference checks.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <StarOutlined style={{ fontSize: '36px', color: '#faad14', marginBottom: '16px' }} />
              <Title level={4}>Community Reviews</Title>
              <Paragraph>
                Real feedback from puppy families helps maintain high standards and provides valuable insights for future adopters.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <SafetyOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4}>Ongoing Support</Title>
              <Paragraph>
                Our team provides continuous support to both breeders and families throughout the entire adoption journey and beyond.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #FA8072 0%, #08979C 100%)',
        color: 'white',
        padding: '64px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Title level={2} style={{ color: 'white', marginBottom: '24px' }}>
            Ready to Join Our Community?
          </Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '32px', color: 'rgba(255, 255, 255, 0.9)' }}>
            Whether you're looking for your perfect puppy companion or you're a breeder committed to ethical practices, 
            HomeForPup is here to connect you with your community.
          </Paragraph>
          <Space size="large">
            <Link href="/browse">
              <Button size="large" style={{ height: '48px', padding: '0 32px', fontSize: '18px' }}>
                Browse Available Puppies
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button 
                size="large" 
                style={{ 
                  height: '48px', 
                  padding: '0 32px', 
                  fontSize: '18px',
                  background: 'transparent',
                  borderColor: 'white',
                  color: 'white'
                }}
              >
                Become a Verified Breeder
              </Button>
            </Link>
          </Space>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;