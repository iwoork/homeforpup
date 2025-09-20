// components/messages/ReplyForm.tsx
'use client';

import React from 'react';
import {
  Form,
  Input,
  Button,
  Space,
  Upload,
  message as antMessage
} from 'antd';
import {
  SendOutlined,
  PaperClipOutlined
} from '@ant-design/icons';
import { ReplyFormValues } from '@/types/messaging';

const { TextArea } = Input;

interface ReplyFormProps {
  onSend: (values: ReplyFormValues) => Promise<void>;
  loading: boolean;
  disabled?: boolean;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  onSend,
  loading,
  disabled = false
}) => {
  const [form] = Form.useForm<ReplyFormValues>();

  const handleSubmit = async (values: ReplyFormValues) => {
    try {
      await onSend(values);
      form.resetFields();
      antMessage.success('Reply sent successfully!');
    } catch (error) {
      console.error('Failed to send reply:', error);
      antMessage.error('Failed to send reply');
    }
  };

  return (
    <div style={{ 
      padding: '16px 24px', 
      borderTop: '1px solid #f0f0f0',
      background: '#fff'
    }}>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Item
          name="content"
          rules={[{ required: true, message: 'Please enter your reply' }]}
          style={{ marginBottom: '12px' }}
        >
          <TextArea
            rows={3}
            placeholder="Type your reply..."
            disabled={loading || disabled}
          />
        </Form.Item>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Upload beforeUpload={() => false}>
              <Button 
                icon={<PaperClipOutlined />} 
                type="text" 
                size="small"
                disabled={loading || disabled}
              >
                Attach
              </Button>
            </Upload>
          </Space>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SendOutlined />}
              loading={loading}
              disabled={disabled}
              style={{ background: '#08979C', borderColor: '#08979C' }}
            >
              Send Reply
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default ReplyForm;