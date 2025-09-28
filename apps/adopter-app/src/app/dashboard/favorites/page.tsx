'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Spin, 
  Empty,
  Space,
  message,
  Breadcrumb,
  Statistic
} from 'antd';
import { 
  HeartOutlined, 
  ArrowLeftOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useAuth, useFavorites } from '@/hooks';
import { PuppyList, PuppyWithBreeder } from '@homeforpup/shared-components';

const { Title, Paragraph } = Typography;

const FavoritesPage: React.FC = () => {
  const { user, effectiveUserType } = useAuth();
  const { favorites, isLoading: favoritesLoading, removeFromFavorites } = useFavorites();
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Convert favorites to puppy format for the PuppyList component
  const favoritePuppies: PuppyWithBreeder[] = favorites.map(favorite => ({
    id: favorite.puppyId,
    name: favorite.puppyData?.name || 'Unknown Puppy',
    breed: favorite.puppyData?.breed || 'Unknown Breed',
    gender: favorite.puppyData?.gender || 'unknown',
    ageWeeks: favorite.puppyData?.ageWeeks || 0,
    price: favorite.puppyData?.price || 0,
    image: favorite.puppyData?.image || '/placeholder-puppy.jpg',
    location: favorite.puppyData?.location || 'Unknown Location',
    country: favorite.puppyData?.country || 'Unknown Country',
    description: `A lovely ${favorite.puppyData?.breed || 'puppy'} from ${favorite.puppyData?.breederName || 'a trusted breeder'}.`,
    breeder: {
      id: 'breeder-id', // We don't have this in favorites data
      businessName: favorite.puppyData?.breederName || 'Unknown Breeder',
      verified: true, // Assume verified for favorites
      shipping: true,
      pickupAvailable: true,
      rating: 4.5,
      reviewCount: 10,
      avgResponseTime: '2 hours',
      responseRate: 0.95,
      phone: '+1-555-0123',
      email: 'breeder@example.com',
      website: 'https://example.com'
    }
  }));

  const handleRemoveFromFavorites = async (puppyId: string) => {
    setRemovingId(puppyId);
    try {
      await removeFromFavorites(puppyId);
      message.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      message.error('Failed to remove from favorites');
    } finally {
      setRemovingId(null);
    }
  };

  // Redirect non-adopters
  if (effectiveUserType === 'breeder') {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Favorites are only available for adopters"
        >
          <Link href="/dashboard">
            <Button type="primary" icon={<ArrowLeftOutlined />}>
              Back to Dashboard
            </Button>
          </Link>
        </Empty>
      </div>
    );
  }

  if (favoritesLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <Paragraph style={{ marginTop: '20px' }}>Loading your favorites...</Paragraph>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    marginBottom: '16px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <Breadcrumb.Item>
          <Link href="/dashboard">Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Favorites</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <Title level={2} style={{ marginBottom: '24px' }}>
        My Favorite Puppies
      </Title>
      <Paragraph style={{ marginBottom: '32px' }}>
        Your saved puppies are listed below. Click on any puppy to view more details or contact the breeder.
      </Paragraph>

      {/* Stats Overview */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Total Favorites"
              value={favorites.length}
              prefix={<HeartOutlined style={{ color: '#ff4d4f' }} />}
            />
            <Link href="/browse">
              <Button type="link" style={{ paddingLeft: 0 }}>Browse More</Button>
            </Link>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Ready to View"
              value={favorites.length}
              prefix={<EyeOutlined style={{ color: '#1890ff' }} />}
            />
            <Link href="/browse">
              <Button type="link" style={{ paddingLeft: 0 }}>View All</Button>
            </Link>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Active Lists"
              value={favorites.length > 0 ? 1 : 0}
              prefix={<HeartOutlined style={{ color: '#52c41a' }} />}
            />
            <Button type="link" style={{ paddingLeft: 0 }}>Manage Lists</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Recently Added"
              value={favorites.length > 0 ? 'Today' : 'None'}
              prefix={<SearchOutlined style={{ color: '#faad14' }} />}
            />
            <Button type="link" style={{ paddingLeft: 0 }}>View Activity</Button>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Title level={3} style={{ marginBottom: '24px' }}>Quick Actions</Title>
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable style={cardStyle}>
            <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
              <SearchOutlined style={{ fontSize: '36px', color: '#08979C' }} />
              <Title level={4}>Browse Puppies</Title>
              <Paragraph>Find more puppies to add to your favorites.</Paragraph>
              <Link href="/browse">
                <Button type="primary" size="large" block>Start Browsing</Button>
              </Link>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable style={cardStyle}>
            <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
              <EyeOutlined style={{ fontSize: '36px', color: '#FA8072' }} />
              <Title level={4}>View All Breeds</Title>
              <Paragraph>Explore different dog breeds and their characteristics.</Paragraph>
              <Link href="/breeds">
                <Button size="large" block>Explore Breeds</Button>
              </Link>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable style={cardStyle}>
            <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
              <HeartOutlined style={{ fontSize: '36px', color: '#1890FF' }} />
              <Title level={4}>Share Favorites</Title>
              <Paragraph>Share your favorite puppies with family and friends.</Paragraph>
              <Button size="large" block>Share List</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Puppies List */}
      <Title level={3} style={{ marginBottom: '24px' }}>Your Favorite Puppies</Title>
      <PuppyList
        puppies={favoritePuppies}
        loading={favoritesLoading}
        emptyMessage="No favorite puppies yet"
        emptyDescription="Start browsing puppies and save your favorites to see them here"
        onEmptyAction={() => window.location.href = '/browse'}
        emptyActionText="Browse Puppies"
        showFavorites={false} // Don't show favorites button since these are already favorites
        showContactBreeder={true} // Show contact breeder button
        showViewDetails={true} // Show view details button
        user={user}
        favoritesLoading={false}
        gridProps={{
          gutter: [24, 24],
          xs: 1,
          sm: 3,
          md: 4,
          lg: 5,
          xl: 6,
          xxl: 7
        }}
      />
    </div>
  );
};

export default FavoritesPage;
