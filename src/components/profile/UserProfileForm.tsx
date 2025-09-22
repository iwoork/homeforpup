// components/profile/UserProfileForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Switch,
  InputNumber,
  Upload,
  message as antMessage,
  Divider,
  Tag,
  Space,
  Avatar
} from 'antd';
import {
  UserOutlined,
  SaveOutlined,
  UploadOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/user';

const { TextArea } = Input;
const { Option } = Select;

interface UserProfileFormProps {
  onProfileUpdate?: (user: User) => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ onProfileUpdate }) => {
  const { user, updateUser, loading } = useAuth();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'breeder' | 'adopter' | 'both'>('adopter');

  useEffect(() => {
    if (user) {
      // Populate form with current user data
      form.setFieldsValue({
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        userType: user.userType,
        
        // Preferences
        emailNotifications: user.preferences?.notifications?.email ?? true,
        smsNotifications: user.preferences?.notifications?.sms ?? false,
        pushNotifications: user.preferences?.notifications?.push ?? true,
        showEmail: user.preferences?.privacy?.showEmail ?? false,
        showPhone: user.preferences?.privacy?.showPhone ?? true,
        showLocation: user.preferences?.privacy?.showLocation ?? true,

        // Breeder info
        kennelName: user.breederInfo?.kennelName,
        license: user.breederInfo?.license,
        specialties: user.breederInfo?.specialties,
        experience: user.breederInfo?.experience,
        website: user.breederInfo?.website,

        // Adopter info
        housingType: user.adopterInfo?.housingType,
        yardSize: user.adopterInfo?.yardSize,
        hasOtherPets: user.adopterInfo?.hasOtherPets,
        experienceLevel: user.adopterInfo?.experienceLevel,
        preferredBreeds: user.adopterInfo?.preferredBreeds
      });
      setSelectedUserType(user.userType);
    }
  }, [user, form]);

  const handleSubmit = async (values: any) => {
    if (!user) return;

    setSaving(true);
    try {
      const updatedUserData: Partial<User> = {
        name: values.name,
        displayName: values.displayName,
        phone: values.phone,
        location: values.location,
        bio: values.bio,
        userType: values.userType,
        
        preferences: {
          notifications: {
            email: values.emailNotifications,
            sms: values.smsNotifications,
            push: values.pushNotifications
          },
          privacy: {
            showEmail: values.showEmail,
            showPhone: values.showPhone,
            showLocation: values.showLocation
          }
        }
      };

      // Add breeder-specific info if applicable
      if (values.userType === 'breeder' || values.userType === 'both') {
        updatedUserData.breederInfo = {
          kennelName: values.kennelName,
          license: values.license,
          specialties: values.specialties || [],
          experience: values.experience || 0,
          website: values.website
        };
      }

      // Add adopter-specific info if applicable
      if (values.userType === 'adopter' || values.userType === 'both') {
        updatedUserData.adopterInfo = {
          housingType: values.housingType,
          yardSize: values.yardSize,
          hasOtherPets: values.hasOtherPets || false,
          experienceLevel: values.experienceLevel || 'first-time',
          preferredBreeds: values.preferredBreeds || []
        };
      }

      const updatedUser = await updateUser(updatedUserData);
      
      if (updatedUser) {
        antMessage.success('Profile updated successfully!');
        onProfileUpdate?.(updatedUser);
      } else {
        throw new Error('Failed to update profile');
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      antMessage.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUserTypeChange = (value: 'breeder' | 'adopter' | 'both') => {
    setSelectedUserType(value);
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Avatar 
            size={100} 
            src={user.profileImage}
            icon={<UserOutlined />}
          />
          <h2 style={{ marginTop: '16px', marginBottom: '8px' }}>
            {user.displayName || user.name}
          </h2>
          <Tag color={
            user.userType === 'breeder' ? 'green' : 
            user.userType === 'adopter' ? 'blue' : 'purple'
          }>
            {user.userType}
          </Tag>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          {/* Basic Information */}
          <Card size="small" title="Basic Information" style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="displayName"
                  label="Display Name"
                  tooltip="How others will see your name in messages and announcements"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="email" label="Email">
                  <Input prefix={<MailOutlined />} disabled />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="phone" label="Phone Number">
                  <Input prefix={<PhoneOutlined />} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="location" label="Location">
                  <Input prefix={<HomeOutlined />} placeholder="City, State" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="userType"
                  label="Account Type"
                  rules={[{ required: true, message: 'Please select your account type' }]}
                >
                  <Select onChange={handleUserTypeChange}>
                    <Option value="adopter">Dog Adopter</Option>
                    <Option value="breeder">Dog Breeder</Option>
                    <Option value="both">Both Breeder & Adopter</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="bio" label="Bio">
              <TextArea 
                rows={3} 
                placeholder="Tell others about yourself..."
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Card>

          {/* Breeder Information */}
          {(selectedUserType === 'breeder' || selectedUserType === 'both') && (
            <Card size="small" title="Breeder Information" style={{ marginBottom: '24px' }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="kennelName" label="Kennel Name">
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="license" label="Breeder License">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="experience" label="Years of Experience">
                    <InputNumber min={0} max={50} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="website" label="Website">
                    <Input placeholder="https://your-website.com" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="specialties" label="Breed Specialties">
                <Select
                  mode="tags"
                  placeholder="Enter dog breeds you specialize in"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Card>
          )}

          {/* Adopter Information */}
          {(selectedUserType === 'adopter' || selectedUserType === 'both') && (
            <Card size="small" title="Adopter Information" style={{ marginBottom: '24px' }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="housingType" label="Housing Type">
                    <Select>
                      <Option value="house">House</Option>
                      <Option value="apartment">Apartment</Option>
                      <Option value="condo">Condo</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="yardSize" label="Yard Size">
                    <Select>
                      <Option value="none">No Yard</Option>
                      <Option value="small">Small</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="large">Large</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="experienceLevel" label="Experience Level">
                    <Select>
                      <Option value="first-time">First-time Owner</Option>
                      <Option value="some">Some Experience</Option>
                      <Option value="experienced">Very Experienced</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="hasOtherPets" label="Have Other Pets" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="preferredBreeds" label="Preferred Breeds">
                <Select
                  mode="tags"
                  placeholder="Enter dog breeds you're interested in"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Card>
          )}

          {/* Privacy & Notifications */}
          <Card size="small" title="Privacy & Notifications" style={{ marginBottom: '24px' }}>
            <Divider orientation="left">Privacy Settings</Divider>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="showEmail" label="Show Email to Others" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="showPhone" label="Show Phone to Others" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="showLocation" label="Show Location to Others" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Notification Preferences</Divider>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="emailNotifications" label="Email Notifications" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="smsNotifications" label="SMS Notifications" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="pushNotifications" label="Push Notifications" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Submit Button */}
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={saving || loading}
                size="large"
                style={{ background: '#08979C', borderColor: '#08979C' }}
              >
                Save Profile
              </Button>
              <Button 
                onClick={() => form.resetFields()}
                disabled={saving || loading}
                size="large"
              >
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UserProfileForm;