'use client';

import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  List, 
  Spin, 
  Avatar,
  Tag,
  Space,
  message,
  Statistic,
  Empty,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined, 
  HeartOutlined, 
  EditOutlined, 
  UserOutlined,
  MessageOutlined,
  TeamOutlined,
  SettingOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useDogs, useAvailablePuppies, useMessages } from '@/hooks';
import { AddDogForm } from '@/components';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { user, refreshAuth } = useAuth();
  const { dogs, isLoading: dogsLoading, error: dogsError } = useDogs();
  const { puppies, isLoading: puppiesLoading, error: puppiesError } = useAvailablePuppies();
  const { threads, unreadCount, loading: messagesLoading } = useMessages({
    userId: user?.userId || '',
    userName: user?.name || '',
    pollingInterval: 30000
  });
  const [addDogModalVisible, setAddDogModalVisible] = useState(false);

  // Force refresh auth state when dashboard mounts
  useEffect(() => {
    console.log('🔄 Dashboard mounted, refreshing auth state...');
    refreshAuth();
  }, [refreshAuth]);

  const isLoading = dogsLoading || puppiesLoading || messagesLoading;
  const error = dogsError || puppiesError;

  if (isLoading) {
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

  const isBreeder = user?.userType === 'breeder' || user?.userType === 'both';
  const isAdopter = user?.userType === 'adopter' || user?.userType === 'both';

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '32px 16px' 
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
          <Title level={1} style={{ color: '#08979C', marginBottom: '8px' }}>
          Welcome back, {user?.name || 'User'}!
          </Title>
          <Text style={{ color: '#595959', fontSize: '16px' }}>
          {isBreeder && isAdopter 
            ? "Manage your breeding program and discover new puppies."
            : isBreeder 
            ? "Manage your breeding program and connect with adopters."
            : "Discover new puppies and connect with breeders."}
          </Text>
      </div>

      {error && (
        <div style={{ 
          background: '#fff2f0', 
          border: '1px solid #ffccc7', 
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '24px',
          color: '#ff4d4f'
        }}>
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {/* Quick Stats */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        {isBreeder && (
        <Col xs={24} sm={12} lg={6}>
            <Card>
            <Statistic
                title="My Dogs"
                value={dogs.length}
                prefix={<TeamOutlined style={{ color: '#08979C' }} />}
                valueStyle={{ color: '#08979C' }}
            />
          </Card>
        </Col>
        )}
        {isBreeder && (
        <Col xs={24} sm={12} lg={6}>
            <Card>
            <Statistic
                title="Active Litters"
                value={dogs.filter(dog => dog.breedingStatus === 'available').length}
                prefix={<HeartOutlined style={{ color: '#FA8072' }} />}
                valueStyle={{ color: '#FA8072' }}
            />
          </Card>
        </Col>
        )}
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Messages"
              value={0}
              prefix={<MessageOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Profile Views"
              value={0}
              prefix={<EyeOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Left Column - Main Content */}
        <Col xs={24} lg={16}>
          {/* Available Puppies (for adopters) */}
          {isAdopter && (
            <Card 
              title={`Available Puppies (${puppies.length})`}
              extra={
                <Link href="/browse">
                  <Button type="link" icon={<ArrowRightOutlined />}>
                    View All
                  </Button>
                </Link>
              }
              style={{ marginBottom: '24px' }}
            >
              {puppies.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No puppies available right now"
                >
                  <Link href="/browse">
                    <Button type="primary" icon={<EyeOutlined />}>
                      Browse All Puppies
                    </Button>
                  </Link>
                </Empty>
              ) : (
                <List
                  dataSource={puppies.slice(0, 6)}
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3 }}
                  renderItem={(puppy) => (
                    <List.Item>
                      <Card
                        hoverable
                        cover={
                          <div style={{ height: '200px', overflow: 'hidden' }}>
                            {puppy.photoUrl ? (
                              <Image
                                alt={puppy.name}
                                src={puppy.photoUrl}
                                fill
                                style={{ 
                                  objectFit: 'cover' 
                                }}
                              />
                            ) : (
                              <div style={{ 
                                height: '100%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                background: '#f5f5f5'
                              }}>
                                <UserOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                              </div>
                            )}
                          </div>
                        }
                        actions={[
                          <Link href={`/dogs/${puppy.id}`} key="view">
                            <Button type="link" icon={<EyeOutlined />}>
                              View Details
                            </Button>
                          </Link>,
                          <Link href={`/breeders/${puppy.breederId}`} key="breeder">
                            <Button type="link" icon={<TeamOutlined />}>
                              View Breeder
                            </Button>
                          </Link>
                        ]}
                      >
                        <Card.Meta
                          title={puppy.name}
                          description={
                            <Space direction="vertical" size="small">
                              <Space>
                                <Tag color="blue">{puppy.breed}</Tag>
                                <Tag color={puppy.gender === 'male' ? 'blue' : 'pink'}>
                                  {puppy.gender}
                                </Tag>
                              </Space>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {puppy.description.length > 100 
                                  ? `${puppy.description.substring(0, 100)}...` 
                                  : puppy.description
                                }
                              </Text>
                            </Space>
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          )}

          {/* My Dogs (for breeders) */}
          {isBreeder && (
            <Card 
              title="My Dogs" 
              extra={
                <Button 
                  type="link" 
                  icon={<ArrowRightOutlined />}
                  onClick={() => setAddDogModalVisible(true)}
                >
                  Add Dog
                </Button>
              }
              style={{ marginBottom: '24px' }}
            >
              {dogs.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No dogs added yet"
                >
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setAddDogModalVisible(true)}
                  >
                    Add Your First Dog
                  </Button>
                </Empty>
              ) : (
                <List
                  dataSource={dogs.slice(0, 3)}
                  renderItem={(dog) => (
                    <List.Item
                      actions={[
                        <Link href={`/dogs/${dog.id}`} key="view">
                          <Button type="link" icon={<EyeOutlined />}>
                            View
                          </Button>
                        </Link>,
                        <Button type="link" icon={<EditOutlined />} key="edit">
                          Edit
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            size={48} 
                            src={dog.photoUrl} 
                            icon={<UserOutlined />}
                          />
                        }
                        title={dog.name}
                        description={
                          <Space>
                            <Tag color="blue">{dog.breed}</Tag>
                            <Tag color={dog.gender === 'male' ? 'blue' : 'pink'}>
                              {dog.gender}
                            </Tag>
                            <Tag color={dog.breedingStatus === 'available' ? 'green' : 'orange'}>
                              {dog.breedingStatus}
                            </Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          )}

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <Row gutter={[16, 16]}>
              {isBreeder && (
                <Col xs={24} sm={12}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    block
                    size="large"
                    onClick={() => setAddDogModalVisible(true)}
                    style={{ height: '60px', fontSize: '16px' }}
                  >
                    Add New Dog
                  </Button>
                </Col>
              )}
              <Col xs={24} sm={12}>
                <Link href="/browse">
                  <Button 
                    icon={<EyeOutlined />} 
                    block
                    size="large"
                    style={{ height: '60px', fontSize: '16px' }}
                  >
                    Browse Puppies
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={12}>
                <Link href="/dashboard/messages">
                  <Button 
                    icon={<MessageOutlined />} 
                    block
                    size="large"
                    style={{ height: '60px', fontSize: '16px' }}
                  >
                    View Messages
                  </Button>
                </Link>
              </Col>
              <Col xs={24} sm={12}>
                <Link href={`/users/${user?.userId}/edit`}>
                  <Button 
                    icon={<SettingOutlined />} 
                    block
                    size="large"
                    style={{ height: '60px', fontSize: '16px' }}
                  >
                    Edit Profile
                  </Button>
                </Link>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Right Column - Sidebar */}
        <Col xs={24} lg={8}>
          {/* Messages (for adopters) */}
          {isAdopter && (
            <Card 
              title={
                <Space>
                  <MessageOutlined />
                  Messages
                  {unreadCount > 0 && (
                    <Badge count={unreadCount} size="small" />
                  )}
                </Space>
              }
              extra={
                <Link href="/dashboard/messages">
                  <Button type="link" size="small">
                    View All
                  </Button>
                </Link>
              }
              style={{ marginBottom: '24px' }}
            >
              {threads.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No messages yet"
                  style={{ padding: '20px 0' }}
                >
                  <Link href="/browse">
                    <Button type="primary" size="small">
                      Start Browsing
                    </Button>
                  </Link>
                </Empty>
              ) : (
                <List
                  dataSource={threads.slice(0, 3)}
                  renderItem={(thread) => (
                    <List.Item
                      style={{ padding: '8px 0' }}
                      actions={[
                        <Link href={`/dashboard/messages?thread=${thread.id}`} key="view">
                          <Button type="link" size="small">
                            View
                          </Button>
                        </Link>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            size={32} 
                            src={thread.participantInfo?.[thread.participants.find(p => p !== user?.userId) || '']?.profileImage}
                            icon={<UserOutlined />}
                          />
                        }
                        title={
                          <Text 
                            strong={(thread.unreadCount[user?.userId || ''] || 0) > 0}
                            style={{ 
                              fontSize: '14px',
                              color: (thread.unreadCount[user?.userId || ''] || 0) > 0 ? '#1890ff' : 'inherit'
                            }}
                          >
                            {thread.participantInfo?.[thread.participants.find(p => p !== user?.userId) || '']?.name || 
                             thread.participantNames?.[thread.participants.find(p => p !== user?.userId) || ''] || 
                             'Unknown'}
                          </Text>
                        }
                        description={
                          <Space direction="vertical" size="small">
                            <Text 
                              type="secondary" 
                              style={{ 
                                fontSize: '12px',
                                fontWeight: (thread.unreadCount[user?.userId || ''] || 0) > 0 ? 'bold' : 'normal'
                              }}
                            >
                              {thread.lastMessage?.content?.substring(0, 50)}...
                            </Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              {thread.lastMessage?.timestamp 
                                ? dayjs(thread.lastMessage.timestamp).fromNow()
                                : 'No messages'
                              }
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          )}

          {/* Profile Summary */}
          <Card title="Profile Summary" style={{ marginBottom: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <Avatar 
                size={64} 
                src={user?.profileImage} 
                icon={<UserOutlined />}
                style={{ marginBottom: '12px' }}
              />
              <Title level={4} style={{ margin: 0 }}>
                {user?.name}
              </Title>
              <Text type="secondary">
                {user?.userType === 'breeder' ? 'Breeder' : 
                 user?.userType === 'adopter' ? 'Adopter' : 'Both'}
              </Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Member since:</Text>
              <br />
              <Text type="secondary">
                {user?.createdAt ? dayjs(user.createdAt).format('MMMM YYYY') : 'Recently joined'}
              </Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Location:</Text>
              <br />
              <Text type="secondary">
                {user?.location || 'Not specified'}
              </Text>
            </div>
            <Link href={`/users/${user?.userId}/edit`}>
              <Button type="primary" block>
                Complete Profile
              </Button>
            </Link>
          </Card>

          {/* Recent Activity */}
          <Card title="Recent Activity">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No recent activity"
              style={{ padding: '20px 0' }}
            />
          </Card>
        </Col>
                  </Row>

      {/* Add Dog Modal */}
      <AddDogForm
        visible={addDogModalVisible}
        onClose={() => setAddDogModalVisible(false)}
        onSuccess={() => {
          setAddDogModalVisible(false);
          message.success('Dog added successfully!');
        }}
      />
    </div>
  );
};

export default Dashboard;