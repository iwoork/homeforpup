'use client';

import React, { useState, useEffect } from 'react';
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
  Divider,
  Spin
} from 'antd';
import BreedSelector from '@/components/forms/BreedSelector';
import { 
  HomeOutlined, 
  EnvironmentOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  GlobalOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { UpdateKennelRequest } from '@homeforpup/shared-types';
import useSWR from 'swr';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EditKennelPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'unsaved'>('saved');
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<any>({});
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const params = useParams();
  const kennelId = params.id as string;

  // Fetch existing kennel data
  const { data: kennelData, error, isLoading } = useSWR(
    kennelId ? `/api/kennels/${kennelId}` : null,
    async (url: string) => {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch kennel details');
      }
      return response.json();
    }
  );

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

  // Load existing data into form when kennel data is available
  useEffect(() => {
    if (kennelData?.kennel) {
      const kennel = kennelData.kennel;
      console.log('Loading kennel data:', kennel);
      console.log('Kennel facilities:', kennel.facilities);
      console.log('Facilities type:', typeof kennel.facilities);
      console.log('Is facilities object:', kennel.facilities && typeof kennel.facilities === 'object');
      console.log('Kennel specialties:', kennel.specialties);
      console.log('Specialties type:', typeof kennel.specialties);
      console.log('Is specialties array:', Array.isArray(kennel.specialties));
      
      const formData = {
        name: kennel.name,
        description: kennel.description,
        businessName: kennel.businessName,
        website: kennel.website,
        phone: kennel.phone,
        email: kennel.email,
        street: kennel.address?.street,
        city: kennel.address?.city,
        state: kennel.address?.state,
        zipCode: kennel.address?.zipCode,
        country: kennel.address?.country,
        latitude: kennel.address?.coordinates?.latitude,
        longitude: kennel.address?.coordinates?.longitude,
        indoorSpace: kennel.facilities?.indoorSpace || false,
        outdoorSpace: kennel.facilities?.outdoorSpace || false,
        exerciseArea: kennel.facilities?.exerciseArea || false,
        whelpingArea: kennel.facilities?.whelpingArea || false,
        quarantineArea: kennel.facilities?.quarantineArea || false,
        groomingArea: kennel.facilities?.groomingArea || false,
        veterinaryAccess: kennel.facilities?.veterinaryAccess || false,
        climateControl: kennel.facilities?.climateControl || false,
        security: kennel.facilities?.security || false,
        otherFacilities: kennel.facilities?.other || [],
        maxDogs: kennel.capacity?.maxDogs || 10,
        maxLitters: kennel.capacity?.maxLitters || 5,
        specialties: kennel.specialties || [],
        facebook: kennel.socialMedia?.facebook,
        instagram: kennel.socialMedia?.instagram,
        twitter: kennel.socialMedia?.twitter,
        youtube: kennel.socialMedia?.youtube,
      };
      
      console.log('Loading kennel data into form:', formData);
      console.log('Setting form values...');
      
      // Set form values and wait for it to complete
      form.setFieldsValue(formData);
      setFormValues(formData);
      
      // Force form to update by resetting fields
      form.resetFields();
      form.setFieldsValue(formData);
      
      // Verify the form values were set correctly
      setTimeout(() => {
        const currentFormValues = form.getFieldsValue();
        console.log('Form values after setFieldsValue:', currentFormValues);
        console.log('Facilities in form after setFieldsValue:', {
          indoorSpace: currentFormValues.indoorSpace,
          outdoorSpace: currentFormValues.outdoorSpace,
          exerciseArea: currentFormValues.exerciseArea,
          whelpingArea: currentFormValues.whelpingArea,
          quarantineArea: currentFormValues.quarantineArea,
          groomingArea: currentFormValues.groomingArea,
          veterinaryAccess: currentFormValues.veterinaryAccess,
          climateControl: currentFormValues.climateControl,
          security: currentFormValues.security,
          otherFacilities: currentFormValues.otherFacilities,
        });
      }, 100);
    }
  }, [kennelData, form]);

  // Auto-save functionality
  const triggerAutoSave = () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(async () => {
      if (saveStatus === 'unsaved') {
        const currentValues = form.getFieldsValue();
        const stepName = steps[currentStep]?.title || `Step ${currentStep + 1}`;
        await saveCurrentStep(currentValues, stepName);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    setAutoSaveTimeout(timeout);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  // Function to save current form data to database
  const saveCurrentStep = async (stepData: any, stepName: string) => {
    if (!kennelId) return;
    
    setSaving(true);
    setSaveStatus('saving');
    
    try {
      console.log(`Saving ${stepName} step:`, stepData);
      
      // Get all current form values
      const allValues = form.getFieldsValue();
      const finalValues = { ...formValues, ...allValues, ...stepData };
      
      console.log('All form values:', allValues);
      console.log('Form values state:', formValues);
      console.log('Step data:', stepData);
      console.log('Final values:', finalValues);
      console.log('Facilities values:', {
        indoorSpace: finalValues.indoorSpace,
        outdoorSpace: finalValues.outdoorSpace,
        exerciseArea: finalValues.exerciseArea,
        whelpingArea: finalValues.whelpingArea,
        quarantineArea: finalValues.quarantineArea,
        groomingArea: finalValues.groomingArea,
        veterinaryAccess: finalValues.veterinaryAccess,
        climateControl: finalValues.climateControl,
        security: finalValues.security,
        otherFacilities: finalValues.otherFacilities,
      });
      console.log('Specialties values:', {
        specialties: finalValues.specialties,
        type: typeof finalValues.specialties,
        isArray: Array.isArray(finalValues.specialties)
      });
      
      // Build the update request
      const kennelData: UpdateKennelRequest = {
        name: finalValues.name,
        description: finalValues.description,
        businessName: finalValues.businessName,
        website: finalValues.website,
        phone: finalValues.phone,
        email: finalValues.email,
        address: {
          street: finalValues.street,
          city: finalValues.city,
          state: finalValues.state,
          zipCode: finalValues.zipCode,
          country: finalValues.country,
          coordinates: finalValues.latitude && finalValues.longitude ? {
            latitude: finalValues.latitude,
            longitude: finalValues.longitude,
          } : undefined,
        },
        facilities: {
          indoorSpace: finalValues.indoorSpace || false,
          outdoorSpace: finalValues.outdoorSpace || false,
          exerciseArea: finalValues.exerciseArea || false,
          whelpingArea: finalValues.whelpingArea || false,
          quarantineArea: finalValues.quarantineArea || false,
          groomingArea: finalValues.groomingArea || false,
          veterinaryAccess: finalValues.veterinaryAccess || false,
          climateControl: finalValues.climateControl || false,
          security: finalValues.security || false,
          other: finalValues.otherFacilities || [],
        },
        capacity: {
          maxDogs: finalValues.maxDogs || 10,
          maxLitters: finalValues.maxLitters || 5,
        },
        specialties: finalValues.specialties || [],
        socialMedia: {
          facebook: finalValues.facebook,
          instagram: finalValues.instagram,
          twitter: finalValues.twitter,
          youtube: finalValues.youtube,
        },
      };

      console.log('Sending kennel data to API:', kennelData);
      console.log('Facilities being sent to API:', kennelData.facilities);

      const response = await fetch(`/api/kennels/${kennelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(kennelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save kennel');
      }

      const result = await response.json();
      console.log(`${stepName} step saved successfully:`, result);
      setSaveStatus('saved');
      
      // Update form values with the saved data
      setFormValues(finalValues);
      
    } catch (error) {
      console.error(`Error saving ${stepName} step:`, error);
      setSaveStatus('error');
      message.error(`Failed to save ${stepName} step`);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      console.log('Form values received:', values);
      
      // Get all form values - should now include all steps
      const allValues = form.getFieldsValue();
      console.log('All form values:', allValues);
      console.log('Saved form values:', formValues);
      
      // Merge current form values with saved values to ensure we have everything
      const finalValues = { ...formValues, ...allValues };
      console.log('Final merged values:', finalValues);
      
      // Validate required fields before submission
      if (!finalValues.name) {
        throw new Error('Kennel name is required');
      }
      
      if (!finalValues.street || !finalValues.city || !finalValues.state || !finalValues.zipCode || !finalValues.country) {
        throw new Error('Complete address information is required');
      }

      const kennelData: UpdateKennelRequest = {
        name: finalValues.name,
        description: finalValues.description,
        businessName: finalValues.businessName,
        website: finalValues.website,
        phone: finalValues.phone,
        email: finalValues.email,
        address: {
          street: finalValues.street,
          city: finalValues.city,
          state: finalValues.state,
          zipCode: finalValues.zipCode,
          country: finalValues.country,
          coordinates: finalValues.latitude && finalValues.longitude ? {
            latitude: finalValues.latitude,
            longitude: finalValues.longitude,
          } : undefined,
        },
        facilities: {
          indoorSpace: finalValues.indoorSpace || false,
          outdoorSpace: finalValues.outdoorSpace || false,
          exerciseArea: finalValues.exerciseArea || false,
          whelpingArea: finalValues.whelpingArea || false,
          quarantineArea: finalValues.quarantineArea || false,
          groomingArea: finalValues.groomingArea || false,
          veterinaryAccess: finalValues.veterinaryAccess || false,
          climateControl: finalValues.climateControl || false,
          security: finalValues.security || false,
          other: finalValues.otherFacilities || [],
        },
        capacity: {
          maxDogs: finalValues.maxDogs || 10,
          maxLitters: finalValues.maxLitters || 5,
        },
        specialties: finalValues.specialties || [],
        socialMedia: {
          facebook: finalValues.facebook,
          instagram: finalValues.instagram,
          twitter: finalValues.twitter,
          youtube: finalValues.youtube,
        },
      };

      console.log('Sending kennel data to API:', kennelData);
      console.log('Facilities being sent:', kennelData.facilities);

      const response = await fetch(`/api/kennels/${kennelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(kennelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update kennel');
      }

      const result = await response.json();
      console.log('API response:', result);
      console.log('Updated kennel facilities:', result.kennel?.facilities);
      message.success('Kennel updated successfully!');
      router.push(`/kennels/${kennelId}`);
    } catch (error) {
      console.error('Error updating kennel:', error);
      message.error('Failed to update kennel');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    // Validate current step fields
    const fieldsToValidate = getFieldsForStep(currentStep);
    try {
      await form.validateFields(fieldsToValidate);
      
      // Get current form values and save them
      const currentValues = form.getFieldsValue();
      console.log('Moving to next step. Current values:', currentValues);
      console.log('Current formValues before merge:', formValues);
      const newFormValues = { ...formValues, ...currentValues };
      console.log('New formValues after merge:', newFormValues);
      setFormValues(newFormValues);
      
      // Set the form values to ensure they persist
      form.setFieldsValue(newFormValues);
      
      // Save current step to database
      const stepName = steps[currentStep]?.title || `Step ${currentStep + 1}`;
      await saveCurrentStep(currentValues, stepName);
      
      // Move to next step
      setCurrentStep(currentStep + 1);
      
    } catch (error) {
      console.error('Step validation failed:', error);
      message.error('Please fill in all required fields for this step');
    }
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 0:
        return ['name', 'email']; // Basic info - name and email are required
      case 1:
        return ['street', 'city', 'state', 'zipCode', 'country']; // Address info
      case 2:
        return []; // Facilities - all optional
      case 3:
        return ['maxDogs', 'maxLitters']; // Capacity - required
      default:
        return [];
    }
  };

  const prevStep = async () => {
    // Save current form values before going back
    const currentValues = form.getFieldsValue();
    console.log('Going back. Current values:', currentValues);
    console.log('Current formValues before merge:', formValues);
    const newFormValues = { ...formValues, ...currentValues };
    console.log('New formValues after merge:', newFormValues);
    setFormValues(newFormValues);
    form.setFieldsValue(newFormValues);
    
    // Save current step to database
    const stepName = steps[currentStep]?.title || `Step ${currentStep + 1}`;
    await saveCurrentStep(currentValues, stepName);
    
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
                  { required: true, message: 'Please enter email' },
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
                <Select 
                  placeholder="Select country"
                  onKeyDown={(e) => {
                    // Prevent Enter key from submitting the form when selecting country
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                >
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
        // Debug: Log current form values when rendering facilities step
        const currentFormValues = form.getFieldsValue();
        console.log('Rendering facilities step. Current form values:', currentFormValues);
        console.log('Current formValues state:', formValues);
        console.log('Facilities values in form:', {
          indoorSpace: currentFormValues.indoorSpace,
          outdoorSpace: currentFormValues.outdoorSpace,
          exerciseArea: currentFormValues.exerciseArea,
          whelpingArea: currentFormValues.whelpingArea,
          quarantineArea: currentFormValues.quarantineArea,
          groomingArea: currentFormValues.groomingArea,
          veterinaryAccess: currentFormValues.veterinaryAccess,
          climateControl: currentFormValues.climateControl,
          security: currentFormValues.security,
          otherFacilities: currentFormValues.otherFacilities,
        });
        
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
                <Switch 
                  onChange={(checked) => {
                    console.log('Indoor Space switch changed:', checked);
                    console.log('Current form values:', form.getFieldsValue());
                  }}
                />
              </Form.Item>
              <span>Indoor Space</span>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="outdoorSpace" valuePropName="checked">
                <Switch />
              </Form.Item>
              <span>Outdoor Space</span>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="exerciseArea" valuePropName="checked">
                <Switch />
              </Form.Item>
              <span>Exercise Area</span>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="whelpingArea" valuePropName="checked">
                <Switch />
              </Form.Item>
              <span>Whelping Area</span>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="quarantineArea" valuePropName="checked">
                <Switch />
              </Form.Item>
              <span>Quarantine Area</span>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="groomingArea" valuePropName="checked">
                <Switch />
              </Form.Item>
              <span>Grooming Area</span>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="veterinaryAccess" valuePropName="checked">
                <Switch />
              </Form.Item>
              <span>Veterinary Access</span>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="climateControl" valuePropName="checked">
                <Switch />
              </Form.Item>
              <span>Climate Control</span>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="security" valuePropName="checked">
                <Switch />
              </Form.Item>
              <span>Security System</span>
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
                  onKeyDown={(e) => {
                    // Prevent Enter key from submitting the form when adding facilities
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
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
                <BreedSelector
                  multiple
                  placeholder="Select breeds you specialize in"
                  style={{ width: '100%' }}
                  showBreedInfo={true}
                  showBreederCount={false}
                  onSelect={(value, option) => {
                    console.log('Breed selected:', value, option);
                  }}
                  onKeyDown={(e) => {
                    // Prevent Enter key from submitting the form when selecting breeds
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                />
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

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text type="danger">
          {error.message.includes('Unauthorized') 
            ? 'Please log in to edit kennels' 
            : `Error loading kennel: ${error.message}`}
        </Text>
        <br />
        <Space style={{ marginTop: '16px' }}>
          <Link href="/kennels">
            <Button type="primary">
              Back to Kennels
            </Button>
          </Link>
          {error.message.includes('Unauthorized') && (
            <Link href="/auth/signin">
              <Button type="default">
                Sign In
              </Button>
            </Link>
          )}
        </Space>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Edit Kennel
          </Title>
          <Paragraph type="secondary">
            Update your kennel profile and facilities
          </Paragraph>
          {/* Save Status Indicator */}
          <Space style={{ marginTop: '8px' }}>
            {saveStatus === 'saved' && (
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text type="success" style={{ fontSize: '12px' }}>All changes saved</Text>
              </Space>
            )}
            {saveStatus === 'saving' && (
              <Space>
                <LoadingOutlined style={{ color: '#1890ff' }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>Saving...</Text>
              </Space>
            )}
            {saveStatus === 'error' && (
              <Space>
                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                <Text type="danger" style={{ fontSize: '12px' }}>Save failed</Text>
              </Space>
            )}
            {saveStatus === 'unsaved' && (
              <Space>
                <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                <Text type="warning" style={{ fontSize: '12px' }}>Unsaved changes</Text>
              </Space>
            )}
          </Space>
        </Col>
        <Col>
          <Space>
            <Link href={`/kennels/${kennelId}`}>
              <Button icon={<ArrowLeftOutlined />}>
                Back to Kennel
              </Button>
            </Link>
          </Space>
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
          onValuesChange={(changedValues, allValues) => {
            console.log('Form values changed:', changedValues, allValues);
            console.log('Previous formValues:', formValues);
            
            // Check if facilities values changed
            const facilitiesChanged = Object.keys(changedValues).some(key => 
              ['indoorSpace', 'outdoorSpace', 'exerciseArea', 'whelpingArea', 'quarantineArea', 
               'groomingArea', 'veterinaryAccess', 'climateControl', 'security', 'otherFacilities'].includes(key)
            );
            
            if (facilitiesChanged) {
              console.log('Facilities values changed:', {
                changed: changedValues,
                all: allValues
              });
            }
            
            // Check if specialties changed
            if (changedValues.specialties !== undefined) {
              console.log('Specialties changed:', {
                changed: changedValues.specialties,
                all: allValues.specialties
              });
            }
            
            const newFormValues = { ...formValues, ...allValues };
            console.log('New formValues after change:', newFormValues);
            setFormValues(newFormValues);
            
            // Mark as unsaved when values change
            if (Object.keys(changedValues).length > 0) {
              setSaveStatus('unsaved');
              // Trigger auto-save
              triggerAutoSave();
            }
          }}
          initialValues={{
            maxDogs: 10,
            maxLitters: 5,
            country: 'US',
            // Don't initialize facilities here - let them be set by form.setFieldsValue()
            // when kennel data loads to avoid overriding the loaded values
          }}
        >
          {renderStepContent()}

          {/* Navigation Buttons */}
          <Row justify="space-between" style={{ marginTop: '32px' }}>
            <Col>
              <Space>
                {currentStep > 0 && (
                  <Button onClick={prevStep}>
                    Previous
                  </Button>
                )}
                {saveStatus === 'unsaved' && (
                  <Button 
                    onClick={async () => {
                      const currentValues = form.getFieldsValue();
                      const stepName = steps[currentStep]?.title || `Step ${currentStep + 1}`;
                      await saveCurrentStep(currentValues, stepName);
                    }}
                    loading={saving}
                    icon={<SaveOutlined />}
                  >
                    Save Current Step
                  </Button>
                )}
              </Space>
            </Col>
            <Col>
              <Space>
                {currentStep < steps.length - 1 ? (
                  <Button type="primary" onClick={nextStep} loading={saving}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    Update Kennel
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

export default EditKennelPage;
