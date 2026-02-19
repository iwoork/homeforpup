'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { SearchOutlined, HeartOutlined, BookOutlined } from '@ant-design/icons';
import Link from 'next/link';
import PuppySearchWizard from '@/components/PuppySearchWizard';

const { Title, Paragraph } = Typography;

const PuppyJourneyPage: React.FC = () => {
  const [showSearchWizard, setShowSearchWizard] = useState(false);

  const handleSearchWizardComplete = (criteria: any) => {
    setShowSearchWizard(false);
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
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <Title level={1} style={{ color: '#08979C', marginBottom: '16px' }}>
          Find Your Perfect Puppy
        </Title>
        <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
          Browse available puppies, take our matching quiz, or read our adoption guide to get started.
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Link href="/browse" style={{ textDecoration: 'none' }}>
            <Card
              hoverable
              style={{ textAlign: 'center', height: '100%', border: '2px solid #08979C' }}
            >
              <SearchOutlined style={{ fontSize: '48px', color: '#08979C', marginBottom: '16px', display: 'block' }} />
              <Title level={3}>Browse Puppies</Title>
              <Paragraph>View all available puppies with filters for breed, location, and more.</Paragraph>
            </Card>
          </Link>
        </Col>
        <Col xs={24} md={8}>
          <Card
            hoverable
            style={{ textAlign: 'center', height: '100%' }}
            onClick={() => setShowSearchWizard(true)}
          >
            <HeartOutlined style={{ fontSize: '48px', color: '#FA8072', marginBottom: '16px', display: 'block' }} />
            <Title level={3}>Take Matching Quiz</Title>
            <Paragraph>Answer a few questions and we'll recommend breeds that fit your lifestyle.</Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Link href="/adoption-guide" style={{ textDecoration: 'none' }}>
            <Card
              hoverable
              style={{ textAlign: 'center', height: '100%' }}
            >
              <BookOutlined style={{ fontSize: '48px', color: '#08979C', marginBottom: '16px', display: 'block' }} />
              <Title level={3}>Adoption Guide</Title>
              <Paragraph>Learn everything you need to know about bringing a puppy home.</Paragraph>
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
};

export default PuppyJourneyPage;
