'use client';

import React from 'react';
import { Card, Tag, Typography, Space, Rate, Button } from 'antd';
import {
  CheckCircleOutlined,
  TruckOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
} from '@ant-design/icons';
import Image from 'next/image';
import { Dog, Kennel } from '@homeforpup/shared-types';

const { Title, Text } = Typography;

export interface PuppyWithKennel extends Dog {
  kennel?: Kennel;
  image?: string; // For backward compatibility with current image field
  ageWeeks?: number; // Calculated age in weeks
  location?: string; // Formatted location string
  country?: string; // Country from kennel or default
  price?: number; // Price if available
}

export interface PuppyCardProps {
  puppy: PuppyWithKennel;
  isFavorite?: boolean;
  onFavoriteToggle?: (puppyId: string) => void;
  onContact?: (puppy: PuppyWithKennel) => void;
  showContactButton?: boolean;
  showFavoriteButton?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const PuppyCard: React.FC<PuppyCardProps> = ({
  puppy,
  isFavorite = false,
  onFavoriteToggle,
  onContact,
  showContactButton = true,
  showFavoriteButton = true,
  style,
  className,
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(puppy.id);
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContact) {
      onContact(puppy);
    }
  };

  // Calculate age in weeks from birth date
  const calculateAgeWeeks = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
  };

  const ageWeeks = puppy.ageWeeks || calculateAgeWeeks(puppy.birthDate);
  const displayImage = puppy.image || puppy.photoUrl || '/placeholder-puppy.jpg';
  const kennelName = puppy.kennel?.name || 'Unknown Kennel';
  const location = puppy.location || (puppy.kennel?.address ? `${puppy.kennel.address.city}, ${puppy.kennel.address.state}` : 'Location not specified');
  const country = puppy.country || puppy.kennel?.address?.country || 'Country not specified';

  return (
    <Card
      hoverable
      style={{
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        marginBottom: '16px',
        overflow: 'visible',
        height: '590px',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #f0f0f0',
        ...style,
      }}
      className={className}
      bodyStyle={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        overflow: 'visible'
      }}
      cover={
        <div style={{ position: 'relative', height: '200px' }}>
          <Image
            src={displayImage}
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
            {puppy.kennel?.isActive && (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Active Kennel
              </Tag>
            )}
            <Tag color="blue">
              {ageWeeks} weeks
            </Tag>
            {puppy.kennel?.address && (
              <Tag color="orange" icon={<TruckOutlined />}>
                Ships
              </Tag>
            )}
            <Tag color="purple" icon={<HomeOutlined />}>
              Pickup
            </Tag>
          </div>
          {showFavoriteButton && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
            }}>
              <Button
                type="text"
                shape="circle"
                size="large"
                icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                onClick={handleFavoriteClick}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}
              />
            </div>
          )}
        </div>
      }
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        padding: '0 4px' 
      }}>
        {/* Header Section */}
        <div style={{ marginBottom: '8px' }}>
          <Title level={4} style={{ margin: 0, color: '#08979C', marginBottom: '4px' }}>
            {puppy.name}
          </Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            {puppy.breed} • {puppy.gender}
          </Text>
        </div>

        {/* Location Section */}
        <div style={{ marginBottom: '8px' }}>
          <Space wrap>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <EnvironmentOutlined style={{ marginRight: '4px' }} />
              {location}, {country}
            </Text>
          </Space>
        </div>

        {/* Kennel Section */}
        <div style={{ marginBottom: '8px' }}>
          <Text strong style={{ fontSize: '13px' }}>
            Kennel: {kennelName}
          </Text>
          {puppy.kennel?.specialties && puppy.kennel.specialties.length > 0 && (
            <div style={{ marginTop: '4px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Specializes in: {puppy.kennel.specialties.join(', ')}
              </Text>
            </div>
          )}
        </div>

        {/* Color Section */}
        <div style={{ marginBottom: '8px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <strong>Color:</strong> {puppy.color}
          </Text>
        </div>


        {/* Description Section */}
        {puppy.description && (
          <div style={{ marginBottom: '12px', flex: 1 }}>
            <Text style={{ fontSize: '12px', lineHeight: '1.4' }}>
              {puppy.description.length > 100 
                ? `${puppy.description.substring(0, 100)}...` 
                : puppy.description
              }
            </Text>
          </div>
        )}

        {/* Action Buttons */}
        {showContactButton && (
          <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
            <Button
              type="primary"
              block
              icon={<MessageOutlined />}
              onClick={handleContactClick}
              style={{
                backgroundColor: '#FA8072',
                borderColor: '#FA8072',
                height: '40px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Contact Kennel
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PuppyCard;
