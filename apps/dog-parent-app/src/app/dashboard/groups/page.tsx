'use client';

import React from 'react';
import { Card, Row, Col, Typography, Tag, Spin, Empty, Breadcrumb, Alert, Button } from 'antd';
import { TeamOutlined, CrownOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@homeforpup/shared-auth';
import useSWR from 'swr';

const { Title, Paragraph, Text } = Typography;

interface GroupData {
  id: string;
  name: string;
  description: string;
  groupType: 'litter' | 'custom';
  litterId?: string;
  breederId: string;
  coverPhoto: string;
  createdAt: string;
  createdBy: string;
  memberRole: string;
  memberCount: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

const MyGroupsPage: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  const { data, error, isLoading } = useSWR<{ groups: GroupData[]; count: number }>(
    isAuthenticated && user?.userId ? `/api/groups?userId=${user.userId}` : null,
    fetcher
  );

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f1f5f9',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <Alert
          message="Authentication Required"
          description="Please sign in to view your groups."
          type="warning"
          showIcon
          action={
            <Link href="/auth/login">
              <Button type="primary">Sign In</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <Breadcrumb style={{ marginBottom: '24px' }}>
        <Breadcrumb.Item>
          <Link href="/dashboard">Dashboard</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>My Groups</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2} style={{ marginBottom: '8px' }}>My Groups</Title>
      <Paragraph style={{ marginBottom: '32px', color: '#666' }}>
        Groups you belong to. Click on a group to see posts, milestones, and connect with other members.
      </Paragraph>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <Paragraph style={{ marginTop: '16px' }}>Loading your groups...</Paragraph>
        </div>
      )}

      {error && (
        <Alert
          message="Error"
          description="Failed to load your groups. Please try again later."
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {!isLoading && !error && (!data?.groups || data.groups.length === 0) && (
        <Card style={cardStyle}>
          <Empty
            image={<TeamOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
            imageStyle={{ height: 80 }}
            description={
              <div>
                <Text style={{ fontSize: '16px', color: '#666' }}>No groups yet</Text>
                <Paragraph style={{ marginTop: '8px', color: '#999' }}>
                  When a breeder adds you to a litter group or you join a community group, it will appear here.
                </Paragraph>
              </div>
            }
          />
        </Card>
      )}

      {!isLoading && !error && data?.groups && data.groups.length > 0 && (
        <Row gutter={[24, 24]}>
          {data.groups.map((group) => (
            <Col xs={24} sm={12} lg={8} key={group.id}>
              <Link href={`/groups/${group.id}`} style={{ display: 'block' }}>
                <Card
                  hoverable
                  style={{ ...cardStyle, height: '100%' }}
                  cover={
                    group.coverPhoto ? (
                      <div style={{ position: 'relative', height: '160px', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                        <Image
                          src={group.coverPhoto}
                          alt={group.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        height: '160px',
                        background: 'linear-gradient(135deg, #08979C 0%, #13C2C2 100%)',
                        borderRadius: '12px 12px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <TeamOutlined style={{ fontSize: '48px', color: '#fff' }} />
                      </div>
                    )
                  }
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <Title level={4} style={{ margin: 0, flex: 1 }} ellipsis>
                      {group.name}
                    </Title>
                    <Tag color={group.groupType === 'litter' ? 'blue' : 'default'} style={{ marginLeft: '8px' }}>
                      {group.groupType === 'litter' ? 'Litter' : 'Custom'}
                    </Tag>
                  </div>
                  {group.description && (
                    <Paragraph
                      style={{ color: '#666', marginBottom: '12px' }}
                      ellipsis={{ rows: 2 }}
                    >
                      {group.description}
                    </Paragraph>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#999' }}>
                    <span>
                      <TeamOutlined style={{ marginRight: '4px' }} />
                      {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                    </span>
                    {group.memberRole === 'admin' && (
                      <Tag icon={<CrownOutlined />} color="gold" style={{ margin: 0 }}>
                        Admin
                      </Tag>
                    )}
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default MyGroupsPage;
