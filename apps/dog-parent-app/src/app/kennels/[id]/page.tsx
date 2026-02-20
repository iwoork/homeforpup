'use client';

import React from 'react';
import {
  Card, Row, Col, Typography, Tag, Spin, Alert, Statistic, Collapse, Descriptions, Space, Button, Image, Empty,
} from 'antd';
import {
  EnvironmentOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
  HeartOutlined,
  ShopOutlined,
  ManOutlined,
  WomanOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

const { Title, Text, Paragraph } = Typography;

interface KennelDetailResponse {
  kennel: any;
  dogs: any[];
  litters: any[];
  stats: {
    totalDogs: number;
    totalLitters: number;
    totalPuppies: number;
    activeBreedingDogs: number;
  };
}

const fetcher = async (url: string): Promise<KennelDetailResponse> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch kennel');
  return response.json();
};

const puppyStatusColor: Record<string, string> = {
  available: 'green',
  reserved: 'orange',
  adopted: 'purple',
  sold: 'purple',
  kept: 'blue',
};

const KennelDetailPage: React.FC = () => {
  const params = useParams();
  const kennelId = params?.id as string;

  const { data, error, isLoading } = useSWR<KennelDetailResponse>(
    kennelId ? `/api/kennels/${kennelId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
        <Alert
          message="Kennel Not Found"
          description="The kennel you are looking for could not be found or is no longer active."
          type="error"
          showIcon
          action={
            <Link href="/kennels">
              <Button>Back to Kennels</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const { kennel, dogs, litters, stats } = data;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Back link */}
      <Link href="/kennels" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '24px', color: '#08979C' }}>
        <ArrowLeftOutlined style={{ marginRight: '8px' }} />
        Back to Kennels
      </Link>

      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {kennel.name}
            </Title>
            {kennel.businessName && (
              <Text type="secondary" style={{ fontSize: '16px' }}>
                {kennel.businessName}
              </Text>
            )}
          </div>
          {kennel.verified && (
            <Tag color="green" icon={<CheckCircleOutlined />} style={{ fontSize: '14px', padding: '4px 12px' }}>
              Verified Kennel
            </Tag>
          )}
        </div>
        {(kennel.address?.city || kennel.address?.state) && (
          <div style={{ marginTop: '8px' }}>
            <EnvironmentOutlined style={{ color: '#08979C', marginRight: '6px' }} />
            <Text>
              {[kennel.address?.city, kennel.address?.state, kennel.address?.country].filter(Boolean).join(', ')}
            </Text>
          </div>
        )}
      </Card>

      {/* Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Total Dogs" value={stats.totalDogs} prefix={<TeamOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Total Litters" value={stats.totalLitters} prefix={<ShopOutlined style={{ color: '#722ed1' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Total Puppies" value={stats.totalPuppies} prefix={<HeartOutlined style={{ color: '#fa8c16' }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="Active Breeding" value={stats.activeBreedingDogs} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
      </Row>

      {/* Two-column layout */}
      <Row gutter={[24, 24]}>
        {/* Left column — Info */}
        <Col xs={24} lg={8}>
          {/* Description */}
          {kennel.description && (
            <Card title="About" style={{ marginBottom: '16px' }}>
              <Paragraph>{kennel.description}</Paragraph>
            </Card>
          )}

          {/* Facilities */}
          {kennel.facilities && Object.keys(kennel.facilities).length > 0 && (
            <Card title="Facilities" style={{ marginBottom: '16px' }}>
              {Object.entries(kennel.facilities).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '4px' }}>
                  {value ? (
                    <Tag color="green"><CheckCircleOutlined /> {key}</Tag>
                  ) : (
                    <Tag>{key}</Tag>
                  )}
                </div>
              ))}
            </Card>
          )}

          {/* Specialties */}
          {kennel.specialties && kennel.specialties.length > 0 && (
            <Card title="Specialties" style={{ marginBottom: '16px' }}>
              {kennel.specialties.map((s: string) => (
                <Tag key={s} color="purple" style={{ marginBottom: '6px' }}>{s}</Tag>
              ))}
            </Card>
          )}

          {/* Contact Info */}
          {(kennel.phone || kennel.email || kennel.website) && (
            <Card title="Contact" style={{ marginBottom: '16px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {kennel.phone && (
                  <div>
                    <PhoneOutlined style={{ marginRight: '8px', color: '#08979C' }} />
                    <a href={`tel:${kennel.phone}`}>{kennel.phone}</a>
                  </div>
                )}
                {kennel.email && (
                  <div>
                    <MailOutlined style={{ marginRight: '8px', color: '#08979C' }} />
                    <a href={`mailto:${kennel.email}`}>{kennel.email}</a>
                  </div>
                )}
                {kennel.website && (
                  <div>
                    <GlobalOutlined style={{ marginRight: '8px', color: '#08979C' }} />
                    <a href={kennel.website.startsWith('http') ? kennel.website : `https://${kennel.website}`} target="_blank" rel="noopener noreferrer">
                      {kennel.website}
                    </a>
                  </div>
                )}
              </Space>
            </Card>
          )}

          {/* Social Media */}
          {kennel.socialMedia && Object.keys(kennel.socialMedia).length > 0 && (
            <Card title="Social Media" style={{ marginBottom: '16px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {Object.entries(kennel.socialMedia).map(([platform, url]) => (
                  <div key={platform}>
                    <LinkOutlined style={{ marginRight: '8px', color: '#08979C' }} />
                    <a href={String(url)} target="_blank" rel="noopener noreferrer" style={{ textTransform: 'capitalize' }}>
                      {platform}
                    </a>
                  </div>
                ))}
              </Space>
            </Card>
          )}
        </Col>

        {/* Right column — Dogs & Litters */}
        <Col xs={24} lg={16}>
          {/* Parent Dogs */}
          <Card title={`Parent Dogs (${dogs.length})`} style={{ marginBottom: '24px' }}>
            {dogs.length === 0 ? (
              <Empty description="No parent dogs listed" />
            ) : (
              <Row gutter={[16, 16]}>
                {dogs.map((dog) => (
                  <Col xs={24} sm={12} key={dog.id}>
                    <Link href={`/puppies/${dog.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <Card size="small" hoverable style={{ borderRadius: '8px' }}>
                      {dog.photos && dog.photos.length > 0 && (
                        <Image
                          src={dog.photos[0]?.url || dog.photos[0]}
                          alt={dog.name}
                          style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }}
                          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjEwMCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNjY2MiIGZvbnQtc2l6ZT0iMTQiPk5vIFBob3RvPC90ZXh0Pjwvc3ZnPg=="
                          preview={false}
                        />
                      )}
                      <Title level={5} style={{ margin: '0 0 4px 0' }}>{dog.name}</Title>
                      <div style={{ marginBottom: '4px' }}>
                        <Text type="secondary">{dog.breed}</Text>
                      </div>
                      <Space wrap>
                        {dog.gender && (
                          <Tag
                            icon={dog.gender === 'male' ? <ManOutlined /> : <WomanOutlined />}
                            color={dog.gender === 'male' ? 'blue' : 'pink'}
                          >
                            {dog.gender}
                          </Tag>
                        )}
                        {dog.color && <Tag>{dog.color}</Tag>}
                      </Space>
                    </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            )}
          </Card>

          {/* Litters */}
          <Card title={`Litters (${litters.length})`}>
            {litters.length === 0 ? (
              <Empty description="No litters listed" />
            ) : (
              <Collapse
                items={litters.map((litter) => ({
                  key: litter.id,
                  label: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Text strong>{litter.name || `Litter ${litter.id?.slice(0, 8)}`}</Text>
                      {litter.status && (
                        <Tag color={litter.status === 'active' ? 'green' : litter.status === 'planned' ? 'blue' : 'default'}>
                          {litter.status}
                        </Tag>
                      )}
                    </div>
                  ),
                  children: (
                    <div>
                      {/* Sire & Dam */}
                      <Descriptions size="small" column={2} style={{ marginBottom: '16px' }}>
                        {litter.sire && (
                          <Descriptions.Item label="Sire">
                            {typeof litter.sire === 'string' ? litter.sire : litter.sire.name || litter.sireName || 'Unknown'}
                          </Descriptions.Item>
                        )}
                        {(litter.dam || litter.damName) && (
                          <Descriptions.Item label="Dam">
                            {typeof litter.dam === 'string' ? litter.dam : litter.dam?.name || litter.damName || 'Unknown'}
                          </Descriptions.Item>
                        )}
                        {litter.breed && (
                          <Descriptions.Item label="Breed">{litter.breed}</Descriptions.Item>
                        )}
                        {litter.dateOfBirth && (
                          <Descriptions.Item label="Born">{new Date(litter.dateOfBirth).toLocaleDateString()}</Descriptions.Item>
                        )}
                      </Descriptions>

                      {/* Puppies */}
                      {litter.puppies && litter.puppies.length > 0 && (
                        <div>
                          <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                            Puppies ({litter.puppies.length})
                          </Text>
                          <Row gutter={[8, 8]}>
                            {litter.puppies.map((puppy: any, idx: number) => (
                              <Col xs={24} sm={12} key={puppy.id || idx}>
                                <Link href={`/puppies/${puppy.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                                <Card size="small" hoverable style={{ borderRadius: '6px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                      <Text strong>{puppy.name || `Puppy ${idx + 1}`}</Text>
                                      {puppy.gender && (
                                        <Tag
                                          icon={puppy.gender === 'male' ? <ManOutlined /> : <WomanOutlined />}
                                          color={puppy.gender === 'male' ? 'blue' : 'pink'}
                                          style={{ marginLeft: '8px' }}
                                        >
                                          {puppy.gender}
                                        </Tag>
                                      )}
                                    </div>
                                    <Tag color={puppyStatusColor[puppy.status?.toLowerCase()] || 'default'}>
                                      {puppy.status || 'Unknown'}
                                    </Tag>
                                  </div>
                                  {puppy.color && (
                                    <Text type="secondary" style={{ fontSize: '12px' }}>{puppy.color}</Text>
                                  )}
                                </Card>
                                </Link>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      )}
                    </div>
                  ),
                }))}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default KennelDetailPage;
