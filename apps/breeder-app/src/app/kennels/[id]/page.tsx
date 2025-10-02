'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  Tag, 
  Avatar, 
  Statistic, 
  Tabs, 
  Table, 
  Empty,
  Spin,
  message,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Divider
} from 'antd';
import { 
  HomeOutlined, 
  EnvironmentOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  GlobalOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
  TrophyOutlined,
  HeartOutlined,
  EyeOutlined,
  CalendarOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { AddEditDogForm } from '@homeforpup/shared-components';
import { useDogColors } from '@homeforpup/shared-hooks';
import { useAllBreeds } from '@homeforpup/shared-breeds';
import Link from 'next/link';
import BreedSelector from '@/components/forms/BreedSelector';
import { ColorSelector } from '@homeforpup/shared-components';
import { PhotoUpload, setS3Operations } from '@homeforpup/shared-photo-upload';
import { s3Operations } from '@/lib/api/s3';
import { useParams } from 'next/navigation';
import { KennelResponse } from '@homeforpup/shared-types';
import useSWR from 'swr';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const KennelDetailPage: React.FC = () => {
  const params = useParams();
  const kennelId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');

  // Configure S3 operations for shared photo upload
  React.useEffect(() => {
    setS3Operations(s3Operations);
  }, []);
  const [addDogVisible, setAddDogVisible] = useState(false);
  const [addLitterVisible, setAddLitterVisible] = useState(false);
  const [editDogVisible, setEditDogVisible] = useState(false);
  const [editLitterVisible, setEditLitterVisible] = useState(false);
  const [editingDog, setEditingDog] = useState<any>(null);
  const [editingLitter, setEditingLitter] = useState<any>(null);
  const { colors, loading: colorsLoading, error: colorsError } = useDogColors();
  const { breeds, loading: breedsLoading, error: breedsError } = useAllBreeds();
  const [selectedPuppies, setSelectedPuppies] = useState<any[]>([]);
  const [addPuppyVisible, setAddPuppyVisible] = useState(false);
  const [dogForm] = Form.useForm();
  const [litterForm] = Form.useForm();
  const [editDogForm] = Form.useForm();
  const [editLitterForm] = Form.useForm();
  const [addPuppyForm] = Form.useForm();
  const [editDogPhotos, setEditDogPhotos] = useState<string[]>([]);
  const photosRef = useRef<string[]>([]);

  const { data, error, isLoading, mutate } = useSWR<KennelResponse>(
    `/api/kennels/${kennelId}`,
    async (url: string) => {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch kennel details');
      }
      return response.json();
    }
  );

  const handleAddDog = async (values: any) => {
    try {
      const response = await fetch('/api/dogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...values,
          kennelId: kennelId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add dog');
      }

      message.success('Dog added successfully!');
      setAddDogVisible(false);
      dogForm.resetFields();
      mutate();
    } catch (error) {
      console.error('Error adding dog:', error);
      message.error('Failed to add dog');
    }
  };

  const handleAddLitter = async (values: any) => {
    try {
      const response = await fetch('/api/litters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...values,
          kennelId: kennelId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add litter');
      }

      message.success('Litter added successfully!');
      setAddLitterVisible(false);
      litterForm.resetFields();
      mutate();
    } catch (error) {
      console.error('Error adding litter:', error);
      message.error('Failed to add litter');
    }
  };

  const handleEditDog = (dog: any) => {
    setEditingDog(dog);
    const existingPhotos = dog.photos || [];
    setEditDogPhotos(existingPhotos);
    photosRef.current = existingPhotos;
    editDogForm.setFieldsValue({
      name: dog.name,
      callName: dog.callName,
      breed: dog.breed,
      gender: dog.gender,
      birthDate: dog.birthDate,
      dogType: dog.dogType,
      color: dog.color,
      markings: dog.markings,
      weight: dog.weight,
      height: dog.height,
      eyeColor: dog.eyeColor,
      temperament: dog.temperament,
      specialNeeds: dog.specialNeeds,
      notes: dog.notes,
      photos: existingPhotos,
    });
    setEditDogVisible(true);
  };

  const handleUpdateDog = async (values: any) => {
    if (!editingDog) return;
    
    
    try {
      const response = await fetch(`/api/dogs/${editingDog.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...values,
          photos: photosRef.current,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update dog');
      }

      message.success('Dog updated successfully!');
      setEditDogVisible(false);
      setEditingDog(null);
      editDogForm.resetFields();
      setEditDogPhotos([]);
      mutate();
    } catch (error) {
      console.error('Error updating dog:', error);
      message.error('Failed to update dog');
    }
  };

  const handleEditLitter = (litter: any) => {
    setEditingLitter(litter);
    setSelectedPuppies(litter.puppies || []);
    editLitterForm.setFieldsValue({
      name: litter.name,
      expectedPuppyCount: litter.expectedPuppyCount,
      actualPuppyCount: litter.actualPuppyCount,
      status: litter.status,
      birthDate: litter.birthDate,
      notes: litter.notes,
      specialInstructions: litter.specialInstructions,
    });
    setEditLitterVisible(true);
  };

  const handleUpdateLitter = async (values: any) => {
    if (!editingLitter) return;
    
    try {
      const updateData = {
        ...values,
        puppies: selectedPuppies,
        actualPuppyCount: selectedPuppies.length,
      };

      const response = await fetch(`/api/litters/${editingLitter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update litter');
      }

      message.success('Litter updated successfully!');
      setEditLitterVisible(false);
      setEditingLitter(null);
      setSelectedPuppies([]);
      editLitterForm.resetFields();
      mutate();
    } catch (error) {
      console.error('Error updating litter:', error);
      message.error('Failed to update litter');
    }
  };

  const handleAddPuppy = (puppy: any) => {
    setSelectedPuppies([...selectedPuppies, puppy]);
  };

  const handleRemovePuppy = (puppyId: string) => {
    setSelectedPuppies(selectedPuppies.filter(p => p.id !== puppyId));
  };

  const handleCreatePuppy = async (values: any) => {
    try {
      const response = await fetch('/api/dogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...values,
          kennelId: kennelId,
          type: 'puppy',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create puppy');
      }

      const result = await response.json();
      const newPuppy = {
        id: result.dog.id,
        name: result.dog.name,
        gender: result.dog.gender,
        color: result.dog.color,
        markings: result.dog.markings,
        weight: result.dog.weight,
        status: 'available',
        notes: result.dog.notes,
      };

      handleAddPuppy(newPuppy);
      setAddPuppyVisible(false);
      addPuppyForm.resetFields();
      message.success('Puppy created and added to litter!');
      mutate();
    } catch (error) {
      console.error('Error creating puppy:', error);
      message.error('Failed to create puppy');
    }
  };

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

  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text type="danger">Error loading kennel: {error?.message}</Text>
      </div>
    );
  }

  const { kennel, dogs, litters, stats } = data;
  
  // Debug: Log specialties value to understand the issue
  console.log('Kennel specialties:', kennel.specialties);
  console.log('Specialties type:', typeof kennel.specialties);
  console.log('Is array:', Array.isArray(kennel.specialties));
  
  // Ensure specialties is always an array
  const specialties = Array.isArray(kennel.specialties) ? kennel.specialties : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'orange';
      case 'suspended': return 'red';
      case 'pending_approval': return 'blue';
      default: return 'default';
    }
  };

  const dogColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space>
          <Avatar icon={<TeamOutlined />} style={{ backgroundColor: '#52c41a' }} />
          <div>
            <Text strong>{name}</Text>
            {record.callName && (
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  "{record.callName}"
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Breed',
      dataIndex: 'breed',
      key: 'breed',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => (
        <Tag color={gender === 'male' ? 'blue' : 'pink'}>
          {gender}
        </Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'parent' ? 'gold' : 'green'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => window.open(`/dogs/${record.id}`, '_blank')}
          >
            View
          </Button>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditDog(record)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const litterColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space>
          <Avatar icon={<HeartOutlined />} style={{ backgroundColor: '#f5222d' }} />
          <div>
            <Text strong>{name}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.sireName} × {record.damName}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Birth Date',
      dataIndex: 'birthDate',
      key: 'birthDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Puppies',
      dataIndex: 'actualPuppyCount',
      key: 'puppies',
      render: (count: number, record: any) => (
        <Text>{count} / {record.expectedPuppyCount || '?'}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} size="small">
            View
          </Button>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditLitter(record)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="top">
          <Col>
            <Space>
              <Avatar size={64} icon={<HomeOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  {kennel.name}
                </Title>
                {kennel.businessName && (
                  <Text type="secondary" style={{ fontSize: '16px' }}>
                    {kennel.businessName}
                  </Text>
                )}
                <div style={{ marginTop: '8px' }}>
                  <Space>
                    <Tag color={getStatusColor(kennel.status)}>
                      {kennel.status.replace('_', ' ')}
                    </Tag>
                    {kennel.verified && <Tag color="gold">Verified</Tag>}
                  </Space>
                </div>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Link href={`/kennels/${kennel.id}/edit`}>
                <Button icon={<EditOutlined />}>
                  Edit Kennel
                </Button>
              </Link>
            </Space>
          </Col>
        </Row>

        {/* Contact Info */}
        <Row gutter={[24, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Space>
              <EnvironmentOutlined />
              <div>
                <Text strong>Location</Text>
                <div>
                  <Text type="secondary">
                    {kennel.address.city}, {kennel.address.state}
                  </Text>
                </div>
              </div>
            </Space>
          </Col>
          {kennel.phone && (
            <Col xs={24} sm={12} md={6}>
              <Space>
                <PhoneOutlined />
                <div>
                  <Text strong>Phone</Text>
                  <div>
                    <Text type="secondary">{kennel.phone}</Text>
                  </div>
                </div>
              </Space>
            </Col>
          )}
          {kennel.email && (
            <Col xs={24} sm={12} md={6}>
              <Space>
                <MailOutlined />
                <div>
                  <Text strong>Email</Text>
                  <div>
                    <Text type="secondary">{kennel.email}</Text>
                  </div>
                </div>
              </Space>
            </Col>
          )}
          {kennel.website && (
            <Col xs={24} sm={12} md={6}>
              <Space>
                <GlobalOutlined />
                <div>
                  <Text strong>Website</Text>
                  <div>
                    <a href={kennel.website} target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </div>
                </div>
              </Space>
            </Col>
          )}
        </Row>

        {/* Description */}
        {kennel.description && (
          <div style={{ marginTop: '24px' }}>
            <Title level={4}>About This Kennel</Title>
            <Paragraph>{kennel.description}</Paragraph>
          </div>
        )}

        {/* Specialties */}
        {specialties.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <Title level={4}>Breed Specialties</Title>
            <Space wrap>
              {specialties.map((specialty, index) => (
                <Tag key={index} color="blue">{specialty}</Tag>
              ))}
            </Space>
          </div>
        )}
      </Card>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Dogs"
              value={stats.totalDogs}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Active Litters"
              value={stats.totalLitters}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Puppies"
              value={stats.totalPuppies}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Breeding Dogs"
              value={stats.activeBreedingDogs}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Overview" key="overview">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Title level={4}>Facilities</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {Object.entries(kennel.facilities).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Text>
                      <Tag color={value ? 'green' : 'default'}>
                        {value ? 'Yes' : 'No'}
                      </Tag>
                    </div>
                  ))}
                </Space>
              </Col>
              <Col xs={24} md={12}>
                <Title level={4}>Capacity</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Maximum Dogs</Text>
                    <Text strong>{kennel.capacity.maxDogs}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Maximum Litters</Text>
                    <Text strong>{kennel.capacity.maxLitters}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Current Dogs</Text>
                    <Text strong>{kennel.capacity.currentDogs}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Current Litters</Text>
                    <Text strong>{kennel.capacity.currentLitters}</Text>
                  </div>
                </Space>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={`Dogs (${dogs.length})`} key="dogs">
            <div style={{ marginBottom: '16px' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setAddDogVisible(true)}
              >
                Add Dog
              </Button>
            </div>
            <Table
              columns={dogColumns}
              dataSource={dogs}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: <Empty description="No dogs found" /> }}
            />
          </TabPane>

          <TabPane tab={`Litters (${litters.length})`} key="litters">
            <div style={{ marginBottom: '16px' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setAddLitterVisible(true)}
              >
                Add Litter
              </Button>
            </div>
            <Table
              columns={litterColumns}
              dataSource={litters}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: <Empty description="No litters found" /> }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Add Dog Modal */}
      <Modal
        title="Add New Dog"
        open={addDogVisible}
        onCancel={() => setAddDogVisible(false)}
        footer={null}
        width={600}
      >
        <AddEditDogForm
          form={dogForm}
          onFinish={handleAddDog}
          onCancel={() => setAddDogVisible(false)}
          mode="add"
          kennelId={kennelId}
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

      {/* Add Litter Modal */}
      <Modal
        title="Add New Litter"
        open={addLitterVisible}
        onCancel={() => setAddLitterVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={litterForm}
          layout="vertical"
          onFinish={handleAddLitter}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                name="name"
                label="Litter Name"
                rules={[{ required: true, message: 'Please enter litter name' }]}
              >
                <Input placeholder="Enter litter name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="sireId"
                label="Sire (Father)"
                rules={[{ required: true, message: 'Please select sire' }]}
              >
                <Select placeholder="Select sire">
                  {dogs.filter(dog => dog.gender === 'male' && dog.type === 'parent').map(dog => (
                    <Option key={dog.id} value={dog.id}>{dog.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="damId"
                label="Dam (Mother)"
                rules={[{ required: true, message: 'Please select dam' }]}
              >
                <Select placeholder="Select dam">
                  {dogs.filter(dog => dog.gender === 'female' && dog.type === 'parent').map(dog => (
                    <Option key={dog.id} value={dog.id}>{dog.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="expectedPuppyCount"
                label="Expected Puppy Count"
              >
                <InputNumber 
                  min={1} 
                  max={20} 
                  style={{ width: '100%' }}
                  placeholder="Expected count"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="expectedBirthDate"
                label="Expected Birth Date"
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="notes"
                label="Notes"
              >
                <Input.TextArea rows={3} placeholder="Additional notes about this litter" />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setAddLitterVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Add Litter
              </Button>
            </Space>
          </div>
        </Form>
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
        width={600}
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
          kennelId={kennelId}
          colors={colors}
          colorsLoading={colorsLoading}
          colorsError={colorsError}
          breeds={breeds}
          breedsLoading={breedsLoading}
          breedsError={breedsError}
          layout="detailed"
          showAdvancedFields={true}
          showPhotos={true}
          photos={editDogPhotos}
          onPhotosChange={(photos) => {
            photosRef.current = photos;
            setEditDogPhotos(photos);
            editDogForm.setFieldsValue({ photos });
          }}
          maxPhotos={10}
          s3Operations={s3Operations}
        />
      </Modal>

      {/* Edit Litter Modal */}
      <Modal
        title="Edit Litter"
        open={editLitterVisible}
        onCancel={() => {
          setEditLitterVisible(false);
          setEditingLitter(null);
          editLitterForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editLitterForm}
          layout="vertical"
          onFinish={handleUpdateLitter}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                name="name"
                label="Litter Name"
                rules={[{ required: true, message: 'Please enter litter name' }]}
              >
                <Input placeholder="Enter litter name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="expectedPuppyCount"
                label="Expected Puppy Count"
                rules={[{ required: true, message: 'Please enter expected puppy count' }]}
              >
                <InputNumber 
                  min={1} 
                  max={20} 
                  style={{ width: '100%' }}
                  placeholder="Expected puppies"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="actualPuppyCount"
                label="Actual Puppy Count"
              >
                <InputNumber 
                  min={0} 
                  max={20} 
                  style={{ width: '100%' }}
                  placeholder="Actual puppies"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="expected">Expected</Option>
                  <Option value="born">Born</Option>
                  <Option value="weaned">Weaned</Option>
                  <Option value="ready_for_homes">Ready for Homes</Option>
                  <Option value="sold">Sold</Option>
                  <Option value="completed">Completed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="birthDate"
                label="Birth Date"
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="notes"
                label="Notes"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Additional notes about this litter" 
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="specialInstructions"
                label="Special Instructions"
              >
                <Input.TextArea 
                  rows={2} 
                  placeholder="Any special instructions for this litter" 
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Divider>Puppies in this Litter</Divider>
              <div style={{ marginBottom: '16px' }}>
                <Space wrap>
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />}
                    onClick={() => setAddPuppyVisible(true)}
                  >
                    Add New Puppy
                  </Button>
                  <Select
                    placeholder="Add existing puppy"
                    style={{ width: 200 }}
                    showSearch
                    optionFilterProp="children"
                    onSelect={(value) => {
                      const puppy = data?.dogs.find(d => d.id === value);
                      if (puppy && puppy.type === 'puppy') {
                        const puppyInfo = {
                          id: puppy.id,
                          name: puppy.name,
                          gender: puppy.gender,
                          color: puppy.color,
                          markings: puppy.markings,
                          weight: puppy.weight,
                          status: 'available',
                          notes: puppy.notes,
                        };
                        handleAddPuppy(puppyInfo);
                      }
                    }}
                  >
                    {data?.dogs
                      ?.filter(dog => dog.type === 'puppy' && !selectedPuppies.some(p => p.id === dog.id))
                      ?.map(dog => (
                        <Option key={dog.id} value={dog.id}>
                          {dog.name} ({dog.gender})
                        </Option>
                      ))}
                  </Select>
                </Space>
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {selectedPuppies.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                    No puppies selected
                  </div>
                ) : (
                  <Row gutter={[8, 8]}>
                    {selectedPuppies.map((puppy, index) => (
                      <Col xs={24} sm={12} md={8} key={puppy.id}>
                        <Card size="small" style={{ position: 'relative' }}>
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<CloseOutlined />}
                            style={{ position: 'absolute', top: 4, right: 4 }}
                            onClick={() => handleRemovePuppy(puppy.id)}
                          />
                          <div>
                            <Typography.Text strong>{puppy.name}</Typography.Text>
                            <br />
                            <Typography.Text style={{ fontSize: '12px', color: '#999' }}>
                              {puppy.gender} • {puppy.color}
                            </Typography.Text>
                            {puppy.weight && (
                              <>
                                <br />
                                <Typography.Text style={{ fontSize: '12px', color: '#999' }}>
                                  {puppy.weight} lbs
                                </Typography.Text>
                              </>
                            )}
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            </Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setEditLitterVisible(false);
                setEditingLitter(null);
                editLitterForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Litter
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Add New Puppy Modal */}
      <Modal
        title="Add New Puppy"
        open={addPuppyVisible}
        onCancel={() => {
          setAddPuppyVisible(false);
          addPuppyForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={addPuppyForm}
          layout="vertical"
          onFinish={handleCreatePuppy}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Puppy Name"
                rules={[{ required: true, message: 'Please enter puppy name' }]}
              >
                <Input placeholder="Enter puppy name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="callName"
                label="Call Name (Nickname)"
              >
                <Input placeholder="Enter nickname" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="breed"
                label="Breed"
                rules={[{ required: true, message: 'Please select breed' }]}
              >
                <BreedSelector
                  placeholder="Select breed"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: 'Please select gender' }]}
              >
                <Select placeholder="Select gender">
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="birthDate"
                label="Birth Date"
                rules={[{ required: true, message: 'Please enter birth date' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="color"
                label="Color"
                rules={[{ required: true, message: 'Please select color' }]}
                help="Select the primary color or pattern"
              >
                <ColorSelector
                  colors={colors}
                  loading={colorsLoading}
                  error={colorsError || undefined}
                  showColorSwatches={true}
                  showDescription={true}
                  placeholder="Select color or pattern"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="weight"
                label="Weight (lbs)"
              >
                <InputNumber 
                  min={0} 
                  max={50} 
                  style={{ width: '100%' }}
                  placeholder="Weight"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="markings"
                label="Markings"
              >
                <Input placeholder="Describe any markings" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="notes"
                label="Notes"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Additional notes about this puppy" 
                />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setAddPuppyVisible(false);
                addPuppyForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Puppy
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default KennelDetailPage;
