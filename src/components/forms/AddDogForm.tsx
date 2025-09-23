// components/AddDogForm.tsx
'use client';

import React, { useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Upload, 
  Button, 
  Row, 
  Col,
  InputNumber,
  message
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Dog } from '@/types';
import dayjs from 'dayjs';
import { mutate } from 'swr';

const { Option } = Select;
const { TextArea } = Input;

interface AddDogFormProps {
  visible: boolean;
  onClose: () => void;
  dog?: Dog | null; // For editing existing dog
  onSuccess?: (dog: Dog) => void;
}

export interface DogFormData {
  name: string;
  breed: string;
  gender: 'male' | 'female';
  birthDate: string;
  weight?: number;
  color: string;
  breedingStatus: 'available' | 'retired' | 'not_ready';
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  registrationNumber?: string;
  microchipNumber?: string;
  notes?: string;
  photo?: File;
}

const AddDogForm: React.FC<AddDogFormProps> = ({ 
  visible, 
  onClose, 
  dog, 
  onSuccess 
}) => {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = React.useState(false);

  useEffect(() => {
    if (visible && dog) {
      // Pre-populate form for editing
      form.setFieldsValue({
        ...dog,
        birthDate: dog.birthDate ? dayjs(dog.birthDate) : null,
      });
    } else if (visible) {
      // Reset form for new dog
      form.resetFields();
    }
  }, [visible, dog, form]);

  const handleSubmit = async (values: any) => {
    try {
      setSubmitLoading(true);
      
      const formData = new FormData();
      
      // Convert date to ISO string
      const dogData = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.toISOString() : null,
      };

      // Add form data
      Object.keys(dogData).forEach(key => {
        if (dogData[key] !== null && dogData[key] !== undefined) {
          formData.append(key, dogData[key]);
        }
      });

      // Add photo if uploaded
      if (values.photo && values.photo.fileList && values.photo.fileList[0]) {
        formData.append('photo', values.photo.fileList[0].originFileObj);
      }

      // Add dog ID if editing
      if (dog?.id) {
        formData.append('id', dog.id);
      }

      const endpoint = dog?.id ? `/api/dogs/${dog.id}` : '/api/dogs';
      const method = dog?.id ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save dog');
      }

      const savedDog = await response.json();
      
      message.success(dog?.id ? 'Dog updated successfully!' : 'Dog added successfully!');
      
      // Mutate SWR cache to refresh dogs data
      mutate('/api/dogs');
      
      if (onSuccess) {
        onSuccess(savedDog);
      }
      
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Error saving dog:', error);
      message.error(error instanceof Error ? error.message : 'Failed to save dog');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const validateMicrochip = (_: any, value: string) => {
    if (value && value.length !== 15) {
      return Promise.reject(new Error('Microchip number must be 15 digits'));
    }
    if (value && !/^\d+$/.test(value)) {
      return Promise.reject(new Error('Microchip number must contain only numbers'));
    }
    return Promise.resolve();
  };

  const validateWeight = (_: any, value: number) => {
    if (value && (value < 1 || value > 300)) {
      return Promise.reject(new Error('Weight must be between 1 and 300 pounds'));
    }
    return Promise.resolve();
  };

  return (
    <Modal
      title={
        <div style={{ color: '#08979C', fontSize: '18px', fontWeight: 600 }}>
          {dog?.id ? 'Edit Dog' : 'Add New Dog'}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnHidden
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          gender: 'male',
          breedingStatus: 'not_ready',
          healthStatus: 'excellent',
        }}
        scrollToFirstError
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Dog Name"
              rules={[
                { required: true, message: 'Please enter the dog name' },
                { min: 2, message: 'Name must be at least 2 characters' },
                { max: 50, message: 'Name must be less than 50 characters' }
              ]}
            >
              <Input 
                placeholder="Enter dog name" 
                maxLength={50}
                showCount
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="breed"
              label="Breed"
              rules={[
                { required: true, message: 'Please enter the breed' },
                { min: 2, message: 'Breed must be at least 2 characters' }
              ]}
            >
              <Input 
                placeholder="e.g., Golden Retriever, Labrador" 
                maxLength={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: 'Please select gender' }]}
            >
              <Select>
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="birthDate"
              label="Birth Date"
              rules={[{ required: true, message: 'Please select birth date' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="Select birth date"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="weight"
              label="Weight (lbs)"
              rules={[{ validator: validateWeight }]}
            >
              <InputNumber 
                min={1} 
                max={300} 
                placeholder="Weight in pounds"
                style={{ width: '100%' }}
                precision={1}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="color"
              label="Color/Markings"
              rules={[
                { required: true, message: 'Please enter color/markings' },
                { min: 2, message: 'Color must be at least 2 characters' }
              ]}
            >
              <Input 
                placeholder="e.g., Golden, Black with white markings" 
                maxLength={100}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="breedingStatus"
              label="Breeding Status"
              rules={[{ required: true, message: 'Please select breeding status' }]}
            >
              <Select>
                <Option value="not_ready">Not Ready</Option>
                <Option value="available">Available for Breeding</Option>
                <Option value="retired">Retired</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="healthStatus"
              label="Health Status"
              rules={[{ required: true, message: 'Please select health status' }]}
            >
              <Select>
                <Option value="excellent">Excellent</Option>
                <Option value="good">Good</Option>
                <Option value="fair">Fair</Option>
                <Option value="poor">Poor</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="registrationNumber"
              label="Registration Number"
            >
              <Input 
                placeholder="AKC or other registration number" 
                maxLength={50}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="microchipNumber"
              label="Microchip Number"
              rules={[{ validator: validateMicrochip }]}
            >
              <Input 
                placeholder="15-digit microchip number" 
                maxLength={15}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="photo"
              label="Photo"
              extra="Max file size: 5MB. Supported formats: JPG, PNG, GIF"
            >
              <Upload
                beforeUpload={(file) => {
                  const isValidType = file.type.startsWith('image/');
                  if (!isValidType) {
                    message.error('Please upload an image file!');
                    return false;
                  }
                  const isLt5M = file.size / 1024 / 1024 < 5;
                  if (!isLt5M) {
                    message.error('Image must be smaller than 5MB!');
                    return false;
                  }
                  return false; // Prevent automatic upload
                }}
                maxCount={1}
                accept="image/*"
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Select Photo</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="notes"
          label="Notes"
        >
          <TextArea 
            rows={3} 
            placeholder="Any additional notes about the dog (health records, temperament, etc.)..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
          <Button 
            onClick={handleCancel} 
            style={{ marginRight: 8 }}
            disabled={submitLoading}
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={submitLoading}
            style={{ background: '#08979C', borderColor: '#08979C' }}
          >
            {dog?.id ? 'Update Dog' : 'Add Dog'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDogForm;