'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, Row, Col, Typography, Button, Statistic, List, Spin } from 'antd';
import { PlusOutlined, EyeOutlined, HeartOutlined, StarOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { dbOperations } from '@/lib/dynamodb';
import { Litter, Dog } from '@/types';

const { Title } = Typography;

const cardStyle: React.CSSProperties = {
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  height: '100%',
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [litters, setLitters] = useState<Litter[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('Skipping dashboard data fetch - DynamoDB tables not ready');
      setLitters([]);
      setDogs([]);
      setLoading(false);
      return;
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
  const totalPuppies = litters.reduce((sum, litter) => sum + (litter.puppyCount || 0), 0);
  const availablePuppies = litters.reduce((sum, litter) => sum + (litter.availablePuppies || 0), 0);
  const breedingDogs = dogs.filter(d => d.breedingStatus === 'available');

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '32px 16px' 
    }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={1} style={{ color: '#08979C' }}>Dashboard</Title>
        <p style={{ color: '#595959', fontSize: '16px' }}>
          Welcome back! Here's your breeding operation overview.
        </p>
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
          <Card style={cardStyle}>
            <Statistic
              title="Active Litters"
              value={activeLitters.length}
              prefix={<StarOutlined style={{ color: '#FA8072' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Breeding Dogs"
              value={breedingDogs.length}
              prefix={<HeartOutlined style={{ color: '#08979C' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Total Puppies"
              value={totalPuppies}
              prefix={<EyeOutlined style={{ color: '#FA8072' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={cardStyle}>
            <Statistic
              title="Available Puppies"
              value={availablePuppies}
              prefix={<PlusOutlined style={{ color: '#08979C' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Litters */}
        <Col xs={24} lg={12}>
          <Card 
            title="Recent Litters" 
            style={{ ...cardStyle, height: '400px' }}
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
              locale={{ emptyText: 'No litters yet' }}
              renderItem={(litter, index) => (
                <List.Item key={`litter-${litter.id || index}`}>
                  <List.Item.Meta
                    title={`${litter.breed} Litter`}
                    description={`Expected: ${litter.expectedDate} • Status: ${litter.status}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Dogs */}
        <Col xs={24} lg={12}>
          <Card 
            title="My Dogs" 
            style={{ ...cardStyle, height: '400px' }}
            extra={
              <Link href="/dashboard/dogs/new">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  style={{ background: '#08979C', borderColor: '#08979C' }}
                >
                  Add Dog
                </Button>
              </Link>
            }
          >
            <List
              dataSource={dogs.slice(0, 5)}
              loading={loading}
              locale={{ emptyText: 'No dogs yet' }}
              renderItem={(dog, index) => (
                <List.Item key={`dog-${dog.id || index}`}>
                  <List.Item.Meta
                    title={dog.name}
                    description={`${dog.breed} • ${dog.gender} • ${dog.breedingStatus}`}
                  />
                </List.Item>
              )}
            />
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
                style={{ color: '#FA8072', borderColor: '#FA8072' }}
              >
                Add New Litter
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={8}>
            <Link href="/dashboard/dogs/new">
              <Button 
                type="dashed" 
                size="large" 
                block 
                icon={<PlusOutlined />}
                style={{ color: '#08979C', borderColor: '#08979C' }}
              >
                Add Parent Dog
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={8}>
            <Link href="/dashboard/profile">
              <Button 
                type="dashed" 
                size="large" 
                block 
                icon={<EyeOutlined />}
                style={{ color: '#FA8072', borderColor: '#FA8072' }}
              >
                Update Profile
              </Button>
            </Link>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default DashboardPage;
