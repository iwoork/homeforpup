import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Typography, Space, Divider, Alert } from 'antd';
import { UserOutlined, MailOutlined, MessageOutlined, CheckCircleOutlined } from '@ant-design/icons';

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
  senderEmail,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: { message: string }) => {
    console.log('Form submitted with values:', values);
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
          message: values.message,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Response data:', responseData);
        setSuccess(true);
        message.success('Your message has been sent successfully! We\'ll get back to you soon.');
        
        // Auto-close after 2 seconds
        setTimeout(() => {
          form.resetFields();
          setSuccess(false);
          onCancel();
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        message.error(errorData.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSuccess(false);
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <MessageOutlined style={{ marginRight: '8px', color: '#08979C' }} />
          Contact Breeder
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      centered
    >
      <div style={{ padding: '20px 0' }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
            <Text strong style={{ fontSize: '18px', color: '#52c41a', display: 'block', marginBottom: '8px' }}>
              Message Sent Successfully!
            </Text>
            <Text type="secondary">
              We've forwarded your message to {breederName} and will copy you on their response.
            </Text>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Text strong style={{ fontSize: '16px', color: '#08979C' }}>
                Interested in {puppyName}?
              </Text>
              <br />
              <Text type="secondary">
                Send a message to {breederName} and we'll help you connect.
              </Text>
            </div>

            <Divider />
          </>
        )}

        {!success && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
          <div style={{ marginBottom: '16px' }}>
            <Text strong>Your Information:</Text>
            <div style={{ 
              background: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '6px', 
              marginTop: '8px' 
            }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UserOutlined style={{ marginRight: '8px', color: '#666' }} />
                  <Text>{senderName}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <MailOutlined style={{ marginRight: '8px', color: '#666' }} />
                  <Text>{senderEmail}</Text>
                </div>
              </Space>
            </div>
          </div>

          <Form.Item
            name="message"
            label="Your Message"
            rules={[
              { required: true, message: 'Please enter your message' },
              { min: 10, message: 'Message must be at least 10 characters long' },
              { max: 1000, message: 'Message must be less than 1000 characters' },
            ]}
          >
            <TextArea
              rows={6}
              placeholder={`Hi! I'm interested in ${puppyName}. Could you please tell me more about this puppy? I'd love to know about their temperament, health records, and any other details you can share. Thank you!`}
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #f0f0f0'
          }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              We'll forward your message to the breeder and copy you on the response.
            </Text>
            <Space>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Send Message
              </Button>
            </Space>
          </div>
        </Form>
        )}
      </div>
    </Modal>
  );
};

export default ContactBreederModal;
