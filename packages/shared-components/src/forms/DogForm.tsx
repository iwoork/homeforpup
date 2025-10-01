'use client';

import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Upload,
  Row,
  Col,
  Space,
  message,
} from 'antd';
import { UploadOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ColorSelector from './ColorSelector';
import { useDogColors } from '@homeforpup/shared-hooks';
import type { Dog } from '@homeforpup/shared-types';

const { Option } = Select;
const { TextArea } = Input;

export interface DogFormProps {
  dog?: Dog | null;
  kennels?: Array<{ id: string; name: string }>;
  kennelsLoading?: boolean;
  onSubmit: (values: any) => Promise<void>;
  onCancel?: () => void;
  submitButtonText?: string;
  showKennelSelector?: boolean;
  loading?: boolean;
  layout?: 'horizontal' | 'vertical' | 'inline';
  showPhotoUpload?: boolean;
  showAdvancedFields?: boolean;
}

export const DogForm: React.FC<DogFormProps> = ({
  dog,
  kennels = [],
  kennelsLoading = false,
  onSubmit,
  onCancel,
  submitButtonText,
  showKennelSelector = true,
  loading = false,
  layout = 'vertical',
  showPhotoUpload = true,
  showAdvancedFields = true,
}) => {
  const [form] = Form.useForm();
  const { colors, loading: colorsLoading, error: colorsError } = useDogColors();

  // Pre-populate form when editing
  useEffect(() => {
    if (dog) {
      form.setFieldsValue({
        ...dog,
        birthDate: dog.birthDate ? dayjs(dog.birthDate) : null,
      });
    }
  }, [dog, form]);

  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Error in DogForm submit:', error);
      // Error handling is done by parent
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel?.();
  };

  return (
    <Form
      form={form}
      layout={layout}
      onFinish={handleSubmit}
      initialValues={{
        gender: 'male',
        dogType: 'parent',
        breedingStatus: 'not_ready',
        healthStatus: 'excellent',
      }}
    >
      {/* Kennel Selector */}
      {showKennelSelector && (
        <Form.Item
          name="kennelId"
          label="Kennel"
          rules={[{ required: true, message: 'Please select a kennel' }]}
        >
          <Select 
            placeholder="Select kennel" 
            loading={kennelsLoading}
            disabled={kennelsLoading}
          >
            {kennels.map((kennel) => (
              <Option key={kennel.id} value={kennel.id}>
                {kennel.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      )}

      {/* Basic Information */}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="name"
            label="Dog Name"
            rules={[
              { required: true, message: 'Please enter dog name' },
              { min: 2, message: 'Name must be at least 2 characters' },
            ]}
          >
            <Input placeholder="Enter dog name" maxLength={50} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="breed"
            label="Breed"
            rules={[{ required: true, message: 'Please enter breed' }]}
          >
            <Input placeholder="e.g., Golden Retriever" maxLength={100} />
          </Form.Item>
        </Col>
      </Row>

      {/* Gender, Birth Date, Weight */}
      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            name="gender"
            label="Gender"
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
            name="birthDate"
            label="Birth Date"
            rules={[{ required: true, message: 'Please select birth date' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="weight"
            label="Weight (lbs)"
            rules={[{ required: true, message: 'Please enter weight' }]}
          >
            <InputNumber 
              min={1} 
              max={300} 
              style={{ width: '100%' }} 
              placeholder="Weight in pounds"
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Color and Dog Type */}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="color"
            label="Color/Markings"
            rules={[{ required: true, message: 'Please select color' }]}
            help="Select the primary color or pattern"
          >
            <ColorSelector
              colors={colors}
              loading={colorsLoading}
              error={colorsError || undefined}
              showColorSwatches={true}
              showDescription={true}
              placeholder="Select color or pattern"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="dogType"
            label="Dog Type"
            rules={[{ required: true, message: 'Please select dog type' }]}
          >
            <Select placeholder="Select dog type">
              <Option value="parent">Parent Dog</Option>
              <Option value="puppy">Puppy</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* Advanced Fields */}
      {showAdvancedFields && (
        <>
          <Row gutter={16}>
            <Col xs={24} md={12}>
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
            <Col xs={24} md={12}>
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
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="registrationNumber"
                label="Registration Number"
              >
                <Input placeholder="AKC or other registration" maxLength={50} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="microchipNumber"
                label="Microchip Number"
              >
                <Input placeholder="15-digit microchip number" maxLength={15} />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      {/* Photo Upload */}
      {showPhotoUpload && (
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
      )}

      {/* Notes */}
      <Form.Item
        name="notes"
        label="Notes"
      >
        <TextArea 
          rows={3} 
          placeholder="Any additional notes about the dog..."
          maxLength={500}
          showCount
        />
      </Form.Item>

      {/* Form Actions */}
      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Space>
          {onCancel && (
            <Button 
              onClick={handleCancel}
              icon={<CloseOutlined />}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="primary" 
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
          >
            {submitButtonText || (dog ? 'Update Dog' : 'Add Dog')}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default DogForm;

