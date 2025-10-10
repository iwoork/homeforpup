'use client';

import React from 'react';
import { Card, Avatar, Typography, Button, Space, Tag } from 'antd';
import { UserOutlined, MessageOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ProfileHeaderProps {
  user: {
    userId: string;
    displayName: string;
    name: string;
    verified: boolean;
    profileImage?: string;
    location?: string;
    lastActiveAt: string;
    puppyParentInfo?: any;
    preferences?: any;
  };
  isOwnProfile: boolean;
  onMessageClick: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, isOwnProfile, onMessageClick }) => {
  return (
    <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Avatar 
          size={80} 
          src={user.profileImage} 
          icon={<UserOutlined />}
          style={{ backgroundColor: '#f0f0f0' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Title level={3} style={{ margin: 0 }}>
              {user.displayName || user.name}
            </Title>
            {user.verified && (
              <Tag color="green" icon={<UserOutlined />}>
                Verified
              </Tag>
            )}
          </div>
          
          <Space direction="vertical" size="small">
            {user.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <EnvironmentOutlined style={{ color: '#666' }} />
                <Text type="secondary">{user.location}</Text>
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CalendarOutlined style={{ color: '#666' }} />
              <Text type="secondary">
                Last active {new Date(user.lastActiveAt).toLocaleDateString()}
              </Text>
            </div>
          </Space>
        </div>
        
        {!isOwnProfile && (
          <Button 
            type="primary" 
            icon={<MessageOutlined />}
            onClick={onMessageClick}
          >
            Send Message
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ProfileHeader;
