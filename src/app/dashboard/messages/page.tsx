// pages/dashboard/messages.tsx
'use client';

import React, { useState } from 'react';
import {
  Layout,
  Typography,
  Button,
  Input,
  Space,
  Dropdown,
  Badge,
  Modal,
  message as antMessage
} from 'antd';
import {
  MessageOutlined,
  PlusOutlined,
  FilterOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { MessageFilters } from '@/types/messaging';
import ThreadsList from '@/components/messages/ThreadsList';
import MessageView from '@/components/messages/MessageView';
import ComposeMessage from '@/components/messages/ComposeMessage';
import ReplyForm from '@/components/messages/ReplyForm';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;

// Type definition for compose message form
interface ComposeMessageFormValues {
  recipient: string;
  subject: string;
  content: string;
  messageType?: string;
}

// Mock user data - replace with actual user service
const AVAILABLE_USERS = [
  { id: 'c4e84488-a0c1-70ac-8376-ee8b6151167b', name: 'Efren Macasaet', email: 'efren@iwoork.com' },
  { id: '64482488-9081-7089-fb5b-969fdb276668', name: 'Efren Macasaet', email: 'efren@homeforpup.com' },
];

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [composeVisible, setComposeVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');

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
    userId: user?.id || '',
    userName: user?.name || '',
    pollingInterval: 50000
  });

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
    searchThreads({ search: value });
  };

  // Handle filter dropdown
  const handleFilter = (filterType: string) => {
    const filters: MessageFilters = {};
    
    switch (filterType) {
      case 'unread':
        filters.read = false;
        break;
      case 'inquiries':
        filters.type = 'inquiry';
        break;
      case 'business':
        filters.type = 'business';
        break;
      default:
        // 'all' - no filters
        break;
    }
    
    searchThreads(filters);
  };

  // Handle sending new message
  const handleSendMessage = async (values: ComposeMessageFormValues) => {
    const recipient = AVAILABLE_USERS.find(u => u.id === values.recipient);
    if (!recipient) {
      antMessage.error('Recipient not found');
      return;
    }

    await sendMessage(values, recipient.name);
    setComposeVisible(false);
  };

  // Handle sending reply
  const handleSendReply = async (content: string) => {
    await sendReply(content);
  };

  // Handle thread deletion with confirmation
  const handleDeleteThread = (threadId: string) => {
    confirm({
      title: 'Delete Conversation',
      content: 'Are you sure you want to delete this entire conversation? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteThread(threadId);
          antMessage.success('Conversation deleted');
        } catch {
          antMessage.error('Failed to delete conversation');
        }
      }
    });
  };

  // Filter dropdown items
  const filterItems = [
    { key: 'all', label: 'All Messages' },
    { key: 'unread', label: 'Unread Only' },
    { key: 'inquiries', label: 'Puppy Inquiries' },
    { key: 'business', label: 'Business' }
  ];

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Please log in to access messages.</Text>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ color: '#08979C', marginBottom: '8px' }}>
              <MessageOutlined style={{ marginRight: '12px' }} />
              Messages
              <Badge count={unreadCount} offset={[10, 0]} />
            </Title>
            <Text style={{ color: '#595959' }}>
              Manage your conversations with potential puppy families and fellow breeders.
            </Text>
          </div>
          <Button 
            icon={<SyncOutlined />} 
            onClick={refreshThreads}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '16px', padding: '8px 12px', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: '6px' }}>
          <Text type="danger">{error}</Text>
        </div>
      )}

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
                onSearch={handleSearch}
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
                    items: filterItems,
                    onClick: ({ key }) => handleFilter(key)
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

          <ThreadsList
            threads={threads}
            selectedThreadId={selectedThread?.id}
            currentUserId={user.id}
            loading={loading}
            onSelectThread={selectThread}
            onMarkAsRead={markThreadAsRead}
            onDeleteThread={handleDeleteThread}
          />
        </Sider>

        {/* Messages Content */}
        <Content style={{ display: 'flex', flexDirection: 'column' }}>
          <MessageView
            selectedThread={selectedThread}
            messages={messages}
            currentUserId={user.id}
            loading={loading && !!selectedThread}
            loadingMore={loadingMoreMessages}
            onLoadMore={messages.length >= 20 ? loadMoreMessages : undefined}
          />

          {/* Reply Form - only show when thread is selected */}
          {selectedThread && (
            <ReplyForm
              onSend={({ content }) => handleSendReply(content)}
              loading={sendingMessage}
            />
          )}
        </Content>
      </Layout>

      {/* Compose New Message Modal */}
      <ComposeMessage
        visible={composeVisible}
        onClose={() => setComposeVisible(false)}
        onSend={handleSendMessage}
        loading={sendingMessage}
        availableUsers={AVAILABLE_USERS}
      />
    </div>
  );
};

export default MessagesPage;