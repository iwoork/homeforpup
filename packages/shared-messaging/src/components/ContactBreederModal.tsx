'use client';

import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Typography, Space, Divider, Alert } from 'antd';
import { UserOutlined, MailOutlined, MessageOutlined, CheckCircleOutlined, SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface ContactBreederModalProps {
  visible: boolean;
  onCancel: () => void;
  puppyName: string;
  breederName: string;
  senderName: string;
  senderEmail: string;
}

const ContactBreederModal: React.FC<ContactBreederModalProps> = ({
  visible,
  onCancel,
  puppyName,
  breederName,
  senderName,
  senderEmail
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/contact-breeder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          puppyName,
          breederName,
          senderName,
          senderEmail,
          subject: values.subject,
          message: values.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      message.success('Message sent successfully!');
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <MessageOutlined />
          Contact Breeder
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Alert
        message="Contact Information"
        description={
          <Space direction="vertical" size="small">
            <Text>
              <UserOutlined /> <strong>Puppy:</strong> {puppyName}
            </Text>
            <Text>
              <UserOutlined /> <strong>Breeder:</strong> {breederName}
            </Text>
            <Text>
              <MailOutlined /> <strong>Your Email:</strong> {senderEmail}
            </Text>
          </Space>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          subject: `Inquiry about ${puppyName}`,
        }}
      >
        <Form.Item
          name="subject"
          label="Subject"
          rules={[{ required: true, message: 'Please enter a subject' }]}
        >
          <Input placeholder="Message subject" />
        </Form.Item>

        <Form.Item
          name="message"
          label="Message"
          rules={[
            { required: true, message: 'Please enter your message' },
            { min: 10, message: 'Message must be at least 10 characters' },
          ]}
        >
          <TextArea
            rows={6}
            placeholder={`Hi ${breederName},\n\nI'm interested in learning more about ${puppyName}...`}
          />
        </Form.Item>

        <Divider />

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
            >
              Send Message
            </Button>
            <Button onClick={onCancel}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Alert
        message="What happens next?"
        description={
          <Space direction="vertical" size="small">
            <Text>
              <CheckCircleOutlined /> Your message will be sent to the breeder
            </Text>
            <Text>
              <CheckCircleOutlined /> The breeder will receive an email notification
            </Text>
            <Text>
              <CheckCircleOutlined /> You can continue the conversation in your messages
            </Text>
          </Space>
        }
        type="success"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
};

export default ContactBreederModal;
