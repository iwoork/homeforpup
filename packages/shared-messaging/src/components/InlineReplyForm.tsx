'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Space, Select, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface InlineReplyFormProps {
  threadId: string;
  onSendMessage: (content: string, messageType: string) => Promise<void>;
  loading?: boolean;
}

const InlineReplyForm: React.FC<InlineReplyFormProps> = ({
  threadId,
  onSendMessage,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [sending, setSending] = useState(false);

  const handleSubmit = async (values: any) => {
    if (!values.content.trim()) {
      message.warning('Please enter a message');
      return;
    }

    setSending(true);
    try {
      await onSendMessage(values.content, values.messageType || 'general');
      form.resetFields();
      message.success('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
      message.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#fff',
        position: 'sticky',
        bottom: 0,
        zIndex: 10
      }}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        size="middle"
      >
        <Form.Item
          name="content"
          rules={[
            { required: true, message: 'Please enter your message' },
            { max: 1000, message: 'Message too long (max 1000 characters)' }
          ]}
          style={{ marginBottom: '8px' }}
        >
          <TextArea
            placeholder="Type your message..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            style={{ 
              resize: 'none',
              fontSize: '16px', // Prevents zoom on iOS
              borderRadius: '20px',
              padding: '12px 16px'
            }}
          />
        </Form.Item>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '8px'
        }}>
          <Form.Item
            name="messageType"
            initialValue="general"
            style={{ marginBottom: 0, flex: 1 }}
          >
            <Select
              placeholder="Type"
              style={{ width: '100%' }}
              size="middle"
            >
              <Option value="general">💬 General</Option>
              <Option value="inquiry">❓ Inquiry</Option>
              <Option value="business">💼 Business</Option>
              <Option value="urgent">🚨 Urgent</Option>
            </Select>
          </Form.Item>
          
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={sending || loading}
            size="middle"
            style={{ 
              minWidth: '80px',
              height: '40px',
              borderRadius: '20px'
            }}
          >
            Send
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default InlineReplyForm;
