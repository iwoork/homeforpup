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
import { ComposeMessageFormValues } from '@/types/messaging';

const { TextArea } = Input;

interface ComposeMessageProps {
  visible: boolean;
  onClose: () => void;
  onSend: (values: ComposeMessageFormValues) => Promise<void>;
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
      await onSend(values);
      form.resetFields();
      onClose();
      antMessage.success('Message sent successfully!');
    } catch (error) {
      console.error('Failed to send message:', error);
      antMessage.error('Failed to send message');
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
            placeholder="Select recipient or enter email"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={availableUsers.map(user => ({
              value: user.id,
              label: `${user.name}${user.email ? ` (${user.email})` : ''}`
            }))}
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
          rules={[{ required: true, message: 'Please enter a subject' }]}
        >
          <Input placeholder="Enter subject" />
        </Form.Item>

        <Form.Item
          name="content"
          label="Message"
          rules={[{ required: true, message: 'Please enter your message' }]}
        >
          <TextArea rows={6} placeholder="Type your message here..." />
        </Form.Item>

        <Form.Item label="Attachments">
          <Upload.Dragger
            multiple
            beforeUpload={() => false}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          >
            <p className="ant-upload-drag-icon">
              <PaperClipOutlined />
            </p>
            <p className="ant-upload-text">Click or drag files to attach</p>
            <p className="ant-upload-hint">
              Support for PDF, DOC, DOCX, JPG, PNG files up to 10MB
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
              style={{ background: '#08979C', borderColor: '#08979C' }}
            >
              Send Message
            </Button>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ComposeMessage;