'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  Table, 
  Tag, 
  Avatar, 
  Input, 
  Select, 
  Modal, 
  Form, 
  message,
  Spin,
  Empty,
  Popconfirm,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  HomeOutlined,
  TeamOutlined,
  TrophyOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { KennelsResponse, KennelFilter } from '@homeforpup/shared-types';
import useSWR from 'swr';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const KennelsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Build query parameters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append('limit', pageSize.toString());
    params.append('offset', ((currentPage - 1) * pageSize).toString());
    
    if (searchTerm) params.append('search', searchTerm);
    if (statusFilter) params.append('status', statusFilter);
    if (verifiedFilter) params.append('verified', verifiedFilter);
    if (specialtyFilter) params.append('specialty', specialtyFilter);
    if (cityFilter) params.append('city', cityFilter);
    if (stateFilter) params.append('state', stateFilter);
    
    return params.toString();
  };

  const { data, error, isLoading, mutate } = useSWR<KennelsResponse>(
    `/api/kennels?${buildQueryString()}`,
    async (url: string) => {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch kennels');
      }
      return response.json();
    },
    { refreshInterval: 30000 }
  );

  const handleDelete = async (kennelId: string) => {
    try {
      const response = await fetch(`/api/kennels/${kennelId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete kennel');
      }

      message.success('Kennel deleted successfully');
      mutate(); // Refresh the list
    } catch (error) {
      console.error('Error deleting kennel:', error);
      message.error('Failed to delete kennel');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'orange';
      case 'suspended': return 'red';
      case 'pending_approval': return 'blue';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Kennel',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space>
          <Avatar icon={<HomeOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <Text strong>{name}</Text>
            {record.businessName && (
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {record.businessName}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'address',
      key: 'location',
      render: (address: any) => (
        <Space direction="vertical" size="small">
          <Text>{address.city}, {address.state}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {address.country}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => (
        <Space>
          <Tag color={getStatusColor(status)}>{status.replace('_', ' ')}</Tag>
          {record.verified && <Tag color="gold">Verified</Tag>}
        </Space>
      ),
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: any) => (
        <Space direction="vertical" size="small">
          <Text>{capacity.currentDogs}/{capacity.maxDogs} dogs</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {capacity.currentLitters}/{capacity.maxLitters} litters
          </Text>
        </Space>
      ),
    },
    {
      title: 'Specialties',
      dataIndex: 'specialties',
      key: 'specialties',
      render: (specialties: string[]) => (
        <Space wrap>
          {specialties?.slice(0, 2).map((specialty, index) => (
            <Tag key={index} color="blue">{specialty}</Tag>
          ))}
          {specialties && specialties.length > 2 && (
            <Tag color="default">+{specialties.length - 2} more</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              href={`/kennels/${record.id}`}
            />
          </Tooltip>
          <Tooltip title="Edit Kennel">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              href={`/kennels/${record.id}/edit`}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this kennel?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Kennel">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text type="danger">Error loading kennels: {error.message}</Text>
      </div>
    );
  }

  const kennels = data?.kennels || [];
  const total = data?.total || 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            My Kennels
          </Title>
          <Paragraph type="secondary">
            Manage your kennels, dogs, and litters
          </Paragraph>
        </Col>
        <Col>
          <Link href="/kennels/new">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Add New Kennel
            </Button>
          </Link>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search kennels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={() => setCurrentPage(1)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="suspended">Suspended</Option>
              <Option value="pending_approval">Pending Approval</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Verified"
              value={verifiedFilter}
              onChange={setVerifiedFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="true">Verified</Option>
              <Option value="false">Not Verified</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Specialty"
              value={specialtyFilter}
              onChange={setSpecialtyFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="Golden Retriever">Golden Retriever</Option>
              <Option value="Labrador">Labrador</Option>
              <Option value="German Shepherd">German Shepherd</Option>
              <Option value="French Bulldog">French Bulldog</Option>
              <Option value="Poodle">Poodle</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setVerifiedFilter('');
                setSpecialtyFilter('');
                setCityFilter('');
                setStateFilter('');
                setCurrentPage(1);
              }}
              icon={<FilterOutlined />}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Kennels Table */}
      <Card>
        {kennels.length === 0 ? (
          <Empty
            description="No kennels found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Link href="/kennels/new">
              <Button type="primary" icon={<PlusOutlined />}>
                Create Your First Kennel
              </Button>
            </Link>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={kennels}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} kennels`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size || 10);
              },
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default KennelsPage;
