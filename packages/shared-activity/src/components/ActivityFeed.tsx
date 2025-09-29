'use client';

import React, { useState, useEffect } from 'react';
import { Card, List, Avatar, Typography, Tag, Button, Space, Spin, Empty, Select, DatePicker, Badge } from 'antd';
import { 
  HeartOutlined, 
  MessageOutlined, 
  EyeOutlined, 
  UserOutlined,
  SearchOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
  SettingOutlined,
  BellOutlined,
  StarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Activity, ActivityType, ActivityCategory, ActivityFilter } from '@homeforpup/shared-types';
import { formatDistanceToNow } from 'date-fns';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface ActivityFeedProps {
  userId: string;
  userType: 'adopter' | 'breeder';
  limit?: number;
  showFilters?: boolean;
  showStats?: boolean;
  onActivityClick?: (activity: Activity) => void;
  onMarkAsRead?: (activityId: string) => void;
  onMarkAllAsRead?: () => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  userId,
  userType,
  limit = 20,
  showFilters = true,
  showStats = true,
  onActivityClick,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFilter>({
    limit,
    offset: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    byType: {} as Record<ActivityType, number>,
    byCategory: {} as Record<ActivityCategory, number>
  });

  // Fetch activities
  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filters.types?.length) queryParams.append('types', filters.types.join(','));
      if (filters.categories?.length) queryParams.append('categories', filters.categories.join(','));
      if (filters.priority?.length) queryParams.append('priority', filters.priority.join(','));
      if (filters.read !== undefined) queryParams.append('read', filters.read.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.offset) queryParams.append('offset', filters.offset.toString());
      if (filters.dateRange?.start) queryParams.append('start', filters.dateRange.start);
      if (filters.dateRange?.end) queryParams.append('end', filters.dateRange.end);

      const response = await fetch(`/api/activities?${queryParams.toString()}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      setActivities(data.activities || []);
      setStats(data.stats || stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchActivities();
    }
  }, [userId, filters]);

  const getActivityIcon = (type: ActivityType) => {
    const iconMap: Record<ActivityType, React.ReactNode> = {
      // Adopter activities
      puppy_favorited: <HeartOutlined style={{ color: '#f5222d' }} />,
      puppy_unfavorited: <HeartOutlined style={{ color: '#d9d9d9' }} />,
      breeder_contacted: <MessageOutlined style={{ color: '#1890ff' }} />,
      message_received: <MessageOutlined style={{ color: '#52c41a' }} />,
      message_sent: <MessageOutlined style={{ color: '#1890ff' }} />,
      profile_viewed: <EyeOutlined style={{ color: '#52c41a' }} />,
      search_performed: <SearchOutlined style={{ color: '#722ed1' }} />,
      breed_explored: <TrophyOutlined style={{ color: '#fa8c16' }} />,
      kennel_visited: <TeamOutlined style={{ color: '#13c2c2' }} />,
      puppy_viewed: <EyeOutlined style={{ color: '#52c41a' }} />,
      adoption_guide_viewed: <InfoCircleOutlined style={{ color: '#722ed1' }} />,
      preferences_updated: <SettingOutlined style={{ color: '#fa8c16' }} />,
      profile_updated: <EditOutlined style={{ color: '#1890ff' }} />,
      account_created: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      login: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      logout: <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />,
      
      // Breeder activities
      kennel_created: <TeamOutlined style={{ color: '#52c41a' }} />,
      kennel_updated: <EditOutlined style={{ color: '#1890ff' }} />,
      dog_added: <PlusOutlined style={{ color: '#52c41a' }} />,
      dog_updated: <EditOutlined style={{ color: '#1890ff' }} />,
      puppy_listed: <PlusOutlined style={{ color: '#52c41a' }} />,
      puppy_updated: <EditOutlined style={{ color: '#1890ff' }} />,
      puppy_removed: <DeleteOutlined style={{ color: '#f5222d' }} />,
      announcement_created: <PlusOutlined style={{ color: '#52c41a' }} />,
      announcement_updated: <EditOutlined style={{ color: '#1890ff' }} />,
      inquiry_received: <MessageOutlined style={{ color: '#52c41a' }} />,
      inquiry_responded: <MessageOutlined style={{ color: '#1890ff' }} />,
      profile_viewed_by_adopter: <EyeOutlined style={{ color: '#52c41a' }} />,
      kennel_viewed_by_adopter: <TeamOutlined style={{ color: '#52c41a' }} />,
      puppy_viewed_by_adopter: <EyeOutlined style={{ color: '#52c41a' }} />,
      favorite_received: <HeartOutlined style={{ color: '#f5222d' }} />,
      message_received_from_adopter: <MessageOutlined style={{ color: '#52c41a' }} />,
      message_sent_to_adopter: <MessageOutlined style={{ color: '#1890ff' }} />,
      health_record_updated: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      litter_created: <PlusOutlined style={{ color: '#52c41a' }} />,
      litter_updated: <EditOutlined style={{ color: '#1890ff' }} />,
      certification_added: <TrophyOutlined style={{ color: '#fa8c16' }} />,
      photo_uploaded: <PlusOutlined style={{ color: '#52c41a' }} />,
      video_uploaded: <PlusOutlined style={{ color: '#52c41a' }} />,
      account_verified: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      payment_processed: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      subscription_updated: <SettingOutlined style={{ color: '#1890ff' }} />
    };

    return iconMap[type] || <BellOutlined style={{ color: '#666' }} />;
  };

  const getActivityColor = (category: ActivityCategory) => {
    const colorMap: Record<ActivityCategory, string> = {
      engagement: '#52c41a',
      communication: '#1890ff',
      profile: '#722ed1',
      content: '#fa8c16',
      business: '#13c2c2',
      system: '#666',
      security: '#f5222d',
      marketing: '#eb2f96'
    };
    return colorMap[category] || '#666';
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    const colorMap = {
      low: '#52c41a',
      medium: '#fa8c16',
      high: '#f5222d'
    };
    return colorMap[priority];
  };

  const handleMarkAsRead = async (activityId: string) => {
    try {
      await fetch(`/api/activities/${activityId}/read`, {
        method: 'POST',
        credentials: 'include'
      });
      
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, read: true }
            : activity
        )
      );
      
      onMarkAsRead?.(activityId);
    } catch (error) {
      console.error('Failed to mark activity as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/activities/mark-all-read', {
        method: 'POST',
        credentials: 'include'
      });
      
      setActivities(prev => 
        prev.map(activity => ({ ...activity, read: true }))
      );
      
      onMarkAllAsRead?.();
    } catch (error) {
      console.error('Failed to mark all activities as read:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>Loading activities...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#f5222d', marginBottom: '16px' }} />
          <Title level={4}>Error Loading Activities</Title>
          <Paragraph>{error}</Paragraph>
          <Button onClick={fetchActivities}>Try Again</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (max-width: 768px) {
            .ant-list-item-meta {
              align-items: flex-start !important;
            }
            .ant-list-item-meta-avatar {
              margin-right: 12px !important;
              margin-top: 2px !important;
            }
            .ant-list-item-meta-content {
              flex: 1 !important;
              min-width: 0 !important;
            }
            .ant-list-item-meta-title {
              margin-bottom: 8px !important;
            }
            .ant-list-item-meta-description {
              margin-bottom: 0 !important;
            }
            .ant-tag {
              font-size: 10px !important;
              padding: 2px 6px !important;
              margin: 0 !important;
              line-height: 1.2 !important;
              border-radius: 4px !important;
            }
            .ant-avatar {
              width: 32px !important;
              height: 32px !important;
              font-size: 14px !important;
            }
            .ant-list-item {
              padding: 12px !important;
              margin-bottom: 8px !important;
            }
            .ant-card {
              margin-bottom: 16px !important;
            }
            .ant-card-head {
              padding: 0 12px !important;
              min-height: 48px !important;
            }
            .ant-card-head-title {
              font-size: 16px !important;
              padding: 12px 0 !important;
            }
            .ant-card-body {
              padding: 12px !important;
            }
          }
          @media (max-width: 480px) {
            .ant-list-item {
              padding: 8px !important;
              margin-bottom: 6px !important;
            }
            .ant-avatar {
              width: 28px !important;
              height: 28px !important;
              font-size: 12px !important;
            }
            .ant-list-item-meta-avatar {
              margin-right: 8px !important;
            }
            .ant-card-body {
              padding: 8px !important;
            }
            .ant-card-head {
              padding: 0 8px !important;
              min-height: 44px !important;
            }
            .ant-card-head-title {
              font-size: 14px !important;
              padding: 8px 0 !important;
            }
          }
        `
      }} />
      {/* Stats */}
      {showStats && (
        <Card style={{ marginBottom: '16px' }}>
          <Space size="large">
            <div>
              <Text strong>Total Activities</Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {stats.total}
              </div>
            </div>
            <div>
              <Text strong>Unread</Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
                {stats.unread}
              </div>
            </div>
            {stats.unread > 0 && (
              <Button 
                type="primary" 
                size="small"
                onClick={handleMarkAllAsRead}
              >
                Mark All as Read
              </Button>
            )}
          </Space>
        </Card>
      )}

      {/* Filters */}
      {showFilters && (
        <Card style={{ marginBottom: '16px' }}>
          <Space wrap>
            <Select
              placeholder="Filter by type"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => setFilters(prev => ({ ...prev, types: value }))}
            >
              <Option value="puppy_favorited">Puppy Favorited</Option>
              <Option value="message_received">Message Received</Option>
              <Option value="breeder_contacted">Breeder Contacted</Option>
              <Option value="profile_viewed">Profile Viewed</Option>
              <Option value="search_performed">Search Performed</Option>
            </Select>
            
            <Select
              placeholder="Filter by category"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => setFilters(prev => ({ ...prev, categories: value }))}
            >
              <Option value="engagement">Engagement</Option>
              <Option value="communication">Communication</Option>
              <Option value="profile">Profile</Option>
              <Option value="content">Content</Option>
              <Option value="business">Business</Option>
            </Select>
            
            <Select
              placeholder="Filter by read status"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilters(prev => ({ ...prev, read: value }))}
            >
              <Option value={true}>Read</Option>
              <Option value={false}>Unread</Option>
            </Select>
          </Space>
        </Card>
      )}

      {/* Activities List */}
      <Card title="Recent Activity">
        {activities.length === 0 ? (
          <Empty
            description="No activities found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={activities}
            renderItem={(activity) => (
              <List.Item
                style={{
                  backgroundColor: activity.read ? 'transparent' : '#f6ffed',
                  borderLeft: activity.read ? 'none' : '3px solid #52c41a',
                  padding: '12px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (!activity.read) {
                    handleMarkAsRead(activity.id);
                  }
                  onActivityClick?.(activity);
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot={!activity.read}>
                      <Avatar 
                        icon={getActivityIcon(activity.type)}
                        size="small"
                        style={{ 
                          backgroundColor: getActivityColor(activity.category),
                          border: `2px solid ${getPriorityColor(activity.priority)}`
                        }}
                      />
                    </Badge>
                  }
                  title={
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '4px',
                      width: '100%'
                    }}>
                      <Text 
                        strong={!activity.read} 
                        style={{ 
                          fontSize: '14px',
                          lineHeight: '1.4',
                          wordBreak: 'break-word'
                        }}
                      >
                        {activity.title}
                      </Text>
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '4px',
                        marginTop: '4px'
                      }}>
                        <Tag 
                          color={getActivityColor(activity.category)}
                          style={{ 
                            fontSize: '10px', 
                            padding: '2px 6px',
                            margin: 0,
                            lineHeight: '1.2'
                          }}
                        >
                          {activity.category}
                        </Tag>
                        <Tag 
                          color={getPriorityColor(activity.priority)}
                          style={{ 
                            fontSize: '10px', 
                            padding: '2px 6px',
                            margin: 0,
                            lineHeight: '1.2'
                          }}
                        >
                          {activity.priority}
                        </Tag>
                      </div>
                    </div>
                  }
                  description={
                    <div style={{ marginTop: '8px' }}>
                      <Paragraph 
                        style={{ 
                          margin: 0, 
                          color: activity.read ? '#666' : '#333',
                          fontSize: '13px',
                          lineHeight: '1.4',
                          wordBreak: 'break-word',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {activity.description}
                      </Paragraph>
                      <Text 
                        type="secondary" 
                        style={{ 
                          fontSize: '11px',
                          display: 'block',
                          marginTop: '4px'
                        }}
                      >
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default ActivityFeed;
