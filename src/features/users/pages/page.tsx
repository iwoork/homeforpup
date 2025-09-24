'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Card, Row, Col, Input, Select, List, Avatar, Tag, Button, Space, Spin, Alert, Switch } from 'antd';
import Link from 'next/link';
import useSWR from 'swr';
import { useAuth } from '@/hooks';

const { Search } = Input;

interface BasicUser {
  userId: string;
  name: string;
  displayName?: string;
  email?: string;
  location?: string;
  userType: 'breeder' | 'adopter' | 'both';
  profileImage?: string;
}

interface UsersResponse {
  users: BasicUser[];
  total: number;
  hasMore: boolean;
  nextKey?: string | null;
}

const makeFetcher = (token: string | null) => async (url: string): Promise<UsersResponse> => {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
};

export default function UsersIndexPage() {
  const { getToken } = useAuth();
  const [type, setType] = useState<'all' | 'breeder' | 'adopter' | 'both'>('all');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  // Get token asynchronously
  useEffect(() => {
    const fetchToken = async () => {
      const tokenValue = await getToken();
      setToken(tokenValue);
    };
    fetchToken();
  }, [getToken]);
  
  const url = useMemo(() => {
    const params = new URLSearchParams();
    if (type !== 'all') params.set('userType', type);
    if (query.trim()) params.set('search', query.trim());
    if (location.trim()) params.set('location', location.trim());
    params.set('limit', '50');
    return `/api/users/available?${params.toString()}`;
  }, [type, query, location]);

  const { data, error, isLoading } = useSWR<UsersResponse>(
    token ? url : null,
    makeFetcher(token || null),
    { revalidateOnFocus: false }
  );

  const [items, setItems] = useState<BasicUser[]>([]);
  const [nextKey, setNextKey] = useState<string | null | undefined>(null);

  React.useEffect(() => {
    if (data) {
      // Reset list on new query
      setItems(data.users);
      setNextKey(data.nextKey);
    }
  }, [data]);

  const users = (items || []).filter(u => {
    const matchesType = type === 'all' ? true : u.userType === type;
    const q = query.trim().toLowerCase();
    const matchesQuery = q.length === 0 ||
      u.name.toLowerCase().includes(q) ||
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.location || '').toLowerCase().includes(q);
    const matchesVerified = verifiedOnly ? (u as any).verified === true : true;
    return matchesType && matchesQuery && matchesVerified;
  });

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12}>
            <Search placeholder="Search users..." allowClear onSearch={setQuery} onChange={e => setQuery(e.target.value)} />
          </Col>
          <Col xs={24} sm={12}>
            <Select value={type} onChange={setType} style={{ width: '100%' }}>
              <Select.Option value="all">All</Select.Option>
              <Select.Option value="adopter">Adopters</Select.Option>
              <Select.Option value="breeder">Breeders</Select.Option>
              <Select.Option value="both">Both</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12}>
            <Input placeholder="Location" allowClear value={location} onChange={(e) => setLocation(e.target.value)} />
          </Col>
          <Col xs={24} sm={12}>
            <Space>
              <span>Verified only</span>
              <Switch checked={verifiedOnly} onChange={setVerifiedOnly} />
            </Space>
          </Col>
        </Row>
      </Card>

      {!token && (
        <Alert type="warning" showIcon message="Please log in to view users." style={{ marginBottom: 16 }} />
      )}

      {error && token && (
        <Alert type="error" showIcon message="Failed to load users" style={{ marginBottom: 16 }} />
      )}

      <Card>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : (
          <List
            dataSource={users}
            locale={{ emptyText: 'No users found' }}
            renderItem={(u) => (
              <List.Item key={u.userId}
                actions={[
                  <Link key="view" href={`/users/${u.userId}`}>
                    <Button type="link">View</Button>
                  </Link>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={u.profileImage} />}
                  title={
                    <Space>
                      <Link href={`/users/${u.userId}`}><strong>{u.displayName || u.name}</strong></Link>
                      <Tag color={u.userType === 'breeder' ? 'green' : u.userType === 'adopter' ? 'blue' : 'purple'}>
                        {u.userType}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={2}>
                      {u.email && <span>{u.email}</span>}
                      {u.location && <span style={{ color: '#666' }}>{u.location}</span>}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {!isLoading && users.length > 0 && nextKey && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Button
            onClick={async () => {
              if (!token) return;
              const moreUrl = `${url}&startKey=${encodeURIComponent(nextKey)}`;
              const res = await makeFetcher(token)(moreUrl);
              setItems(prev => [...prev, ...res.users]);
              setNextKey(res.nextKey);
            }}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}


