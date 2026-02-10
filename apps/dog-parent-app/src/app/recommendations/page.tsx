'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Progress, Tag, Space, Spin, Button, Empty, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  ThunderboltOutlined,
  ColumnHeightOutlined,
  SmileOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Title, Text, Paragraph } = Typography;

interface BreedRecommendation {
  id: string;
  name: string;
  size: string;
  category: string;
  image: string;
  characteristics: {
    energyLevel: number;
    trainability: number;
    groomingNeeds: number;
    [key: string]: number;
  };
  score: number;
  breakdown: {
    energyMatch: number;
    sizeMatch: number;
    kidFriendliness: number;
    trainability: number;
    spaceRequirements: number;
    groomingNeeds: number;
    socialCompatibility: number;
  };
  matchReasons: string[];
}

interface PuppyRecommendation {
  id: string;
  name: string;
  breed: string;
  gender: string;
  ageWeeks: number;
  price: number;
  location: string;
  breederName: string;
  breederVerified: boolean;
  image: string;
  matchScore: number;
  matchReasons: string[];
}

interface MatchResults {
  breeds: BreedRecommendation[];
  puppies: PuppyRecommendation[];
  totalBreedsScored: number;
}

const RecommendationsPage: React.FC = () => {
  const router = useRouter();
  const [results, setResults] = useState<MatchResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try session storage first
    const stored = sessionStorage.getItem('matchResults');
    if (stored) {
      setResults(JSON.parse(stored));
      setLoading(false);
      return;
    }

    // Try re-fetching from saved preferences
    const fetchFromPreferences = async () => {
      try {
        const prefsRes = await fetch('/api/matching/preferences');
        if (!prefsRes.ok) {
          setLoading(false);
          return;
        }
        const { matchPreferences } = await prefsRes.json();
        if (!matchPreferences) {
          setLoading(false);
          return;
        }

        const res = await fetch('/api/matching/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(matchPreferences),
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setResults(data);
      } catch {
        // No results available
      } finally {
        setLoading(false);
      }
    };

    fetchFromPreferences();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#1890ff';
    if (score >= 40) return '#faad14';
    return '#ff4d4f';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '24px' }}>
          <Title level={3} style={{ color: '#08979C' }}>Loading Your Recommendations...</Title>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
        <Empty
          description={
            <div>
              <Title level={3}>No Recommendations Yet</Title>
              <Paragraph style={{ fontSize: '16px', color: '#666' }}>
                Take our puppy matching questionnaire to get personalized breed and puppy recommendations!
              </Paragraph>
            </div>
          }
        >
          <Link href="/browse">
            <Button type="primary" size="large" style={{ background: '#08979C', borderColor: '#08979C' }}>
              Take the Questionnaire
            </Button>
          </Link>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/browse')}
          style={{ marginBottom: '16px' }}
        >
          Back to Browse
        </Button>
        <Title level={1} style={{ color: '#08979C', marginBottom: '8px' }}>
          Your Top Breed Matches
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Based on your lifestyle preferences, we scored {results.totalBreedsScored} breeds to find your best matches
        </Text>
      </div>

      {/* Breed Recommendations */}
      <Row gutter={[16, 16]} style={{ marginBottom: '48px' }}>
        {results.breeds.map((breed, index) => (
          <Col xs={24} sm={12} lg={8} key={breed.id}>
            <Card
              hoverable
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                height: '100%',
                border: index === 0 ? '2px solid #08979C' : '1px solid #f0f0f0',
              }}
              cover={
                <div style={{ position: 'relative', height: '180px' }}>
                  <Image
                    src={breed.image}
                    alt={breed.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {index === 0 && (
                    <Tag color="#08979C" style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '14px' }}>
                      #1 Best Match
                    </Tag>
                  )}
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <Progress
                      type="circle"
                      percent={breed.score}
                      size={56}
                      strokeColor={getScoreColor(breed.score)}
                      format={(percent) => <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{percent}</span>}
                    />
                  </div>
                </div>
              }
            >
              <Title level={4} style={{ marginBottom: '4px', color: '#08979C' }}>
                {breed.name}
              </Title>
              <Space style={{ marginBottom: '12px' }}>
                <Tag>{breed.size}</Tag>
                <Tag>{breed.category}</Tag>
              </Space>

              {/* Top 3 match reasons */}
              <div style={{ marginBottom: '12px' }}>
                {breed.matchReasons.slice(0, 3).map((reason, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginTop: '4px', flexShrink: 0 }} />
                    <Text style={{ fontSize: '13px' }}>{reason}</Text>
                  </div>
                ))}
              </div>

              {/* Key characteristics */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Tooltip title="Energy Level">
                  <Tag icon={<ThunderboltOutlined />} color={breed.characteristics.energyLevel >= 7 ? 'orange' : 'blue'}>
                    Energy: {breed.characteristics.energyLevel}/10
                  </Tag>
                </Tooltip>
                <Tooltip title="Size">
                  <Tag icon={<ColumnHeightOutlined />}>
                    {breed.size}
                  </Tag>
                </Tooltip>
                <Tooltip title="Trainability">
                  <Tag icon={<SmileOutlined />} color={breed.characteristics.trainability >= 7 ? 'green' : 'default'}>
                    Train: {breed.characteristics.trainability}/10
                  </Tag>
                </Tooltip>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Available Puppies Section */}
      {results.puppies.length > 0 && (
        <>
          <Title level={2} style={{ color: '#08979C', marginBottom: '24px' }}>
            Available Puppies For You
          </Title>
          <Row gutter={[16, 16]}>
            {results.puppies.map((puppy) => (
              <Col xs={24} sm={12} lg={6} key={puppy.id}>
                <Link href={`/puppies/${puppy.id}`} style={{ textDecoration: 'none' }}>
                  <Card
                    hoverable
                    style={{ borderRadius: '12px', overflow: 'hidden', height: '100%' }}
                    cover={
                      <div style={{ position: 'relative', height: '160px' }}>
                        <Image
                          src={puppy.image}
                          alt={puppy.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                        <Tag
                          color={getScoreColor(puppy.matchScore)}
                          style={{ position: 'absolute', top: '8px', right: '8px', fontWeight: 'bold' }}
                        >
                          {puppy.matchScore}% Match
                        </Tag>
                        {puppy.breederVerified && (
                          <Tag color="green" icon={<CheckCircleOutlined />} style={{ position: 'absolute', top: '8px', left: '8px' }}>
                            Verified
                          </Tag>
                        )}
                      </div>
                    }
                  >
                    <Title level={5} style={{ marginBottom: '4px', color: '#08979C' }}>
                      {puppy.name}
                    </Title>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      {puppy.breed} &bull; {puppy.gender} &bull; {puppy.ageWeeks} weeks
                    </Text>
                    <div style={{ marginTop: '8px' }}>
                      <Text style={{ fontSize: '12px', color: '#666' }}>
                        {puppy.location}
                      </Text>
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <Text strong style={{ color: '#08979C' }}>
                        ${puppy.price.toLocaleString()}
                      </Text>
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
};

export default RecommendationsPage;
