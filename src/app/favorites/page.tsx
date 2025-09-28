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
  Breadcrumb
} from 'antd';
import { 
  HeartOutlined, 
  ArrowLeftOutlined,
  EyeOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useAuth, useFavorites } from '@/hooks';
import PuppyList, { PuppyWithBreeder } from '@/components/PuppyList';

const { Title, Text } = Typography;

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
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '32px 16px' 
      }}>
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '32px 16px' 
    }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <Breadcrumb.Item>
          <Link href="/dashboard">Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>My Favorites</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div style={{ 
        marginBottom: '32px',
        background: 'linear-gradient(135deg, #F6FFED 0%, #FFFFFF 100%)',
        padding: '32px',
        borderRadius: '16px',
        border: '2px solid #52C41A20',
        boxShadow: '0 8px 32px #52C41A15',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, #52C41A10 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <div>
            <Title level={1} style={{ 
              color: '#52C41A', 
              margin: 0, 
              fontSize: '32px',
              fontWeight: 'bold',
              textShadow: '0 2px 4px #52C41A20'
            }}>
              💖 My Favorite Puppies
            </Title>
            <Text style={{ 
              color: '#8C8C8C', 
              fontSize: '18px',
              fontWeight: '500'
            }}>
              {favorites.length} saved puppy{favorites.length !== 1 ? 's' : ''}
            </Text>
          </div>
          
          <Space>
            <Link href="/dashboard">
              <Button 
                icon={<ArrowLeftOutlined />}
                style={{ 
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/browse">
              <Button 
                type="primary"
                icon={<EyeOutlined />}
                style={{ 
                  background: '#52C41A',
                  borderColor: '#52C41A',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                Browse More Puppies
              </Button>
            </Link>
          </Space>
        </div>
      </div>

      {/* Stats Card */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={8}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #FFFFFF 0%, #52C41A05 100%)',
              border: '1px solid #52C41A20',
              borderRadius: '12px',
              boxShadow: '0 4px 16px #52C41A10',
              textAlign: 'center'
            }}
          >
            <HeartOutlined style={{ fontSize: '32px', color: '#52C41A', marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52C41A', marginBottom: '4px' }}>
              {favorites.length}
            </div>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Total Favorites
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #FFFFFF 0%, #08979C05 100%)',
              border: '1px solid #08979C20',
              borderRadius: '12px',
              boxShadow: '0 4px 16px #08979C10',
              textAlign: 'center'
            }}
          >
            <EyeOutlined style={{ fontSize: '32px', color: '#08979C', marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#08979C', marginBottom: '4px' }}>
              {favorites.length}
            </div>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Ready to View
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FA8C1605 100%)',
              border: '1px solid #FA8C1620',
              borderRadius: '12px',
              boxShadow: '0 4px 16px #FA8C1610',
              textAlign: 'center'
            }}
          >
            <HeartOutlined style={{ fontSize: '32px', color: '#FA8C16', marginBottom: '8px' }} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FA8C16', marginBottom: '4px' }}>
              {favorites.length > 0 ? 'Active' : 'None'}
            </div>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              Saved Lists
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Puppies List */}
      <PuppyList
        puppies={favoritePuppies}
        loading={favoritesLoading}
        emptyMessage="No favorite puppies yet"
        emptyDescription="Start browsing puppies and save your favorites to see them here"
        onEmptyAction={() => window.location.href = '/browse'}
        emptyActionText="Browse Puppies"
        showFavorites={false} // Don't show favorites button since these are already favorites
        cardHeight="650px"
        gridProps={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 3
        }}
      />
    </div>
  );
};

export default FavoritesPage;
