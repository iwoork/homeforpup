'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Switch, 
  Select, 
  InputNumber,
  message,
  Steps,
  Divider
} from 'antd';
import { 
  HomeOutlined, 
  EnvironmentOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  GlobalOutlined,
  SaveOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreateKennelRequest } from '@homeforpup/shared-types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateKennelPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const steps = [
    {
      title: 'Basic Information',
      description: 'Kennel name and contact details',
    },
    {
      title: 'Location',
      description: 'Address and location details',
    },
    {
      title: 'Facilities',
      description: 'Available facilities and amenities',
    },
    {
      title: 'Capacity & Specialties',
      description: 'Capacity limits and breed specialties',
    },
  ];

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const kennelData: CreateKennelRequest = {
        name: values.name,
        description: values.description,
        businessName: values.businessName,
        website: values.website,
        phone: values.phone,
        email: values.email,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
          coordinates: values.latitude && values.longitude ? {
            latitude: values.latitude,
            longitude: values.longitude,
          } : undefined,
        },
        facilities: {
          indoorSpace: values.indoorSpace || false,
          outdoorSpace: values.outdoorSpace || false,
          exerciseArea: values.exerciseArea || false,
          whelpingArea: values.whelpingArea || false,
          quarantineArea: values.quarantineArea || false,
          groomingArea: values.groomingArea || false,
          veterinaryAccess: values.veterinaryAccess || false,
          climateControl: values.climateControl || false,
          security: values.security || false,
          other: values.otherFacilities || [],
        },
        capacity: {
          maxDogs: values.maxDogs || 10,
          maxLitters: values.maxLitters || 5,
          currentDogs: 0,
          currentLitters: 0,
        },
        specialties: values.specialties || [],
        socialMedia: {
          facebook: values.facebook,
          instagram: values.instagram,
          twitter: values.twitter,
          youtube: values.youtube,
        },
      };

      const response = await fetch('/api/kennels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(kennelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create kennel');
      }

      const result = await response.json();
      message.success('Kennel created successfully!');
      router.push(`/kennels/${result.kennel.id}`);
    } catch (error) {
      console.error('Error creating kennel:', error);
      message.error('Failed to create kennel');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    }).catch(() => {
      message.error('Please fill in all required fields');
    });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Kennel Name"
                rules={[{ required: true, message: 'Please enter kennel name' }]}
              >
                <Input placeholder="Enter kennel name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="businessName"
                label="Business Name"
              >
                <Input placeholder="Enter business name (optional)" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Describe your kennel, breeding philosophy, and experience..."
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="phone"
                label="Phone Number"
              >
                <Input placeholder="+1 (555) 123-4567" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="kennel@example.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="website"
                label="Website"
              >
                <Input placeholder="https://www.example.com" />
              </Form.Item>
            </Col>
          </Row>
        );

      case 1:
        return (
          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <Form.Item
                name="street"
                label="Street Address"
                rules={[{ required: true, message: 'Please enter street address' }]}
              >
                <Input placeholder="123 Main Street" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Please enter city' }]}
              >
                <Input placeholder="City" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="state"
                label="State/Province"
                rules={[{ required: true, message: 'Please enter state' }]}
              >
                <Input placeholder="State" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="zipCode"
                label="ZIP/Postal Code"
                rules={[{ required: true, message: 'Please enter ZIP code' }]}
              >
                <Input placeholder="12345" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="country"
                label="Country"
                rules={[{ required: true, message: 'Please select country' }]}
              >
                <Select placeholder="Select country">
                  <Option value="US">United States</Option>
                  <Option value="CA">Canada</Option>
                  <Option value="UK">United Kingdom</Option>
                  <Option value="AU">Australia</Option>
                  <Option value="DE">Germany</Option>
                  <Option value="FR">France</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="latitude"
                label="Latitude"
              >
                <InputNumber 
                  placeholder="40.7128" 
                  style={{ width: '100%' }}
                  precision={6}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                name="longitude"
                label="Longitude"
              >
                <InputNumber 
                  placeholder="-74.0060" 
                  style={{ width: '100%' }}
                  precision={6}
                />
              </Form.Item>
            </Col>
          </Row>
        );

      case 2:
        return (
          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <Title level={4}>Facilities & Amenities</Title>
              <Paragraph type="secondary">
                Select the facilities available at your kennel
              </Paragraph>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="indoorSpace" valuePropName="checked">
                <Switch /> Indoor Space
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="outdoorSpace" valuePropName="checked">
                <Switch /> Outdoor Space
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="exerciseArea" valuePropName="checked">
                <Switch /> Exercise Area
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="whelpingArea" valuePropName="checked">
                <Switch /> Whelping Area
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="quarantineArea" valuePropName="checked">
                <Switch /> Quarantine Area
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="groomingArea" valuePropName="checked">
                <Switch /> Grooming Area
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="veterinaryAccess" valuePropName="checked">
                <Switch /> Veterinary Access
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="climateControl" valuePropName="checked">
                <Switch /> Climate Control
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="security" valuePropName="checked">
                <Switch /> Security System
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="otherFacilities"
                label="Other Facilities"
              >
                <Select
                  mode="tags"
                  placeholder="Add other facilities"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        );

      case 3:
        return (
          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <Title level={4}>Capacity & Specialties</Title>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="maxDogs"
                label="Maximum Dogs"
                rules={[{ required: true, message: 'Please enter maximum dogs' }]}
              >
                <InputNumber 
                  min={1} 
                  max={100} 
                  style={{ width: '100%' }}
                  placeholder="10"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="maxLitters"
                label="Maximum Litters"
                rules={[{ required: true, message: 'Please enter maximum litters' }]}
              >
                <InputNumber 
                  min={1} 
                  max={20} 
                  style={{ width: '100%' }}
                  placeholder="5"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="specialties"
                label="Breed Specialties"
              >
                <Select
                  mode="multiple"
                  placeholder="Select breeds you specialize in"
                  style={{ width: '100%' }}
                >
                  <Option value="Golden Retriever">Golden Retriever</Option>
                  <Option value="Labrador">Labrador</Option>
                  <Option value="German Shepherd">German Shepherd</Option>
                  <Option value="French Bulldog">French Bulldog</Option>
                  <Option value="Poodle">Poodle</Option>
                  <Option value="Bulldog">Bulldog</Option>
                  <Option value="Beagle">Beagle</Option>
                  <Option value="Rottweiler">Rottweiler</Option>
                  <Option value="Siberian Husky">Siberian Husky</Option>
                  <Option value="Dachshund">Dachshund</Option>
                </Select>
              </Form.Item>
            </Col>
            <Divider />
            <Col xs={24}>
              <Title level={5}>Social Media (Optional)</Title>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="facebook" label="Facebook">
                <Input placeholder="https://facebook.com/yourpage" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="instagram" label="Instagram">
                <Input placeholder="https://instagram.com/yourpage" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="twitter" label="Twitter">
                <Input placeholder="https://twitter.com/yourpage" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="youtube" label="YouTube">
                <Input placeholder="https://youtube.com/yourchannel" />
              </Form.Item>
            </Col>
          </Row>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Create New Kennel
          </Title>
          <Paragraph type="secondary">
            Set up your kennel profile and facilities
          </Paragraph>
        </Col>
        <Col>
          <Link href="/kennels">
            <Button icon={<ArrowLeftOutlined />}>
              Back to Kennels
            </Button>
          </Link>
        </Col>
      </Row>

      {/* Steps */}
      <Card style={{ marginBottom: '24px' }}>
        <Steps current={currentStep} items={steps} />
      </Card>

      {/* Form */}
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            maxDogs: 10,
            maxLitters: 5,
            country: 'US',
          }}
        >
          {renderStepContent()}

          {/* Navigation Buttons */}
          <Row justify="space-between" style={{ marginTop: '32px' }}>
            <Col>
              {currentStep > 0 && (
                <Button onClick={prevStep}>
                  Previous
                </Button>
              )}
            </Col>
            <Col>
              <Space>
                {currentStep < steps.length - 1 ? (
                  <Button type="primary" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Create Kennel
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default CreateKennelPage;
