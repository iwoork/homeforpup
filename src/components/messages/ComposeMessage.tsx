// components/messages/ComposeMessage.tsx
'use client';

import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Upload,
  message as antMessage,
  Tag,
  Spin,
  Alert
} from 'antd';
import {
  SendOutlined,
  PaperClipOutlined,
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useAvailableUsers } from '@/hooks/useAvailableUsers';

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
}

const ComposeMessage: React.FC<ComposeMessageProps> = ({
  visible,
  onClose,
  onSend,
  loading
}) => {
  const [form] = Form.useForm<ComposeMessageFormValues>();
  const { users, loading: usersLoading, error: usersError, searchUsers, refreshUsers } = useAvailableUsers();

  // Refresh users when modal opens
  useEffect(() => {
    if (visible) {
      refreshUsers();
    }
  }, [visible, refreshUsers]);

  // Helper to get user type badge color
  const getUserTypeBadgeColor = (userType: string) => {
    switch (userType) {
      case 'breeder': return 'green';
      case 'adopter': return 'blue';
      case 'both': return 'purple';
      default: return 'default';
    }
  };

  const handleSubmit = async (values: ComposeMessageFormValues) => {
    try {
      // Find the recipient from available users
      const selectedUser = users.find(user => user.userId === values.recipient);
      const recipientName = selectedUser?.displayName || selectedUser?.name || 'Unknown User';
      
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

  const handleUserSearch = async (search: string) => {
    if (search.trim()) {
      await searchUsers({ search: search.trim() });
    } else {
      await refreshUsers();
    }
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
        {/* Show error if users failed to load */}
        {usersError && (
          <Alert
            message="Failed to load users"
            description={usersError}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
            action={
              <Button size="small" onClick={refreshUsers}>
                Retry
              </Button>
            }
          />
        )}

        <Form.Item
          name="recipient"
          label="To"
          rules={[{ required: true, message: 'Please select a recipient' }]}
        >
          <Select
            placeholder="Select recipient"
            showSearch
            loading={usersLoading}
            onSearch={handleUserSearch}
            filterOption={false}
            suffixIcon={usersLoading ? <Spin size="small" /> : <SearchOutlined />}
            optionRender={(option) => {
              const user = users.find(u => u.userId === option.value);
              if (!user) return option.label;
              
              return (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '4px 0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <UserOutlined />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '14px' }}>
                        {user.displayName || user.name}
                      </div>
                      {user.email && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {user.email}
                        </div>
                      )}
                      {user.location && (
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          📍 {user.location}
                        </div>
                      )}
                      {user.breederInfo?.kennelName && (
                        <div style={{ fontSize: '11px', color: '#08979C' }}>
                          🏠 {user.breederInfo.kennelName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <Tag 
                      color={getUserTypeBadgeColor(user.userType)}
                      style={{ fontSize: '10px', padding: '0 4px', height: '16px', lineHeight: '16px', margin: 0 }}
                    >
                      {user.userType}
                    </Tag>
                    {user.verified && (
                      <div style={{ fontSize: '10px', color: '#52c41a' }}>
                        ✓ Verified
                      </div>
                    )}
                  </div>
                </div>
              );
            }}
            options={users.map(user => ({
              value: user.userId,
              label: `${user.displayName || user.name}${user.email ? ` (${user.email})` : ''}`,
              user: user
            }))}
            notFoundContent={
              usersLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin size="small" />
                  <div style={{ marginTop: '8px' }}>Loading users...</div>
                </div>
              ) : users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div>No users found</div>
                  <Button size="small" type="link" onClick={refreshUsers}>
                    Refresh
                  </Button>
                </div>
              ) : (
                "No users match your search"
              )
            }
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
              disabled={loading || usersLoading}
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