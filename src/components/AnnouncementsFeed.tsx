'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  List,
  Avatar,
  Typography,
  Button,
  Space,
  Tag,
  Image,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Row,
  Col,
  Divider,
  Tooltip,
  Dropdown,
  Empty,
  message as antMessage,
  Carousel,
} from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  MessageOutlined,
  MoreOutlined,
  EyeOutlined,
  FlagOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  FileImageOutlined,
  SendOutlined,
  BookFilled,
  BookOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/hooks/useDogs';
import { Announcement, AnnouncementComment } from '@/types/messaging';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface AnnouncementFormValues {
  title: string;
  content: string;
  type: 'available' | 'general' | 'litter' | 'health' | 'achievement' | 'event';
  tags?: string[];
  sire?: string;
  dam?: string;
  expectedDate?: dayjs.Dayjs;
  expectedPuppies?: number;
  breed?: string;
  readyDate?: dayjs.Dayjs;
  priceMin?: number;
  priceMax?: number;
  deposit?: number;
  breedingRights?: 'included' | 'additional' | 'not_available';
  applicationRequired?: boolean;
  waitingListOpen?: boolean;
  visibility?: 'public' | 'followers' | 'private';
}

interface CommentFormValues {
  comment: string;
}

interface AnnouncementsFeedProps {
  showCreateButton?: boolean;
  maxItems?: number;
  feedType?: 'home' | 'profile' | 'community';
}

// Custom Comment component to replace the removed Ant Design Comment
const CommentItem: React.FC<{
  author: string;
  avatar: React.ReactNode;
  content: string;
  datetime: string;
}> = ({ author, avatar, content, datetime }) => (
  <div style={{ 
    display: 'flex', 
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#fafafa',
    borderRadius: '8px'
  }}>
    <div style={{ marginRight: '12px' }}>
      {avatar}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '4px',
        gap: '8px'
      }}>
        <Text strong style={{ fontSize: '14px' }}>{author}</Text>
        <Text type="secondary" style={{ fontSize: '12px' }}>{datetime}</Text>
      </div>
      <div>
        <Text style={{ fontSize: '14px' }}>{content}</Text>
      </div>
    </div>
  </div>
);

