'use client';

import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Space,
  Button,
  FormInstance
} from 'antd';
import { Dog } from '@homeforpup/shared-types';
import BreedSelector from './forms/BreedSelector';
import ColorSelector from './forms/ColorSelector';
import { PhotoUpload, setS3Operations } from '@homeforpup/shared-photo-upload';

const { Option } = Select;
const { TextArea } = Input;

export interface AddEditDogFormProps {
  form: FormInstance;
  onFinish: (values: any) => void;
  onCancel: () => void;
  initialValues?: Partial<Dog>;
  mode: 'add' | 'edit';
  loading?: boolean;
  kennelId?: string;
  kennels?: Array<{ id: string; name: string }>;
  colors?: any[];
  colorsLoading?: boolean;
  colorsError?: any;
  // Breed selector data
  breeds?: any[];
  breedsLoading?: boolean;
  breedsError?: any;
  // Photo-related props (optional - only for detailed forms)
  showPhotos?: boolean;
  photos?: string[];
  onPhotosChange?: (photos: string[]) => void;
  maxPhotos?: number;
  // S3 operations for photo upload
  s3Operations?: any;
  // Layout options
  layout?: 'simple' | 'detailed';
  // Additional fields control
  showAdvancedFields?: boolean;
}

const AddEditDogForm: React.FC<AddEditDogFormProps> = ({
  form,
  onFinish,
  onCancel,
  initialValues,
  mode,
  loading = false,
  kennelId,
  kennels,
  colors,
  colorsLoading,
  colorsError,
  breeds,
  breedsLoading,
  breedsError,
  showPhotos = false,
  photos = [],
  onPhotosChange,
  maxPhotos = 10,
  s3Operations,
  layout = 'simple',
  showAdvancedFields = false
}) => {
  // Configure S3 operations for photo upload if provided
  useEffect(() => {
    if (s3Operations && showPhotos) {
      setS3Operations(s3Operations);
    }
  }, [s3Operations, showPhotos]);

  // Set initial values when editing
  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        callName: initialValues.callName,
        breed: initialValues.breed,
        gender: initialValues.gender,
        dogType: initialValues.dogType,
        birthDate: initialValues.birthDate,
        color: initialValues.color,
        weight: initialValues.weight,
        height: initialValues.height,
        eyeColor: initialValues.eyeColor,
        markings: initialValues.markings,
        temperament: initialValues.temperament,
        specialNeeds: initialValues.specialNeeds,
        notes: initialValues.notes,
        description: initialValues.description,
        kennelId: initialValues.kennelId || kennelId,
      });
    }
  }, [mode, initialValues, form, kennelId]);

  const isDetailed = layout === 'detailed' || showAdvancedFields;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      preserve={false}
    >
      <Row gutter={[16, 16]}>
        {/* Kennel Selection - only show if kennels are provided and no kennelId is set */}
        {kennels && !kennelId && (
          <Col xs={24}>
            <Form.Item
              name="kennelId"
              label="Kennel"
              rules={[{ required: true, message: 'Please select a kennel' }]}
            >
              <Select placeholder="Select kennel">
                {kennels.map((kennel) => (
                  <Option key={kennel.id} value={kennel.id}>
                    {kennel.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        )}

        {/* Basic Information */}
        <Col xs={24} md={isDetailed ? 12 : 24}>
          <Form.Item
            name="name"
            label="Dog Name"
            rules={[{ required: true, message: 'Please enter dog name' }]}
          >
            <Input placeholder="Enter dog name" />
          </Form.Item>
        </Col>

        {isDetailed && (
          <Col xs={24} md={12}>
            <Form.Item
              name="callName"
              label="Call Name (Nickname)"
            >
              <Input placeholder="Enter nickname" />
            </Form.Item>
          </Col>
        )}

        {/* Breed, Gender, Type */}
        <Col xs={24} md={isDetailed ? 8 : 12}>
          <Form.Item
            name="breed"
            label="Breed"
            rules={[{ required: true, message: 'Please select breed' }]}
          >
            <BreedSelector
              placeholder="Select breed"
              showSearch={true}
              allowClear={true}
              breeds={breeds}
              loading={breedsLoading}
              error={breedsError}
              showBreedInfo={true}
              showBreederCount={true}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={isDetailed ? 8 : 12}>
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

        <Col xs={24} md={isDetailed ? 8 : 12}>
          <Form.Item
            name="dogType"
            label="Type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select placeholder="Select type">
              <Option value="parent">Parent</Option>
              <Option value="puppy">Puppy</Option>
            </Select>
          </Form.Item>
        </Col>

        {/* Birth Date and Color */}
        <Col xs={24} md={12}>
          <Form.Item
            name="birthDate"
            label="Birth Date"
            rules={isDetailed ? [{ required: true, message: 'Please enter birth date' }] : []}
          >
            <Input type="date" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="color"
            label="Color"
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

        {/* Physical Characteristics - detailed layout only */}
        {isDetailed && (
          <>
            <Col xs={24} md={8}>
              <Form.Item
                name="weight"
                label="Weight (lbs)"
              >
                <InputNumber 
                  min={0} 
                  max={200} 
                  style={{ width: '100%' }}
                  placeholder="Weight"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="height"
                label="Height (inches)"
              >
                <InputNumber 
                  min={0} 
                  max={50} 
                  style={{ width: '100%' }}
                  placeholder="Height"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="eyeColor"
                label="Eye Color"
              >
                <Input placeholder="Enter eye color" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="markings"
                label="Markings"
              >
                <Input placeholder="Describe any markings" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="temperament"
                label="Temperament"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Describe the dog's temperament" 
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="specialNeeds"
                label="Special Needs"
              >
                <TextArea 
                  rows={2} 
                  placeholder="Any special needs or medical conditions" 
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="notes"
                label="Notes"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Additional notes about this dog" 
                />
              </Form.Item>
            </Col>
          </>
        )}

        {/* Simple layout weight and description */}
        {!isDetailed && (
          <>
            <Col xs={24} md={12}>
              <Form.Item
                name="weight"
                label="Weight (lbs)"
                rules={[{ required: true, message: 'Please enter weight' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea rows={3} placeholder="Description and notes..." />
              </Form.Item>
            </Col>
          </>
        )}

        {/* Photo Upload - only show if enabled */}
        {showPhotos && (
          <Col xs={24}>
            <Form.Item
              name="photos"
              label="Photos"
            >
              <PhotoUpload
                key={`photo-upload-${photos.length}`}
                photos={photos}
                onPhotosChange={onPhotosChange || (() => {})}
                maxPhotos={maxPhotos}
                aspect="standard"
                uploadPath="dog-photos"
              />
            </Form.Item>
          </Col>
        )}
      </Row>

      {/* Form Actions */}
      <div style={{ textAlign: 'right', marginTop: '24px' }}>
        <Space>
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {mode === 'add' ? 'Add Dog' : 'Update Dog'}
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default AddEditDogForm;
