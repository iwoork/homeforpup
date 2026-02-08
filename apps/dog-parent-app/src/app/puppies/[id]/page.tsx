'use client';

import React from 'react';
import {
  Card, Row, Col, Typography, Tag, Space, Spin, Alert, Button,
} from 'antd';
import {
  LoadingOutlined, EnvironmentOutlined, CalendarOutlined,
  HeartOutlined, ManOutlined, WomanOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Dog, Kennel } from '@homeforpup/shared-types';

const { Title, Paragraph, Text } = Typography;

interface PuppyDetail extends Dog {
  kennel?: Kennel;
  ageWeeks?: number;
  location?: string | null;
}

const fetcher = async (url: string): Promise<PuppyDetail> => {
  const response = await fetch(url);
  if (response.status === 404) {
    throw new Error('NOT_FOUND');
  }
  if (!response.ok) {
    throw new Error('Failed to fetch puppy');
  }
  return response.json();
};

const formatAge = (ageWeeks?: number, birthDate?: string): string => {
  if (ageWeeks !== undefined && ageWeeks !== null) {
    if (ageWeeks < 1) return 'Less than a week old';
    if (ageWeeks < 52) return `${ageWeeks} week${ageWeeks !== 1 ? 's' : ''} old`;
    const years = Math.floor(ageWeeks / 52);
    const remainingWeeks = ageWeeks % 52;
    if (remainingWeeks === 0) return `${years} year${years !== 1 ? 's' : ''} old`;
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingWeeks} week${remainingWeeks !== 1 ? 's' : ''} old`;
  }
  if (birthDate) {
    const birth = new Date(birthDate);
    const now = new Date();
    const weeks = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 7));
    return `${weeks} week${weeks !== 1 ? 's' : ''} old`;
  }
  return 'Age unknown';
};

const cardStyle: React.CSSProperties = {
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  marginBottom: '16px',
};

const PuppyDetailPage: React.FC = () => {
  const params = useParams();
  const puppyId = params?.id as string;

  const { data: puppy, error, isLoading } = useSWR<PuppyDetail>(
    puppyId ? `/api/puppies/${puppyId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px',
        textAlign: 'center',
        paddingTop: '100px',
      }}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          tip="Loading puppy details..."
        />
      </div>
    );
  }

  // 404 / Error state
  if (error?.message === 'NOT_FOUND' || (!isLoading && !puppy)) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <Alert
          message="Puppy Not Found"
          description="The puppy you're looking for doesn't exist or is no longer available."
          type="error"
          showIcon
          style={{ marginTop: '50px' }}
          action={
            <Link href="/available-puppies">
              <Button type="primary">Browse Available Puppies</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <Alert
          message="Error Loading Puppy"
          description="Something went wrong while loading puppy details. Please try again later."
          type="error"
          showIcon
          style={{ marginTop: '50px' }}
          action={
            <Link href="/available-puppies">
              <Button type="primary">Browse Available Puppies</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (!puppy) return null;

  // Extract photo URL
  const photoGallery = puppy.photoGallery;
  const profilePhoto = photoGallery?.find((photo) => photo.isProfilePhoto)?.url;
  const firstPhoto = photoGallery?.[0]?.url;
  const heroImage = puppy.photoUrl || profilePhoto || firstPhoto || null;

  const GenderIcon = puppy.gender === 'male' ? ManOutlined : WomanOutlined;
  const genderColor = puppy.gender === 'male' ? '#1890ff' : '#eb2f96';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      {/* Hero Section */}
      <Card style={{ ...cardStyle, marginBottom: '24px', overflow: 'hidden' }}>
        <Row gutter={[24, 24]}>
          {/* Primary Photo */}
          <Col xs={24} md={12}>
            <div style={{
              position: 'relative',
              width: '100%',
              height: '400px',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#f5f5f5',
            }}>
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={puppy.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#bfbfbf',
                  fontSize: '64px',
                }}>
                  <HeartOutlined />
                </div>
              )}
            </div>
          </Col>

          {/* Puppy Info */}
          <Col xs={24} md={12}>
            <div style={{ padding: '8px 0' }}>
              <Title level={2} style={{ margin: '0 0 8px 0', color: '#08979C' }}>
                {puppy.name}
              </Title>

              <Space size="middle" wrap style={{ marginBottom: '16px' }}>
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {puppy.breed}
                </Tag>
                <Tag
                  icon={<GenderIcon />}
                  color={genderColor}
                  style={{ fontSize: '14px', padding: '4px 12px' }}
                >
                  {puppy.gender === 'male' ? 'Male' : 'Female'}
                </Tag>
              </Space>

              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Space>
                    <CalendarOutlined style={{ color: '#08979C', fontSize: '16px' }} />
                    <Text style={{ fontSize: '16px' }}>
                      {formatAge(puppy.ageWeeks, puppy.birthDate)}
                    </Text>
                  </Space>
                </div>

                {puppy.location && (
                  <div>
                    <Space>
                      <EnvironmentOutlined style={{ color: '#08979C', fontSize: '16px' }} />
                      <Text style={{ fontSize: '16px' }}>{puppy.location}</Text>
                    </Space>
                  </div>
                )}

                {puppy.color && (
                  <div>
                    <Text strong>Color: </Text>
                    <Text>{puppy.color}</Text>
                  </div>
                )}

                {puppy.weight > 0 && (
                  <div>
                    <Text strong>Weight: </Text>
                    <Text>{puppy.weight} lbs</Text>
                  </div>
                )}

                <div style={{ marginTop: '8px' }}>
                  <Space wrap>
                    {puppy.breedingStatus === 'available' && (
                      <Tag color="green">Available</Tag>
                    )}
                    {puppy.healthStatus && (
                      <Tag color={
                        puppy.healthStatus === 'excellent' ? 'green' :
                        puppy.healthStatus === 'good' ? 'blue' :
                        puppy.healthStatus === 'fair' ? 'orange' : 'red'
                      }>
                        Health: {puppy.healthStatus.charAt(0).toUpperCase() + puppy.healthStatus.slice(1)}
                      </Tag>
                    )}
                  </Space>
                </div>
              </Space>

              {puppy.description && (
                <Paragraph style={{ marginTop: '16px', fontSize: '14px', color: '#595959' }}>
                  {puppy.description}
                </Paragraph>
              )}
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default PuppyDetailPage;
