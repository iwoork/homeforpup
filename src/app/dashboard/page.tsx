// page.tsx (Updated Dashboard with SWR)
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Statistic, 
  List, 
  Spin, 
  Dropdown, 
  Avatar,
  Tag,
  Space,
  Modal
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined, 
  HeartOutlined, 
  StarOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/hooks/useDogs';
import { Litter, Dog } from '@/types';
import AddDogForm from '@/components/AddDogForm';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { confirm } = Modal;

const cardStyle: React.CSSProperties = {
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  height: '100%',
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { dogs, isLoading: dogsLoading, deleteDog, refreshDogs } = useDogs();
  const [litters, setLitters] = useState<Litter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dogFormVisible, setDogFormVisible] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      // For now, just set empty litters since DynamoDB tables aren't ready
      console.log('Skipping litters data fetch - DynamoDB tables not ready');
      setLitters([]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const handleAddDog = () => {
    setEditingDog(null);
    setDogFormVisible(true);
  };

  const handleEditDog = (dog: Dog) => {
    setEditingDog(dog);
    setDogFormVisible(true);
  };

  const handleDeleteDog = (dog: Dog) => {
    confirm({
      title: 'Delete Dog',
      content: (
        <div>
          <p>Are you sure you want to delete <strong>{dog.name}</strong>?</p>
          <p style={{ color: '#ff4d4f', fontSize: '12px' }}>
            This action cannot be undone and will also delete the dog&apos;s photo.
          </p>
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteDog(dog.id),
    });
  };

  const handleDogFormSuccess = () => {
    refreshDogs();
  };

  const getBreedingStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'retired':
        return 'default';
      case 'not_ready':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'green';
      case 'good':
        return 'blue';
      case 'fair':
        return 'orange';
      case 'poor':
        return 'red';
      default:
        return 'default';
    }
  };

  const getDogMenuItems = (dog: Dog) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit Dog',
      onClick: () => handleEditDog(dog),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete Dog',
      danger: true,
      onClick: () => handleDeleteDog(dog),
    },
  ];

  if (loading && !user) {
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

  const activeLitters = litters.filter(l => l.status === 'ready' || l.status === 'expecting');
  const availablePuppies = litters.reduce((sum, litter) => sum + (litter.availablePuppies || 0), 0);
  const breedingDogs = dogs.filter(d => d.breedingStatus === 'available');

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '32px 16px' 
    }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={1} style={{ color: '#08979C', marginBottom: '8px' }}>
          Dashboard
        </Title>
        <Text style={{ color: '#595959', fontSize: '16px' }}>
          Welcome back! Here&apos;s your breeding operation overview.
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
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle} hoverable>
            <Statistic
              title="Active Litters"
              value={activeLitters.length}
              prefix={<StarOutlined style={{ color: '#FA8072' }} />}
              valueStyle={{ color: '#FA8072' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle} hoverable>
            <Statistic
              title="Breeding Dogs"
              value={breedingDogs.length}
              prefix={<HeartOutlined style={{ color: '#08979C' }} />}
              valueStyle={{ color: '#08979C' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle} hoverable>
            <Statistic
              title="Total Dogs"
              value={dogs.length}
              prefix={<UserOutlined style={{ color: '#FA8072' }} />}
              valueStyle={{ color: '#FA8072' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle} hoverable>
            <Statistic
              title="Available Puppies"
              value={availablePuppies}
              prefix={<PlusOutlined style={{ color: '#08979C' }} />}
              valueStyle={{ color: '#08979C' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Litters */}
        <Col xs={24} lg={12}>
          <Card 
            title="Recent Litters" 
            style={{ ...cardStyle, height: '450px' }}
            extra={
              <Link href="/dashboard/litters/new">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  style={{ background: '#FA8072', borderColor: '#FA8072' }}
                >
                  Add Litter
                </Button>
              </Link>
            }
          >
            <List
              dataSource={litters.slice(0, 5)}
              loading={loading}
              locale={{ emptyText: 'No litters yet. Add your first litter to get started!' }}
              renderItem={(litter, index) => (
                <List.Item key={`litter-${litter.id || index}`}>
                  <List.Item.Meta
                    title={`${litter.breed} Litter`}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">
                          <CalendarOutlined /> Expected: {litter.expectedDate}
                        </Text>
                        <Tag color="blue">{litter.status}</Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* My Dogs */}
        <Col xs={24} lg={12}>
          <Card 
            title={`My Dogs (${dogs.length})`}
            style={{ ...cardStyle, height: '450px' }}
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddDog}
                style={{ background: '#08979C', borderColor: '#08979C' }}
              >
                Add Dog
              </Button>
            }
          >
            <div style={{ height: '350px', overflowY: 'auto' }}>
              <List
                dataSource={dogs.slice(0, 10)}
                loading={dogsLoading}
                locale={{ emptyText: 'No dogs yet. Add your first dog to get started!' }}
                renderItem={(dog) => (
                  <List.Item
                    key={dog.id}
                    actions={[
                      <Dropdown
                        key="more"
                        menu={{ items: getDogMenuItems(dog) }}
                        trigger={['click']}
                      >
                        <Button 
                          type="text" 
                          icon={<MoreOutlined />} 
                          size="small"
                        />
                      </Dropdown>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          src={dog.photoUrl} 
                          icon={<UserOutlined />}
                          size="large"
                        />
                      }
                      title={
                        <Space>
                          <strong>{dog.name}</strong>
                          <Tag color={getBreedingStatusColor(dog.breedingStatus)}>
                            {dog.breedingStatus.replace('_', ' ')}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Text type="secondary">
                            {dog.breed} • {dog.gender} • {dog.weight ? `${dog.weight} lbs` : 'Weight not specified'}
                          </Text>
                          <Space>
                            <Tag color={getHealthStatusColor(dog.healthStatus)}>
                              {dog.healthStatus} health
                            </Tag>
                            {dog.birthDate && (
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Born {dayjs(dog.birthDate).format('MMM DD, YYYY')}
                              </Text>
                            )}
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card 
        title="Quick Actions" 
        style={{ ...cardStyle, marginTop: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Link href="/dashboard/litters/new">
              <Button 
                type="dashed" 
                size="large" 
                block 
                icon={<PlusOutlined />}
                style={{ 
                  color: '#FA8072', 
                  borderColor: '#FA8072',
                  height: '60px'
                }}
              >
                <div>
                  <div>Add New Litter</div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Track breeding and puppies
                  </Text>
                </div>
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={8}>
            <Button 
              type="dashed" 
              size="large" 
              block 
              icon={<PlusOutlined />}
              onClick={handleAddDog}
              style={{ 
                color: '#08979C', 
                borderColor: '#08979C',
                height: '60px'
              }}
            >
              <div>
                <div>Add Parent Dog</div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Register breeding dogs
                </Text>
              </div>
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Link href="/dashboard/profile">
              <Button 
                type="dashed" 
                size="large" 
                block 
                icon={<EyeOutlined />}
                style={{ 
                  color: '#FA8072', 
                  borderColor: '#FA8072',
                  height: '60px'
                }}
              >
                <div>
                  <div>Update Profile</div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Manage your information
                  </Text>
                </div>
              </Button>
            </Link>
          </Col>
        </Row>
      </Card>

      {/* AddDogForm Modal */}
      <AddDogForm
        visible={dogFormVisible}
        onClose={() => setDogFormVisible(false)}
        dog={editingDog}
        onSuccess={handleDogFormSuccess}
      />
    </div>
  );
};

export default DashboardPage;