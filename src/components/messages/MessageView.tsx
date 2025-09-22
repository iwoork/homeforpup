// components/messages/MessageView.tsx (Debug Version)
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
  Collapse
} from 'antd';
import {
  InboxOutlined,
  StarOutlined,
  FlagOutlined,
  LoadingOutlined,
  BugOutlined
} from '@ant-design/icons';
import { Message, MessageThread } from '@/types/messaging';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

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

  // Helper function to get participant name from thread
  const getParticipantName = (userId: string): string => {
    if (!selectedThread) return 'Unknown';
    
    console.log('Getting participant name for userId:', userId.substring(0, 10) + '...');
    console.log('Thread participantNames:', selectedThread.participantNames);
    
    // Check participantNames object first
    if (selectedThread.participantNames && typeof selectedThread.participantNames === 'object') {
      const name = selectedThread.participantNames[userId];
      console.log('Found name in participantNames:', name);
      if (name && name !== 'Unknown User' && name !== 'Unknown') {
        return name;
      }
    }
    
    // Fallback: look through messages for this user's name
    for (const message of messages) {
      if (message.senderId === userId && message.senderName && message.senderName !== 'Unknown User') {
        console.log('Found name in message senderName:', message.senderName);
        return message.senderName;
      }
      if (message.receiverId === userId && message.receiverName && message.receiverName !== 'Unknown User') {
        console.log('Found name in message receiverName:', message.receiverName);
        return message.receiverName;
      }
    }
    
    console.log('No name found, using fallback');
    // Last resort: show truncated user ID
    return `User ${userId.slice(-4)}`;
  };

  // Get display name for message sender
  const getMessageSenderName = (message: Message): string => {
    console.log('Getting sender name for message:', {
      messageId: message.id.substring(0, 10) + '...',
      senderId: message.senderId.substring(0, 10) + '...',
      senderName: message.senderName,
      receiverId: message.receiverId.substring(0, 10) + '...',
      receiverName: message.receiverName
    });
    
    // First, try the message's own senderName
    if (message.senderName && message.senderName !== 'Unknown User' && message.senderName !== 'Unknown') {
      return message.senderName;
    }
    
    // Fallback to participant name lookup
    return getParticipantName(message.senderId);
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

  // Get the other participant's name for the header
  const otherParticipant = selectedThread.participants.find(p => p !== currentUserId);
  const otherParticipantName = otherParticipant ? getParticipantName(otherParticipant) : 'Unknown';

  return (
    <>
      {/* Debug Panel */}
      <Collapse size="small" style={{ margin: '8px' }}>
        <Panel header={<><BugOutlined /> Debug Info</>} key="debug">
          <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            <div><strong>Current User ID:</strong> {currentUserId.substring(0, 10)}...</div>
            <div><strong>Thread Participants:</strong> {JSON.stringify(selectedThread.participants.map(p => p.substring(0, 10) + '...'))}</div>
            <div><strong>Participant Names:</strong> {JSON.stringify(selectedThread.participantNames)}</div>
            <div><strong>Other Participant:</strong> {otherParticipant?.substring(0, 10)}...</div>
            <div><strong>Other Participant Name:</strong> {otherParticipantName}</div>
            <div><strong>Messages Count:</strong> {messages.length}</div>
            {messages.length > 0 && (
              <div>
                <strong>First Message:</strong>
                <pre style={{ fontSize: '10px', marginTop: '4px' }}>
                  {JSON.stringify({
                    senderId: messages[0].senderId.substring(0, 10) + '...',
                    senderName: messages[0].senderName,
                    receiverId: messages[0].receiverId.substring(0, 10) + '...',
                    receiverName: messages[0].receiverName
                  }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Panel>
      </Collapse>

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
              Conversation with {otherParticipantName} • {selectedThread.messageCount} messages • Last updated {dayjs(selectedThread.updatedAt).fromNow()}
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
                const senderName = getMessageSenderName(msg);
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
                        <Space>
                          <Text strong style={{ fontSize: '13px' }}>
                            {senderName}
                          </Text>
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