const AnnouncementsFeed: React.FC<AnnouncementsFeedProps> = ({
  showCreateButton = true,
  maxItems,
  feedType: _feedType = 'community' // Prefix with underscore to indicate intentionally unused
}) => {
  const { user } = useAuth();
  const { dogs } = useDogs();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, AnnouncementComment[]>>({});
  
  const [createForm] = Form.useForm<AnnouncementFormValues>();
  const [commentForm] = Form.useForm<CommentFormValues>();

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockAnnouncements: Announcement[] = [
        {
          id: '1',
          breederId: user?.id || 'user1',
          breederName: user?.name || 'Mountain View Kennel',
          breederAvatar: undefined,
          kennel: 'Mountain View Kennel',
          title: 'Exciting Golden Retriever Litter Expected!',
          content: 'We are thrilled to announce an upcoming litter from our champion bloodlines. Both parents have excellent health clearances including OFA hips/elbows, CERF eyes, and genetic testing for common breed conditions. This pairing represents years of careful breeding for temperament, health, and conformation.',
          type: 'litter',
          status: 'published',
          timestamp: dayjs().subtract(2, 'days').toISOString(),
          images: [
            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'
          ],
          tags: ['golden-retriever', 'champion-bloodlines', 'health-tested'],
          location: {
            city: 'Burnaby',
            state: 'BC',
            country: 'Canada'
          },
          litterInfo: {
            sireId: 'dog1',
            sireName: 'CH Mountain View Thunder',
            sireRegistration: 'CKC ABC123',
            damId: 'dog2',
            damName: 'CH Golden Fields Belle',
            damRegistration: 'CKC DEF456',
            expectedDate: dayjs().add(45, 'days').format('YYYY-MM-DD'),
            breed: 'Golden Retriever',
            expectedPuppies: 8,
            puppyPrice: { min: 2500, max: 3000, currency: 'CAD' },
            depositeRequired: 500,
            breedingRights: 'additional',
            healthTesting: {
              sire: [
                { testName: 'OFA Hip', result: 'Good', date: '2024-01-15', certifyingBody: 'OFA' },
                { testName: 'OFA Elbow', result: 'Normal', date: '2024-01-15', certifyingBody: 'OFA' }
              ],
              dam: [
                { testName: 'OFA Hip', result: 'Excellent', date: '2024-02-10', certifyingBody: 'OFA' },
                { testName: 'CERF Eyes', result: 'Clear', date: '2024-03-01', certifyingBody: 'CERF' }
              ]
            },
            pupyApplicationRequired: true,
            waitingListOpen: true,
            estimatedReadyDate: dayjs().add(90, 'days').format('YYYY-MM-DD')
          },
          visibility: 'public',
          interactions: {
            likes: 24,
            shares: 7,
            saves: 12,
            comments: 15
          }
        },
        {
          id: '2',
          breederId: 'other_breeder',
          breederName: 'Sunset Labradors',
          kennel: 'Sunset Labradors',
          title: 'Amazing Success at Regional Dog Show!',
          content: 'We are proud to announce that our Labrador "Sunset\'s Morning Glory" took Winners Bitch and Best of Winners at the regional specialty show this weekend! This was her first major win and we couldn\'t be more thrilled.',
          type: 'achievement',
          status: 'published',
          timestamp: dayjs().subtract(1, 'day').toISOString(),
          images: [
            'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400'
          ],
          tags: ['dog-show', 'labrador', 'achievement', 'winner'],
          location: {
            city: 'Vancouver',
            state: 'BC',
            country: 'Canada'
          },
          visibility: 'public',
          interactions: {
            likes: 45,
            shares: 12,
            saves: 8,
            comments: 23
          }
        },
        {
          id: '3',
          breederId: 'health_breeder',
          breederName: 'Healthy Paws Kennel',
          title: 'New Health Testing Results Available',
          content: 'All of our breeding dogs have completed their annual health screenings with excellent results. We believe in transparency and all health certificates are available for review by prospective puppy families.',
          type: 'health',
          status: 'published',
          timestamp: dayjs().subtract(3, 'days').toISOString(),
          tags: ['health-testing', 'transparency', 'breeding'],
          healthInfo: {
            dogIds: ['dog1', 'dog2', 'dog3'],
            testType: 'Annual Health Screening',
            testDate: '2024-09-01',
            results: 'All dogs cleared with excellent results',
            certifyingOrganization: 'OFA'
          },
          visibility: 'public',
          interactions: {
            likes: 18,
            shares: 5,
            saves: 15,
            comments: 8
          }
        }
      ];

      const displayAnnouncements = maxItems 
        ? mockAnnouncements.slice(0, maxItems)
        : mockAnnouncements;

      setAnnouncements(displayAnnouncements);
      
      // Mock some liked and saved posts
      setLikedPosts(new Set(['1']));
      setSavedPosts(new Set(['2']));
      
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  }, [maxItems, user?.id, user?.name]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreateAnnouncement = async (values: AnnouncementFormValues) => {
    try {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        breederId: user?.id || '',
        breederName: user?.name || 'Your Kennel',
        title: values.title,
        content: values.content,
        type: values.type,
        status: 'published',
        timestamp: dayjs().toISOString(),
        images: [], // Handle image uploads in real implementation
        tags: values.tags || [],
        litterInfo: values.type === 'litter' ? {
          sireId: values.sire || '',
          sireName: dogs.find(d => d.id === values.sire)?.name || '',
          damId: values.dam || '',
          damName: dogs.find(d => d.id === values.dam)?.name || '',
          expectedDate: values.expectedDate?.format('YYYY-MM-DD') || '',
          breed: values.breed || '',
          expectedPuppies: values.expectedPuppies,
          puppyPrice: values.priceMin && values.priceMax ? {
            min: values.priceMin,
            max: values.priceMax,
            currency: 'CAD'
          } : undefined,
          depositeRequired: values.deposit,
          breedingRights: values.breedingRights,
          healthTesting: { sire: [], dam: [] },
          pupyApplicationRequired: values.applicationRequired,
          waitingListOpen: values.waitingListOpen,
          estimatedReadyDate: values.readyDate?.format('YYYY-MM-DD')
        } : undefined,
        visibility: values.visibility || 'public',
        interactions: {
          likes: 0,
          shares: 0,
          saves: 0,
          comments: 0
        }
      };

      setAnnouncements([newAnnouncement, ...announcements]);
      antMessage.success('Announcement created successfully!');
      createForm.resetFields();
      setCreateModalVisible(false);
    } catch (error) {
      console.error('Error creating announcement:', error);
      antMessage.error('Failed to create announcement');
    }
  };

  const handleLike = (announcementId: string) => {
    const newLikedPosts = new Set(likedPosts);
    const announcement = announcements.find(a => a.id === announcementId);
    
    if (newLikedPosts.has(announcementId)) {
      newLikedPosts.delete(announcementId);
      if (announcement) {
        announcement.interactions.likes--;
      }
    } else {
      newLikedPosts.add(announcementId);
      if (announcement) {
        announcement.interactions.likes++;
      }
    }
    
    setLikedPosts(newLikedPosts);
    setAnnouncements([...announcements]);
  };

  const handleSave = (announcementId: string) => {
    const newSavedPosts = new Set(savedPosts);
    
    if (newSavedPosts.has(announcementId)) {
      newSavedPosts.delete(announcementId);
      antMessage.success('Removed from saved posts');
    } else {
      newSavedPosts.add(announcementId);
      antMessage.success('Added to saved posts');
    }
    
    setSavedPosts(newSavedPosts);
  };

  const handleComment = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setCommentModalVisible(true);
  };

  const handleShare = (announcement: Announcement) => {
    // In real implementation, this would open a share modal or copy link
    navigator.clipboard.writeText(`Check out this announcement: ${announcement.title}`);
    antMessage.success('Link copied to clipboard!');
  };

  const getAnnouncementTypeColor = (type: string) => {
    switch (type) {
      case 'litter': return '#FA8072';
      case 'health': return '#08979C';
      case 'achievement': return '#722ED1';
      case 'event': return '#52C41A';
      case 'available': return '#1890FF';
      case 'general': return '#595959';
      default: return '#1890FF';
    }
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'litter': return '🐕';
      case 'health': return '🏥';
      case 'achievement': return '🏆';
      case 'event': return '📅';
      case 'available': return '💎';
      case 'general': return '📢';
      default: return '📢';
    }
  };

  const renderLitterInfo = (litterInfo: Announcement['litterInfo']) => {
    if (!litterInfo) return null;
    
    return (
      <Card
        size="small"
        title="Litter Details"
        style={{ marginTop: '12px', backgroundColor: '#f8f9ff' }}
      >
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text strong>Sire:</Text>
            <br />
            <Text>{litterInfo.sireName}</Text>
            {litterInfo.sireRegistration && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <br />({litterInfo.sireRegistration})
              </Text>
            )}
          </Col>
          <Col span={12}>
            <Text strong>Dam:</Text>
            <br />
            <Text>{litterInfo.damName}</Text>
            {litterInfo.damRegistration && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <br />({litterInfo.damRegistration})
              </Text>
            )}
          </Col>
          <Col span={12}>
            <Text strong>Expected Date:</Text>
            <br />
            <Text>
              <CalendarOutlined style={{ marginRight: '4px' }} />
              {dayjs(litterInfo.expectedDate).format('MMM DD, YYYY')}
            </Text>
          </Col>
          <Col span={12}>
            <Text strong>Expected Puppies:</Text>
            <br />
            <Text>{litterInfo.expectedPuppies || 'TBD'}</Text>
          </Col>
          {litterInfo.puppyPrice && (
            <Col span={12}>
              <Text strong>Price Range:</Text>
              <br />
              <Text>
                ${litterInfo.puppyPrice.min.toLocaleString()} - ${litterInfo.puppyPrice.max.toLocaleString()} {litterInfo.puppyPrice.currency}
              </Text>
            </Col>
          )}
          {litterInfo.estimatedReadyDate && (
            <Col span={12}>
              <Text strong>Ready Date:</Text>
              <br />
              <Text>{dayjs(litterInfo.estimatedReadyDate).format('MMM DD, YYYY')}</Text>
            </Col>
          )}
        </Row>
        {litterInfo.waitingListOpen && (
          <div style={{ marginTop: '12px' }}>
            <Tag color="green">Waiting List Open</Tag>
            {litterInfo.pupyApplicationRequired && (
              <Tag color="blue">Application Required</Tag>
            )}
          </div>
        )}
      </Card>
    );
  };

  const renderAnnouncementActions = (announcement: Announcement) => [
    <Tooltip key="like" title={likedPosts.has(announcement.id) ? 'Unlike' : 'Like'}>
      <Button
        type="text"
        icon={likedPosts.has(announcement.id) ? 
          <HeartFilled style={{ color: '#ff4d4f' }} /> : 
          <HeartOutlined />
        }
        onClick={() => handleLike(announcement.id)}
        style={{ padding: '4px 8px' }}
      >
        {announcement.interactions.likes}
      </Button>
    </Tooltip>,
    <Tooltip key="comment" title="Comment">
      <Button
        type="text"
        icon={<MessageOutlined />}
        onClick={() => handleComment(announcement)}
        style={{ padding: '4px 8px' }}
      >
        {announcement.interactions.comments}
      </Button>
    </Tooltip>,
    <Tooltip key="share" title="Share">
      <Button
        type="text"
        icon={<ShareAltOutlined />}
        onClick={() => handleShare(announcement)}
        style={{ padding: '4px 8px' }}
      >
        {announcement.interactions.shares}
      </Button>
    </Tooltip>,
    <Tooltip key="save" title={savedPosts.has(announcement.id) ? 'Unsave' : 'Save'}>
      <Button
        type="text"
        icon={savedPosts.has(announcement.id) ? 
          <BookFilled style={{ color: '#1890ff' }} /> : 
          <BookOutlined />
        }
        onClick={() => handleSave(announcement.id)}
        style={{ padding: '4px 8px' }}
      />
    </Tooltip>
  ];

  return (
    <div>
      {showCreateButton && (
        <Card style={{ marginBottom: '16px' }}>
          <Button
            type="dashed"
            block
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
            style={{ 
              height: '60px',
              color: '#FA8072',
              borderColor: '#FA8072'
            }}
          >
            Share an announcement with the community
          </Button>
        </Card>
      )}

      <List
        dataSource={announcements}
        loading={loading}
        locale={{ emptyText: <Empty description="No announcements yet" /> }}
        renderItem={(announcement) => (
          <Card
            key={announcement.id}
            style={{ marginBottom: '16px' }}
            actions={renderAnnouncementActions(announcement)}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={announcement.breederAvatar}
                  icon={<UserOutlined />}
                  style={{ marginRight: '12px' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text strong>{announcement.breederName}</Text>
                    {announcement.kennel && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        • {announcement.kennel}
                      </Text>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {dayjs(announcement.timestamp).fromNow()}
                    </Text>
                    {announcement.location && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        • <EnvironmentOutlined /> {announcement.location.city}, {announcement.location.state}
                      </Text>
                    )}
                  </div>
                </div>
              </div>
              <Dropdown
                menu={{
                  items: [
                    { key: 'view', icon: <EyeOutlined />, label: 'View Details' },
                    { key: 'flag', icon: <FlagOutlined />, label: 'Report' },
                    ...(announcement.breederId === user?.id ? [
                      { type: 'divider' as const },
                      { key: 'edit', icon: <EditOutlined />, label: 'Edit' },
                      { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true }
                    ] : [])
                  ]
                }}
                trigger={['click']}
              >
                <Button type="text" icon={<MoreOutlined />} />
              </Dropdown>
            </div>

            {/* Content */}
            <div style={{ marginBottom: '16px' }}>
              <Title level={4} style={{ margin: '0 0 8px 0' }}>
                <span style={{ marginRight: '8px' }}>
                  {getAnnouncementIcon(announcement.type)}
                </span>
                {announcement.title}
              </Title>
              
              <div style={{ marginBottom: '8px' }}>
                <Tag color={getAnnouncementTypeColor(announcement.type)}>
                  {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                </Tag>
                {announcement.tags?.map(tag => (
                  <Tag key={tag} style={{ fontSize: '11px' }}>
                    #{tag}
                  </Tag>
                ))}
              </div>

              <Paragraph>{announcement.content}</Paragraph>

              {/* Litter-specific information */}
              {announcement.litterInfo && renderLitterInfo(announcement.litterInfo)}

              {/* Health information */}
              {announcement.healthInfo && (
                <Card size="small" title="Health Testing Update" style={{ marginTop: '12px' }}>
                  <Text><strong>Test Type:</strong> {announcement.healthInfo.testType}</Text><br />
                  <Text><strong>Date:</strong> {dayjs(announcement.healthInfo.testDate).format('MMM DD, YYYY')}</Text><br />
                  <Text><strong>Results:</strong> {announcement.healthInfo.results}</Text><br />
                  <Text><strong>Certifying Organization:</strong> {announcement.healthInfo.certifyingOrganization}</Text>
                </Card>
              )}

              {/* Images */}
              {announcement.images && announcement.images.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  {announcement.images.length === 1 ? (
                    <Image
                      src={announcement.images[0]}
                      alt="Announcement image"
                      style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <Carousel>
                      {announcement.images.map((image, index) => (
                        <div key={index}>
                          <Image
                            src={image}
                            alt={`Announcement image ${index + 1}`}
                            style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                          />
                        </div>
                      ))}
                    </Carousel>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
      />

      {/* Create Announcement Modal */}
      <Modal
        title="Create New Announcement"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateAnnouncement}
        >
          <Form.Item
            name="type"
            label="Announcement Type"
            rules={[{ required: true, message: 'Please select announcement type' }]}
          >
            <Select placeholder="Select type">
              <Select.Option value="litter">
                🐕 Upcoming Litter
              </Select.Option>
              <Select.Option value="available">
                💎 Puppies Available
              </Select.Option>
              <Select.Option value="health">
                🏥 Health Update
              </Select.Option>
              <Select.Option value="achievement">
                🏆 Achievement
              </Select.Option>
              <Select.Option value="event">
                📅 Event
              </Select.Option>
              <Select.Option value="general">
                📢 General Announcement
              </Select.Option>
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
            <TextArea rows={4} placeholder="Share your announcement with the community..." />
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
                        name="applicationRequired"
                        label="Application Required"
                      >
                        <Select placeholder="Is application required?">
                          <Select.Option value={true}>Yes, Application Required</Select.Option>
                          <Select.Option value={false}>No Application Required</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="waitingListOpen"
                    label="Waiting List Status"
                  >
                    <Select placeholder="Select waiting list status">
                      <Select.Option value={true}>Waiting List Open</Select.Option>
                      <Select.Option value={false}>Waiting List Closed</Select.Option>
                    </Select>
                  </Form.Item>
                </>
              ) : null;
            }}
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags (Optional)"
          >
            <Select
              mode="tags"
              placeholder="Add tags to help others find your announcement"
              style={{ width: '100%' }}
            >
              <Select.Option value="health-tested">health-tested</Select.Option>
              <Select.Option value="champion-bloodlines">champion-bloodlines</Select.Option>
              <Select.Option value="family-friendly">family-friendly</Select.Option>
              <Select.Option value="therapy-dog">therapy-dog</Select.Option>
              <Select.Option value="working-dog">working-dog</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="images"
            label="Images (Optional)"
          >
            <Upload.Dragger
              multiple
              beforeUpload={() => false}
              accept="image/*"
              listType="picture"
            >
              <p className="ant-upload-drag-icon">
                <FileImageOutlined />
              </p>
              <p className="ant-upload-text">Click or drag images to upload</p>
              <p className="ant-upload-hint">
                Support for JPG, PNG files. Max 5 images, 5MB each.
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item
            name="visibility"
            label="Visibility"
            initialValue="public"
          >
            <Select>
              <Select.Option value="public">🌍 Public - Visible to everyone</Select.Option>
              <Select.Option value="followers">👥 Followers Only</Select.Option>
              <Select.Option value="private">🔒 Private - Only you can see</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                style={{ background: '#FA8072', borderColor: '#FA8072' }}
              >
                Create Announcement
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Comments Modal */}
      <Modal
        title={`Comments - ${selectedAnnouncement?.title}`}
        open={commentModalVisible}
        onCancel={() => setCommentModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedAnnouncement && (
          <div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '16px' }}>
              {comments[selectedAnnouncement.id]?.length ? (
                comments[selectedAnnouncement.id].map(comment => (
                  <CommentItem
                    key={comment.id}
                    author={comment.userName}
                    avatar={<Avatar icon={<UserOutlined />} />}
                    content={comment.content}
                    datetime={dayjs(comment.timestamp).fromNow()}
                  />
                ))
              ) : (
                <Empty description="No comments yet. Be the first to comment!" />
              )}
            </div>
            
            <Form
              form={commentForm}
              onFinish={(values: CommentFormValues) => {
                // Add comment logic here
                const newComment: AnnouncementComment = {
                  id: Date.now().toString(),
                  userId: user?.id || '',
                  userName: user?.name || 'Anonymous',
                  content: values.comment,
                  timestamp: dayjs().toISOString(),
                  likes: 0
                };
                
                const currentComments = comments[selectedAnnouncement.id] || [];
                setComments({
                  ...comments,
                  [selectedAnnouncement.id]: [...currentComments, newComment]
                });
                
                // Update announcement comment count
                const updatedAnnouncements = announcements.map(a => 
                  a.id === selectedAnnouncement.id 
                    ? { ...a, interactions: { ...a.interactions, comments: a.interactions.comments + 1 }}
                    : a
                );
                setAnnouncements(updatedAnnouncements);
                
                commentForm.resetFields();
                antMessage.success('Comment added!');
              }}
            >
              <Form.Item
                name="comment"
                rules={[{ required: true, message: 'Please enter your comment' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="Write a comment..."
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SendOutlined />}
                  style={{ background: '#08979C', borderColor: '#08979C' }}
                >
                  Post Comment
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AnnouncementsFeed;