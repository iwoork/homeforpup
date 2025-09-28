'use client';

import React from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Upload,
  message,
  Space,
  Row,
  Col,
  Typography,
  Modal,
} from 'antd';
import {
  UploadOutlined,
  SaveOutlined,
  CloseOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Dog, Kennel } from '@/types';
import { useKennels } from '@/hooks/useKennels';
import { BreedSelector } from '@/components';
import KennelSelector from './KennelSelector';
import KennelForm from './KennelForm';

const { Option } = Select;
const { Title } = Typography;

interface DogFormProps {
  dog?: Dog;
  onSave?: (dog: Dog) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const DogForm: React.FC<DogFormProps> = ({
  dog,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = React.useState(false);
  const [showKennelForm, setShowKennelForm] = React.useState(false);
  const { kennels, isLoading: kennelsLoading, refreshKennels } = useKennels();

  React.useEffect(() => {
    if (dog) {
      form.setFieldsValue({
        ...dog,
        birthDate: dog.birthDate ? dayjs(dog.birthDate) : undefined,
      });
    }
  }, [dog, form]);

  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);

      const formData = new FormData();
      
      // Add all form fields
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'birthDate' && value && typeof value === 'object' && 'format' in value) {
            formData.append(key, (value as any).format('YYYY-MM-DD'));
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Handle photo upload
      if (values.photo && values.photo.fileList && values.photo.fileList.length > 0) {
        formData.append('photo', values.photo.fileList[0].originFileObj);
      }

      const url = dog ? `/api/dogs/${dog.id}` : '/api/dogs';
      const method = dog ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save dog');
      }

      const savedDog = await response.json();
      message.success(dog ? 'Dog updated successfully' : 'Dog created successfully');
      form.resetFields();
      onSave?.(savedDog);
    } catch (error) {
      console.error('Error saving dog:', error);
      message.error('Failed to save dog');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel?.();
  };

  const handleKennelCreated = (newKennel: Kennel) => {
    setShowKennelForm(false);
    refreshKennels();
    message.success('Kennel created successfully');
  };

  const handleAddKennel = () => {
    setShowKennelForm(true);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={3}>
        {dog ? 'Edit Dog' : 'Add New Dog'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          dogType: 'parent',
          breedingStatus: 'available',
          healthStatus: 'excellent',
        }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Dog Name"
              name="name"
              rules={[{ required: true, message: 'Please enter dog name' }]}
            >
              <Input placeholder="Enter dog name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Breed"
              name="breed"
              rules={[{ required: true, message: 'Please select breed' }]}
            >
              <BreedSelector
                placeholder="Select breed"
                showSearch={true}
                showBreedInfo={true}
                showBreederCount={true}
                allowClear={true}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: 'Please select gender' }]}
            >
              <Select placeholder="Select gender">
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Birth Date"
              name="birthDate"
              rules={[{ required: true, message: 'Please select birth date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Weight (lbs)"
              name="weight"
              rules={[{ required: true, message: 'Please enter weight' }]}
            >
              <InputNumber min={1} max={300} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Color"
              name="color"
              rules={[{ required: true, message: 'Please enter color' }]}
            >
              <Input placeholder="e.g., Golden, Black, Brown" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Dog Type"
              name="dogType"
              rules={[{ required: true, message: 'Please select dog type' }]}
            >
              <Select placeholder="Select dog type">
                <Option value="parent">Parent Dog</Option>
                <Option value="puppy">Puppy</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <KennelSelector
          kennels={kennels}
          loading={kennelsLoading}
          onAddKennel={handleAddKennel}
        />

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Breeding Status"
              name="breedingStatus"
              rules={[{ required: true, message: 'Please select breeding status' }]}
            >
              <Select placeholder="Select breeding status">
                <Option value="available">Available for Breeding</Option>
                <Option value="not_ready">Not Ready</Option>
                <Option value="retired">Retired</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Health Status"
              name="healthStatus"
              rules={[{ required: true, message: 'Please select health status' }]}
            >
              <Select placeholder="Select health status">
                <Option value="excellent">Excellent</Option>
                <Option value="good">Good</Option>
                <Option value="fair">Fair</Option>
                <Option value="poor">Poor</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Photo" name="photo">
          <Upload
            listType="picture-card"
            maxCount={1}
            beforeUpload={() => false}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload Photo</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} placeholder="Describe this dog..." />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saving || loading}
            >
              {dog ? 'Update Dog' : 'Add Dog'}
            </Button>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Modal
        title="Create New Kennel"
        open={showKennelForm}
        onCancel={() => setShowKennelForm(false)}
        footer={null}
        width={800}
      >
        <KennelForm
          onSave={handleKennelCreated}
          onCancel={() => setShowKennelForm(false)}
        />
      </Modal>
    </div>
  );
};

export default DogForm;
