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
  Statistic,
  Tabs
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
  UndoOutlined
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
  userType?: 'adopter' | 'breeder';
}

const MessagesPage: React.FC<MessagesPageProps> = ({ userId, userType = 'adopter' }) => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load thread messages when a thread is selected
  useEffect(() => {
    if (selectedThread) {
      setLoadingThread(true);
      fetchThreadMessages(selectedThread.id).then(messages => {
        // Sort messages by timestamp (oldest first for chat display)
        const sortedMessages = messages.sort((a, b) => 
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

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        {/* Stats Overview */}
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total Messages"
                  value={messages.length}
                  prefix={<MessageOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Unread Messages"
                  value={unreadCount}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<Badge count={unreadCount} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Active Threads"
                  value={threads.length}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Main Content */}
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
                    // Use the reply API endpoint instead of send
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

                    // Refresh threads first, then get messages
                    console.log('Refreshing threads and messages after reply...');
                    await fetchMessages(); // Refresh threads list
                    
                    // Get the updated messages for the current thread
                    const messagesResult = await fetchThreadMessages(selectedThread.id);
                    console.log('Messages refreshed:', messagesResult.length, 'messages');
                    
                    // Sort messages by timestamp (oldest first for chat display)
                    const sortedMessages = messagesResult.sort((a, b) => 
                      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    );
                    
                    // Update the thread messages state
                    setThreadMessages(sortedMessages);
                    
                    // Update the selected thread to reflect the new last message
                    if (sortedMessages.length > 0) {
                      const lastMessage = sortedMessages[sortedMessages.length - 1];
                      console.log('Updating selected thread with last message:', lastMessage);
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
