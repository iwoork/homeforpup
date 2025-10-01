'use client';

import React from 'react';
import { Modal, Form, Input, Button, Select, message, Space } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface ComposeMessageProps {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  defaultRecipientId?: string;
  onSend: (values: any, recipientName?: string) => Promise<void>;
}

const ComposeMessage: React.FC<ComposeMessageProps> = ({
  visible,
  onClose,
  loading,
  defaultRecipientId,
  onSend
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      await onSend(values);
      form.resetFields();
      message.success('Message sent successfully!');
    } catch (error) {
      message.error('Failed to send message. Please try again.');
    }
  };

  return (
    <Modal
      title="Send Message"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={window.innerWidth < 768 ? '95%' : 600}
      style={{ top: window.innerWidth < 768 ? 20 : undefined }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          recipient: defaultRecipientId,
          messageType: 'general'
        }}
      >
        <Form.Item
          name="recipient"
          label="Recipient"
          rules={[{ required: true, message: 'Please select a recipient' }]}
        >
          <Input 
            placeholder="Recipient ID" 
            disabled={!!defaultRecipientId}
            size="large"
            style={{ fontSize: '16px' }} // Prevents zoom on iOS
          />
        </Form.Item>

        <Form.Item
          name="subject"
          label="Subject"
          rules={[{ required: true, message: 'Please enter a subject' }]}
        >
          <Input 
            placeholder="Message subject"
            size="large"
            style={{ fontSize: '16px' }} // Prevents zoom on iOS
          />
        </Form.Item>

        <Form.Item
          name="messageType"
          label="Message Type"
        >
          <Select size="large">
            <Option value="general">💬 General</Option>
            <Option value="inquiry">❓ Inquiry</Option>
            <Option value="business">💼 Business</Option>
            <Option value="urgent">🚨 Urgent</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="content"
          label="Message"
          rules={[{ required: true, message: 'Please enter your message' }]}
        >
          <TextArea
            rows={6}
            placeholder="Type your message here..."
            style={{ fontSize: '16px' }} // Prevents zoom on iOS
          />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button 
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
              size="large"
              style={{ minWidth: '120px' }}
            >
              Send Message
            </Button>
            <Button 
              onClick={onClose}
              size="large"
              style={{ minWidth: '80px' }}
            >
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ComposeMessage;
