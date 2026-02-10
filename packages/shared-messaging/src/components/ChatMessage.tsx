'use client';

import React from 'react';
import { Avatar, Typography, Space, Tag, Badge, Image } from 'antd';
import { UserOutlined, ClockCircleOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Message } from '../types';

const { Text } = Typography;

interface ChatMessageProps {
  message: Message;
  currentUserId: string;
  isLastMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  currentUserId, 
  isLastMessage = false 
}) => {
  const isOwnMessage = message.senderId === currentUserId;
  
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

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        marginBottom: '16px',
        padding: '0 8px'
      }}
    >
      <div
        style={{
          maxWidth: '85%',
          display: 'flex',
          flexDirection: isOwnMessage ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
          gap: '8px'
        }}
      >
        {/* Avatar - only show for other messages */}
        {!isOwnMessage && (
          <Avatar 
            size="default" 
            icon={<UserOutlined />}
            style={{ flexShrink: 0 }}
          />
        )}
        
        {/* Message bubble */}
        <div
          style={{
            backgroundColor: isOwnMessage ? '#1890ff' : '#f5f5f5',
            color: isOwnMessage ? 'white' : 'black',
            padding: '12px 16px',
            borderRadius: '18px',
            borderBottomRightRadius: isOwnMessage ? '4px' : '18px',
            borderBottomLeftRadius: isOwnMessage ? '18px' : '4px',
            position: 'relative',
            wordWrap: 'break-word',
            maxWidth: '100%',
            minWidth: '60px'
          }}
        >
          {/* Message header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px',
              flexWrap: 'wrap',
              gap: '4px'
            }}
          >
            <Space size="small" wrap>
              <Text
                strong
                style={{
                  color: isOwnMessage ? 'white' : 'rgba(0, 0, 0, 0.85)',
                  fontSize: '12px'
                }}
              >
                {message.senderName}
              </Text>
              <Tag
                color={getMessageTypeColor(message.messageType)}
                style={{
                  fontSize: '10px',
                  margin: 0,
                  border: 'none',
                  background: isOwnMessage 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : getMessageTypeColor(message.messageType) === 'default' 
                      ? '#f0f0f0' 
                      : undefined
                }}
              >
                {getMessageTypeIcon(message.messageType)} {message.messageType}
              </Tag>
              {!message.read && (
                <Badge 
                  status="processing" 
                  text=""
                  style={{ fontSize: '10px' }}
                />
              )}
            </Space>
          </div>
          
          {/* Message content */}
          {message.content && (
            <div
              style={{
                whiteSpace: 'pre-wrap',
                lineHeight: '1.5',
                marginBottom: '4px',
                fontSize: '14px',
                wordBreak: 'break-word'
              }}
            >
              {message.content}
            </div>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div style={{ marginTop: '8px', marginBottom: '4px' }}>
              <Image.PreviewGroup>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {message.attachments.map((attachment) => (
                    <Image
                      key={attachment.id}
                      src={attachment.url}
                      alt={attachment.filename}
                      width={120}
                      height={90}
                      style={{
                        objectFit: 'cover',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: isOwnMessage ? '1px solid rgba(255,255,255,0.3)' : '1px solid #d9d9d9',
                      }}
                    />
                  ))}
                </div>
              </Image.PreviewGroup>
              <div style={{ marginTop: '4px' }}>
                <Space size="small">
                  <PaperClipOutlined style={{ fontSize: '10px', opacity: 0.7 }} />
                  <Text
                    style={{
                      fontSize: '10px',
                      color: isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.45)',
                    }}
                  >
                    {message.attachments.length} {message.attachments.length === 1 ? 'attachment' : 'attachments'}
                  </Text>
                </Space>
              </div>
            </div>
          )}

          {/* Message timestamp */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '10px',
              opacity: 0.7,
              marginTop: '4px'
            }}
          >
            <Space size="small">
              <ClockCircleOutlined />
              <Text
                style={{
                  color: isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.45)',
                  fontSize: '10px'
                }}
              >
                {new Date(message.timestamp).toLocaleString()}
              </Text>
            </Space>
          </div>
        </div>
        
        {/* Avatar for own messages */}
        {isOwnMessage && (
          <Avatar 
            size="small" 
            icon={<UserOutlined />}
            style={{ flexShrink: 0 }}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
