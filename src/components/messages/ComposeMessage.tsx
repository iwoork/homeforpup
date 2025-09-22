// components/messages/ComposeMessage.tsx
'use client';

import React from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Upload,
  message as antMessage
} from 'antd';
import {
  SendOutlined,
  PaperClipOutlined
} from '@ant-design/icons';

const { TextArea } = Input;

// Type definition for compose message form
interface ComposeMessageFormValues {
  recipient: string;
  subject: string;
  content: string;
  messageType?: string;
}

interface ComposeMessageProps {
  visible: boolean;
  onClose: () => void;
  onSend: (values: ComposeMessageFormValues, recipientName: string) => Promise<void>;
  loading: boolean;
  availableUsers?: Array<{ id: string; name: string; email?: string }>;
}

const ComposeMessage: React.FC<ComposeMessageProps> = ({
  visible,
  onClose,
  onSend,
  loading,
  availableUsers = []
}) => {
  const [form] = Form.useForm<ComposeMessageFormValues>();

  const handleSubmit = async (values: ComposeMessageFormValues) => {
    try {
      // Find the recipient name from available users
      const selectedUser = availableUsers.find(user => user.id === values.recipient);
      const recipientName = selectedUser?.name || 'Unknown User';
      
      await onSend(values, recipientName);
      form.resetFields();
      onClose();
      antMessage.success('Message sent successfully!');
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Authentication expired')) {
          antMessage.error('Your session has expired. Please log in again.');
        } else if (error.message.includes('Invalid authentication')) {
          antMessage.error('Authentication error. Please log in again.');
        } else if (error.message.includes('Cannot send message to yourself')) {
          antMessage.error('You cannot send a message to yourself.');
        } else {
          antMessage.error('Failed to send message. Please try again.');
        }
      } else {
        antMessage.error('Failed to send message. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Compose New Message"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="recipient"
          label="To"
          rules={[{ required: true, message: 'Please select a recipient' }]}
        >
          <Select
            placeholder="Select recipient"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={availableUsers.map(user => ({
              value: user.id,
              label: `${user.name}${user.email ? ` (${user.email})` : ''}`
            }))}
            notFoundContent="No users found"
          />
        </Form.Item>

        <Form.Item
          name="messageType"
          label="Message Type"
          rules={[{ required: true, message: 'Please select message type' }]}
        >
          <Select placeholder="Select message type">
            <Select.Option value="inquiry">Puppy Inquiry</Select.Option>
            <Select.Option value="business">Business</Select.Option>
            <Select.Option value="general">General</Select.Option>
            <Select.Option value="urgent">Urgent</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="subject"
          label="Subject"
          rules={[
            { required: true, message: 'Please enter a subject' },
            { max: 200, message: 'Subject cannot exceed 200 characters' }
          ]}
        >
          <Input placeholder="Enter subject" maxLength={200} showCount />
        </Form.Item>

        <Form.Item
          name="content"
          label="Message"
          rules={[
            { required: true, message: 'Please enter your message' },
            { max: 10000, message: 'Message cannot exceed 10,000 characters' }
          ]}
        >
          <TextArea 
            rows={6} 
            placeholder="Type your message here..." 
            maxLength={10000}
            showCount
          />
        </Form.Item>

        <Form.Item label="Attachments">
          <Upload.Dragger
            multiple
            beforeUpload={() => false}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            disabled
          >
            <p className="ant-upload-drag-icon">
              <PaperClipOutlined />
            </p>
            <p className="ant-upload-text">Attachments coming soon</p>
            <p className="ant-upload-hint">
              File attachments will be available in a future update
            </p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SendOutlined />}
              loading={loading}
              disabled={loading}
              style={{ background: '#08979C', borderColor: '#08979C' }}
            >
              Send Message
            </Button>
            <Button onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ComposeMessage;