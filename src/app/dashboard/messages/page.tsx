// pages/dashboard/messages.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  List,
  Card,
  Avatar,
  Typography,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Badge,
  Empty,
  Dropdown,
  Upload,
  message as antMessage
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  UserOutlined,
  FilterOutlined,
  PlusOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  MoreOutlined,
  InboxOutlined,
  StarOutlined,
  FlagOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { Message, MessageThread, MessageFilters } from '@/types/messaging';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea, Search } = Input;
const { confirm } = Modal;

// Form interfaces for type safety
interface ComposeMessageFormValues {
  recipient: string;
  subject: string;
  content: string;
  messageType?: 'inquiry' | 'general' | 'business' | 'urgent';
}

interface ReplyFormValues {
  content: string;
}

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [composeVisible, setComposeVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<MessageFilters>({});
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [messageForm] = Form.useForm<ComposeMessageFormValues>();
  const [replyForm] = Form.useForm<ReplyFormValues>();

  const fetchMessagesData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockThreads: MessageThread[] = [
        {
          id: 'thread1',
          subject: 'Interested in Golden Retriever puppies',
          participants: [user.id, 'user123'],
          lastMessage: {
            id: 'msg1',
            senderId: 'user123',
            senderName: 'Sarah Johnson',
            receiverId: user.id,
            receiverName: user.name || '',
            subject: 'Re: Interested in Golden Retriever puppies',
            content: 'Thank you for the information about health testing. When will the puppies be ready?',
            timestamp: dayjs().subtract(1, 'hour').toISOString(),
            read: false,
            messageType: 'inquiry'
          },
          messageCount: 4,
          unreadCount: 2,
          updatedAt: dayjs().subtract(1, 'hour').toISOString()
        },
        {
          id: 'thread2',
          subject: 'Puppy application follow-up',
          participants: [user.id, 'user456'],
          lastMessage: {
            id: 'msg2',
            senderId: user.id,
            senderName: user.name || '',
            receiverId: 'user456',
            receiverName: 'Mike Thompson',
            subject: 'Re: Puppy application follow-up',
            content: 'I have reviewed your application and would like to schedule a call.',
            timestamp: dayjs().subtract(2, 'hours').toISOString(),
            read: true,
            messageType: 'business'
          },
          messageCount: 3,
          unreadCount: 0,
          updatedAt: dayjs().subtract(2, 'hours').toISOString()
        }
      ];

      const mockMessages: Message[] = [
        {
          id: 'msg1',
          senderId: 'user123',
          senderName: 'Sarah Johnson',
          receiverId: user.id,
          receiverName: user.name || '',
          subject: 'Re: Interested in Golden Retriever puppies',
          content: 'Thank you for the information about health testing. When will the puppies be ready?',
          timestamp: dayjs().subtract(1, 'hour').toISOString(),
          read: false,
          messageType: 'inquiry',
          threadId: 'thread1'
        },
        {
          id: 'msg1-prev',
          senderId: user.id,
          senderName: user.name || '',
          receiverId: 'user123',
          receiverName: 'Sarah Johnson',
          subject: 'Re: Interested in Golden Retriever puppies',
          content: 'Both parents have completed all health testing including hips, elbows, eyes, and genetic testing. All results are available for review.',
          timestamp: dayjs().subtract(3, 'hours').toISOString(),
          read: true,
          messageType: 'inquiry',
          threadId: 'thread1'
        }
      ];

      setThreads(mockThreads);
      setMessages(mockMessages);
      setUnreadCount(mockThreads.reduce((sum, thread) => sum + thread.unreadCount, 0));
      
      if (mockThreads.length > 0) {
        setSelectedThread(mockThreads[0]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.name]);

  useEffect(() => {
    if (user) {
      fetchMessagesData();
    }
  }, [user, fetchMessagesData]);

  const handleSelectThread = (thread: MessageThread) => {
    setSelectedThread(thread);
    // Mark messages as read
    if (thread.unreadCount > 0) {
      markThreadAsRead(thread.id);
    }
  };

  const markThreadAsRead = async (threadId: string) => {
    // Update UI optimistically
    setThreads(threads.map(t => 
      t.id === threadId ? { ...t, unreadCount: 0 } : t
    ));
    setUnreadCount(prev => Math.max(0, prev - (threads.find(t => t.id === threadId)?.unreadCount || 0)));
  };

  const handleSendMessage = async (values: ComposeMessageFormValues) => {
    try {
      setSendingMessage(true);
      
      // Create new message
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: user?.id || '',
        senderName: user?.name || '',
        receiverId: values.recipient,
        receiverName: 'Recipient Name', // Would come from user lookup
        subject: values.subject,
        content: values.content,
        timestamp: dayjs().toISOString(),
        read: false,
        messageType: values.messageType || 'general'
      };

      // Add to messages (in real app, this would be an API call)
      setMessages([newMessage, ...messages]);
      
      antMessage.success('Message sent successfully!');
      messageForm.resetFields();
      setComposeVisible(false);
    } catch (err) {
      console.error('Failed to send message:', err);
      antMessage.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleReplyToMessage = async (values: ReplyFormValues) => {
    if (!selectedThread) return;

    try {
      setSendingMessage(true);
      
      const replyMessage: Message = {
        id: Date.now().toString(),
        senderId: user?.id || '',
        senderName: user?.name || '',
        receiverId: selectedThread.participants.find(p => p !== user?.id) || '',
        receiverName: 'Other Participant',
        subject: `Re: ${selectedThread.subject}`,
        content: values.content,
        timestamp: dayjs().toISOString(),
        read: false,
        messageType: 'general',
        threadId: selectedThread.id
      };

      setMessages([replyMessage, ...messages]);
      
      antMessage.success('Reply sent successfully!');
      replyForm.resetFields();
    } catch (err) {
      console.error('Failed to send reply:', err);
      antMessage.error('Failed to send reply');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteThread = (threadId: string) => {
    confirm({
      title: 'Delete Conversation',
      content: 'Are you sure you want to delete this entire conversation? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        setThreads(threads.filter(t => t.id !== threadId));
        if (selectedThread?.id === threadId) {
          setSelectedThread(threads[0] || null);
        }
        antMessage.success('Conversation deleted');
      }
    });
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'inquiry': return 'blue';
      case 'business': return 'green';
      case 'urgent': return 'red';
      default: return 'default';
    }
  };

  const getThreadMenuItems = (thread: MessageThread) => [
    {
      key: 'markRead',
      icon: <EyeOutlined />,
      label: 'Mark as Read',
      disabled: thread.unreadCount === 0,
      onClick: () => markThreadAsRead(thread.id)
    },
    {
      key: 'star',
      icon: <StarOutlined />,
      label: 'Star Conversation'
    },
    {
      key: 'flag',
      icon: <FlagOutlined />,
      label: 'Flag as Important'
    },
    {
      type: 'divider' as const
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete Conversation',
      danger: true,
      onClick: () => handleDeleteThread(thread.id)
    }
  ];

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = !searchValue || 
      thread.subject.toLowerCase().includes(searchValue.toLowerCase()) ||
      thread.lastMessage.content.toLowerCase().includes(searchValue.toLowerCase());
    
    const matchesFilter = !filters.read || 
      (filters.read && thread.unreadCount === 0) ||
      (!filters.read && thread.unreadCount > 0);
    
    return matchesSearch && matchesFilter;
  });

  const threadMessages = messages.filter(msg => msg.threadId === selectedThread?.id);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ color: '#08979C', marginBottom: '8px' }}>
          <MessageOutlined style={{ marginRight: '12px' }} />
          Messages
          <Badge count={unreadCount} offset={[10, 0]} />
        </Title>
        <Text style={{ color: '#595959' }}>
          Manage your conversations with potential puppy families and fellow breeders.
        </Text>
      </div>

      <Layout style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', minHeight: '600px' }}>
        {/* Conversations Sidebar */}
        <Sider 
          width={400} 
          style={{ 
            background: '#fafafa', 
            borderRight: '1px solid #f0f0f0',
            padding: '16px 0'
          }}
        >
          <div style={{ padding: '0 16px', marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Search
                placeholder="Search conversations..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{ width: '100%' }}
              />
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setComposeVisible(true)}
                  style={{ background: '#08979C', borderColor: '#08979C' }}
                >
                  New Message
                </Button>
                <Dropdown
                  menu={{
                    items: [
                      { key: 'all', label: 'All Messages' },
                      { key: 'unread', label: 'Unread Only' },
                      { key: 'inquiries', label: 'Puppy Inquiries' },
                      { key: 'business', label: 'Business' }
                    ],
                    onClick: ({ key }) => {
                      if (key === 'unread') setFilters({ read: false });
                      else if (key === 'inquiries') setFilters({ type: 'inquiry' });
                      else if (key === 'business') setFilters({ type: 'business' });
                      else setFilters({});
                    }
                  }}
                  trigger={['click']}
                >
                  <Button icon={<FilterOutlined />}>
                    Filter
                  </Button>
                </Dropdown>
              </Space>
            </Space>
          </div>

          <div style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <List
              dataSource={filteredThreads}
              loading={loading}
              locale={{ emptyText: <Empty description="No conversations yet" /> }}
              renderItem={(thread) => (
                <List.Item
                  key={thread.id}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: selectedThread?.id === thread.id ? '#e6f7ff' : 'transparent',
                    borderLeft: selectedThread?.id === thread.id ? '3px solid #1890ff' : '3px solid transparent',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                  onClick={() => handleSelectThread(thread)}
                  actions={[
                    <Dropdown
                      key="more"
                      menu={{ items: getThreadMenuItems(thread) }}
                      trigger={['click']}
                    >
                      <Button 
                        type="text" 
                        icon={<MoreOutlined />} 
                        size="small"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge count={thread.unreadCount} size="small">
                        <Avatar icon={<UserOutlined />} />
                      </Badge>
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong={thread.unreadCount > 0} style={{ fontSize: '14px' }}>
                          {thread.subject}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {dayjs(thread.updatedAt).fromNow()}
                        </Text>
                      </div>
                    }
                    description={
                      <div>
                        <Text 
                          type="secondary" 
                          style={{ 
                            fontSize: '12px',
                            fontWeight: thread.unreadCount > 0 ? 500 : 'normal'
                          }}
                        >
                          {thread.lastMessage.content.length > 50 
                            ? `${thread.lastMessage.content.substring(0, 50)}...` 
                            : thread.lastMessage.content
                          }
                        </Text>
                        <div style={{ marginTop: '4px' }}>
                          <Tag 
                            color={getMessageTypeColor(thread.lastMessage.messageType)}
                          >
                            {thread.lastMessage.messageType}
                          </Tag>
                          <Text type="secondary" style={{ fontSize: '11px', marginLeft: '8px' }}>
                            {thread.messageCount} messages
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </Sider>

        {/* Messages Content */}
        <Content style={{ display: 'flex', flexDirection: 'column' }}>
          {selectedThread ? (
            <>
              {/* Thread Header */}
              <div style={{ 
                padding: '16px 24px', 
                borderBottom: '1px solid #f0f0f0',
                background: '#fff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Title level={4} style={{ margin: 0, color: '#08979C' }}>
                      {selectedThread.subject}
                    </Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {selectedThread.messageCount} messages • Last updated {dayjs(selectedThread.updatedAt).fromNow()}
                    </Text>
                  </div>
                  <Space>
                    <Button icon={<StarOutlined />} type="text">Star</Button>
                    <Button icon={<FlagOutlined />} type="text">Flag</Button>
                  </Space>
                </div>
              </div>

              {/* Messages List */}
              <div style={{ 
                flex: 1, 
                padding: '16px 24px', 
                overflowY: 'auto',
                background: '#fafafa'
              }}>
                <List
                  dataSource={threadMessages.sort((a, b) => 
                    dayjs(a.timestamp).isBefore(b.timestamp) ? -1 : 1
                  )}
                  renderItem={(msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: msg.senderId === user?.id ? 'flex-end' : 'flex-start',
                        marginBottom: '16px'
                      }}
                    >
                      <Card
                        style={{
                          maxWidth: '70%',
                          backgroundColor: msg.senderId === user?.id ? '#e6f7ff' : '#fff',
                          border: msg.senderId === user?.id ? '1px solid #91d5ff' : '1px solid #f0f0f0'
                        }}
                        bodyStyle={{ padding: '12px 16px' }}
                      >
                        <div style={{ marginBottom: '8px' }}>
                          <Space>
                            <Text strong style={{ fontSize: '13px' }}>
                              {msg.senderName}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              {dayjs(msg.timestamp).format('MMM DD, h:mm A')}
                            </Text>
                            <Tag color={getMessageTypeColor(msg.messageType)}>
                              {msg.messageType}
                            </Tag>
                          </Space>
                        </div>
                        <Paragraph style={{ margin: 0, fontSize: '14px' }}>
                          {msg.content}
                        </Paragraph>
                      </Card>
                    </div>
                  )}
                />
              </div>

              {/* Reply Form */}
              <div style={{ 
                padding: '16px 24px', 
                borderTop: '1px solid #f0f0f0',
                background: '#fff'
              }}>
                <Form
                  form={replyForm}
                  onFinish={handleReplyToMessage}
                  layout="vertical"
                >
                  <Form.Item
                    name="content"
                    rules={[{ required: true, message: 'Please enter your reply' }]}
                    style={{ marginBottom: '12px' }}
                  >
                    <TextArea
                      rows={3}
                      placeholder="Type your reply..."
                      disabled={sendingMessage}
                    />
                  </Form.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <Upload beforeUpload={() => false}>
                        <Button icon={<PaperClipOutlined />} type="text" size="small">
                          Attach
                        </Button>
                      </Upload>
                    </Space>
                    <Space>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        icon={<SendOutlined />}
                        loading={sendingMessage}
                        style={{ background: '#08979C', borderColor: '#08979C' }}
                      >
                        Send Reply
                      </Button>
                    </Space>
                  </div>
                </Form>
              </div>
            </>
          ) : (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column'
            }}>
              <Empty
                image={<InboxOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
                description={
                  <div>
                    <Title level={4} type="secondary">Select a conversation</Title>
                    <Text type="secondary">Choose a conversation from the left to start messaging</Text>
                  </div>
                }
              />
            </div>
          )}
        </Content>
      </Layout>

      {/* Compose New Message Modal */}
      <Modal
        title="Compose New Message"
        open={composeVisible}
        onCancel={() => setComposeVisible(false)}
        footer={null}
        width={600}
      >
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
            <Select
              placeholder="Select recipient or enter email"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={[
                { value: 'user123', label: 'Sarah Johnson (sarah@email.com)' },
                { value: 'user456', label: 'Mike Thompson (mike@email.com)' },
                { value: 'user789', label: 'Emma Davis (emma@email.com)' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="messageType"
            label="Message Type"
            rules={[{ required: true, message: 'Please select message type' }]}
          >
            <Select placeholder="Select message type">
              <Select.Option value="inquiry">Puppy Inquiry</Select.Option>
              <Select.Option value="business">Business</Select.Option>
              <Select.Option value="general">General</Select.Option>
              <Select.Option value="urgent">Urgent</Select.Option>
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
            <TextArea rows={6} placeholder="Type your message here..." />
          </Form.Item>

          <Form.Item label="Attachments">
            <Upload.Dragger
              multiple
              beforeUpload={() => false}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            >
              <p className="ant-upload-drag-icon">
                <PaperClipOutlined />
              </p>
              <p className="ant-upload-text">Click or drag files to attach</p>
              <p className="ant-upload-hint">
                Support for PDF, DOC, DOCX, JPG, PNG files up to 10MB
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SendOutlined />}
                loading={sendingMessage}
                style={{ background: '#08979C', borderColor: '#08979C' }}
              >
                Send Message
              </Button>
              <Button onClick={() => setComposeVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MessagesPage;