// components/messages/ThreadsList.tsx
'use client';

import React from 'react';
import {
  List,
  Avatar,
  Typography,
  Badge,
  Empty,
  Dropdown,
  Button,
  Tag
} from 'antd';
import {
  UserOutlined,
  MoreOutlined,
  EyeOutlined,
  StarOutlined,
  FlagOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { MessageThread } from '@/types/messaging';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface ThreadsListProps {
  threads: MessageThread[];
  selectedThreadId?: string;
  currentUserId: string;
  loading: boolean;
  onSelectThread: (thread: MessageThread) => void;
  onMarkAsRead: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
}

const ThreadsList: React.FC<ThreadsListProps> = ({
  threads,
  selectedThreadId,
  currentUserId,
  loading,
  onSelectThread,
  onMarkAsRead,
  onDeleteThread
}) => {
  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'inquiry': return 'blue';
      case 'business': return 'green';
      case 'urgent': return 'red';
      default: return 'default';
    }
  };

  // Helper function to safely get unread count
  const getUnreadCount = (thread: MessageThread, userId: string): number => {
    if (typeof thread.unreadCount === 'object' && thread.unreadCount !== null) {
      return (thread.unreadCount as Record<string, number>)[userId] || 0;
    }
    return 0;
  };

  const getThreadMenuItems = (thread: MessageThread) => [
    {
      key: 'markRead',
      icon: <EyeOutlined />,
      label: 'Mark as Read',
      disabled: getUnreadCount(thread, currentUserId) === 0,
      onClick: () => onMarkAsRead(thread.id)
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
      onClick: () => onDeleteThread(thread.id)
    }
  ];

  const getOtherParticipantName = (thread: MessageThread) => {
    const otherParticipant = thread.participants.find(p => p !== currentUserId);
    
    // Try to get name from participantNames if it exists, otherwise use a fallback
    if (otherParticipant) {
      // Check if participantNames exists on the thread object
      if ('participantNames' in thread && thread.participantNames) {
        return (thread.participantNames as Record<string, string>)[otherParticipant] || 'Unknown User';
      }
      
      // Fallback: try to extract name from the last message or use the participant ID
      if (thread.lastMessage.senderId === otherParticipant) {
        return thread.lastMessage.senderName || `User ${otherParticipant.slice(-4)}`;
      }
      
      // If the other participant is the receiver of the last message
      return `User ${otherParticipant.slice(-4)}`;
    }
    
    return 'Unknown';
  };

  return (
    <div style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
      <List
        dataSource={threads}
        loading={loading}
        locale={{ emptyText: <Empty description="No conversations yet" /> }}
        renderItem={(thread) => (
          <List.Item
            key={thread.id}
            style={{
              padding: '12px 16px',
              backgroundColor: selectedThreadId === thread.id ? '#e6f7ff' : 'transparent',
              borderLeft: selectedThreadId === thread.id ? '3px solid #1890ff' : '3px solid transparent',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0'
            }}
            onClick={() => onSelectThread(thread)}
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
                <Badge count={getUnreadCount(thread, currentUserId)} size="small">
                  <Avatar icon={<UserOutlined />} />
                </Badge>
              }
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong={getUnreadCount(thread, currentUserId) > 0} style={{ fontSize: '14px' }}>
                    {getOtherParticipantName(thread)}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    {dayjs(thread.updatedAt).fromNow()}
                  </Text>
                </div>
              }
              description={
                <div>
                  <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '2px' }}>
                    {thread.subject}
                  </Text>
                  <Text 
                    type="secondary" 
                    style={{ 
                      fontSize: '12px',
                      fontWeight: getUnreadCount(thread, currentUserId) > 0 ? 500 : 'normal'
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
                      style={{ fontSize: '11px', padding: '0 6px', height: '18px', lineHeight: '18px' }}
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
  );
};

export default ThreadsList;