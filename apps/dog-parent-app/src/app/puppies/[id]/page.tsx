'use client';

import React, { useState } from 'react';
import {
  Card, Row, Col, Typography, Tag, Space, Spin, Alert, Button, Divider, Empty,
  Tooltip, message,
} from 'antd';
import {
  LoadingOutlined, EnvironmentOutlined, CalendarOutlined,
  HeartOutlined, HeartFilled, ManOutlined, WomanOutlined, MedicineBoxOutlined,
  SafetyCertificateOutlined, SmileOutlined, TeamOutlined,
  CheckCircleOutlined, PhoneOutlined, MailOutlined, GlobalOutlined,
  MessageOutlined, ShareAltOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Dog, Kennel } from '@homeforpup/shared-types';
import ContactBreederModal from '@/components/ContactBreederModal';
import { useAuth, useFavorites, useFavoriteStatus } from '@/hooks';

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

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 16px 0',
  color: '#08979C',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

interface SimilarPuppyFromApi {
  id: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  ageWeeks: number;
  price: number;
  location: string;
  image: string;
}

const similarFetcher = async (url: string): Promise<{ puppies: SimilarPuppyFromApi[] }> => {
  const response = await fetch(url);
  if (!response.ok) return { puppies: [] };
  return response.json();
};

const SimilarPuppies: React.FC<{ breed: string; currentPuppyId: string }> = ({ breed, currentPuppyId }) => {
  const { data, isLoading } = useSWR(
    breed ? `/api/puppies?breed=${encodeURIComponent(breed)}&limit=5` : null,
    similarFetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const similarPuppies = (data?.puppies || [])
    .filter((p) => p.id !== currentPuppyId)
    .slice(0, 4);

  if (isLoading || similarPuppies.length === 0) return null;

  return (
    <div style={{ marginTop: '24px' }}>
      <Title level={4} style={{ ...sectionTitleStyle, marginBottom: '16px' }}>
        <TeamOutlined /> Similar Puppies
      </Title>
      <Row gutter={[16, 16]}>
        {similarPuppies.map((p) => (
          <Col key={p.id} xs={12} sm={12} md={6}>
            <Link href={`/puppies/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <Card
                hoverable
                style={{ ...cardStyle, marginBottom: 0 }}
                cover={
                  <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                }
              >
                <Card.Meta
                  title={<Text strong style={{ fontSize: '14px' }}>{p.name}</Text>}
                  description={
                    <Space direction="vertical" size={2} style={{ width: '100%' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>{p.breed}</Text>
                      <Space size="small">
                        <Tag color={p.gender === 'male' ? 'blue' : 'pink'} style={{ fontSize: '11px', margin: 0 }}>
                          {p.gender === 'male' ? 'Male' : 'Female'}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {p.ageWeeks}w
                        </Text>
                      </Space>
                      {p.location && (
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          <EnvironmentOutlined /> {p.location}
                        </Text>
                      )}
                    </Space>
                  }
                />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

const PuppyDetailPage: React.FC = () => {
  const params = useParams();
  const puppyId = params?.id as string;
  const { user, isAuthenticated } = useAuth();
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Favorites
  const { toggleFavorite } = useFavorites();
  const { isFavorited, isLoading: favoriteLoading } = useFavoriteStatus(puppyId);
  const [optimisticFavorited, setOptimisticFavorited] = useState<boolean | null>(null);
  const isFav = optimisticFavorited !== null ? optimisticFavorited : isFavorited;

  const handleToggleFavorite = async () => {
    if (!puppyId) return;
    const prev = isFav;
    setOptimisticFavorited(!prev);
    try {
      await toggleFavorite(puppyId);
      setOptimisticFavorited(null); // Let server state take over
    } catch {
      setOptimisticFavorited(prev); // Revert on error
    }
  };

  // Share / copy URL
  const [shareTooltipVisible, setShareTooltipVisible] = useState(false);
  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareTooltipVisible(true);
      setTimeout(() => setShareTooltipVisible(false), 2000);
    } catch {
      message.info('Copy this URL to share: ' + url);
    }
  };

  const { data: puppy, error, isLoading } = useSWR<PuppyDetail>(
    puppyId ? `/api/puppies/${puppyId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Fetch sire data if sireId exists
  const { data: sire } = useSWR<PuppyDetail>(
    puppy?.sireId ? `/api/puppies/${puppy.sireId}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  // Fetch dam data if damId exists
  const { data: dam } = useSWR<PuppyDetail>(
    puppy?.damId ? `/api/puppies/${puppy.damId}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
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

  // Build ordered photo list: profile photo first, then remaining gallery photos
  const allPhotos: { url: string; caption?: string }[] = [];
  const photoGallery = puppy.photoGallery;
  const profilePhotoEntry = photoGallery?.find((photo) => photo.isProfilePhoto);

  if (puppy.photoUrl) {
    allPhotos.push({ url: puppy.photoUrl });
  } else if (profilePhotoEntry) {
    allPhotos.push({ url: profilePhotoEntry.url, caption: profilePhotoEntry.caption });
  }

  if (photoGallery) {
    for (const photo of photoGallery) {
      if (photo.url && !allPhotos.some((p) => p.url === photo.url)) {
        allPhotos.push({ url: photo.url, caption: photo.caption });
      }
    }
  }

  const heroImage = allPhotos.length > 0 ? allPhotos[selectedPhotoIndex]?.url : null;

  const GenderIcon = puppy.gender === 'male' ? ManOutlined : WomanOutlined;
  const genderColor = puppy.gender === 'male' ? '#1890ff' : '#eb2f96';
  const kennel = puppy.kennel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isVerified = !!(kennel as any)?.verified;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      {/* Hero Section */}
      <Card style={{ ...cardStyle, marginBottom: '24px', overflow: 'hidden' }}>
        <Row gutter={[24, 24]}>
          {/* Photo Gallery */}
          <Col xs={24} md={12}>
            {/* Main Photo */}
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
                  alt={allPhotos[selectedPhotoIndex]?.caption || puppy.name}
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
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#bfbfbf',
                  fontSize: '64px',
                }}>
                  <HeartOutlined />
                  <Text style={{ fontSize: '14px', color: '#bfbfbf', marginTop: '8px' }}>
                    No photos available
                  </Text>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {allPhotos.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '8px',
                overflowX: 'auto',
                paddingBottom: '4px',
              }}>
                {allPhotos.map((photo, index) => (
                  <div
                    key={photo.url}
                    onClick={() => setSelectedPhotoIndex(index)}
                    style={{
                      position: 'relative',
                      width: '72px',
                      height: '72px',
                      minWidth: '72px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: index === selectedPhotoIndex
                        ? '2px solid #08979C'
                        : '2px solid transparent',
                      opacity: index === selectedPhotoIndex ? 1 : 0.7,
                      transition: 'opacity 0.2s, border-color 0.2s',
                    }}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.caption || `${puppy.name} photo ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="72px"
                    />
                  </div>
                ))}
              </div>
            )}
          </Col>

          {/* Puppy Info */}
          <Col xs={24} md={12}>
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Title level={2} style={{ margin: 0, color: '#08979C' }}>
                  {puppy.name}
                </Title>
                <Space>
                  <Button
                    type="text"
                    shape="circle"
                    size="large"
                    icon={isFav
                      ? <HeartFilled style={{ color: '#ff4d4f', fontSize: '22px' }} />
                      : <HeartOutlined style={{ fontSize: '22px' }} />
                    }
                    onClick={handleToggleFavorite}
                    disabled={favoriteLoading}
                    aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  />
                  <Tooltip title="Copied!" open={shareTooltipVisible}>
                    <Button
                      type="text"
                      shape="circle"
                      size="large"
                      icon={<ShareAltOutlined style={{ fontSize: '22px' }} />}
                      onClick={handleShare}
                      aria-label="Share this puppy"
                    />
                  </Tooltip>
                </Space>
              </div>

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

      {/* Content Sections + Sidebar */}
      <Row gutter={[24, 24]}>
        {/* Main Content */}
        <Col xs={24} md={16}>
          {/* About Section */}
          <Card style={cardStyle}>
            <Title level={4} style={sectionTitleStyle}>
              <SmileOutlined /> About {puppy.name}
            </Title>
            {puppy.description && (
              <Paragraph style={{ fontSize: '14px', color: '#595959' }}>
                {puppy.description}
              </Paragraph>
            )}
            <Row gutter={[16, 12]}>
              {puppy.color && (
                <Col xs={12} sm={6}>
                  <Text type="secondary">Color</Text>
                  <div><Text strong>{puppy.color}</Text></div>
                </Col>
              )}
              {puppy.weight > 0 && (
                <Col xs={12} sm={6}>
                  <Text type="secondary">Weight</Text>
                  <div><Text strong>{puppy.weight} lbs</Text></div>
                </Col>
              )}
              {puppy.birthDate && (
                <Col xs={12} sm={6}>
                  <Text type="secondary">Birth Date</Text>
                  <div><Text strong>{new Date(puppy.birthDate).toLocaleDateString()}</Text></div>
                </Col>
              )}
              {puppy.height && (
                <Col xs={12} sm={6}>
                  <Text type="secondary">Height</Text>
                  <div><Text strong>{puppy.height} inches</Text></div>
                </Col>
              )}
              {puppy.eyeColor && (
                <Col xs={12} sm={6}>
                  <Text type="secondary">Eye Color</Text>
                  <div><Text strong>{puppy.eyeColor}</Text></div>
                </Col>
              )}
              {puppy.markings && (
                <Col xs={12} sm={6}>
                  <Text type="secondary">Markings</Text>
                  <div><Text strong>{puppy.markings}</Text></div>
                </Col>
              )}
            </Row>
          </Card>

          {/* Health & Vaccinations Section */}
          <Card style={cardStyle}>
            <Title level={4} style={sectionTitleStyle}>
              <MedicineBoxOutlined /> Health & Vaccinations
            </Title>
            {puppy.healthStatus && (
              <div style={{ marginBottom: '16px' }}>
                <Text type="secondary">Health Status: </Text>
                <Tag color={
                  puppy.healthStatus === 'excellent' ? 'green' :
                  puppy.healthStatus === 'good' ? 'blue' :
                  puppy.healthStatus === 'fair' ? 'orange' : 'red'
                }>
                  {puppy.healthStatus.charAt(0).toUpperCase() + puppy.healthStatus.slice(1)}
                </Tag>
              </div>
            )}
            {puppy.specialNeeds && (
              <div style={{ marginBottom: '16px' }}>
                <Text type="secondary">Special Needs: </Text>
                <Text>{puppy.specialNeeds}</Text>
              </div>
            )}
            {puppy.healthTests && puppy.healthTests.length > 0 ? (
              <>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Health Tests</Text>
                <Space wrap>
                  {puppy.healthTests.map((test, index) => (
                    <Tag
                      key={index}
                      icon={<SafetyCertificateOutlined />}
                      color="green"
                    >
                      {test.includes('http') ? `Health Test ${index + 1}` : test}
                    </Tag>
                  ))}
                </Space>
              </>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No health test records available"
              />
            )}
          </Card>

          {/* Temperament Section */}
          {puppy.temperament && (
            <Card style={cardStyle}>
              <Title level={4} style={sectionTitleStyle}>
                <SmileOutlined /> Temperament
              </Title>
              <Space wrap size="middle">
                {puppy.temperament.split(',').map((trait, index) => (
                  <Tag
                    key={index}
                    color="cyan"
                    style={{ fontSize: '14px', padding: '4px 12px' }}
                  >
                    {trait.trim()}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {/* Parents Section */}
          {(puppy.sireId || puppy.damId) && (
            <Card style={cardStyle}>
              <Title level={4} style={sectionTitleStyle}>
                <TeamOutlined /> Parents
              </Title>
              <Row gutter={[16, 16]}>
                {puppy.sireId && (
                  <Col xs={24} sm={12}>
                    <Card
                      size="small"
                      style={{ borderRadius: '8px', background: '#f0f9ff' }}
                    >
                      <Space>
                        <ManOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>Sire (Father)</Text>
                          <div>
                            <Link href={`/puppies/${puppy.sireId}`}>
                              <Text strong style={{ color: '#08979C' }}>
                                {sire?.name || 'View Sire'}
                              </Text>
                            </Link>
                          </div>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                )}
                {puppy.damId && (
                  <Col xs={24} sm={12}>
                    <Card
                      size="small"
                      style={{ borderRadius: '8px', background: '#fff0f6' }}
                    >
                      <Space>
                        <WomanOutlined style={{ color: '#eb2f96', fontSize: '20px' }} />
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>Dam (Mother)</Text>
                          <div>
                            <Link href={`/puppies/${puppy.damId}`}>
                              <Text strong style={{ color: '#08979C' }}>
                                {dam?.name || 'View Dam'}
                              </Text>
                            </Link>
                          </div>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                )}
              </Row>
            </Card>
          )}
        </Col>

        {/* Sidebar - Breeder Info */}
        <Col xs={24} md={8}>
          <Card style={{ ...cardStyle, position: 'sticky', top: '16px' }}>
            <Title level={4} style={sectionTitleStyle}>
              Breeder Info
            </Title>
            {kennel ? (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <Space align="center">
                    <Text strong style={{ fontSize: '18px' }}>{kennel.name}</Text>
                    {isVerified && (
                      <CheckCircleOutlined style={{ color: '#08979C', fontSize: '18px' }} />
                    )}
                  </Space>
                  {isVerified && (
                    <div>
                      <Tag color="cyan" style={{ marginTop: '4px' }}>Verified Breeder</Tag>
                    </div>
                  )}
                </div>

                {kennel.description && (
                  <Paragraph
                    style={{ fontSize: '13px', color: '#595959' }}
                    ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
                  >
                    {kennel.description}
                  </Paragraph>
                )}

                <Divider style={{ margin: '12px 0' }} />

                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {kennel.address && (
                    <div>
                      <Space>
                        <EnvironmentOutlined style={{ color: '#08979C' }} />
                        <Text>
                          {kennel.address.city}, {kennel.address.state}
                          {kennel.address.country && kennel.address.country !== 'US' ? `, ${kennel.address.country}` : ''}
                        </Text>
                      </Space>
                    </div>
                  )}
                  {kennel.phone && (
                    <div>
                      <Space>
                        <PhoneOutlined style={{ color: '#08979C' }} />
                        <Text>{kennel.phone}</Text>
                      </Space>
                    </div>
                  )}
                  {kennel.email && (
                    <div>
                      <Space>
                        <MailOutlined style={{ color: '#08979C' }} />
                        <Text>{kennel.email}</Text>
                      </Space>
                    </div>
                  )}
                  {kennel.website && (
                    <div>
                      <Space>
                        <GlobalOutlined style={{ color: '#08979C' }} />
                        <a href={kennel.website} target="_blank" rel="noopener noreferrer">
                          <Text style={{ color: '#08979C' }}>Website</Text>
                        </a>
                      </Space>
                    </div>
                  )}
                </Space>

                {kennel.specialties && kennel.specialties.length > 0 && (
                  <>
                    <Divider style={{ margin: '12px 0' }} />
                    <Text type="secondary" style={{ fontSize: '12px' }}>Specialties</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Space wrap>
                        {kennel.specialties.map((breed, index) => (
                          <Tag key={index} color="blue">{breed}</Tag>
                        ))}
                      </Space>
                    </div>
                  </>
                )}

                <Divider style={{ margin: '12px 0' }} />

                <Button
                  type="primary"
                  icon={<MessageOutlined />}
                  block
                  size="large"
                  style={{ background: '#08979C', borderColor: '#08979C' }}
                  onClick={() => setContactModalVisible(true)}
                >
                  Contact Breeder
                </Button>
              </>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Breeder information unavailable"
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Similar Puppies Section */}
      <SimilarPuppies breed={puppy.breed} currentPuppyId={puppyId} />

      {/* Contact Breeder Modal */}
      <ContactBreederModal
        visible={contactModalVisible}
        onCancel={() => setContactModalVisible(false)}
        puppyName={puppy.name}
        breederName={kennel?.name || 'Breeder'}
        senderName={user?.name || user?.displayName || 'Guest User'}
        senderEmail={user?.email || ''}
      />
    </div>
  );
};

export default PuppyDetailPage;
