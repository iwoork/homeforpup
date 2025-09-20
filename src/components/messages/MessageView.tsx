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
  Spin
} from 'antd';
import {
  InboxOutlined,
  StarOutlined,
  FlagOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { Message, MessageThread } from '@/types/messaging';
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

  return (
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
              renderItem={(msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.senderId === currentUserId ? 'flex-end' : 'flex-start',
                    marginBottom: '16px'
                  }}
                >
                  <Card
                    style={{
                      maxWidth: '70%',
                      backgroundColor: msg.senderId === currentUserId ? '#e6f7ff' : '#fff',
                      border: msg.senderId === currentUserId ? '1px solid #91d5ff' : '1px solid #f0f0f0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
                        <Tag color={getMessageTypeColor(msg.messageType)} size="small">
                          {msg.messageType}
                        </Tag>
                        {!msg.read && msg.receiverId === currentUserId && (
                          <Tag color="red" size="small">New</Tag>
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
              )}
            />
          </>
        )}
      </div>
    </>
  );
};

export default MessageView;