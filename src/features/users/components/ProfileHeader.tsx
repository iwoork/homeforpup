'use client';

import React from 'react';
import { Card, Row, Col, Space, Avatar, Typography, Tag, Tooltip, Button } from 'antd';
import { CheckCircleOutlined, EnvironmentOutlined, UserOutlined, EditOutlined, MessageOutlined, HeartOutlined, CrownOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { canSeeVerifiedBadges } from '@homeforpup/shared-hooks';
import { User } from '@/types';

const { Title, Text } = Typography;

export interface ProfileHeaderUser {
  userId: string;
  displayName?: string;
  name: string;
  verified?: boolean;
  profileImage?: string;
  location?: string;
  lastActiveAt?: string;
  puppyParentInfo?: {
    experienceLevel?: 'first-time' | 'some-experience' | 'very-experienced';
  };
  preferences?: {
    privacy?: {
      showLocation?: boolean;
    };
  };
}

function formatLastActive(dateString?: string) {
  if (!dateString) return null;
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return 'Active today';
  if (diffDays <= 7) return `Active ${diffDays} days ago`;
  if (diffDays <= 30) return `Active ${Math.ceil(diffDays / 7)} weeks ago`;
  return `Active ${Math.ceil(diffDays / 30)} months ago`;
}

type Props = {
  user: ProfileHeaderUser;
  isOwnProfile: boolean;
  editHref?: string;
  onMessageClick?: () => void;
  currentViewer?: User | null; // The currently logged-in user viewing this profile
};

const ProfileHeader: React.FC<Props> = ({ user, isOwnProfile, editHref, onMessageClick, currentViewer }) => {
  // Check if the current viewer has premium access to see verified badges
  const hasPremiumAccess = canSeeVerifiedBadges(currentViewer);
  
  // Show verified badge only if viewer has premium OR if it's their own profile
  const showVerifiedBadge = user.verified && (hasPremiumAccess || isOwnProfile);
  return (
    <Card 
      style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden' }}
      bodyStyle={{ padding: 0 }}
    >
      <div 
        style={{
          height: '250px',
          background: 'transparent',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '24px',
          right: '24px'
        }}>
          <Row align="bottom" justify="space-between">
            <Col>
              <Space align="end" size={16}>
                <Avatar 
                  size={120} 
                  src={user.profileImage}
                  icon={<UserOutlined />}
                  style={{ border: '4px solid white' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Title level={2} style={{ 
                      margin: 0, 
                      color: '#1e293b'
                    }}>
                      {user.displayName || user.name}
                    </Title>
                    {showVerifiedBadge && (
                      <Tooltip title="Verified User">
                        <CheckCircleOutlined style={{ color: '#8fbc8f', fontSize: '24px' }} />
                      </Tooltip>
                    )}
                    {user.verified && !hasPremiumAccess && !isOwnProfile && (
                      <Tooltip title="Upgrade to Premium to see verified badges">
                        <Tag icon={<CrownOutlined />} color="gold">Premium Feature</Tag>
                      </Tooltip>
                    )}
                  </div>
                  <Text style={{ 
                    color: '#64748b',
                    fontSize: '16px'
                  }}>
                    Looking for the perfect furry companion
                  </Text>
                  <br />
                  <Space style={{ marginTop: '8px' }}>
                    {user.puppyParentInfo?.experienceLevel && (
                      <Tag style={{ fontSize: '12px', backgroundColor: '#e6d7ff', color: '#6b46c1', borderColor: '#d1c4e9' }}>
                        {user.puppyParentInfo.experienceLevel.replace('-', ' ').toUpperCase()}
                      </Tag>
                    )}
                    {user.preferences?.privacy?.showLocation && user.location && (
                      <Tag icon={<EnvironmentOutlined />} style={{ fontSize: '12px', backgroundColor: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' }}>
                        {user.location}
                      </Tag>
                    )}
                    {user.lastActiveAt && (
                      <Tag style={{ fontSize: '12px', backgroundColor: '#f3f4f6', color: '#6b7280', borderColor: '#e5e7eb' }}>
                        {formatLastActive(user.lastActiveAt)}
                      </Tag>
                    )}
                  </Space>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                {isOwnProfile ? (
                  <Link href={editHref || `/users/${user.userId}/edit`}>
                    <Button 
                      type="primary" 
                      size="large" 
                      style={{ background: '#86efac', borderColor: '#86efac', color: '#166534' }}
                      icon={<EditOutlined />}
                    >
                      Edit Profile
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button 
                      type="primary" 
                      size="large" 
                      style={{ background: '#a5b4fc', borderColor: '#a5b4fc', color: '#3730a3' }}
                      icon={<MessageOutlined />}
                      onClick={onMessageClick}
                    >
                      Send Message
                    </Button>
                    <Button size="large" icon={<HeartOutlined />}>
                      Add to Favorites
                    </Button>
                  </>
                )}
              </Space>
            </Col>
          </Row>
        </div>
      </div>
    </Card>
  );
};

export default ProfileHeader;


