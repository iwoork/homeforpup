'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  List,
  Button,
  Input,
  Select,
  Space,
  Typography,
  Tag,
  Avatar,
  Badge,
  Empty,
  Spin,
  message,
  Modal,
  Form,
  Divider,
  Row,
  Col,
  Drawer
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  UserOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  UndoOutlined,
  ArrowLeftOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useMessaging } from '../hooks/useMessaging';
import ComposeMessage from './ComposeMessage';
import ChatMessage from './ChatMessage';
import InlineReplyForm from './InlineReplyForm';
import { Message, MessageThread } from '../types';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

type MessageType = "general" | "inquiry" | "business" | "urgent";

interface MessagesPageProps {
  userId?: string;
  userType?: 'dog-parent' | 'breeder';
}

const MessagesPage: React.FC<MessagesPageProps> = ({ userId, userType = 'dog-parent' }) => {
  const {
    messages,
    threads,
    unreadCount,
    loading,
    error,
    sendMessage,
    markAsRead,
    deleteMessage,
    fetchThreadMessages,
    fetchMessages
  } = useMessaging(userId);

  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [composeVisible, setComposeVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageTypeFilter, setMessageTypeFilter] = useState<MessageType | 'all'>('all');
  const [loadingThread, setLoadingThread] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showThreadList, setShowThreadList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowThreadList(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load thread messages when a thread is selected
  useEffect(() => {
    if (selectedThread) {
      setLoadingThread(true);
      fetchThreadMessages(selectedThread.id).then(messages => {
        // Sort messages by timestamp (oldest first for chat display)
        const sortedMessages = messages.sort((a: Message, b: Message) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setThreadMessages(sortedMessages);
        setLoadingThread(false);
      });
    }
  }, [selectedThread, fetchThreadMessages]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [threadMessages]);

  const handleSendMessage = async (values: any) => {
    try {
      await sendMessage({
        recipientId: values.recipient,
        subject: values.subject,
        content: values.content,
        messageType: values.messageType || 'general'
      });
      setComposeVisible(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };


  const handleThreadSelect = async (thread: MessageThread) => {
    setSelectedThread(thread);
    
    // On mobile, hide thread list and show chat view
    if (isMobile) {
      setShowThreadList(false);
    }
    
    // Mark all messages in this thread as read for the current user
    const unreadCount = thread.unreadCount[userId || ''] || 0;
    console.log('Selecting thread:', thread.subject, 'unread count:', unreadCount);
    
    if (unreadCount > 0) {
      try {
        console.log('Marking thread messages as read...');
        const response = await fetch(`/api/messages/threads/${thread.id}/mark-read`, {
          method: 'POST',
          credentials: 'include',
        });
        
        if (response.ok) {
          console.log('Successfully marked messages as read, refreshing threads...');
          // Refresh the threads list to update unread counts
          await fetchMessages();
        } else {
          console.error('Failed to mark messages as read:', response.status);
        }
      } catch (error) {
        console.error('Failed to mark thread messages as read:', error);
      }
    }
  };

  const handleBackToThreads = () => {
    if (isMobile) {
      setShowThreadList(true);
      setSelectedThread(null);
    }
  };

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.participants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = messageTypeFilter === 'all' || 
      thread.lastMessage?.messageType === messageTypeFilter;
    return matchesSearch && matchesType;
  });

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'red';
      case 'business': return 'blue';
      case 'inquiry': return 'green';
      default: return 'default';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return '🚨';
      case 'business': return '💼';
      case 'inquiry': return '❓';
      default: return '💬';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile Header */}
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '56px'
        }}>
          {showThreadList ? (
            <>
              <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                Messages
                {unreadCount > 0 && (
                  <Badge count={unreadCount} style={{ marginLeft: '8px' }} />
                )}
              </Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setComposeVisible(true)}
                size="small"
              >
                New
              </Button>
            </>
          ) : (
            <>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToThreads}
                type="text"
                style={{ padding: '4px 8px' }}
              />
              <Title level={4} style={{ margin: 0, fontSize: '16px', flex: 1, textAlign: 'center' }}>
                {selectedThread?.subject || 'Messages'}
              </Title>
              <div style={{ width: '40px' }} />
            </>
          )}
        </div>

        {/* Mobile Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {showThreadList ? (
            // Thread List View
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Search and Filter */}
              <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Search
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    prefix={<SearchOutlined />}
                    size="large"
                  />
                  <Select
                    value={messageTypeFilter}
                    onChange={setMessageTypeFilter}
                    style={{ width: '100%' }}
                    placeholder="Filter by type"
                    size="large"
                  >
                    <Option value="all">All Types</Option>
                    <Option value="general">General</Option>
                    <Option value="inquiry">Inquiry</Option>
                    <Option value="business">Business</Option>
                    <Option value="urgent">Urgent</Option>
                  </Select>
                </Space>
              </div>

              {/* Thread List */}
              <div style={{ flex: 1, overflow: 'auto' }}>
                <List
                  dataSource={filteredThreads}
                  renderItem={(thread) => (
                    <List.Item
                      onClick={() => handleThreadSelect(thread)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedThread?.id === thread.id ? '#f0f0f0' : 'transparent',
                        padding: '16px',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge count={thread.unreadCount[userId || ''] || 0}>
                            <Avatar icon={<UserOutlined />} size="large" />
                          </Badge>
                        }
                        title={
                          <Space wrap>
                            <Text strong style={{ fontSize: '16px' }}>{thread.subject}</Text>
                            {thread.lastMessage && (
                              <Tag color={getMessageTypeColor(thread.lastMessage.messageType)}>
                                {getMessageTypeIcon(thread.lastMessage.messageType)} {thread.lastMessage.messageType}
                              </Tag>
                            )}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                              {thread.participants.length} participants
                            </Text>
                            {thread.lastMessage && (
                              <Text ellipsis style={{ fontSize: '14px', lineHeight: '1.4' }}>
                                {thread.lastMessage.content}
                              </Text>
                            )}
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              <ClockCircleOutlined /> {new Date(thread.updatedAt).toLocaleDateString()}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: 'No message threads found' }}
                />
              </div>
            </div>
          ) : (
            // Chat View
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {selectedThread ? (
                loadingThread ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <>
                    {/* Messages Area */}
                    <div
                      style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px 8px',
                        backgroundColor: '#fafafa'
                      }}
                    >
                      {threadMessages.length > 0 ? (
                        <>
                          {threadMessages.map((msg, index) => (
                            <ChatMessage
                              key={msg.id}
                              message={msg}
                              currentUserId={userId || ''}
                              isLastMessage={index === threadMessages.length - 1}
                            />
                          ))}
                          <div ref={messagesEndRef} />
                        </>
                      ) : (
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          height: '100%',
                          color: '#999'
                        }}>
                          No messages in this thread
                        </div>
                      )}
                    </div>
                    
                    {/* Reply Form */}
                    {!loadingThread && (
                      <InlineReplyForm
                        threadId={selectedThread.id}
                        onSendMessage={async (content: string, messageType: string) => {
                          try {
                            const recipientId = selectedThread.participants.find(p => p !== userId) || '';
                            const recipientName = selectedThread.participantNames?.[recipientId] || 'Unknown User';
                            
                            const response = await fetch('/api/messages/reply', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              credentials: 'include',
                              body: JSON.stringify({
                                threadId: selectedThread.id,
                                content,
                                receiverId: recipientId,
                                receiverName: recipientName,
                                subject: `Re: ${selectedThread.subject}`
                              })
                            });

                            if (!response.ok) {
                              const errorData = await response.json();
                              throw new Error(errorData.error || 'Failed to send reply');
                            }

                            await fetchMessages();
                            const messagesResult = await fetchThreadMessages(selectedThread.id);
                            const sortedMessages = messagesResult.sort((a: Message, b: Message) => 
                              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                            );
                            
                            setThreadMessages(sortedMessages);
                            
                            if (sortedMessages.length > 0) {
                              const lastMessage = sortedMessages[sortedMessages.length - 1];
                              setSelectedThread(prev => prev ? {
                                ...prev,
                                lastMessage,
                                messageCount: sortedMessages.length,
                                updatedAt: lastMessage.timestamp
                              } : null);
                            }
                          } catch (error) {
                            console.error('Failed to send reply:', error);
                            throw error;
                          }
                        }}
                        loading={loading}
                      />
                    )}
                  </>
                )
              ) : (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  flex: 1,
                  color: '#999'
                }}>
                  No thread selected
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compose Message Modal */}
        <ComposeMessage
          visible={composeVisible}
          onClose={() => setComposeVisible(false)}
          loading={loading}
          onSend={handleSendMessage}
        />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        {/* Thread List */}
        <Col xs={24} lg={8}>
          <Card
            title="Message Threads"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setComposeVisible(true)}
              >
                New Message
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
              <Search
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
              />
              <Select
                value={messageTypeFilter}
                onChange={setMessageTypeFilter}
                style={{ width: '100%' }}
                placeholder="Filter by type"
              >
                <Option value="all">All Types</Option>
                <Option value="general">General</Option>
                <Option value="inquiry">Inquiry</Option>
                <Option value="business">Business</Option>
                <Option value="urgent">Urgent</Option>
              </Select>
            </Space>

            <List
              dataSource={filteredThreads}
              renderItem={(thread) => (
                <List.Item
                  onClick={() => handleThreadSelect(thread)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedThread?.id === thread.id ? '#f0f0f0' : 'transparent',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge count={thread.unreadCount[userId || ''] || 0}>
                        <Avatar icon={<UserOutlined />} />
                      </Badge>
                    }
                    title={
                      <Space>
                        <Text strong>{thread.subject}</Text>
                        {thread.lastMessage && (
                          <Tag color={getMessageTypeColor(thread.lastMessage.messageType)}>
                            {getMessageTypeIcon(thread.lastMessage.messageType)} {thread.lastMessage.messageType}
                          </Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">
                          {thread.participants.length} participants
                        </Text>
                        {thread.lastMessage && (
                          <Text ellipsis style={{ maxWidth: 200 }}>
                            {thread.lastMessage.content}
                          </Text>
                        )}
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          <ClockCircleOutlined /> {new Date(thread.updatedAt).toLocaleDateString()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No message threads found' }}
            />
          </Card>
        </Col>

        {/* Thread Messages */}
        <Col xs={24} lg={16}>
          <Card
            title={selectedThread ? selectedThread.subject : 'Select a thread'}
          >
            {selectedThread ? (
              loadingThread ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <Spin />
                </div>
              ) : (
                <div
                  style={{
                    height: '400px',
                    overflowY: 'auto',
                    padding: '16px 0',
                    backgroundColor: '#fafafa'
                  }}
                >
                  {threadMessages.length > 0 ? (
                    <>
                      {threadMessages.map((msg, index) => (
                        <ChatMessage
                          key={msg.id}
                          message={msg}
                          currentUserId={userId || ''}
                          isLastMessage={index === threadMessages.length - 1}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '100%',
                      color: '#999'
                    }}>
                      No messages in this thread
                    </div>
                  )}
                </div>
              )
            ) : (
              <Empty
                description="Select a message thread to view messages"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
            
            {/* Inline Reply Form */}
            {selectedThread && !loadingThread && (
              <InlineReplyForm
                threadId={selectedThread.id}
                onSendMessage={async (content: string, messageType: string) => {
                  try {
                    const recipientId = selectedThread.participants.find(p => p !== userId) || '';
                    const recipientName = selectedThread.participantNames?.[recipientId] || 'Unknown User';
                    
                    const response = await fetch('/api/messages/reply', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      credentials: 'include',
                      body: JSON.stringify({
                        threadId: selectedThread.id,
                        content,
                        receiverId: recipientId,
                        receiverName: recipientName,
                        subject: `Re: ${selectedThread.subject}`
                      })
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Failed to send reply');
                    }

                    await fetchMessages();
                    const messagesResult = await fetchThreadMessages(selectedThread.id);
                    const sortedMessages = messagesResult.sort((a: Message, b: Message) => 
                      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    );
                    
                    setThreadMessages(sortedMessages);
                    
                    if (sortedMessages.length > 0) {
                      const lastMessage = sortedMessages[sortedMessages.length - 1];
                      setSelectedThread(prev => prev ? {
                        ...prev,
                        lastMessage,
                        messageCount: sortedMessages.length,
                        updatedAt: lastMessage.timestamp
                      } : null);
                    }
                  } catch (error) {
                    console.error('Failed to send reply:', error);
                    throw error;
                  }
                }}
                loading={loading}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Compose Message Modal */}
      <ComposeMessage
        visible={composeVisible}
        onClose={() => setComposeVisible(false)}
        loading={loading}
        onSend={handleSendMessage}
      />
    </div>
  );
};

export default MessagesPage;
