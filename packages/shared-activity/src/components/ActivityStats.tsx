'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Progress, Tag, Space } from 'antd';
import { 
  HeartOutlined, 
  MessageOutlined, 
  EyeOutlined, 
  UserOutlined,
  SearchOutlined,
  TeamOutlined,
  TrophyOutlined,
  SettingOutlined,
  BellOutlined,
  StarOutlined,
  PlusOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { ActivityStats as ActivityStatsType, ActivityType, ActivityCategory } from '@homeforpup/shared-types';

const { Title, Text } = Typography;

interface ActivityStatsProps {
  userId: string;
  userType: 'dog-parent' | 'breeder';
  period?: 'day' | 'week' | 'month' | 'year';
  onStatsChange?: (stats: ActivityStatsType) => void;
}

const ActivityStats: React.FC<ActivityStatsProps> = ({
  userId,
  userType,
  period = 'week',
  onStatsChange
}) => {
  const [stats, setStats] = useState<ActivityStatsType>({
    total: 0,
    unread: 0,
    byType: {} as Record<ActivityType, number>,
    byCategory: {} as Record<ActivityCategory, number>,
    byPriority: { low: 0, medium: 0, high: 0 },
    recent: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [userId, period]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/activities/stats?period=${period}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activity stats');
      }

      const data = await response.json();
      setStats(data);
      onStatsChange?.(data);
    } catch (error) {
      console.error('Error fetching activity stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: ActivityCategory) => {
    const iconMap: Record<ActivityCategory, React.ReactNode> = {
      engagement: <HeartOutlined />,
      communication: <MessageOutlined />,
      profile: <UserOutlined />,
      content: <EditOutlined />,
      business: <TeamOutlined />,
      system: <SettingOutlined />,
      security: <ExclamationCircleOutlined />,
      marketing: <TrophyOutlined />
    };
    return iconMap[category] || <BellOutlined />;
  };

  const getCategoryColor = (category: ActivityCategory) => {
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

  const getTopActivities = () => {
    return Object.entries(stats.byType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type: type as ActivityType, count }));
  };

  const getTopCategories = () => {
    return Object.entries(stats.byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category: category as ActivityCategory, count }));
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Loading stats...</div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Overview Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Activities"
              value={stats.total}
              prefix={<BellOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Unread"
              value={stats.unread}
              prefix={<ExclamationCircleOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="High Priority"
              value={stats.byPriority.high}
              prefix={<StarOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="This {period}"
              value={stats.total}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Top Activity Types */}
        <Col xs={24} lg={12}>
          <Card title="Top Activity Types" size="small">
            {getTopActivities().map(({ type, count }, index) => (
              <div key={type} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <Text strong>#{index + 1}</Text>
                    <Text>{type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
                  </Space>
                  <Text strong>{count}</Text>
                </div>
                <Progress 
                  percent={(count / stats.total) * 100} 
                  showInfo={false}
                  strokeColor="#1890ff"
                  size="small"
                />
              </div>
            ))}
          </Card>
        </Col>

        {/* Top Categories */}
        <Col xs={24} lg={12}>
          <Card title="Top Categories" size="small">
            {getTopCategories().map(({ category, count }, index) => (
              <div key={category} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <Text strong>#{index + 1}</Text>
                    <Tag 
                      color={getCategoryColor(category)}
                      icon={getCategoryIcon(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Tag>
                  </Space>
                  <Text strong>{count}</Text>
                </div>
                <Progress 
                  percent={(count / stats.total) * 100} 
                  showInfo={false}
                  strokeColor={getCategoryColor(category)}
                  size="small"
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* Priority Distribution */}
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="Priority Distribution" size="small">
            <Row gutter={[16, 16]}>
              <Col xs={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }}>
                    {stats.byPriority.low}
                  </div>
                  <Text type="secondary">Low Priority</Text>
                  <Progress 
                    percent={(stats.byPriority.low / stats.total) * 100} 
                    showInfo={false}
                    strokeColor="#52c41a"
                    size="small"
                  />
                </div>
              </Col>
              <Col xs={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', color: '#fa8c16', marginBottom: '8px' }}>
                    {stats.byPriority.medium}
                  </div>
                  <Text type="secondary">Medium Priority</Text>
                  <Progress 
                    percent={(stats.byPriority.medium / stats.total) * 100} 
                    showInfo={false}
                    strokeColor="#fa8c16"
                    size="small"
                  />
                </div>
              </Col>
              <Col xs={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', color: '#f5222d', marginBottom: '8px' }}>
                    {stats.byPriority.high}
                  </div>
                  <Text type="secondary">High Priority</Text>
                  <Progress 
                    percent={(stats.byPriority.high / stats.total) * 100} 
                    showInfo={false}
                    strokeColor="#f5222d"
                    size="small"
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ActivityStats;
