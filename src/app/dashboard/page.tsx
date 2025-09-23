// page.tsx (Enhanced Dashboard with Messaging & Announcements) - Fixed
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
  Modal,
  Badge,
  Tabs,
  Input,
  Form,
  Select,
  DatePicker,
  message,
  Divider
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
  CalendarOutlined,
  MessageOutlined,
  SendOutlined,
  NotificationOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/hooks/useDogs';
import { Litter, Dog } from '@/types';
import AddDogForm from '@/components/AddDogForm';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { confirm } = Modal;
const { TextArea } = Input;
const { TabPane } = Tabs;

// Types for new features
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  subject?: string;
}

interface Announcement {
  id: string;
  breederId: string;
  breederName: string;
  title: string;
  content: string;
  type: 'litter' | 'general' | 'health' | 'achievement';
  timestamp: string;
  litterInfo?: {
    sireId: string;
    sireName: string;
    damId: string;
    damName: string;
    expectedDate: string;
    breed: string;
    expectedPuppies?: number;
  };
  likes: number;
  comments: number;
}

// Form value interfaces
interface MessageFormValues {
  recipient: string;
  subject: string;
  content: string;
}

interface AnnouncementFormValues {
  type: 'litter' | 'general' | 'health' | 'achievement';
  title: string;
  content: string;
  sire?: string;
  dam?: string;
  expectedDate?: dayjs.Dayjs;
  expectedPuppies?: number;
  breed?: string;
}

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
  
  // New state for messaging and announcements
  const [messages, setMessages] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [announcementModalVisible, setAnnouncementModalVisible] = useState(false);
  const [messageForm] = Form.useForm<MessageFormValues>();
  const [announcementForm] = Form.useForm<AnnouncementFormValues>();
  const [unreadCount, setUnreadCount] = useState(0);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);

  // Initialize gallery photos from user data
  useEffect(() => {
    if (user?.galleryPhotos) {
      setGalleryPhotos(user.galleryPhotos);
    }
  }, [user?.galleryPhotos]);

  const fetchDashboardData = useCallback(async () => {
    // Fixed: Changed user?.id to user?.userId
    if (!user?.userId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Mock data for demonstration
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: 'user123',
          senderName: 'Sarah Johnson',
          receiverId: user.userId, // Fixed: using userId instead of id
          subject: 'Interested in your Golden Retriever litter',
          content: 'Hi! I saw your upcoming Golden Retriever litter and would love to learn more about available puppies.',
          timestamp: dayjs().subtract(2, 'hours').toISOString(),
          read: false
        },
        {
          id: '2',
          senderId: 'user456',
          senderName: 'Mike Thompson',
          receiverId: user.userId, // Fixed: using userId instead of id
          subject: 'Health clearance question',
          content: 'Could you share the health clearances for the parents of your Labrador litter?',
          timestamp: dayjs().subtract(1, 'day').toISOString(),
          read: true
        }
      ];

      const mockAnnouncements: Announcement[] = [
        {
          id: '1',
          breederId: user.userId, // Fixed: using userId instead of id
          breederName: user.name || 'Your Name',
          title: 'Exciting Golden Retriever Litter Expected!',
          content: 'We are thrilled to announce an upcoming litter from our champion bloodlines. Both parents have excellent health clearances and amazing temperaments.',
          type: 'litter',
          timestamp: dayjs().subtract(3, 'days').toISOString(),
          litterInfo: {
            sireId: 'dog1',
            sireName: 'Champion Max',
            damId: 'dog2',
            damName: 'Bella',
            expectedDate: dayjs().add(45, 'days').format('YYYY-MM-DD'),
            breed: 'Golden Retriever',
            expectedPuppies: 8
          },
          likes: 15,
          comments: 7
        },
        {
          id: '2',
          breederId: 'other_breeder',
          breederName: 'Mountain View Kennel',
          title: 'New Health Testing Results Available',
          content: 'We are proud to share that all our breeding dogs have passed their latest health screenings with excellent results.',
          type: 'health',
          timestamp: dayjs().subtract(5, 'days').toISOString(),
          likes: 23,
          comments: 12
        }
      ];

      setMessages(mockMessages);
      setAnnouncements(mockAnnouncements);
      setUnreadCount(mockMessages.filter(m => !m.read).length);
      setLitters([]);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.userId, user?.name]); // Fixed: updated dependencies

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

  const handleSendMessage = async (values: MessageFormValues) => {
    try {
      // In real implementation, this would send to your API
      console.log('Sending message:', values);
      message.success('Message sent successfully!');
      messageForm.resetFields();
      setMessageModalVisible(false);
    } catch {
      message.error('Failed to send message');
    }
  };

  const handleCreateAnnouncement = async (values: AnnouncementFormValues) => {
    try {
      // In real implementation, this would send to your API
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        breederId: user?.userId || '', // Fixed: using userId instead of id
        breederName: user?.name || 'Your Name',
        title: values.title,
        content: values.content,
        type: values.type,
        timestamp: dayjs().toISOString(),
        litterInfo: values.type === 'litter' ? {
          sireId: values.sire || '',
          sireName: dogs.find(d => d.id === values.sire)?.name || '',
          damId: values.dam || '',
          damName: dogs.find(d => d.id === values.dam)?.name || '',
          expectedDate: values.expectedDate?.format('YYYY-MM-DD') || '',
          breed: values.breed || '',
          expectedPuppies: values.expectedPuppies
        } : undefined,
        likes: 0,
        comments: 0
      };
      
      setAnnouncements([newAnnouncement, ...announcements]);
      message.success('Announcement created successfully!');
      announcementForm.resetFields();
      setAnnouncementModalVisible(false);
    } catch {
      message.error('Failed to create announcement');
    }
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages(messages.map(m => 
      m.id === messageId ? { ...m, read: true } : m
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
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

  const isBreeder = user?.userType === 'breeder' || user?.userType === 'both';

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '32px 16px' 
    }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={1} style={{ color: '#08979C', marginBottom: '8px' }}>
            {isBreeder ? 'Breeder Dashboard' : 'Your Dashboard'}
          </Title>
          <Text style={{ color: '#595959', fontSize: '16px' }}>
            {isBreeder
              ? "Welcome back! Here’s your breeding operation overview."
              : "Welcome back! Track your messages, preferences, and discover new pups."}
          </Text>
        </div>
        
        {/* Message & Announcement Actions */}
        <Space>
          {isBreeder && (
            <Button
              type="primary"
              icon={<NotificationOutlined />}
              onClick={() => setAnnouncementModalVisible(true)}
              style={{ 
                background: '#FA8072', 
                borderColor: '#FA8072' 
              }}
            >
              Create Announcement
            </Button>
          )}
          {!isBreeder && (
            <Link href="/browse">
              <Button type="primary" icon={<EyeOutlined />} style={{ background: '#08979C', borderColor: '#08979C' }}>
                Browse Puppies
              </Button>
            </Link>
          )}
        </Space>
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

      {/* Quick Stats Bar */}
      <div style={{ 
        background: 'linear-gradient(135deg, #08979C 0%, #13C2C2 100%)', 
        borderRadius: '12px', 
        padding: '24px', 
        marginBottom: '32px',
        color: 'white'
      }}>
        <Row gutter={[24, 16]} align="middle">
          {isBreeder ? (
            <>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {activeLitters.length}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Active Litters</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {dogs.length}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>My Dogs</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {availablePuppies}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Available Puppies</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {unreadCount}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>New Messages</div>
                </div>
              </Col>
            </>
          ) : (
            <>
              <Col xs={12} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {unreadCount}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Unread Messages</div>
                </div>
              </Col>
              <Col xs={12} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {Array.isArray((user as any)?.adopterInfo?.preferredBreeds) ? (user as any).adopterInfo.preferredBreeds.length : 0}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Saved Breeds</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {messages.length}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Conversations</div>
                </div>
              </Col>
            </>
          )}
        </Row>
      </div>


      {/* Main Task Sections */}
      {isBreeder ? (
        <div>
          {/* Manage Your Breeding Program */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <StarOutlined style={{ color: '#08979C', fontSize: '20px' }} />
                <span>Manage Your Breeding Program</span>
              </div>
            }
            style={{ ...cardStyle, marginBottom: '24px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div style={{ 
                  background: '#f0f9ff', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #bae7ff'
                }}>
                  <Title level={4} style={{ marginBottom: '16px', color: '#08979C' }}>
                    Active Litters ({activeLitters.length})
                  </Title>
                  {activeLitters.length > 0 ? (
                    <List
                      dataSource={activeLitters.slice(0, 3)}
                      renderItem={(litter, index) => (
                        <List.Item key={`litter-${litter.id || index}`} style={{ padding: '8px 0' }}>
                          <div style={{ width: '100%' }}>
                            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                              {litter.breed} Litter
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              <CalendarOutlined /> Expected: {litter.expectedDate}
                            </div>
                            <Tag color="blue" style={{ marginTop: '4px' }}>{litter.status}</Tag>
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                      <StarOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                      <div>No active litters yet</div>
                      <div style={{ fontSize: '12px' }}>Create your first litter to get started</div>
                    </div>
                  )}
                  <div style={{ marginTop: '16px' }}>
                    <Link href="/dashboard/litters/new">
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        style={{ background: '#08979C', borderColor: '#08979C' }}
                      >
                        Add New Litter
                      </Button>
                    </Link>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={12}>
                <div style={{ 
                  background: '#fff7e6', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #ffd591'
                }}>
                  <Title level={4} style={{ marginBottom: '16px', color: '#FA8072' }}>
                    My Dogs ({dogs.length})
                  </Title>
                  {dogs.length > 0 ? (
                    <List
                      dataSource={dogs.slice(0, 3)}
                      renderItem={(dog) => (
                        <List.Item key={dog.id} style={{ padding: '8px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                            <Avatar src={dog.photoUrl} icon={<UserOutlined />} size="small" />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '500' }}>{dog.name}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {dog.breed} • {dog.gender} • {dog.weight ? `${dog.weight} lbs` : 'Weight not specified'}
                              </div>
                            </div>
                            <Tag color={getBreedingStatusColor(dog.breedingStatus)} style={{ margin: 0 }}>
                              {dog.breedingStatus.replace('_', ' ')}
                            </Tag>
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                      <UserOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                      <div>No dogs registered yet</div>
                      <div style={{ fontSize: '12px' }}>Add your breeding dogs to get started</div>
                    </div>
                  )}
                  <div style={{ marginTop: '16px' }}>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={handleAddDog}
                      style={{ background: '#FA8072', borderColor: '#FA8072' }}
                    >
                      Add New Dog
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Connect with Adopters */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MessageOutlined style={{ color: '#13C2C2', fontSize: '20px' }} />
                <span>Connect with Adopters</span>
                {unreadCount > 0 && (
                  <Badge count={unreadCount} style={{ backgroundColor: '#ff4d4f' }} />
                )}
              </div>
            }
            style={{ ...cardStyle, marginBottom: '24px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div style={{ 
                  background: '#f0f9ff', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #bae7ff'
                }}>
                  <Title level={4} style={{ marginBottom: '16px', color: '#13C2C2' }}>
                    Recent Messages ({messages.length})
                  </Title>
                  {messages.length > 0 ? (
                    <List
                      dataSource={messages.slice(0, 3)}
                      renderItem={(msg) => (
                        <List.Item key={msg.id} style={{ padding: '8px 0' }}>
                          <div style={{ width: '100%' }}>
                            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                              From: {msg.senderName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                              {msg.subject || 'No subject'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#999' }}>
                              {dayjs(msg.timestamp).fromNow()}
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                      <MessageOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                      <div>No messages yet</div>
                      <div style={{ fontSize: '12px' }}>Adopters will contact you here</div>
                    </div>
                  )}
                  <div style={{ marginTop: '16px' }}>
                    <Link href="/dashboard/messages">
                      <Button 
                        type="primary" 
                        icon={<MessageOutlined />}
                        style={{ background: '#13C2C2', borderColor: '#13C2C2' }}
                      >
                        View All Messages
                      </Button>
                    </Link>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={12}>
                <div style={{ 
                  background: '#fff1f0', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #ffccc7'
                }}>
                  <Title level={4} style={{ marginBottom: '16px', color: '#ff4d4f' }}>
                    Share Updates
                  </Title>
                  <div style={{ marginBottom: '16px' }}>
                    <Text type="secondary">
                      Keep your followers updated about your breeding program, new litters, and available puppies.
                    </Text>
                  </div>
                  <div>
                    <Button 
                      type="primary" 
                      icon={<NotificationOutlined />}
                      onClick={() => setAnnouncementModalVisible(true)}
                      style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }}
                    >
                      Create Announcement
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      ) : (
        <div>
          {/* Find Your Perfect Pet */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <HeartOutlined style={{ color: '#08979C', fontSize: '20px' }} />
                <span>Find Your Perfect Pet</span>
              </div>
            }
            style={{ ...cardStyle, marginBottom: '24px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div style={{ 
                  background: '#f0f9ff', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #bae7ff',
                  textAlign: 'center',
                  height: '100%'
                }}>
                  <EyeOutlined style={{ fontSize: '32px', color: '#08979C', marginBottom: '12px' }} />
                  <Title level={4} style={{ marginBottom: '12px', color: '#08979C' }}>
                    Browse Puppies
                  </Title>
                  <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
                    Discover available puppies from reputable breeders
                  </Text>
                  <Link href="/browse">
                    <Button 
                      type="primary" 
                      icon={<EyeOutlined />}
                      style={{ background: '#08979C', borderColor: '#08979C' }}
                    >
                      Start Browsing
                    </Button>
                  </Link>
                </div>
              </Col>
              
              <Col xs={24} md={8}>
                <div style={{ 
                  background: '#fff7e6', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #ffd591',
                  textAlign: 'center',
                  height: '100%'
                }}>
                  <UserOutlined style={{ fontSize: '32px', color: '#FA8072', marginBottom: '12px' }} />
                  <Title level={4} style={{ marginBottom: '12px', color: '#FA8072' }}>
                    Find Breeders
                  </Title>
                  <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
                    Connect with trusted breeders in your area
                  </Text>
                  <Link href="/breeders">
                    <Button 
                      type="primary" 
                      icon={<UserOutlined />}
                      style={{ background: '#FA8072', borderColor: '#FA8072' }}
                    >
                      Find Breeders
                    </Button>
                  </Link>
                </div>
              </Col>
              
              <Col xs={24} md={8}>
                <div style={{ 
                  background: '#f0f9ff', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #bae7ff',
                  textAlign: 'center',
                  height: '100%'
                }}>
                  <HeartOutlined style={{ fontSize: '32px', color: '#13C2C2', marginBottom: '12px' }} />
                  <Title level={4} style={{ marginBottom: '12px', color: '#13C2C2' }}>
                    Explore Breeds
                  </Title>
                  <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
                    Learn about different dog breeds and their characteristics
                  </Text>
                  <Link href="/breeds">
                    <Button 
                      type="primary" 
                      icon={<HeartOutlined />}
                      style={{ background: '#13C2C2', borderColor: '#13C2C2' }}
                    >
                      Explore Breeds
                    </Button>
                  </Link>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Stay Connected */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MessageOutlined style={{ color: '#13C2C2', fontSize: '20px' }} />
                <span>Stay Connected</span>
                {unreadCount > 0 && (
                  <Badge count={unreadCount} style={{ backgroundColor: '#ff4d4f' }} />
                )}
              </div>
            }
            style={{ ...cardStyle, marginBottom: '24px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div style={{ 
                  background: '#f0f9ff', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #bae7ff'
                }}>
                  <Title level={4} style={{ marginBottom: '16px', color: '#13C2C2' }}>
                    Your Messages ({messages.length})
                  </Title>
                  {messages.length > 0 ? (
                    <List
                      dataSource={messages.slice(0, 3)}
                      renderItem={(msg) => (
                        <List.Item key={msg.id} style={{ padding: '8px 0' }}>
                          <div style={{ width: '100%' }}>
                            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                              From: {msg.senderName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                              {msg.subject || 'No subject'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#999' }}>
                              {dayjs(msg.timestamp).fromNow()}
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                      <MessageOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
                      <div>No messages yet</div>
                      <div style={{ fontSize: '12px' }}>Start conversations with breeders</div>
                    </div>
                  )}
                  <div style={{ marginTop: '16px' }}>
                    <Link href="/dashboard/messages">
                      <Button 
                        type="primary" 
                        icon={<MessageOutlined />}
                        style={{ background: '#13C2C2', borderColor: '#13C2C2' }}
                      >
                        View All Messages
                      </Button>
                    </Link>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={12}>
                <div style={{ 
                  background: '#fff1f0', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #ffccc7'
                }}>
                  <Title level={4} style={{ marginBottom: '16px', color: '#ff4d4f' }}>
                    Manage Your Search
                  </Title>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Link href={`/users/${user?.userId}/edit`}>
                      <Button 
                        icon={<EditOutlined />} 
                        style={{ width: '100%' }}
                      >
                        Update Preferences
                      </Button>
                    </Link>
                    <Link href="/adoption-guide">
                      <Button 
                        icon={<EyeOutlined />} 
                        style={{ width: '100%' }}
                      >
                        Read Adoption Guide
                      </Button>
                    </Link>
                    <Link href="/users">
                      <Button 
                        icon={<UserOutlined />} 
                        style={{ width: '100%' }}
                      >
                        Find Other Adopters
                      </Button>
                    </Link>
                  </Space>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      )}

      {/* My Galleries */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24}>
          <Card 
            title="My Photo Galleries" 
            style={cardStyle}
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {/* Could open a modal for managing galleries */}}
              >
                Manage Photos
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div>
                  <Title level={5}>Profile & Cover Photos</Title>
                  <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
                    Manage your profile picture and cover photo
                  </Text>
                  <Space direction="vertical" size="middle">
                    <div>
                      <Text strong>Profile Photo:</Text>
                      <div style={{ marginTop: '8px' }}>
                        {user?.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt="Profile" 
                            style={{ 
                              width: 80, 
                              height: 80, 
                              borderRadius: '50%', 
                              objectFit: 'cover' 
                            }} 
                          />
                        ) : (
                          <div style={{ 
                            width: 80, 
                            height: 80, 
                            borderRadius: '50%', 
                            background: '#f0f0f0', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <UserOutlined style={{ fontSize: '24px', color: '#999' }} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Text strong>Cover Photo:</Text>
                      <div style={{ marginTop: '8px' }}>
                        {user?.coverPhoto ? (
                          <img 
                            src={user.coverPhoto} 
                            alt="Cover" 
                            style={{ 
                              width: 200, 
                              height: 67, 
                              borderRadius: '8px', 
                              objectFit: 'cover' 
                            }} 
                          />
                        ) : (
                          <div style={{ 
                            width: 200, 
                            height: 67, 
                            borderRadius: '8px', 
                            background: '#f0f0f0', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <Text type="secondary">No cover photo</Text>
                          </div>
                        )}
                      </div>
                    </div>
                    <Link href={`/users/${user?.userId}/edit?tab=photos`}>
                      <Button type="link" icon={<EditOutlined />}>
                        Edit Profile & Cover Photos
                      </Button>
                    </Link>
                  </Space>
                </div>
              </Col>
              
              <Col xs={24} md={12}>
                <div>
                  <Title level={5}>Photo Gallery</Title>
                  <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
                    Share photos of your pets, home, or experiences
                  </Text>
                  {galleryPhotos.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                      {galleryPhotos.slice(0, 6).map((photo, index) => (
                        <img 
                          key={index}
                          src={photo} 
                          alt={`Gallery ${index + 1}`} 
                          style={{ 
                            width: '100%', 
                            height: 80, 
                            borderRadius: '8px', 
                            objectFit: 'cover' 
                          }} 
                        />
                      ))}
                      {galleryPhotos.length > 6 && (
                        <div style={{ 
                          width: '100%', 
                          height: 80, 
                          borderRadius: '8px', 
                          background: '#f0f0f0', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <Text type="secondary">+{galleryPhotos.length - 6} more</Text>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px 20px', 
                      background: '#fafafa', 
                      borderRadius: '8px' 
                    }}>
                      <Text type="secondary">No photos in gallery yet</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Add photos to showcase your pet ownership experience
                      </Text>
                    </div>
                  )}
                  <div style={{ marginTop: '12px' }}>
                    <Link href={`/users/${user?.userId}/edit?tab=photos`}>
                      <Button type="link" icon={<EditOutlined />}>
                        {galleryPhotos.length > 0 ? 'Manage Gallery' : 'Add Photos to Gallery'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      {isBreeder ? (
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
              <Link href={`/users/${user?.userId}/edit`}>
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
      ) : null}

      {/* Messages Modal */}
      <Modal
        title="Messages"
        open={messageModalVisible}
        onCancel={() => setMessageModalVisible(false)}
        footer={null}
        width={800}
      >
        <Tabs defaultActiveKey="inbox">
          <TabPane tab={<Badge count={unreadCount}>Inbox</Badge>} key="inbox">
            <List
              dataSource={messages}
              renderItem={(msg) => (
                <List.Item 
                  key={msg.id}
                  style={{ 
                    backgroundColor: !msg.read ? '#f6ffed' : 'transparent',
                    border: !msg.read ? '1px solid #b7eb8f' : '1px solid #f0f0f0',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    padding: '12px'
                  }}
                  actions={[
                    <Button key="reply" size="small" icon={<SendOutlined />}>
                      Reply
                    </Button>,
                    !msg.read && (
                      <Button 
                        key="read"
                        size="small" 
                        onClick={() => handleMarkAsRead(msg.id)}
                      >
                        Mark as Read
                      </Button>
                    )
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <strong>{msg.senderName}</strong>
                        {!msg.read && <Tag color="green">New</Tag>}
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {dayjs(msg.timestamp).format('MMM DD, YYYY h:mm A')}
                        </Text>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>{msg.subject}</Text>
                        <Text>{msg.content}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
          <TabPane tab="Compose" key="compose">
            <Form
              form={messageForm}
              layout="vertical"
              onFinish={handleSendMessage}
            >
              <Form.Item
                name="recipient"
                label="To"
                rules={[{ required: true, message: 'Please select a recipient' }]}
              >
                <Select placeholder="Select recipient">
                  <Select.Option value="user123">Sarah Johnson</Select.Option>
                  <Select.Option value="user456">Mike Thompson</Select.Option>
                  <Select.Option value="user789">Emma Davis</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true, message: 'Please enter a subject' }]}
              >
                <Input placeholder="Enter subject" />
              </Form.Item>
              <Form.Item
                name="content"
                label="Message"
                rules={[{ required: true, message: 'Please enter your message' }]}
              >
                <TextArea rows={4} placeholder="Type your message here..." />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                  Send Message
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>

      {/* Create Announcement Modal */}
      <Modal
        title="Create Announcement"
        open={announcementModalVisible}
        onCancel={() => setAnnouncementModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={announcementForm}
          layout="vertical"
          onFinish={handleCreateAnnouncement}
        >
          <Form.Item
            name="type"
            label="Announcement Type"
            rules={[{ required: true, message: 'Please select announcement type' }]}
          >
            <Select placeholder="Select type">
              <Select.Option value="litter">Upcoming Litter</Select.Option>
              <Select.Option value="general">General Announcement</Select.Option>
              <Select.Option value="health">Health Update</Select.Option>
              <Select.Option value="achievement">Achievement</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter announcement title" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please enter content' }]}
          >
            <TextArea rows={4} placeholder="Enter announcement content..." />
          </Form.Item>

          {/* Conditional fields for litter announcements */}
          <Form.Item dependencies={['type']} noStyle>
            {({ getFieldValue }) => {
              return getFieldValue('type') === 'litter' ? (
                <>
                  <Divider>Litter Details</Divider>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="sire"
                        label="Sire (Father)"
                        rules={[{ required: true, message: 'Please select sire' }]}
                      >
                        <Select placeholder="Select sire">
                          {dogs.filter(d => d.gender === 'male' && d.breedingStatus === 'available').map(dog => (
                            <Select.Option key={dog.id} value={dog.id}>
                              {dog.name} - {dog.breed}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="dam"
                        label="Dam (Mother)"
                        rules={[{ required: true, message: 'Please select dam' }]}
                      >
                        <Select placeholder="Select dam">
                          {dogs.filter(d => d.gender === 'female' && d.breedingStatus === 'available').map(dog => (
                            <Select.Option key={dog.id} value={dog.id}>
                              {dog.name} - {dog.breed}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="expectedDate"
                        label="Expected Date"
                        rules={[{ required: true, message: 'Please select expected date' }]}
                      >
                        <DatePicker 
                          style={{ width: '100%' }}
                          disabledDate={(current) => current && current < dayjs().endOf('day')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="expectedPuppies"
                        label="Expected Number of Puppies"
                      >
                        <Select placeholder="Select expected count">
                          {[...Array(15)].map((_, i) => (
                            <Select.Option key={i + 1} value={i + 1}>
                              {i + 1} {i === 0 ? 'puppy' : 'puppies'}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="breed"
                    label="Breed"
                    rules={[{ required: true, message: 'Please enter breed' }]}
                  >
                    <Input placeholder="Enter breed" />
                  </Form.Item>
                </>
              ) : null;
            }}
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<NotificationOutlined />}>
                Create Announcement
              </Button>
              <Button onClick={() => setAnnouncementModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

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