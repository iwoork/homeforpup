'use client';

import React from 'react';
import { Card, Row, Col, Space, Avatar, Typography, Tag, Tooltip, Button } from 'antd';
import { CheckCircleOutlined, EnvironmentOutlined, UserOutlined, EditOutlined, MessageOutlined, HeartOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export interface ProfileHeaderUser {
  userId: string;
  displayName?: string;
  name: string;
  verified?: boolean;
  profileImage?: string;
  location?: string;
  lastActiveAt?: string;
  adopterInfo?: {
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
};

const ProfileHeader: React.FC<Props> = ({ user, isOwnProfile, editHref, onMessageClick }) => {
  return (
    <Card 
      style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden' }}
      bodyStyle={{ padding: 0 }}
    >
      <div 
        style={{
          height: '250px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                      color: 'white', 
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)' 
                    }}>
                      {user.displayName || user.name}
                    </Title>
                    {user.verified && (
                      <Tooltip title="Verified User">
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />
                      </Tooltip>
                    )}
                  </div>
                  <Text style={{ 
                    color: 'white', 
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    fontSize: '16px'
                  }}>
                    Looking for the perfect furry companion
                  </Text>
                  <br />
                  <Space style={{ marginTop: '8px' }}>
                    {user.adopterInfo?.experienceLevel && (
                      <Tag color="purple" style={{ fontSize: '12px' }}>
                        {user.adopterInfo.experienceLevel.replace('-', ' ').toUpperCase()}
                      </Tag>
                    )}
                    {user.preferences?.privacy?.showLocation && user.location && (
                      <Tag icon={<EnvironmentOutlined />} style={{ fontSize: '12px' }}>
                        {user.location}
                      </Tag>
                    )}
                    {user.lastActiveAt && (
                      <Tag style={{ fontSize: '12px' }}>
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
                      style={{ background: '#52c41a', borderColor: '#52c41a' }}
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
                      style={{ background: '#667eea', borderColor: '#667eea' }}
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


