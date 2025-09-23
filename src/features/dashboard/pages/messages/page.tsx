// app/dashboard/messages/page.tsx (Fixed version)
'use client';

import React, { useState } from 'react';
import { Layout, Row, Col, Button, Input, Select, Space, Card, Drawer } from 'antd';
import { PlusOutlined, FilterOutlined } from '@ant-design/icons';
import { useAuth, useMessages } from '@/hooks';
import { ThreadsList, MessageView, ComposeMessage, ReplyForm } from '@/features/messaging';

const { Content } = Layout;
const { Search } = Input;

// Define the message type union
type MessageType = "general" | "inquiry" | "business" | "urgent";

export default function MessagesPage() {
  const { user } = useAuth();
  const [composeVisible, setComposeVisible] = useState(false);
  const [threadsDrawerOpen, setThreadsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  // Fix the type annotation here
  const [messageTypeFilter, setMessageTypeFilter] = useState<MessageType | undefined>();

  const {
    threads,
    selectedThread,
    messages,
    unreadCount,
    loading,
    sendingMessage,
    loadingMoreMessages,
    error,
    selectThread,
    sendMessage,
    sendReply,
    markThreadAsRead,
    deleteThread,
    searchThreads,
    loadMoreMessages,
    refreshThreads
  } = useMessages({
    userId: user?.userId || '',
    userName: user?.name || '',
    pollingInterval: 5000
  });

  const handleSearch = (value: string) => {
    setSearchText(value);
    searchThreads({ search: value, type: messageTypeFilter });
  };

  // Fix the parameter type here as well
  const handleFilterChange = (value: MessageType | undefined) => {
    setMessageTypeFilter(value);
    searchThreads({ search: searchText, type: value });
  };

  const handleSendMessage = async (values: any, recipientName: string) => {
    await sendMessage(values, recipientName);
    setComposeVisible(false);
  };

  const handleSendReply = async (values: { content: string }) => {
    await sendReply(values.content);
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        Please log in to access messages.
      </div>
    );
  }

  return (
    <Layout>
      <style jsx global>{`
        @media (max-width: 991px) {
          .threads-desktop { display: none !important; }
          .mobile-actions { display: block !important; }
        }
        @media (min-width: 992px) {
          .threads-desktop { display: block !important; }
          .mobile-actions { display: none !important; }
        }
      `}</style>
      <Content style={{ padding: '24px' }}>
        {/* Mobile actions bar */}
        <div className="mobile-actions" style={{ display: 'none', marginBottom: 12 }}>
          <Space>
            <Button onClick={() => setThreadsDrawerOpen(true)}>Conversations</Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setComposeVisible(true)}
              style={{ background: '#08979C', borderColor: '#08979C' }}
            >
              New
            </Button>
          </Space>
        </div>
        <Row gutter={24}>
          {/* Left Side - Threads List */}
          <Col xs={24} lg={8} className="threads-desktop">
            <Card 
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Messages ({unreadCount} unread)</span>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={() => setComposeVisible(true)}
                    style={{ background: '#08979C', borderColor: '#08979C' }}
                  >
                    New
                  </Button>
                </div>
              }
              bodyStyle={{ padding: 0 }}
              style={{ display: 'flex', flexDirection: 'column', position: 'sticky', top: 24 }}
            >
              {/* Search and Filter Controls */}
              <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Search
                    placeholder="Search messages..."
                    allowClear
                    onSearch={handleSearch}
                    style={{ width: '100%' }}
                  />
                  <Select
                    placeholder="Filter by type"
                    allowClear
                    style={{ width: '100%' }}
                    onChange={handleFilterChange}
                    suffixIcon={<FilterOutlined />}
                  >
                    <Select.Option value="inquiry">Puppy Inquiry</Select.Option>
                    <Select.Option value="business">Business</Select.Option>
                    <Select.Option value="general">General</Select.Option>
                    <Select.Option value="urgent">Urgent</Select.Option>
                  </Select>
                </Space>
              </div>

              {/* Threads List */}
              <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                <ThreadsList
                  threads={threads}
                  selectedThreadId={selectedThread?.id}
                  currentUserId={user.userId}
                  loading={loading}
                  onSelectThread={selectThread}
                  onMarkAsRead={markThreadAsRead}
                  onDeleteThread={deleteThread}
                />
              </div>
            </Card>
          </Col>

          {/* Right Side - Message View */}
          <Col xs={24} lg={16}>
            <Card 
              bodyStyle={{ padding: 0 }}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <MessageView
                  selectedThread={selectedThread}
                  messages={messages}
                  currentUserId={user.userId}
                  loading={loading}
                  loadingMore={loadingMoreMessages}
                  onLoadMore={loadMoreMessages}
                />
                
                {/* Reply Form */}
                {selectedThread && (
                  <ReplyForm
                    onSend={handleSendReply}
                    loading={sendingMessage}
                  />
                )}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Mobile Threads Drawer */}
        <Drawer
          title="Conversations"
          placement="left"
          onClose={() => setThreadsDrawerOpen(false)}
          open={threadsDrawerOpen}
          width={320}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 12 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Search
                  placeholder="Search messages..."
                  allowClear
                  onSearch={handleSearch}
                  style={{ width: '100%' }}
                />
                <Select
                  placeholder="Filter by type"
                  allowClear
                  style={{ width: '100%' }}
                  onChange={handleFilterChange}
                >
                  <Select.Option value="inquiry">Puppy Inquiry</Select.Option>
                  <Select.Option value="business">Business</Select.Option>
                  <Select.Option value="general">General</Select.Option>
                  <Select.Option value="urgent">Urgent</Select.Option>
                </Select>
              </Space>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <ThreadsList
                threads={threads}
                selectedThreadId={selectedThread?.id}
                currentUserId={user.userId}
                loading={loading}
                onSelectThread={(t) => { selectThread(t); setThreadsDrawerOpen(false); }}
                onMarkAsRead={markThreadAsRead}
                onDeleteThread={deleteThread}
              />
            </div>
          </div>
        </Drawer>

        {/* Compose Message Modal */}
        <ComposeMessage
          visible={composeVisible}
          onClose={() => setComposeVisible(false)}
          onSend={handleSendMessage}
          loading={sendingMessage}
        />

        {/* Error Display */}
        {error && (
          <div style={{ 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px',
            background: '#ff4d4f',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {error}
            <Button 
              type="text" 
              size="small" 
              style={{ color: 'white', marginLeft: '8px' }}
              onClick={refreshThreads}
            >
              Retry
            </Button>
          </div>
        )}
      </Content>
    </Layout>
  );
}