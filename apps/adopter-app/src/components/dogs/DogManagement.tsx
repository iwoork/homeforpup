'use client';

import React from 'react';
import {
  Card,
  Button,
  Space,
  Table,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Typography,
  Modal,
  Image,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Dog, Kennel } from '@/types';
import { useDogs } from '@/hooks/api/useDogs';
import { useKennels } from '@/hooks/useKennels';
import DogForm from '../forms/DogForm';
import KennelForm from './KennelForm';

const { Title, Text } = Typography;
const { Column } = Table;

interface DogManagementProps {
  userId: string;
}

const DogManagement: React.FC<DogManagementProps> = ({ userId }) => {
  const [showDogForm, setShowDogForm] = React.useState(false);
  const [showKennelForm, setShowKennelForm] = React.useState(false);
  const [editingDog, setEditingDog] = React.useState<Dog | null>(null);
  const [editingKennel, setEditingKennel] = React.useState<Kennel | null>(null);

  const { dogs, isLoading: dogsLoading, error: dogsError, deleteDog, mutate: refreshDogs } = useDogs();
  const { kennels, isLoading: kennelsLoading, deleteKennel, refreshKennels } = useKennels();

  const handleAddDog = () => {
    setEditingDog(null);
    setShowDogForm(true);
  };

  const handleEditDog = (dog: Dog) => {
    setEditingDog(dog);
    setShowDogForm(true);
  };

  const handleDeleteDog = async (dogId: string) => {
    try {
      await deleteDog(dogId);
      message.success('Dog deleted successfully');
      refreshDogs();
    } catch (error) {
      console.error('Error deleting dog:', error);
      message.error('Failed to delete dog');
    }
  };

  const handleDogSaved = async (values: any) => {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'birthDate' && value && typeof value === 'object' && 'format' in value) {
            formData.append(key, (value as any).format('YYYY-MM-DD'));
          } else if (key === 'photo' && value && typeof value === 'object' && 'fileList' in value) {
            if ((value as any).fileList && (value as any).fileList[0]) {
              formData.append('photo', (value as any).fileList[0].originFileObj);
            }
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const url = editingDog?.id ? `/api/dogs/${editingDog.id}` : '/api/dogs';
      const method = editingDog?.id ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body: formData });
      if (!response.ok) throw new Error('Failed to save dog');

      message.success(editingDog ? 'Dog updated successfully' : 'Dog created successfully');
      setShowDogForm(false);
      setEditingDog(null);
      refreshDogs();
    } catch (error) {
      console.error('Error saving dog:', error);
      message.error('Failed to save dog');
      throw error;
    }
  };

  const handleDogFormCancel = () => {
    setShowDogForm(false);
    setEditingDog(null);
  };

  const handleAddKennel = () => {
    setEditingKennel(null);
    setShowKennelForm(true);
  };

  const handleEditKennel = (kennel: Kennel) => {
    setEditingKennel(kennel);
    setShowKennelForm(true);
  };

  const handleDeleteKennel = async (kennelId: string) => {
    try {
      await deleteKennel(kennelId);
      message.success('Kennel deleted successfully');
      refreshKennels();
    } catch (error) {
      console.error('Error deleting kennel:', error);
      message.error('Failed to delete kennel');
    }
  };

  const handleKennelSaved = () => {
    setShowKennelForm(false);
    setEditingKennel(null);
    refreshKennels();
  };

  const handleKennelFormCancel = () => {
    setShowKennelForm(false);
    setEditingKennel(null);
  };

  const getKennelName = (kennelId?: string) => {
    if (!kennelId) return 'No Kennel';
    const kennel = kennels?.find(k => k.id === kennelId);
    return kennel?.name || 'Unknown Kennel';
  };

  const getBreedingStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'green';
      case 'not_ready': return 'orange';
      case 'retired': return 'red';
      default: return 'default';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'fair': return 'orange';
      case 'poor': return 'red';
      default: return 'default';
    }
  };

  if (dogsError) {
    return (
      <Card>
        <Text type="danger">Error loading dogs: {dogsError.message}</Text>
      </Card>
    );
  }

  return (
    <div>
      {/* Kennels Section */}
      <Card 
        title={
          <Space>
            <HomeOutlined />
            <span>My Kennels</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddKennel}>
            Add Kennel
          </Button>
        }
        style={{ marginBottom: '24px' }}
      >
        {kennelsLoading ? (
          <div>Loading kennels...</div>
        ) : kennels && kennels.length > 0 ? (
          <Row gutter={[16, 16]}>
            {kennels.map((kennel) => (
              <Col xs={24} sm={12} md={8} key={kennel.id}>
                <Card
                  size="small"
                  title={kennel.name}
                  extra={
                    <Space>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditKennel(kennel)}
                      />
                      <Popconfirm
                        title="Are you sure you want to delete this kennel?"
                        onConfirm={() => handleDeleteKennel(kennel.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    </Space>
                  }
                >
                  <div>
                    <Text type="secondary">{kennel.address ? `${kennel.address.city}, ${kennel.address.state}` : 'Location not specified'}</Text>
                    <br />
                    <Text type="secondary">Est. {dayjs(kennel.establishedDate).format('YYYY')}</Text>
                    <br />
                    <Tag color={kennel.isActive ? 'green' : 'red'}>
                      {kennel.isActive ? 'Active' : 'Inactive'}
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">No kennels found. Create your first kennel to get started.</Text>
          </div>
        )}
      </Card>

      {/* Dogs Section */}
      <Card
        title={
          <Space>
            <span>My Dogs</span>
            <Tag color="blue">{dogs?.length || 0}</Tag>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddDog}>
            Add Dog
          </Button>
        }
      >
        <Table
          dataSource={dogs}
          loading={dogsLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        >
          <Column
            title="Photo"
            dataIndex="photoUrl"
            key="photoUrl"
            width={80}
            render={(photoUrl) => (
              photoUrl ? (
                <Image
                  src={photoUrl}
                  alt="Dog"
                  width={50}
                  height={50}
                  style={{ objectFit: 'cover', borderRadius: '4px' }}
                />
              ) : (
                <div style={{ width: 50, height: 50, backgroundColor: '#f0f0f0', borderRadius: '4px' }} />
              )
            )}
          />
          
          <Column
            title="Name"
            dataIndex="name"
            key="name"
            sorter={(a: Dog, b: Dog) => a.name.localeCompare(b.name)}
          />
          
          <Column
            title="Breed"
            dataIndex="breed"
            key="breed"
            sorter={(a: Dog, b: Dog) => a.breed.localeCompare(b.breed)}
          />
          
          <Column
            title="Gender"
            dataIndex="gender"
            key="gender"
            render={(gender) => (
              <Tag color={gender === 'male' ? 'blue' : 'pink'}>
                {gender === 'male' ? '♂' : '♀'} {gender}
              </Tag>
            )}
          />
          
          <Column
            title="Age"
            dataIndex="birthDate"
            key="age"
            render={(birthDate) => {
              const age = dayjs().diff(dayjs(birthDate), 'year');
              return `${age} year${age !== 1 ? 's' : ''} old`;
            }}
            sorter={(a: Dog, b: Dog) => dayjs(a.birthDate).diff(dayjs(b.birthDate))}
          />
          
          <Column
            title="Kennel"
            dataIndex="kennelId"
            key="kennelId"
            render={(kennelId) => (
              <Tooltip title={getKennelName(kennelId)}>
                <Text>{getKennelName(kennelId)}</Text>
              </Tooltip>
            )}
          />
          
          <Column
            title="Type"
            dataIndex="dogType"
            key="dogType"
            render={(type) => (
              <Tag color={type === 'parent' ? 'green' : 'orange'}>
                {type === 'parent' ? 'Parent' : 'Puppy'}
              </Tag>
            )}
          />
          
          <Column
            title="Breeding"
            dataIndex="breedingStatus"
            key="breedingStatus"
            render={(status) => (
              <Tag color={getBreedingStatusColor(status)}>
                {status.replace('_', ' ').toUpperCase()}
              </Tag>
            )}
          />
          
          <Column
            title="Health"
            dataIndex="healthStatus"
            key="healthStatus"
            render={(status) => (
              <Tag color={getHealthStatusColor(status)}>
                {status.toUpperCase()}
              </Tag>
            )}
          />
          
          <Column
            title="Actions"
            key="actions"
            width={120}
            render={(_, record: Dog) => (
              <Space>
                <Tooltip title="View Details">
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      // TODO: Implement view details modal
                      message.info('View details coming soon');
                    }}
                  />
                </Tooltip>
                <Tooltip title="Edit">
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEditDog(record)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Are you sure you want to delete this dog?"
                  onConfirm={() => handleDeleteDog(record.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Tooltip title="Delete">
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            )}
          />
        </Table>
      </Card>

      {/* Modals */}
      <Modal
        title={editingDog ? 'Edit Dog' : 'Add New Dog'}
        open={showDogForm}
        onCancel={handleDogFormCancel}
        footer={null}
        width={1000}
        destroyOnClose
      >
        <DogForm
          dog={editingDog || undefined}
          kennels={kennels?.map(k => ({ id: k.id, name: k.name })) || []}
          kennelsLoading={kennelsLoading}
          onSubmit={handleDogSaved}
          onCancel={handleDogFormCancel}
          showKennelSelector={true}
          showAdvancedFields={true}
          showPhotoUpload={true}
        />
      </Modal>

      <Modal
        title={editingKennel ? 'Edit Kennel' : 'Create New Kennel'}
        open={showKennelForm}
        onCancel={handleKennelFormCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        <KennelForm
          kennel={editingKennel || undefined}
          onSave={handleKennelSaved}
          onCancel={handleKennelFormCancel}
        />
      </Modal>
    </div>
  );
};

export default DogManagement;
