'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  List, 
  Spin, 
  Empty,
  Tag,
  Space,
  Tooltip,
  Rate,
  Divider,
  Pagination,
  message
} from 'antd';
import { 
  HeartOutlined, 
  HeartFilled, 
  EnvironmentOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  GlobalOutlined, 
  CheckCircleOutlined, 
  TruckOutlined, 
  HomeOutlined,
  EyeOutlined
} from '@ant-design/icons';
import Image from 'next/image';
import Link from 'next/link';

const { Text } = Typography;

export interface PuppyWithBreeder {
  id: string;
  name: string;
  breed: string;
  gender: string;
  ageWeeks: number;
  price: number;
  image: string;
  location: string;
  country: string;
  description: string;
  breeder: {
    id: string;
    businessName: string;
    verified: boolean;
    shipping: boolean;
    pickupAvailable: boolean;
    rating: number;
    reviewCount: number;
    avgResponseTime: string;
    responseRate: number;
    phone: string;
    email: string;
    website?: string;
  };
}

interface PuppyListProps {
  puppies: PuppyWithBreeder[];
  loading?: boolean;
  title?: string;
  showFavorites?: boolean;
  showContactBreeder?: boolean;
  showViewDetails?: boolean;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  emptyDescription?: string;
  onEmptyAction?: () => void;
  emptyActionText?: string;
  gridProps?: {
    gutter?: number | [number, number];
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
  cardHeight?: string;
  onToggleFavorite?: (puppy: PuppyWithBreeder) => void;
  onContactBreeder?: (puppy: PuppyWithBreeder) => void;
  onViewDetails?: (puppy: PuppyWithBreeder) => void;
  isFavorite?: (puppyId: string) => boolean;
  favoritesLoading?: boolean;
  user?: any;
}

const PuppyList: React.FC<PuppyListProps> = ({
  puppies,
  loading = false,
  title,
  showFavorites = true,
  showContactBreeder = true,
  showViewDetails = true,
  showPagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage = "No puppies found",
  emptyDescription = "Try adjusting your search criteria",
  onEmptyAction,
  emptyActionText = "Browse Puppies",
  gridProps = { gutter: [24, 24], xs: 1, sm: 3, md: 4, lg: 5, xl: 6, xxl: 7 },
  cardHeight = '590px',
  onToggleFavorite,
  onContactBreeder,
  onViewDetails,
  isFavorite,
  favoritesLoading = false,
  user
}) => {
  const [optimisticFavorites, setOptimisticFavorites] = useState<Record<string, boolean>>({});

  // Helper function to get current favorite status
  const getCurrentFavoriteStatus = (puppyId: string): boolean => {
    if (isFavorite) {
      return isFavorite(puppyId);
    }
    return optimisticFavorites[puppyId] || false;
  };

  // Clear optimistic updates when puppies change
  React.useEffect(() => {
    setOptimisticFavorites({});
  }, [puppies]);

  const handleToggleFavorite = async (puppy: PuppyWithBreeder) => {
    if (!user) {
      message.warning('Please sign in to save favorites');
      return;
    }
    
    if (onToggleFavorite) {
      onToggleFavorite(puppy);
    } else {
      // Fallback optimistic update
      const currentStatus = getCurrentFavoriteStatus(puppy.id);
      const newStatus = !currentStatus;
      
      setOptimisticFavorites(prev => ({
        ...prev,
        [puppy.id]: newStatus
      }));
    }
  };

  const handleContactBreeder = (puppy: PuppyWithBreeder) => {
    if (onContactBreeder) {
      onContactBreeder(puppy);
    }
  };

  const handleViewDetails = (puppy: PuppyWithBreeder) => {
    if (onViewDetails) {
      onViewDetails(puppy);
    }
  };

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render puppy card
  const renderPuppyCard = (puppy: PuppyWithBreeder) => (
    <Card
      key={puppy.id}
      hoverable
      style={{
        borderRadius: '12px',
        boxShadow: getCurrentFavoriteStatus(puppy.id) 
          ? '0 4px 12px rgba(255, 77, 79, 0.3)' 
          : '0 4px 12px rgba(0, 0, 0, 0.1)',
        marginBottom: '16px',
        overflow: 'visible',
        height: cardHeight,
        display: 'flex',
        flexDirection: 'column',
        border: getCurrentFavoriteStatus(puppy.id) 
          ? '2px solid #ff4d4f' 
          : '1px solid #f0f0f0'
      }}
      cover={
        <div style={{ position: 'relative', height: '200px' }}>
          <Image
            src={puppy.image}
            alt={puppy.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {getCurrentFavoriteStatus(puppy.id) && (
              <Tag color="red" icon={<HeartFilled />}>
                Favorited
              </Tag>
            )}
            {puppy.breeder.verified && (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Verified
              </Tag>
            )}
            {puppy.breeder.shipping && (
              <Tag color="blue" icon={<TruckOutlined />}>
                Shipping
              </Tag>
            )}
            {puppy.breeder.pickupAvailable && (
              <Tag color="orange" icon={<HomeOutlined />}>
                Pickup
              </Tag>
            )}
          </div>
        </div>
      }
      actions={[]}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Puppy Info */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <Text strong style={{ fontSize: '18px', color: '#262626' }}>
                {puppy.name}
              </Text>
              <div style={{ marginTop: '4px' }}>
                <Tag color="blue">{puppy.breed}</Tag>
                <Tag color={puppy.gender === 'male' ? 'blue' : 'pink'}>
                  {puppy.gender}
                </Tag>
                <Tag color="green">{puppy.ageWeeks} weeks</Tag>
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <Space>
              <EnvironmentOutlined style={{ color: '#8C8C8C' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {puppy.location}, {puppy.country}
              </Text>
            </Space>
          </div>

          <Text type="secondary" style={{ fontSize: '13px', lineHeight: '1.4' }}>
            {puppy.description.length > 100 
              ? `${puppy.description.substring(0, 100)}...` 
              : puppy.description
            }
          </Text>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* Breeder Info */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '8px' }}>
            <Text strong style={{ fontSize: '14px', color: '#262626' }}>
              Breeder: {puppy.breeder.businessName}
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <Rate disabled value={puppy.breeder.rating} style={{ fontSize: '12px' }} />
              <Text type="secondary" style={{ fontSize: '11px' }}>
                ({puppy.breeder.reviewCount} reviews)
              </Text>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Response: {puppy.breeder.avgResponseTime}
              </Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Rate: {Math.round(puppy.breeder.responseRate * 100)}%
              </Text>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          marginTop: '12px',
          paddingTop: '8px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Space size="middle">
            {showFavorites && (
              <Tooltip title={getCurrentFavoriteStatus(puppy.id) ? "Remove from favorites" : "Save to favorites"}>
                <Button 
                  type="text" 
                  icon={getCurrentFavoriteStatus(puppy.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} 
                  size="small" 
                  onClick={() => handleToggleFavorite(puppy)}
                  loading={favoritesLoading}
                  disabled={!user}
                  style={{
                    color: getCurrentFavoriteStatus(puppy.id) ? '#ff4d4f' : undefined,
                    borderColor: getCurrentFavoriteStatus(puppy.id) ? '#ff4d4f' : undefined
                  }}
                />
              </Tooltip>
            )}
            {showContactBreeder && (
              <Tooltip title="Contact Breeder">
                <Button 
                  type="text" 
                  icon={<PhoneOutlined />} 
                  size="small"
                  onClick={() => handleContactBreeder(puppy)}
                />
              </Tooltip>
            )}
            {showViewDetails && (
              <Tooltip title="View Details">
                <Button 
                  type="text" 
                  icon={<EyeOutlined />} 
                  size="small"
                  onClick={() => handleViewDetails(puppy)}
                />
              </Tooltip>
            )}
            <Tooltip title={puppy.breeder.email}>
              <Button type="text" icon={<MailOutlined />} size="small" />
            </Tooltip>
            {puppy.breeder.website && (
              <Tooltip title={puppy.breeder.website}>
                <Button type="text" icon={<GlobalOutlined />} size="small" />
              </Tooltip>
            )}
          </Space>
        </div>
      </div>
    </Card>
  );

  if (loading) {
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

  if (!puppies || puppies.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={emptyMessage}
      >
        {emptyDescription && (
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
            {emptyDescription}
          </Text>
        )}
        {onEmptyAction && (
          <Button type="primary" icon={<EyeOutlined />} onClick={onEmptyAction}>
            {emptyActionText}
          </Button>
        )}
      </Empty>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '100%' }}>
      {title && (
        <div style={{ marginBottom: '24px' }}>
          <Typography.Title level={2} style={{ color: '#08979C', margin: 0 }}>
            {title}
          </Typography.Title>
        </div>
      )}
      
      <Row 
        gutter={gridProps.gutter} 
        style={{ 
          width: '100%', 
          maxWidth: '100%',
          margin: 0,
          display: 'flex',
          flexWrap: 'wrap'
        }}
      >
        {puppies.map((puppy) => (
          <Col 
            key={puppy.id}
            xs={gridProps.xs} 
            sm={gridProps.sm} 
            md={gridProps.md} 
            lg={gridProps.lg} 
            xl={gridProps.xl}
            xxl={gridProps.xxl}
            style={{ 
              display: 'flex',
              marginBottom: '24px'
            }}
          >
            {renderPuppyCard(puppy)}
          </Col>
        ))}
      </Row>

      {showPagination && totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '32px' 
        }}>
          <Pagination
            current={currentPage}
            total={totalPages}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} of ${total} puppies`
            }
          />
        </div>
      )}
    </div>
  );
};

export default PuppyList;
