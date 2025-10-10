// components/messages/MessageView.tsx
'use client';

import React from 'react';
import {
  List,
  Card,
  Typography,
  Space,
  Tag,
  Empty,
  Button,
  Spin,
  Avatar
} from 'antd';
import {
  InboxOutlined,
  StarOutlined,
  FlagOutlined,
  LoadingOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Message, MessageThread } from '@/types';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface MessageViewProps {
  selectedThread: MessageThread | null;
  messages: Message[];
  currentUserId: string;
  loading: boolean;
  loadingMore: boolean;
  onLoadMore?: () => void;
}

const MessageView: React.FC<MessageViewProps> = ({
  selectedThread,
  messages,
  currentUserId,
  loading,
  loadingMore,
  onLoadMore
}) => {
  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'inquiry': return 'blue';
      case 'business': return 'green';
      case 'urgent': return 'red';
      default: return 'default';
    }
  };

  // Helper function to get participant info from thread
  const getParticipantInfo = (userId: string) => {
    if (!selectedThread) return { name: 'Unknown', avatar: undefined, userType: undefined };
    
    // Method 1: Check participantInfo object (enhanced participant data)
    if (selectedThread.participantInfo && selectedThread.participantInfo[userId]) {
      const info = selectedThread.participantInfo[userId];
      return {
        name: info.displayName || info.name || 'Unknown User',
        avatar: info.profileImage,
        userType: info.userType
      };
    }

    // // Method 2: Check participantNames object (basic name mapping)
    // if (selectedThread.participantNames && selectedThread.participantNames[userId]) {
    //   const name = selectedThread.participantNames[userId];
    //   if (name && name !== 'Unknown User' && name !== 'Unknown') {
    //     return { name, avatar: undefined, userType: undefined };
    //   }
    // }
    
    // Method 3: Fallback to look through messages for this user's name
    for (const message of messages) {
      if (message.senderId === userId && message.senderName && message.senderName !== 'Unknown User') {
        return { 
          name: message.senderName, 
          avatar: message.senderAvatar,
          userType: undefined 
        };
      }
      if (message.receiverId === userId && message.receiverName && message.receiverName !== 'Unknown User') {
        return { 
          name: message.receiverName, 
          avatar: undefined,
          userType: undefined 
        };
      }
    }
    
    // Last resort: show truncated user ID
    return { 
      name: `User ${userId.slice(-4)}`, 
      avatar: undefined,
      userType: undefined 
    };
  };

  // Get display info for message sender
  const getMessageSenderInfo = (message: Message) => {
    // First, try the message's own sender data
    if (message.senderName && message.senderName !== 'Unknown User' && message.senderName !== 'Unknown') {
      return {
        name: message.senderName,
        avatar: message.senderAvatar,
        userType: undefined // We don't store userType in message objects
      };
    }
    
    // Fallback to participant info lookup
    return getParticipantInfo(message.senderId);
  };

  // Helper to get user type badge color
  const getUserTypeBadgeColor = (userType?: string) => {
    switch (userType) {
      case 'breeder': return 'green';
      case 'dog-parent': return 'blue';
      case 'both': return 'purple';
      default: return 'default';
    }
  };

  const sortedMessages = [...messages].sort((a, b) => 
    dayjs(a.timestamp).isBefore(b.timestamp) ? -1 : 1
  );

  if (!selectedThread) {
    return (
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
    );
  }

  // Get the other participant's info for the header
  const otherParticipant = selectedThread.participants.find(p => p !== currentUserId);
  const otherParticipantInfo = otherParticipant ? getParticipantInfo(otherParticipant) : 
    { name: 'Unknown', avatar: undefined, userType: undefined };

  return (
    <>
      {/* Thread Header */}
      <div style={{ 
        padding: '16px 24px', 
        borderBottom: '1px solid #f0f0f0',
        background: '#fff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar 
              src={otherParticipantInfo.avatar}
              icon={!otherParticipantInfo.avatar ? <UserOutlined /> : undefined}
              size={40}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <Title level={4} style={{ margin: 0, color: '#08979C' }}>
                  {selectedThread.subject}
                </Title>
                {otherParticipantInfo.userType && (
                  <Tag 
                    color={getUserTypeBadgeColor(otherParticipantInfo.userType)}
                    style={{ fontSize: '10px', padding: '0 4px', height: '16px', lineHeight: '16px' }}
                  >
                    {otherParticipantInfo.userType}
                  </Tag>
                )}
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Conversation with {otherParticipantInfo.name} • {selectedThread.messageCount} messages • Last updated {dayjs(selectedThread.updatedAt).fromNow()}
              </Text>
            </div>
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {loadingMore && (
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
                <Text type="secondary" style={{ marginLeft: '8px' }}>Loading more messages...</Text>
              </div>
            )}
            
            {onLoadMore && messages.length >= 20 && (
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <Button onClick={onLoadMore} loading={loadingMore}>
                  Load Earlier Messages
                </Button>
              </div>
            )}

            <List
              dataSource={sortedMessages}
              renderItem={(msg) => {
                const senderInfo = getMessageSenderInfo(msg);
                const isCurrentUser = msg.senderId === currentUserId;
                
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                      marginBottom: '16px'
                    }}
                  >
                    <Card
                      style={{
                        maxWidth: '70%',
                        backgroundColor: isCurrentUser ? '#e6f7ff' : '#fff',
                        border: isCurrentUser ? '1px solid #91d5ff' : '1px solid #f0f0f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      bodyStyle={{ padding: '12px 16px' }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <Space align="center">
                          <Avatar 
                            src={senderInfo.avatar}
                            icon={!senderInfo.avatar ? <UserOutlined /> : undefined}
                            size={24}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Text strong style={{ fontSize: '13px' }}>
                              {senderInfo.name}
                            </Text>
                            {senderInfo.userType && (
                              <Tag 
                                color={getUserTypeBadgeColor(senderInfo.userType)}
                                style={{ fontSize: '9px', padding: '0 3px', height: '14px', lineHeight: '14px' }}
                              >
                                {senderInfo.userType}
                              </Tag>
                            )}
                          </div>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {dayjs(msg.timestamp).format('MMM DD, h:mm A')}
                          </Text>
                          <Tag 
                            color={getMessageTypeColor(msg.messageType)} 
                            style={{ fontSize: '11px', padding: '0 6px', height: '18px', lineHeight: '18px' }}
                          >
                            {msg.messageType}
                          </Tag>
                          {!msg.read && msg.receiverId === currentUserId && (
                            <Tag 
                              color="red" 
                              style={{ fontSize: '11px', padding: '0 6px', height: '18px', lineHeight: '18px' }}
                            >
                              New
                            </Tag>
                          )}
                        </Space>
                      </div>
                      <Paragraph style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                        {msg.content}
                      </Paragraph>
                      
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Attachments: {msg.attachments.map(att => att.filename).join(', ')}
                          </Text>
                        </div>
                      )}
                    </Card>
                  </div>
                );
              }}
            />
          </>
        )}
      </div>
    </>
  );
};

export default MessageView;