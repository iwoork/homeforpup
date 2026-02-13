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
  Modal,
  Form,
  Statistic,
  App
} from 'antd';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  HeartOutlined,
  TeamOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { AddEditDogForm, useDogColors, useAllBreeds } from '@homeforpup/shared-dogs';
import Link from 'next/link';
import useSWR from 'swr';
import type { Dog } from '@homeforpup/shared-types';
import { formatAge } from '@/lib/utils/ageDisplay';
import BreedSelector from '@/components/forms/BreedSelector';

const { Title, Text } = Typography;
const { Option } = Select;

interface DogsResponse {
  dogs: Dog[];
  total: number;
}

const DogsPage: React.FC = () => {
  const { message, modal } = App.useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [breedFilter, setBreedFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [addDogVisible, setAddDogVisible] = useState(false);
  const [editDogVisible, setEditDogVisible] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [addDogForm] = Form.useForm();
  const [editDogForm] = Form.useForm();
  const { colors, loading: colorsLoading, error: colorsError } = useDogColors();
  const { breeds, loading: breedsLoading, error: breedsError } = useAllBreeds();

  // Build query parameters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append('limit', pageSize.toString());
    params.append('offset', ((currentPage - 1) * pageSize).toString());
    
    if (searchTerm) params.append('search', searchTerm);
    if (typeFilter) params.append('type', typeFilter);
    if (statusFilter) params.append('status', statusFilter);
    if (breedFilter) params.append('breed', breedFilter);
    if (genderFilter) params.append('gender', genderFilter);
    
    return params.toString();
  };

  const { data, error, isLoading, mutate } = useSWR<DogsResponse>(
    `/api/dogs?${buildQueryString()}`,
    async (url: string) => {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch dogs');
      }
      return response.json();
    },
    { refreshInterval: 30000 }
  );

  // Fetch kennels for the dropdown
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

  const handleAddDog = async (values: any) => {
    try {
      const response = await fetch('/api/dogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create dog');
      }

      message.success('Dog added successfully!');
      setAddDogVisible(false);
      addDogForm.resetFields();
      mutate();
    } catch (error) {
      console.error('Error adding dog:', error);
      message.error('Failed to add dog');
    }
  };

  const handleEditDog = (dog: Dog) => {
    setEditingDog(dog);
    setEditDogVisible(true);
  };

  const handleUpdateDog = async (values: any) => {
    if (!editingDog) return;

    try {
      const response = await fetch(`/api/dogs/${editingDog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update dog');
      }

      message.success('Dog updated successfully!');
      setEditDogVisible(false);
      setEditingDog(null);
      editDogForm.resetFields();
      mutate();
    } catch (error) {
      console.error('Error updating dog:', error);
      message.error('Failed to update dog');
    }
  };

  const handleDeleteDog = async (dogId: string) => {
    modal.confirm({
      title: 'Are you sure you want to delete this dog?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          const response = await fetch(`/api/dogs/${dogId}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to delete dog');
          }

          message.success('Dog deleted successfully');
          mutate();
        } catch (error) {
          console.error('Error deleting dog:', error);
          message.error('Failed to delete dog');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Dog) => (
        <Link href={`/dogs/${record.id}`} style={{ fontWeight: 500, color: '#1890ff' }}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Breed',
      dataIndex: 'breed',
      key: 'breed',
    },
    {
      title: 'Type',
      dataIndex: 'dogType',
      key: 'dogType',
      render: (dogType: string) => {
        const colors: { [key: string]: string } = {
          parent: 'blue',
          puppy: 'green',
        };
        return <Tag color={colors[dogType] || 'default'}>{dogType}</Tag>;
      },
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => (
        <Tag color={gender === 'male' ? 'blue' : 'pink'}>{gender}</Tag>
      ),
    },
    {
      title: 'Age',
      dataIndex: 'birthDate',
      key: 'age',
      render: (birthDate: string) => {
        if (!birthDate) return '-';
        return formatAge(birthDate);
      },
    },
    {
      title: 'Kennel',
      dataIndex: 'kennelId',
      key: 'kennelId',
      render: (kennelId: string) => {
        if (!kennelId) return <Text type="secondary">No kennel</Text>;
        return (
          <Link href={`/kennels/${kennelId}`}>
            <Button type="link" size="small">View Kennel</Button>
          </Link>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Dog) => (
        <Space size="small">
          <Link href={`/dogs/${record.id}`}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
            >
              View
            </Button>
          </Link>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditDog(record)}
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteDog(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const stats = data ? {
    total: data.dogs.length,
    parents: data.dogs.filter(d => d.dogType === 'parent').length,
    puppies: data.dogs.filter(d => d.dogType === 'puppy').length,
  } : { total: 0, parents: 0, puppies: 0 };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>Dogs Management</Title>
          <Text type="secondary">Manage your breeding dogs and puppies</Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setAddDogVisible(true)}
          >
            Add Dog
          </Button>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={8} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Dogs"
              value={stats.total}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={8} sm={12} md={6}>
          <Card>
            <Statistic
              title="Parents"
              value={stats.parents}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={8} sm={12} md={6}>
          <Card>
            <Statistic
              title="Puppies"
              value={stats.puppies}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search by name..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by type"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="parent">Parent</Option>
              <Option value="puppy">Puppy</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by gender"
              value={genderFilter}
              onChange={setGenderFilter}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Filter by breed..."
              value={breedFilter}
              onChange={(e) => setBreedFilter(e.target.value)}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      {/* Dogs Table */}
      <Card>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary">Loading dogs...</Text>
            </div>
          </div>
        ) : error ? (
          <Empty
            description="Failed to load dogs. Please try again."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button onClick={() => mutate()}>Retry</Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={data?.dogs || []}
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
              showTotal: (total) => `Total ${total} dogs`,
            }}
          />
        )}
      </Card>

      {/* Add Dog Modal */}
      <Modal
        title="Add New Dog"
        open={addDogVisible}
        onCancel={() => {
          setAddDogVisible(false);
          addDogForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <AddEditDogForm
          form={addDogForm}
          onFinish={handleAddDog}
          onCancel={() => {
            setAddDogVisible(false);
            addDogForm.resetFields();
          }}
          mode="add"
          kennels={kennelsData?.kennels}
          colors={colors}
          colorsLoading={colorsLoading}
          colorsError={colorsError}
          breeds={breeds}
          breedsLoading={breedsLoading}
          breedsError={breedsError}
          layout="detailed"
          showAdvancedFields={true}
        />
      </Modal>

      {/* Edit Dog Modal */}
      <Modal
        title="Edit Dog"
        open={editDogVisible}
        onCancel={() => {
          setEditDogVisible(false);
          setEditingDog(null);
          editDogForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <AddEditDogForm
          form={editDogForm}
          onFinish={handleUpdateDog}
          onCancel={() => {
            setEditDogVisible(false);
            setEditingDog(null);
            editDogForm.resetFields();
          }}
          mode="edit"
          initialValues={editingDog || undefined}
          colors={colors}
          colorsLoading={colorsLoading}
          colorsError={colorsError}
          breeds={breeds}
          breedsLoading={breedsLoading}
          breedsError={breedsError}
          layout="detailed"
          showAdvancedFields={true}
        />
      </Modal>
    </div>
  );
};

export default DogsPage;
