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
  Tag,
  MenuProps
} from 'antd';
import {
  UserOutlined,
  MoreOutlined,
  EyeOutlined,
  StarOutlined,
  FlagOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { MessageThread } from '@/types';
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

  // Enhanced function to get other participant's name and info
  const getOtherParticipantInfo = (thread: MessageThread) => {
    const otherParticipant = thread.participants.find(p => p !== currentUserId);
    
    if (!otherParticipant) {
      return { name: 'Unknown', avatar: undefined, userType: undefined };
    }

    // // Method 1: Check participantInfo object (enhanced participant data)
    // if (thread.participantInfo && thread.participantInfo[otherParticipant]) {
    //   const info = thread.participantInfo[otherParticipant];
    //   return {
    //     name: info.displayName || info.name || 'Unknown User',
    //     avatar: info.profileImage,
    //     userType: info.userType
    //   };
    // }

    // // Method 2: Check participantNames object (basic name mapping)
    // if (thread.participantNames && thread.participantNames[otherParticipant]) {
    //   const name = thread.participantNames[otherParticipant];
    //   if (name && name !== 'Unknown User' && name !== 'Unknown') {
    //     return { name, avatar: undefined, userType: undefined };
    //   }
    // }
    
    // Method 3: Check last message for sender/receiver names
    if (thread.lastMessage) {
      // If other participant sent the last message
      if (thread.lastMessage.senderId === otherParticipant && 
          thread.lastMessage.senderName && 
          thread.lastMessage.senderName !== 'Unknown User' && 
          thread.lastMessage.senderName !== 'Unknown') {
        return { 
          name: thread.lastMessage.senderName, 
          avatar: thread.lastMessage.senderAvatar,
          userType: undefined 
        };
      }
      
      // If other participant received the last message
      if (thread.lastMessage.receiverId === otherParticipant && 
          thread.lastMessage.receiverName && 
          thread.lastMessage.receiverName !== 'Unknown User' && 
          thread.lastMessage.receiverName !== 'Unknown') {
        return { 
          name: thread.lastMessage.receiverName, 
          avatar: undefined,
          userType: undefined 
        };
      }
    }
    
    // Method 4: Fallback to partial user ID
    return { 
      name: `User ${otherParticipant.slice(-4)}`, 
      avatar: undefined,
      userType: undefined 
    };
  };

  const getThreadMenuItems = (thread: MessageThread): MenuProps['items'] => [
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
      type: 'divider'
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete Conversation',
      danger: true,
      onClick: () => onDeleteThread(thread.id)
    }
  ];

  // Helper to get user type badge color
  const getUserTypeBadgeColor = (userType?: string) => {
    switch (userType) {
      case 'breeder': return 'green';
      case 'adopter': return 'blue';
      case 'both': return 'purple';
      default: return 'default';
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
      <List
        dataSource={threads}
        loading={loading}
        locale={{ emptyText: <Empty description="No conversations yet" /> }}
        renderItem={(thread) => {
          const otherParticipantInfo = getOtherParticipantInfo(thread);
          const unreadCount = getUnreadCount(thread, currentUserId);
          
          return (
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
                  <Badge count={unreadCount} size="small">
                    <Avatar 
                      src={otherParticipantInfo.avatar}
                      icon={!otherParticipantInfo.avatar ? <UserOutlined /> : undefined}
                    />
                  </Badge>
                }
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Text strong={unreadCount > 0} style={{ fontSize: '14px' }}>
                        {otherParticipantInfo.name}
                      </Text>
                      {otherParticipantInfo.userType && (
                        <Tag 
                          color={getUserTypeBadgeColor(otherParticipantInfo.userType)}
                          style={{ fontSize: '10px', padding: '0 4px', height: '16px', lineHeight: '16px' }}
                        >
                          {otherParticipantInfo.userType}
                        </Tag>
                      )}
                    </div>
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
                        fontWeight: unreadCount > 0 ? 500 : 'normal'
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
          );
        }}
      />
    </div>
  );
};

export default ThreadsList;