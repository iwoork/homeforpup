'use client';

import React from 'react';
import {
  Form,
  Input,
  Button,
  Space,
  Row,
  Col,
  Select,
  Upload,
  message,
  Typography,
  DatePicker,
  InputNumber,
  Switch,
} from 'antd';
import { UploadOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { KennelAnnouncement } from '@/types';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

interface KennelAnnouncementFormProps {
  kennelId: string;
  announcement?: KennelAnnouncement;
  onSave?: (announcement: KennelAnnouncement) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const KennelAnnouncementForm: React.FC<KennelAnnouncementFormProps> = ({
  kennelId,
  announcement,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = React.useState(false);
  const [announcementType, setAnnouncementType] = React.useState<string>('general');

  React.useEffect(() => {
    if (announcement) {
      form.setFieldsValue(announcement);
      setAnnouncementType(announcement.type);
    }
  }, [announcement, form]);

  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);

      const announcementData = {
        ...values,
        kennelId,
        isPublished: values.isPublished !== false,
        isPinned: values.isPinned || false,
        publishedAt: values.isPublished ? new Date().toISOString() : undefined,
      };

      // TODO: Implement API call to save announcement
      console.log('Saving announcement:', announcementData);
      
      message.success('Announcement saved successfully');
      onSave?.(announcementData as KennelAnnouncement);
    } catch (error) {
      console.error('Error saving announcement:', error);
      message.error('Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel?.();
  };

  const handleTypeChange = (value: string) => {
    setAnnouncementType(value);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Title level={3}>
        {announcement ? 'Edit Announcement' : 'Create New Announcement'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'general',
          isPublished: true,
          isPinned: false,
        }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: 'Please enter announcement title' }]}
            >
              <Input placeholder="Enter announcement title" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Type"
              name="type"
              rules={[{ required: true, message: 'Please select announcement type' }]}
            >
              <Select placeholder="Select type" onChange={handleTypeChange}>
                <Option value="general">General Update</Option>
                <Option value="litter_available">Litter Available</Option>
                <Option value="update">Kennel Update</Option>
                <Option value="blog">Blog Post</Option>
                <Option value="event">Event</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Content"
          name="content"
          rules={[{ required: true, message: 'Please enter announcement content' }]}
        >
          <TextArea rows={6} placeholder="Write your announcement content..." />
        </Form.Item>

        {/* Litter-specific fields */}
        {announcementType === 'litter_available' && (
          <>
            <Title level={4}>Litter Information</Title>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Breed" name="breed">
                  <Input placeholder="e.g., Golden Retriever" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Available Puppies" name="availablePuppies">
                  <InputNumber min={0} placeholder="Number of available puppies" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Price Range (Min)" name={['priceRange', 'min']}>
                  <InputNumber min={0} placeholder="Minimum price" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Price Range (Max)" name={['priceRange', 'max']}>
                  <InputNumber min={0} placeholder="Maximum price" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* Event-specific fields */}
        {announcementType === 'event' && (
          <>
            <Title level={4}>Event Information</Title>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Event Date" name="eventDate">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Event Location" name="eventLocation">
                  <Input placeholder="Event location" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* Media Upload */}
        <Form.Item label="Photos" name="photos">
          <Upload
            listType="picture-card"
            multiple
            beforeUpload={() => false} // Prevent auto upload
          >
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Form.Item>

        {/* Tags */}
        <Form.Item label="Tags" name="tags">
          <Select
            mode="tags"
            placeholder="Add tags for better discoverability"
            style={{ width: '100%' }}
          >
            <Option value="puppies">Puppies</Option>
            <Option value="breeding">Breeding</Option>
            <Option value="health">Health</Option>
            <Option value="training">Training</Option>
            <Option value="show">Show</Option>
            <Option value="working">Working Dogs</Option>
          </Select>
        </Form.Item>

        {/* Publishing Options */}
        <Title level={4}>Publishing Options</Title>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Published" name="isPublished" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Pinned to Top" name="isPinned" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saving || loading}
            >
              {announcement ? 'Update Announcement' : 'Create Announcement'}
            </Button>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default KennelAnnouncementForm;
