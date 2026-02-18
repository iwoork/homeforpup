'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Steps, 
  Button, 
  Space, 
  Tabs,
  Alert,
  Divider
} from 'antd';
import { 
  SearchOutlined, 
  TeamOutlined, 
  SafetyOutlined, 
  HeartOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import PuppySearchWizard from '@/components/PuppySearchWizard';
import EthicalBreederGuide from '@/components/EthicalBreederGuide';
import PostAdoptionSupport from '@/components/PostAdoptionSupport';
import TrustBuildingFeatures from '@/components/TrustBuildingFeatures';

const { Title, Paragraph, Text } = Typography;
// TabPane is deprecated, using items prop instead

const PuppyJourneyPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSearchWizard, setShowSearchWizard] = useState(false);

  const journeySteps = [
    {
      key: 'search',
      title: 'Define Your Search',
      description: 'Find your perfect puppy match',
      icon: <SearchOutlined />,
      content: (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <SearchOutlined style={{ fontSize: '64px', color: '#08979C', marginBottom: '24px' }} />
          <Title level={3} style={{ color: '#08979C', marginBottom: '16px' }}>
            Start Your Puppy Search
          </Title>
          <Paragraph style={{ fontSize: '16px', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            Use our intelligent search wizard to define your preferences and find the perfect puppy match. 
            We'll help you consider all the important factors for a successful adoption.
          </Paragraph>
          <Space size="large">
            <Button 
              type="primary" 
              size="large"
              onClick={() => setShowSearchWizard(true)}
              icon={<SearchOutlined />}
            >
              Start Search Wizard
            </Button>
            <Link href="/browse">
              <Button size="large" icon={<ArrowRightOutlined />}>
                Browse All Puppies
              </Button>
            </Link>
          </Space>
        </div>
      )
    },
    {
      key: 'breeders',
      title: 'Find Ethical Breeders',
      description: 'Connect with responsible breeders',
      icon: <TeamOutlined />,
      content: (
        <div>
          <Title level={3} style={{ color: '#08979C', marginBottom: '24px', textAlign: 'center' }}>
            Learn About Ethical Breeding
          </Title>
          <EthicalBreederGuide />
        </div>
      )
    },
    {
      key: 'trust',
      title: 'Build Trust & Confidence',
      description: 'Verify breeders and read reviews',
      icon: <SafetyOutlined />,
      content: (
        <div>
          <Title level={3} style={{ color: '#08979C', marginBottom: '24px', textAlign: 'center' }}>
            Trust & Transparency Features
          </Title>
          <TrustBuildingFeatures />
        </div>
      )
    },
    {
      key: 'adoption',
      title: 'Complete Adoption',
      description: 'Finalize your puppy adoption',
      icon: <HeartOutlined />,
      content: (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <HeartOutlined style={{ fontSize: '64px', color: '#08979C', marginBottom: '24px' }} />
          <Title level={3} style={{ color: '#08979C', marginBottom: '16px' }}>
            Complete Your Adoption
          </Title>
          <Paragraph style={{ fontSize: '16px', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            Once you've found your perfect match, work with the breeder to complete the adoption process. 
            We'll guide you through contracts, health guarantees, and preparation for bringing your puppy home.
          </Paragraph>
          <Alert
            message="Adoption Process"
            description="Our adoption guide walks you through every step from initial contact to bringing your puppy home safely."
            type="info"
            showIcon
            style={{ marginBottom: '24px', textAlign: 'left' }}
          />
          <Space size="large">
            <Link href="/adoption-guide">
              <Button type="primary" size="large" icon={<BookOutlined />}>
                Read Adoption Guide
              </Button>
            </Link>
            <Link href="/kennels">
              <Button size="large" icon={<TeamOutlined />}>
                Browse Breeders
              </Button>
            </Link>
          </Space>
        </div>
      )
    },
    {
      key: 'support',
      title: 'Post-Adoption Support',
      description: 'Get ongoing help and resources',
      icon: <CheckCircleOutlined />,
      content: (
        <div>
          <Title level={3} style={{ color: '#08979C', marginBottom: '24px', textAlign: 'center' }}>
            Post-Adoption Support Center
          </Title>
          <PostAdoptionSupport />
        </div>
      )
    }
  ];

  const handleSearchWizardComplete = (criteria: any) => {
    setShowSearchWizard(false);
    // Navigate to browse page with criteria
    const params = new URLSearchParams();
    if (criteria.country) params.append('country', criteria.country);
    if (criteria.state?.length) params.append('state', criteria.state[0]);
    if (criteria.breeds?.length) params.append('breed', criteria.breeds[0]);
    if (criteria.gender) params.append('gender', criteria.gender);
    if (criteria.shipping) params.append('shipping', 'true');
    if (criteria.verifiedOnly) params.append('verified', 'true');
    
    window.location.href = `/browse?${params.toString()}`;
  };

  if (showSearchWizard) {
    return (
      <PuppySearchWizard
        onComplete={handleSearchWizardComplete}
        onCancel={() => setShowSearchWizard(false)}
      />
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <Title level={1} style={{ color: '#08979C', marginBottom: '16px' }}>
          Your Complete Puppy Journey
        </Title>
        <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
          From defining your search criteria to post-adoption support, we're here to guide you through every step 
          of finding and caring for your perfect puppy. Trust our expertise to help you make informed decisions.
        </Paragraph>
      </div>

      {/* Journey Overview */}
      <Card style={{ marginBottom: '32px', background: '#f6ffed', border: '1px solid #b7eb8f' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
              Your Journey Progress
            </Title>
            <Text style={{ color: '#666' }}>
              Step {currentStep + 1} of {journeySteps.length}: {journeySteps[currentStep].title}
            </Text>
          </Col>
          <Col>
            <Button 
              type="primary" 
              onClick={() => setShowSearchWizard(true)}
              icon={<SearchOutlined />}
            >
              Start Your Search
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Steps Navigation */}
      <Card style={{ marginBottom: '32px' }}>
        <Steps
          current={currentStep}
          onChange={setCurrentStep}
          items={journeySteps.map(step => ({
            title: step.title,
            description: step.description,
            icon: step.icon
          }))}
          style={{ marginBottom: '32px' }}
        />
      </Card>

      {/* Current Step Content */}
      <Card>
        {journeySteps[currentStep].content}
      </Card>

      {/* Quick Access Tabs */}
      <Card style={{ marginTop: '32px' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
          Quick Access to Resources
        </Title>
        <Tabs 
          defaultActiveKey="search" 
          centered
          items={[
            {
              key: 'search',
              label: (
                <span>
                  <SearchOutlined />
                  Search Tools
                </span>
              ),
              children: (
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={8}>
                    <Card 
                      hoverable
                      style={{ textAlign: 'center', height: '100%' }}
                      onClick={() => setShowSearchWizard(true)}
                    >
                      <SearchOutlined style={{ fontSize: '32px', color: '#08979C', marginBottom: '12px' }} />
                      <Title level={4}>Search Wizard</Title>
                      <Paragraph>Find your perfect puppy with our guided search</Paragraph>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Link href="/browse">
                      <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
                        <HeartOutlined style={{ fontSize: '32px', color: '#08979C', marginBottom: '12px' }} />
                        <Title level={4}>Browse Puppies</Title>
                        <Paragraph>View all available puppies</Paragraph>
                      </Card>
                    </Link>
                  </Col>
                  <Col xs={24} md={8}>
                    <Link href="/breeds">
                      <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
                        <BookOutlined style={{ fontSize: '32px', color: '#08979C', marginBottom: '12px' }} />
                        <Title level={4}>Breed Guide</Title>
                        <Paragraph>Learn about different dog breeds</Paragraph>
                      </Card>
                    </Link>
                  </Col>
                </Row>
              )
            },
            {
              key: 'breeders',
              label: (
                <span>
                  <TeamOutlined />
                  Breeder Resources
                </span>
              ),
              children: (
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={8}>
                    <Link href="/kennels">
                      <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
                        <TeamOutlined style={{ fontSize: '32px', color: '#08979C', marginBottom: '12px' }} />
                        <Title level={4}>Find Breeders</Title>
                        <Paragraph>Connect with verified ethical breeders</Paragraph>
                      </Card>
                    </Link>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card 
                      hoverable
                      style={{ textAlign: 'center', height: '100%' }}
                      onClick={() => setCurrentStep(1)}
                    >
                      <SafetyOutlined style={{ fontSize: '32px', color: '#08979C', marginBottom: '12px' }} />
                      <Title level={4}>Ethical Guide</Title>
                      <Paragraph>Learn how to identify ethical breeders</Paragraph>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card 
                      hoverable
                      style={{ textAlign: 'center', height: '100%' }}
                      onClick={() => setCurrentStep(2)}
                    >
                      <CheckCircleOutlined style={{ fontSize: '32px', color: '#08979C', marginBottom: '12px' }} />
                      <Title level={4}>Trust Features</Title>
                      <Paragraph>Reviews, verification, and transparency</Paragraph>
                    </Card>
                  </Col>
                </Row>
              )
            },
            {
              key: 'support',
              label: (
                <span>
                  <HeartOutlined />
                  Support
                </span>
              ),
              children: (
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={8}>
                    <Link href="/adoption-guide">
                      <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
                        <BookOutlined style={{ fontSize: '32px', color: '#08979C', marginBottom: '12px' }} />
                        <Title level={4}>Adoption Guide</Title>
                        <Paragraph>Step-by-step adoption process</Paragraph>
                      </Card>
                    </Link>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card 
                      hoverable
                      style={{ textAlign: 'center', height: '100%' }}
                      onClick={() => setCurrentStep(4)}
                    >
                      <HeartOutlined style={{ fontSize: '32px', color: '#08979C', marginBottom: '12px' }} />
                      <Title level={4}>Post-Adoption</Title>
                      <Paragraph>Support after bringing puppy home</Paragraph>
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Link href="/faq">
                      <Card hoverable style={{ textAlign: 'center', height: '100%' }}>
                        <BookOutlined style={{ fontSize: '32px', color: '#08979C', marginBottom: '12px' }} />
                        <Title level={4}>FAQ</Title>
                        <Paragraph>Frequently asked questions</Paragraph>
                      </Card>
                    </Link>
                  </Col>
                </Row>
              )
            }
          ]}
        />
      </Card>

      {/* Call to Action */}
      <Card style={{ marginTop: '32px', textAlign: 'center', background: '#f6ffed', border: '1px solid #b7eb8f' }}>
        <Title level={3} style={{ color: '#08979C', marginBottom: '16px' }}>
          Ready to Start Your Puppy Journey?
        </Title>
        <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
          Join thousands of families who have found their perfect puppy through our trusted platform.
        </Paragraph>
        <Space size="large">
          <Button 
            type="primary" 
            size="large"
            onClick={() => setShowSearchWizard(true)}
            icon={<SearchOutlined />}
          >
            Start Your Search
          </Button>
          <Link href="/browse">
            <Button size="large" icon={<HeartOutlined />}>
              Browse Puppies
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
};

export default PuppyJourneyPage;
