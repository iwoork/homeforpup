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
  Avatar, 
  Tabs, 
  Table, 
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Upload,
  Image,
  Divider,
  Descriptions,
  Badge,
  Timeline,
  Progress,
  App
} from 'antd';
import { 
  ArrowLeftOutlined,
  EditOutlined,
  PlusOutlined,
  CameraOutlined,
  MedicineBoxOutlined,
  BookOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  TrophyOutlined,
  FileTextOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import { Dog, VeterinaryVisit, TrainingRecord, DogPhoto } from '@homeforpup/shared-types/kennel';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { PhotoUpload, setS3Operations } from '@homeforpup/shared-photo-upload';
import { s3Operations } from '@/lib/api/s3';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DogDetailsPage: React.FC = () => {
  const { message } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const dogId = params.id as string;

  // Configure S3 operations for shared photo upload
  React.useEffect(() => {
    setS3Operations(s3Operations);
  }, []);
  const [activeTab, setActiveTab] = useState('overview');
  const [vetVisitVisible, setVetVisitVisible] = useState(false);
  const [trainingVisible, setTrainingVisible] = useState(false);
  const [photoVisible, setPhotoVisible] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VeterinaryVisit | null>(null);
  const [editingTraining, setEditingTraining] = useState<TrainingRecord | null>(null);
  const [photoModalPhotos, setPhotoModalPhotos] = useState<string[]>([]);
  const [vetForm] = Form.useForm();
  const [trainingForm] = Form.useForm();
  const [photoForm] = Form.useForm();

  const { data, error, isLoading, mutate } = useSWR<{ dog: Dog }>(
    `/api/dogs/${dogId}`,
    async (url: string) => {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch dog details');
      }
      return response.json();
    }
  );

  const dog = data?.dog;

  const handleAddVetVisit = async (values: any) => {
    try {
      const response = await fetch(`/api/dogs/${dogId}/vet-visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add vet visit');
      }

      message.success('Vet visit added successfully');
      setVetVisitVisible(false);
      vetForm.resetFields();
      mutate();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to add vet visit');
    }
  };

  const handleAddTraining = async (values: any) => {
    try {
      const response = await fetch(`/api/dogs/${dogId}/training`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add training record');
      }

      message.success('Training record added successfully');
      setTrainingVisible(false);
      trainingForm.resetFields();
      mutate();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to add training record');
    }
  };

  const handleAddPhoto = async (values: any) => {
    try {
      const { ...photoData } = values;
      
      if (!photoModalPhotos || photoModalPhotos.length === 0) {
        message.error('Please upload at least one photo');
        return;
      }
      
      // Add each photo individually
      for (const photoUrl of photoModalPhotos) {
        const response = await fetch(`/api/dogs/${dogId}/photos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            url: photoUrl,
            ...photoData,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add photo');
        }
      }

      message.success(`${photoModalPhotos.length} photo(s) added successfully`);
      setPhotoVisible(false);
      photoForm.resetFields();
      setPhotoModalPhotos([]);
      mutate();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to add photo');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'fair': return 'orange';
      case 'poor': return 'red';
      default: return 'default';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'fair': return 'orange';
      case 'needs_work': return 'red';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !dog) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Card>
          <Title level={3}>Dog Not Found</Title>
          <Paragraph>The dog you're looking for doesn't exist or you don't have permission to view it.</Paragraph>
          <Button type="primary" onClick={() => router.back()}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const vetVisitColumns = [
    {
      title: 'Date',
      dataIndex: 'visitDate',
      key: 'visitDate',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a: VeterinaryVisit, b: VeterinaryVisit) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime(),
    },
    {
      title: 'Type',
      dataIndex: 'visitType',
      key: 'visitType',
      render: (type: string) => <Tag color="blue">{type.replace('_', ' ')}</Tag>,
    },
    {
      title: 'Veterinarian',
      dataIndex: 'veterinarian',
      key: 'veterinarian',
      render: (vet: any) => `${vet.name} - ${vet.clinic}`,
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number) => weight ? `${weight} lbs` : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: VeterinaryVisit) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>View</Button>
          <Button size="small" icon={<EditOutlined />}>Edit</Button>
        </Space>
      ),
    },
  ];

  const trainingColumns = [
    {
      title: 'Date',
      dataIndex: 'sessionDate',
      key: 'sessionDate',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a: TrainingRecord, b: TrainingRecord) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime(),
    },
    {
      title: 'Type',
      dataIndex: 'trainingType',
      key: 'trainingType',
      render: (type: string) => <Tag color="green">{type.replace('_', ' ')}</Tag>,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration} min`,
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: string) => (
        <Badge color={getProgressColor(progress)} text={progress.replace('_', ' ')} />
      ),
    },
    {
      title: 'Skills',
      dataIndex: 'skills',
      key: 'skills',
      render: (skills: any[]) => (
        <div>
          {skills.slice(0, 2).map((skill, index) => (
            <Tag key={index}>{skill.skill}</Tag>
          ))}
          {skills.length > 2 && <Tag>+{skills.length - 2} more</Tag>}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: TrainingRecord) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}>View</Button>
          <Button size="small" icon={<EditOutlined />}>Edit</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Space style={{ marginBottom: '16px' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            Back
          </Button>
        </Space>
        
        <Row gutter={[24, 16]} align="middle">
          <Col>
            <Avatar 
              size={80} 
              src={dog.photoGallery?.[0]?.url || dog.photos?.[0]} 
              icon={<HeartOutlined />}
              style={{ backgroundColor: '#f56a00' }}
            />
          </Col>
          <Col flex="auto">
            <Title level={2} style={{ margin: 0 }}>
              {dog.name}
              {dog.callName && (
                <Text type="secondary" style={{ marginLeft: '8px', fontSize: '18px' }}>
                  "{dog.callName}"
                </Text>
              )}
            </Title>
            <Space wrap>
              <Tag color="blue">{dog.breed}</Tag>
              <Tag color={dog.gender === 'male' ? 'blue' : 'pink'}>
                {dog.gender}
              </Tag>
              <Tag color="green">{dog.type}</Tag>
              <Badge 
                color={getStatusColor(dog.health?.currentHealthStatus || 'good')} 
                text={dog.health?.currentHealthStatus || 'Unknown'}
              />
            </Space>
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">
                Born {dayjs(dog.birthDate).format('MMMM DD, YYYY')} • 
                {dog.weight ? ` ${dog.weight} lbs` : ''} • 
                {dog.color}
              </Text>
            </div>
          </Col>
          <Col>
            <Space>
              <Button icon={<EditOutlined />}>Edit Dog</Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Tabs */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'overview',
            label: 'Overview',
            children: (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Basic Information" style={{ marginBottom: '24px' }}>
                <Descriptions column={1}>
                  <Descriptions.Item label="Name">{dog.name}</Descriptions.Item>
                  <Descriptions.Item label="Call Name">{dog.callName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Breed">{dog.breed}</Descriptions.Item>
                  <Descriptions.Item label="Gender">{dog.gender}</Descriptions.Item>
                  <Descriptions.Item label="Birth Date">
                    {dayjs(dog.birthDate).format('MMMM DD, YYYY')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Age">
                    {dayjs().diff(dayjs(dog.birthDate), 'year')} years old
                  </Descriptions.Item>
                  <Descriptions.Item label="Color">{dog.color}</Descriptions.Item>
                  <Descriptions.Item label="Weight">
                    {dog.weight ? `${dog.weight} lbs` : 'Not specified'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Height">
                    {dog.height ? `${dog.height} inches` : 'Not specified'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Health Status">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Current Health Status: </Text>
                    <Badge 
                      color={getStatusColor(dog.health?.currentHealthStatus || 'good')} 
                      text={dog.health?.currentHealthStatus || 'Unknown'}
                    />
                  </div>
                  {dog.health?.lastVetVisit && (
                    <div>
                      <Text strong>Last Vet Visit: </Text>
                      <Text>{dayjs(dog.health.lastVetVisit).format('MMMM DD, YYYY')}</Text>
                    </div>
                  )}
                  {dog.health?.microchipId && (
                    <div>
                      <Text strong>Microchip ID: </Text>
                      <Text code>{dog.health.microchipId}</Text>
                    </div>
                  )}
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Photos" extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setPhotoVisible(true)}
                >
                  Add Photo
                </Button>
              }>
                {dog.photoGallery && dog.photoGallery.length > 0 ? (
                  <Row gutter={[8, 8]}>
                    {dog.photoGallery.slice(0, 6).map((photo: DogPhoto, index: number) => (
                      <Col xs={8} sm={6} key={photo.id}>
                        <div style={{ position: 'relative' }}>
                          <Image
                            src={photo.url}
                            alt={photo.caption || `Photo ${index + 1}`}
                            style={{ 
                              width: '100%', 
                              height: '80px', 
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                            preview={{
                              mask: <EyeOutlined />
                            }}
                          />
                          {photo.isProfilePhoto && (
                            <Tag 
                              color="gold" 
                              style={{ 
                                position: 'absolute', 
                                top: '4px', 
                                left: '4px',
                                fontSize: '10px'
                              }}
                            >
                              Profile
                            </Tag>
                          )}
                        </div>
                      </Col>
                    ))}
                    {dog.photoGallery.length > 6 && (
                      <Col xs={8} sm={6}>
                        <div style={{
                          width: '100%',
                          height: '80px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}>
                          <Text type="secondary">+{dog.photoGallery.length - 6} more</Text>
                        </div>
                      </Col>
                    )}
                  </Row>
                ) : (
                  <Empty 
                    image={<PictureOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
                    description="No photos yet"
                  />
                )}
              </Card>
            </Col>
          </Row>
            )
          },
          {
            key: 'vet-visits',
            label: 'Veterinary Visits',
            children: (
          <Card 
            title="Veterinary Visits" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setVetVisitVisible(true)}
              >
                Add Visit
              </Button>
            }
          >
            {dog.veterinaryVisits && dog.veterinaryVisits.length > 0 ? (
              <Table
                columns={vetVisitColumns}
                dataSource={dog.veterinaryVisits}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty 
                image={<MedicineBoxOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
                description="No veterinary visits recorded yet"
              />
            )}
          </Card>
            )
          },
          {
            key: 'training',
            label: 'Training Records',
            children: (
          <Card 
            title="Training Records" 
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setTrainingVisible(true)}
              >
                Add Training
              </Button>
            }
          >
            {dog.trainingRecords && dog.trainingRecords.length > 0 ? (
              <Table
                columns={trainingColumns}
                dataSource={dog.trainingRecords}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty 
                image={<BookOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
                description="No training records yet"
              />
            )}
          </Card>
            )
          }
        ]}
      />

      {/* Add Vet Visit Modal */}
      <Modal
        title="Add Veterinary Visit"
        open={vetVisitVisible}
        onCancel={() => {
          setVetVisitVisible(false);
          vetForm.resetFields();
        }}
        onOk={() => vetForm.submit()}
        width={600}
      >
        <Form
          form={vetForm}
          layout="vertical"
          onFinish={handleAddVetVisit}
          preserve={false}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="visitDate"
                label="Visit Date"
                rules={[{ required: true, message: 'Please select visit date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="visitType"
                label="Visit Type"
                rules={[{ required: true, message: 'Please select visit type' }]}
              >
                <Select>
                  <Option value="routine">Routine</Option>
                  <Option value="emergency">Emergency</Option>
                  <Option value="follow-up">Follow-up</Option>
                  <Option value="vaccination">Vaccination</Option>
                  <Option value="surgery">Surgery</Option>
                  <Option value="checkup">Checkup</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={['veterinarian', 'name']}
                label="Veterinarian Name"
                rules={[{ required: true, message: 'Please enter veterinarian name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['veterinarian', 'clinic']}
                label="Clinic"
                rules={[{ required: true, message: 'Please enter clinic name' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="reason"
            label="Reason for Visit"
            rules={[{ required: true, message: 'Please enter reason for visit' }]}
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="weight" label="Weight (lbs)">
                <InputNumber style={{ width: '100%' }} min={0} max={300} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="temperature" label="Temperature (°F)">
                <InputNumber style={{ width: '100%' }} min={90} max={110} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="heartRate" label="Heart Rate (BPM)">
                <InputNumber style={{ width: '100%' }} min={40} max={200} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="diagnosis" label="Diagnosis">
            <Input />
          </Form.Item>

          <Form.Item name="treatment" label="Treatment">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Training Modal */}
      <Modal
        title="Add Training Record"
        open={trainingVisible}
        onCancel={() => {
          setTrainingVisible(false);
          trainingForm.resetFields();
        }}
        onOk={() => trainingForm.submit()}
        width={600}
      >
        <Form
          form={trainingForm}
          layout="vertical"
          onFinish={handleAddTraining}
          preserve={false}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sessionDate"
                label="Session Date"
                rules={[{ required: true, message: 'Please select session date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="trainingType"
                label="Training Type"
                rules={[{ required: true, message: 'Please select training type' }]}
              >
                <Select>
                  <Option value="basic_obedience">Basic Obedience</Option>
                  <Option value="advanced_obedience">Advanced Obedience</Option>
                  <Option value="agility">Agility</Option>
                  <Option value="therapy">Therapy</Option>
                  <Option value="service">Service</Option>
                  <Option value="behavioral">Behavioral</Option>
                  <Option value="socialization">Socialization</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Duration (minutes)"
                rules={[{ required: true, message: 'Please enter duration' }]}
              >
                <InputNumber style={{ width: '100%' }} min={1} max={480} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="progress"
                label="Progress"
                rules={[{ required: true, message: 'Please select progress' }]}
              >
                <Select>
                  <Option value="excellent">Excellent</Option>
                  <Option value="good">Good</Option>
                  <Option value="fair">Fair</Option>
                  <Option value="needs_work">Needs Work</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please enter location' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Photo Modal */}
      <Modal
        title="Add Photo"
        open={photoVisible}
        onCancel={() => {
          setPhotoVisible(false);
          photoForm.resetFields();
          setPhotoModalPhotos([]);
        }}
        onOk={() => photoForm.submit()}
        width={800}
      >
        <Form
          form={photoForm}
          layout="vertical"
          onFinish={handleAddPhoto}
          preserve={false}
        >
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Upload Photos *
            </label>
            <PhotoUpload
              key={`photo-modal-${photoModalPhotos.length}`}
              photos={photoModalPhotos}
              onPhotosChange={(photos) => {
                setPhotoModalPhotos(photos);
                photoForm.setFieldsValue({ photos });
              }}
              maxPhotos={5}
              aspect="standard"
              uploadPath="dog-photos"
            />
          </div>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select>
              <Option value="general">General</Option>
              <Option value="vet_visit">Vet Visit</Option>
              <Option value="training">Training</Option>
              <Option value="show">Show</Option>
              <Option value="breeding">Breeding</Option>
              <Option value="puppy">Puppy</Option>
              <Option value="family">Family</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="takenDate"
            label="Date Taken"
            rules={[{ required: true, message: 'Please select date taken' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="caption" label="Caption">
            <Input />
          </Form.Item>

          <Form.Item name="photographer" label="Photographer">
            <Input />
          </Form.Item>

          <Form.Item name="tags" label="Tags">
            <Select mode="tags" placeholder="Add tags">
              <Option value="cute">Cute</Option>
              <Option value="playful">Playful</Option>
              <Option value="sleeping">Sleeping</Option>
              <Option value="playing">Playing</Option>
              <Option value="training">Training</Option>
            </Select>
          </Form.Item>

          <Form.Item name="isProfilePhoto" valuePropName="checked">
            <input type="checkbox" /> Set as profile photo
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DogDetailsPage;
