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
} from 'antd';
import { UploadOutlined, SaveOutlined, CloseOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Kennel } from '@/types';
import { useKennels } from '@/hooks/useKennels';
import { LocationAutocomplete } from '@/components';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

interface KennelFormProps {
  kennel?: Kennel;
  onSave?: (kennel: Kennel) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const KennelForm: React.FC<KennelFormProps> = ({
  kennel,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const { createKennel, updateKennel } = useKennels();
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (kennel) {
      form.setFieldsValue(kennel);
    }
  }, [kennel, form]);

  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);

      const kennelData = {
        ...values,
        isActive: values.isActive !== false,
      };

      let savedKennel;
      if (kennel) {
        savedKennel = await updateKennel(kennel.id, kennelData);
        message.success('Kennel updated successfully');
      } else {
        savedKennel = await createKennel(kennelData);
        message.success('Kennel created successfully');
      }

      form.resetFields();
      onSave?.(savedKennel);
    } catch (error) {
      console.error('Error saving kennel:', error);
      message.error('Failed to save kennel');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel?.();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Title level={3}>
        {kennel ? 'Edit Kennel' : 'Create New Kennel'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          specialties: [],
          isActive: true,
          isPublic: true,
          businessType: 'hobby',
        }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Kennel Name"
              name="name"
              rules={[{ required: true, message: 'Please enter kennel name' }]}
            >
              <Input placeholder="Enter kennel name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="License Number" name="licenseNumber">
              <Input placeholder="Enter license number (optional)" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Description" name="description">
          <TextArea rows={3} placeholder="Describe your kennel..." />
        </Form.Item>

        {/* Address Information */}
        <Title level={4}>Address Information</Title>
        
        {/* Location Autocomplete to help fill address */}
        <Form.Item 
          label="Search Location" 
          help="Start typing to search and auto-fill your address"
        >
          <LocationAutocomplete
            placeholder="Search for your address or location"
            prefix={<EnvironmentOutlined />}
            onChange={(value, details) => {
              if (details) {
                // Auto-fill the address fields based on Google Places details
                const updates: any = {};
                
                details.fullAddress && form.setFieldValue(['address', 'street'], details.fullAddress.split(',')[0]);
                details.city && form.setFieldValue(['address', 'city'], details.city);
                details.state && form.setFieldValue(['address', 'state'], details.state);
                details.country && form.setFieldValue(['address', 'country'], details.country);
              }
            }}
          />
        </Form.Item>
        
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Street Address" name={['address', 'street']}>
              <Input placeholder="123 Main Street" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="City" name={['address', 'city']}>
              <Input placeholder="City" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="State" name={['address', 'state']}>
              <Input placeholder="State/Province" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="ZIP Code" name={['address', 'zipCode']}>
              <Input placeholder="12345" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Country" name={['address', 'country']}>
              <Input placeholder="Country" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Established Date" name="establishedDate">
              <Input type="date" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Business Type" name="businessType">
              <Select placeholder="Select business type">
                <Option value="hobby">Hobby Breeder</Option>
                <Option value="commercial">Commercial Breeder</Option>
                <Option value="show">Show Kennel</Option>
                <Option value="working">Working Dog Kennel</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Phone" name="phone">
              <Input placeholder="Phone number" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Email" name="email">
              <Input type="email" placeholder="Email address" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Website" name="website">
              <Input placeholder="Website URL" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Specialties"
          name="specialties"
          tooltip="Breeds your kennel specializes in"
        >
          <Select
            mode="tags"
            placeholder="Add breeds you specialize in"
            style={{ width: '100%' }}
          >
            <Option value="Golden Retriever">Golden Retriever</Option>
            <Option value="Labrador Retriever">Labrador Retriever</Option>
            <Option value="German Shepherd">German Shepherd</Option>
            <Option value="French Bulldog">French Bulldog</Option>
            <Option value="Bulldog">Bulldog</Option>
            <Option value="Poodle">Poodle</Option>
            <Option value="Beagle">Beagle</Option>
            <Option value="Rottweiler">Rottweiler</Option>
            <Option value="German Shorthaired Pointer">German Shorthaired Pointer</Option>
            <Option value="Yorkshire Terrier">Yorkshire Terrier</Option>
          </Select>
        </Form.Item>

        {/* Social Media Links */}
        <Title level={4}>Social Media & Marketing</Title>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Facebook" name={['socialLinks', 'facebook']}>
              <Input placeholder="https://facebook.com/yourkennel" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Instagram" name={['socialLinks', 'instagram']}>
              <Input placeholder="https://instagram.com/yourkennel" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Twitter" name={['socialLinks', 'twitter']}>
              <Input placeholder="https://twitter.com/yourkennel" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="YouTube" name={['socialLinks', 'youtube']}>
              <Input placeholder="https://youtube.com/yourkennel" />
            </Form.Item>
          </Col>
        </Row>

        {/* Status and Visibility */}
        <Title level={4}>Status & Visibility</Title>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Kennel Status" name="isActive">
              <Select>
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Public Visibility" name="isPublic">
              <Select>
                <Option value={true}>Public (visible to everyone)</Option>
                <Option value={false}>Private (only you can see)</Option>
              </Select>
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
              {kennel ? 'Update Kennel' : 'Create Kennel'}
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

export default KennelForm;
