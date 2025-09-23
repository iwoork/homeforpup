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
  BellOutlined,
  SendOutlined,
  FileTextOutlined,
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

  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case 'litter':
        return '#FA8072';
      case 'health':
        return '#08979C';
      case 'achievement':
        return '#722ED1';
      case 'general':
        return '#1890FF';
      default:
        return '#1890FF';
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

      {/* Statistics Cards */}
      {isBreeder ? (
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={cardStyle} hoverable>
              <Statistic
                title="Active Litters"
                value={activeLitters.length}
                prefix={<StarOutlined style={{ color: '#FA8072' }} />}
                valueStyle={{ color: '#FA8072' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={cardStyle} hoverable>
              <Statistic
                title="Breeding Dogs"
                value={breedingDogs.length}
                prefix={<HeartOutlined style={{ color: '#08979C' }} />}
                valueStyle={{ color: '#08979C' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={cardStyle} hoverable>
              <Statistic
                title="Total Dogs"
                value={dogs.length}
                prefix={<UserOutlined style={{ color: '#FA8072' }} />}
                valueStyle={{ color: '#FA8072' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={cardStyle} hoverable>
              <Statistic
                title="Available Puppies"
                value={availablePuppies}
                prefix={<PlusOutlined style={{ color: '#08979C' }} />}
                valueStyle={{ color: '#08979C' }}
              />
            </Card>
          </Col>
        </Row>
      ) : (
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={cardStyle} hoverable>
              <Statistic
                title="Unread Messages"
                value={unreadCount}
                prefix={<MessageOutlined style={{ color: '#08979C' }} />}
                valueStyle={{ color: '#08979C' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card style={cardStyle} hoverable>
              <Statistic
                title="Saved Breeds"
                value={Array.isArray((user as any)?.adopterInfo?.preferredBreeds) ? (user as any).adopterInfo.preferredBreeds.length : 0}
                prefix={<HeartOutlined style={{ color: '#FA8072' }} />}
                valueStyle={{ color: '#FA8072' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Community Feed & Messages */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24}>
          <Card 
            title="Community Feed & Recent Messages" 
            style={cardStyle}
            extra={
              <Space>
                <Badge count={unreadCount}>
                  <Button 
                    icon={<MessageOutlined />}
                    onClick={() => setMessageModalVisible(true)}
                  >
                    All Messages
                  </Button>
                </Badge>
              </Space>
            }
          >
            <Tabs 
              defaultActiveKey="announcements"
              items={[
                {
                  key: 'announcements',
                  label: 'Announcements',
                  children: (
                    <List
                      dataSource={announcements.slice(0, 3)}
                      renderItem={(announcement) => (
                        <List.Item key={announcement.id}>
                          <List.Item.Meta
                            avatar={
                              <Avatar 
                                style={{ 
                                  backgroundColor: getAnnouncementTypeColor(announcement.type) 
                                }}
                                icon={
                                  announcement.type === 'litter' ? <HeartOutlined /> :
                                  announcement.type === 'health' ? <BellOutlined /> :
                                  <FileTextOutlined />
                                }
                              />
                            }
                            title={
                              <Space>
                                <strong>{announcement.title}</strong>
                                <Tag color={getAnnouncementTypeColor(announcement.type)}>
                                  {announcement.type}
                                </Tag>
                              </Space>
                            }
                            description={
                              <Space direction="vertical" style={{ width: '100%' }}>
                                <Text>{announcement.content}</Text>
                                {announcement.litterInfo && (
                                  <div style={{ 
                                    background: '#f5f5f5', 
                                    padding: '8px', 
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                  }}>
                                    <strong>Litter Details:</strong> {announcement.litterInfo.sireName} x {announcement.litterInfo.damName} | 
                                    Expected: {dayjs(announcement.litterInfo.expectedDate).format('MMM DD, YYYY')} | 
                                    {announcement.litterInfo.expectedPuppies} expected puppies
                                  </div>
                                )}
                                <Space>
                                  <Text type="secondary">
                                    by {announcement.breederName} • {dayjs(announcement.timestamp).fromNow()}
                                  </Text>
                                  <Text type="secondary">
                                    {announcement.likes} likes • {announcement.comments} comments
                                  </Text>
                                </Space>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )
                },
                {
                  key: 'messages',
                  label: <Badge count={unreadCount} size="small">Recent Messages</Badge>,
                  children: (
                    <List
                      dataSource={messages.slice(0, 3)}
                      renderItem={(msg) => (
                        <List.Item 
                          key={msg.id}
                          style={{ 
                            backgroundColor: !msg.read ? '#f6ffed' : 'transparent',
                            border: !msg.read ? '1px solid #b7eb8f' : 'none',
                            borderRadius: '6px',
                            padding: '12px'
                          }}
                          actions={[
                            !msg.read && (
                              <Button 
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
                              </Space>
                            }
                            description={
                              <Space direction="vertical" style={{ width: '100%' }}>
                                <Text strong>{msg.subject}</Text>
                                <Text>{msg.content}</Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  {dayjs(msg.timestamp).fromNow()}
                                </Text>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Litters or Recommendations */}
        <Col xs={24} lg={12}>
          <Card 
            title={isBreeder ? 'Recent Litters' : 'Recommendations For You'} 
            style={{ ...cardStyle, height: '450px' }}
            extra={
              isBreeder ? (
                <Link href="/dashboard/litters/new">
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    style={{ background: '#FA8072', borderColor: '#FA8072' }}
                  >
                    Add Litter
                  </Button>
                </Link>
              ) : (
                <Link href="/browse">
                  <Button 
                    type="primary" 
                    icon={<EyeOutlined />}
                    style={{ background: '#08979C', borderColor: '#08979C' }}
                  >
                    Browse All
                  </Button>
                </Link>
              )
            }
          >
            {isBreeder ? (
              <List
                dataSource={litters.slice(0, 5)}
                loading={loading}
                locale={{ emptyText: 'No litters yet. Add your first litter to get started!' }}
                renderItem={(litter, index) => (
                  <List.Item key={`litter-${litter.id || index}`}>
                    <List.Item.Meta
                      title={`${litter.breed} Litter`}
                      description={
                        <Space direction="vertical" size="small">
                          <Text type="secondary">
                            <CalendarOutlined /> Expected: {litter.expectedDate}
                          </Text>
                          <Tag color="blue">{litter.status}</Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <List
                dataSource={Array.isArray((user as any)?.adopterInfo?.preferredBreeds) ? (user as any).adopterInfo.preferredBreeds as string[] : []}
                locale={{ emptyText: 'Set your preferences to get recommendations.' }}
                renderItem={(breed, i) => (
                  <List.Item key={`rec-${breed}-${i}`}>
                    <List.Item.Meta
                      title={breed}
                      description={<Text type="secondary">Popular near you</Text>}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* My Dogs or Quick Links */}
        <Col xs={24} lg={12}>
          <Card 
            title={isBreeder ? `My Dogs (${dogs.length})` : 'Quick Links'}
            style={{ ...cardStyle, height: '450px' }}
            extra={
              isBreeder ? (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddDog}
                  style={{ background: '#08979C', borderColor: '#08979C' }}
                >
                  Add Dog
                </Button>
              ) : null
            }
          >
            {isBreeder ? (
              <div style={{ height: '350px', overflowY: 'auto' }}>
                <List
                  dataSource={dogs.slice(0, 10)}
                  loading={dogsLoading}
                  locale={{ emptyText: 'No dogs yet. Add your first dog to get started!' }}
                  renderItem={(dog) => (
                    <List.Item
                      key={dog.id}
                      actions={[
                        <Dropdown
                          key="more"
                          menu={{ items: getDogMenuItems(dog) }}
                          trigger={['click']}
                        >
                          <Button 
                            type="text" 
                            icon={<MoreOutlined />} 
                            size="small"
                          />
                        </Dropdown>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            src={dog.photoUrl} 
                            icon={<UserOutlined />}
                            size="large"
                          />
                        }
                        title={
                          <Space>
                            <strong>{dog.name}</strong>
                            <Tag color={getBreedingStatusColor(dog.breedingStatus)}>
                              {dog.breedingStatus.replace('_', ' ')}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Text type="secondary">
                              {dog.breed} • {dog.gender} • {dog.weight ? `${dog.weight} lbs` : 'Weight not specified'}
                            </Text>
                            <Space>
                              <Tag color={getHealthStatusColor(dog.healthStatus)}>
                                {dog.healthStatus} health
                              </Tag>
                              {dog.birthDate && (
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  Born {dayjs(dog.birthDate).format('MMM DD, YYYY')}
                                </Text>
                              )}
                            </Space>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            ) : (
              <List
                dataSource={[
                  { title: 'Edit Preferences', href: `/users/${user?.userId}/edit` },
                  { title: 'Browse Puppies', href: '/browse' },
                  { title: 'Find Breeders', href: '/breeders' },
                  { title: 'Messages', href: '/dashboard/messages' },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Link href={item.href}>
                      <Button block>{item.title}</Button>
                    </Link>
                  </List.Item>
                )}
              />
            )}
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