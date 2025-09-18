'use client';

import React from 'react';
import { Card, Row, Col, Typography, Button, Timeline, Statistic, Space  } from 'antd';
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
            Creating Paw-some Families <br />
            <span style={{ 
              background: 'linear-gradient(135deg, #08979C 0%, #FA8072 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              One Match at a Time
            </span>
          </Title>
          <Paragraph style={{ 
            fontSize: '18px', 
            color: '#5a6c7d', 
            lineHeight: '1.7',
            maxWidth: '600px',
            margin: '0 auto 48px'
          }}>
            We&apos;re building a loving community where passionate dog families and caring people connect through 
            shared values, genuine relationships, and the joy of bringing together perfect four-legged matches.
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
                <Text style={{ color: '#666', fontSize: '12px' }}>Caring Dog Families</Text>
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
                <Text style={{ color: '#666', fontSize: '12px' }}>Paw-some Matches</Text>
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
                <Text style={{ color: '#666', fontSize: '12px' }}>Love & Care</Text>
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
                <Text style={{ color: '#666', fontSize: '12px' }}>Community Love</Text>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Problem Statement */}
      <section style={{ ...sectionStyle, background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Title level={2}>The Challenge in Finding Your Perfect Match</Title>
          <Paragraph style={{ fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
            Finding caring dog families and building meaningful connections in the puppy world has always been challenging. 
            Families struggle to find genuine dog lovers, while passionate dog families find it difficult to connect 
            with the right people who share their values and commitment to puppy happiness.
          </Paragraph>
        </div>
      </section>

      {/* For Puppy Seekers */}
      <section style={{ ...sectionStyle, background: '#F5F5F5' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '48px', color: '#08979C' }}>
          For Families Seeking Their Perfect Pup
        </Title>
        
        <Row gutter={[32, 32]} style={{ marginBottom: '48px' }}>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <SafetyOutlined style={{ fontSize: '48px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4}>Caring Dog Families</Title>
              <Paragraph>
                Every dog family in our community is passionate about puppy welfare, health, and creating loving environments for their dogs.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <BulbOutlined style={{ fontSize: '48px', color: '#FA8072', marginBottom: '16px' }} />
              <Title level={4}>Open & Honest Sharing</Title>
              <Paragraph>
                See detailed health records, happy puppy photos, parent dog personalities, and family stories before making connections.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <MessageOutlined style={{ fontSize: '48px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4}>Genuine Relationships</Title>
              <Paragraph>
                Connect directly with dog families, build friendships, and maintain relationships that last long after your puppy comes home.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Card style={{ padding: '32px', background: 'white', borderRadius: '12px' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '24px', color: '#08979C' }}>
            Your Journey to Finding Your Paw-fect Match
          </Title>
          <Timeline
            mode="left"
            items={[
              {
                dot: <SafetyOutlined style={{ fontSize: '16px', color: '#08979C' }} />,
                children: (
                  <div>
                    <Text strong>Discover & Connect</Text>
                    <Paragraph style={{ margin: '4px 0 0 0' }}>
                      Meet amazing dog families, read their heartwarming stories, and learn about their approach to raising happy, healthy puppies.
                    </Paragraph>
                  </div>
                )
              },
              {
                dot: <HeartOutlined style={{ fontSize: '16px', color: '#FA8072' }} />,
                children: (
                  <div>
                    <Text strong>Build Friendships & Trust</Text>
                    <Paragraph style={{ margin: '4px 0 0 0' }}>
                      Follow family updates, get excited about upcoming litters, and build genuine friendships with people who share your love for dogs.
                    </Paragraph>
                  </div>
                )
              },
              {
                dot: <HomeOutlined style={{ fontSize: '16px', color: '#08979C' }} />,
                children: (
                  <div>
                    <Text strong>Welcome Home & Community</Text>
                    <Paragraph style={{ margin: '4px 0 0 0' }}>
                      Stay connected with your dog family community, share puppy updates, and enjoy ongoing friendships and support throughout your journey.
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
          For Passionate Dog Families
        </Title>
        
        <Row gutter={[32, 32]} style={{ marginBottom: '48px' }}>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <TeamOutlined style={{ fontSize: '48px', color: '#FA8072', marginBottom: '16px' }} />
              <Title level={4}>Share Your Love Story</Title>
              <Paragraph>
                Create a heartwarming profile that showcases your passion for dogs and connects you with families who share your values.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <RocketOutlined style={{ fontSize: '48px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4}>Easy Communication</Title>
              <Paragraph>
                Stay connected with puppy families in one place, from first hellos to lifelong friendships and puppy updates.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <TrophyOutlined style={{ fontSize: '48px', color: '#FA8072', marginBottom: '16px' }} />
              <Title level={4}>Show Your Dedication</Title>
              <Paragraph>
                Share health testing, your approach to puppy care, and what makes your dog family special to attract like-minded people.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Card style={{ padding: '32px', background: '#F8F9FA', borderRadius: '12px' }}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: '24px', color: '#FA8072' }}>
            How HomeForPup Transforms Your Dog Family Experience
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Title level={5}>Before HomeForPup</Title>
                  <ul style={{ color: '#666', lineHeight: '1.8' }}>
                    <li>Scattered conversations across multiple platforms</li>
                    <li>Difficulty sharing your dog family story</li>
                    <li>Limited connection with puppy families after placement</li>
                    <li>Time-consuming individual updates to interested families</li>
                    <li>Challenges building trust with new families</li>
                  </ul>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Title level={5}>With HomeForPup</Title>
                  <ul style={{ color: '#08979C', lineHeight: '1.8' }}>
                    <li>Loving community hub for all your puppy families</li>
                    <li>Beautiful profile showcasing your dog family story</li>
                    <li>Ongoing friendships with puppy families</li>
                    <li>Easy updates and litter announcements</li>
                    <li>Community trust and heartwarming testimonials</li>
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
          Why Our Community Works
        </Title>
        
        <Row gutter={[32, 32]}>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Statistic
                title="Caring Dog Families"
                value={250}
                suffix="+"
                valueStyle={{ color: '#08979C', fontSize: '32px' }}
              />
              <Paragraph style={{ marginTop: '8px', fontSize: '14px' }}>
                Passionate about puppy happiness and health
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Statistic
                title="Paw-some Matches"
                value={1200}
                suffix="+"
                valueStyle={{ color: '#FA8072', fontSize: '32px' }}
              />
              <Paragraph style={{ marginTop: '8px', fontSize: '14px' }}>
                Perfect families matched with their ideal pups
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Statistic
                title="Love & Support"
                value={100}
                suffix="%"
                valueStyle={{ color: '#08979C', fontSize: '32px' }}
              />
              <Paragraph style={{ marginTop: '8px', fontSize: '14px' }}>
                All puppies surrounded by love and care
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Statistic
                title="Community Love"
                value={98}
                suffix="%"
                valueStyle={{ color: '#FA8072', fontSize: '32px' }}
              />
              <Paragraph style={{ marginTop: '8px', fontSize: '14px' }}>
                Families would recommend our community
              </Paragraph>
            </div>
          </Col>
        </Row>
      </section>

      {/* Trust & Safety */}
      <section style={{ ...sectionStyle, background: 'white' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
          Built on Love & Community Values
        </Title>
        
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <CheckCircleOutlined style={{ fontSize: '36px', color: '#52c41a', marginBottom: '16px' }} />
              <Title level={4}>Caring Community</Title>
              <Paragraph>
                Every dog family in our community is passionate about puppy welfare, with genuine care for health, happiness, and finding perfect matches.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <StarOutlined style={{ fontSize: '36px', color: '#faad14', marginBottom: '16px' }} />
              <Title level={4}>Real Stories & Friendships</Title>
              <Paragraph>
                Heartfelt feedback from puppy families creates lasting connections and helps build a supportive community for everyone involved.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={cardStyle}>
              <SafetyOutlined style={{ fontSize: '36px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4}>Ongoing Support</Title>
              <Paragraph>
                Our team and community provide continuous support to both dog families and puppy families throughout the entire journey and beyond.
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
            Ready to Join Our Loving Community?
          </Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '32px', color: 'rgba(255, 255, 255, 0.9)' }}>
            Whether you&apos;re looking for your perfect furry family member or you&apos;re a dog family passionate about puppy happiness, 
            HomeForPup is here to create meaningful connections and lifelong friendships.
          </Paragraph>
          <Row gutter={[16, 16]} justify="center">
            <Col xs={24} sm={12} md={10}>
              <Link href="/browse">
                <Button 
                  block
                  size="large" 
                  style={{ 
                    height: '48px', 
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  Meet Available Puppies
                </Button>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={10}>
              <Link href="/auth/register">
                <Button 
                  block
                  size="large" 
                  style={{ 
                    height: '48px', 
                    fontSize: '16px',
                    fontWeight: '500',
                    background: 'transparent',
                    borderColor: 'white',
                    color: 'white'
                  }}
                >
                  Join Our Community
                </Button>
              </Link>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;