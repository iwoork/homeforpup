'use client';

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Tag,
  Table,
  Input,
  Select,
  Empty,
  Spin,
  Statistic,
  App
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  HeartOutlined,
  TeamOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import useSWR from 'swr';
import type { Litter, LittersResponse } from '@homeforpup/shared-types/kennel';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const statusColors: Record<string, string> = {
  expected: 'blue',
  born: 'cyan',
  weaned: 'orange',
  ready_for_homes: 'green',
  sold: 'purple',
  completed: 'default',
};

const statusLabels: Record<string, string> = {
  expected: 'Expected',
  born: 'Born',
  weaned: 'Weaned',
  ready_for_homes: 'Ready for Homes',
  sold: 'Sold',
  completed: 'Completed',
};

const LittersPage: React.FC = () => {
  const { message, modal } = App.useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [kennelFilter, setKennelFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append('limit', pageSize.toString());
    params.append('offset', ((currentPage - 1) * pageSize).toString());
    if (searchTerm) params.append('search', searchTerm);
    if (kennelFilter) params.append('kennelId', kennelFilter);
    if (statusFilter) params.append('status', statusFilter);
    return params.toString();
  };

  const { data, error, isLoading, mutate } = useSWR<LittersResponse>(
    `/api/litters?${buildQueryString()}`,
    async (url: string) => {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch litters');
      }
      return response.json();
    },
    { refreshInterval: 30000 }
  );

  const { data: kennelsData } = useSWR(
    '/api/kennels',
    async (url: string) => {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch kennels');
      }
      return response.json();
    }
  );

  const handleDeleteLitter = async (litterId: string) => {
    modal.confirm({
      title: 'Are you sure you want to delete this litter?',
      content: 'This action cannot be undone. Litters with puppies cannot be deleted.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          const response = await fetch(`/api/litters/${litterId}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete litter');
          }

          message.success('Litter deleted successfully');
          mutate();
        } catch (err) {
          console.error('Error deleting litter:', err);
          message.error(err instanceof Error ? err.message : 'Failed to delete litter');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Litter) => (
        <Link href={`/litters/${record.id}`} style={{ fontWeight: 500 }}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Parents',
      key: 'parents',
      render: (_: unknown, record: Litter) => (
        <Text>{record.sireName} &times; {record.damName}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>
          {statusLabels[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Puppies',
      key: 'puppies',
      render: (_: unknown, record: Litter) => (
        <Text>
          {record.actualPuppyCount}/{record.expectedPuppyCount ?? '—'}
        </Text>
      ),
    },
    {
      title: 'Birth Date',
      dataIndex: 'birthDate',
      key: 'birthDate',
      render: (date: string) => date ? dayjs(date).format('MMM DD, YYYY') : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Litter) => (
        <Space size="small">
          <Link href={`/litters/${record.id}`}>
            <Button type="text" icon={<EyeOutlined />} size="small">
              View
            </Button>
          </Link>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteLitter(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const litters = data?.litters || [];
  const activeStatuses = ['expected', 'born', 'weaned', 'ready_for_homes'];
  const stats = {
    total: data?.total || 0,
    active: litters.filter(l => activeStatuses.includes(l.status)).length,
    completed: litters.filter(l => l.status === 'completed').length,
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>Litters Management</Title>
          <Text type="secondary">Manage your breeding litters</Text>
        </Col>
        <Col>
          <Link href="/litters/new">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Create Litter
            </Button>
          </Link>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={8} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Litters"
              value={stats.total}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={8} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active"
              value={stats.active}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={8} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by name, sire, or dam..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by kennel"
              value={kennelFilter || undefined}
              onChange={(val) => {
                setKennelFilter(val || '');
                setCurrentPage(1);
              }}
              style={{ width: '100%' }}
              allowClear
            >
              {kennelsData?.kennels?.map((kennel: { id: string; name: string }) => (
                <Option key={kennel.id} value={kennel.id}>
                  {kennel.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by status"
              value={statusFilter || undefined}
              onChange={(val) => {
                setStatusFilter(val || '');
                setCurrentPage(1);
              }}
              style={{ width: '100%' }}
              allowClear
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <Option key={value} value={value}>
                  {label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Litters Table */}
      <Card>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary">Loading litters...</Text>
            </div>
          </div>
        ) : error ? (
          <Empty
            description="Failed to load litters. Please try again."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button onClick={() => mutate()}>Retry</Button>
          </Empty>
        ) : litters.length === 0 && !searchTerm && !kennelFilter && !statusFilter ? (
          <Empty
            description="No litters found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Link href="/litters/new">
              <Button type="primary" icon={<PlusOutlined />}>
                Create Litter
              </Button>
            </Link>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={litters}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: data?.total || 0,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size || 10);
              },
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} litters`,
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default LittersPage;
