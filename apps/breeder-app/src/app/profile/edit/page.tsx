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
  Upload,
  Avatar,
  Divider,
  Spin,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  SaveOutlined, 
  ArrowLeftOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  MailOutlined,
  GlobalOutlined,
  CameraOutlined,
  EditOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CountrySelector from '@/components/CountrySelector';
import { useUser } from '@clerk/nextjs';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface UserProfile {
  userId: string;
  name: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  profileImage?: string;
  coverPhoto?: string;
  userType: 'breeder' | 'dog-parent' | 'both';
  verified: boolean;
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      showEmail: boolean;
      showPhone: boolean;
      showLocation: boolean;
    };
  };
  breederInfo?: {
    kennelName?: string;
    license?: string;
    specialties?: string[];
    experience?: number;
    website?: string;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

const EditProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<{code: string, name: string, dialCode: string, flag: string} | null>(null);
  const router = useRouter();
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        router.push('/sign-in');
        return;
      }

      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(data.user);
          
          // Merge database data with Clerk user data
          // Prefer database data if it exists, otherwise fall back to Clerk data
          const mergedData = {
            name: data.user.name || clerkUser?.fullName || '',
            displayName: data.user.displayName || '',
            firstName: data.user.firstName || clerkUser?.firstName || '',
            lastName: data.user.lastName || clerkUser?.lastName || '',
            phone: data.user.phone || clerkUser?.primaryPhoneNumber?.phoneNumber || '',
            location: data.user.location || '',
            bio: data.user.bio || '',
            kennelName: data.user.breederInfo?.kennelName || '',
            license: data.user.breederInfo?.license || '',
            experience: data.user.breederInfo?.experience || 0,
            website: data.user.breederInfo?.website || data.user.socialLinks?.website || '',
            facebook: data.user.socialLinks?.facebook || '',
            instagram: data.user.socialLinks?.instagram || '',
            twitter: data.user.socialLinks?.twitter || '',
            notificationEmail: data.user.preferences?.notifications?.email ?? true,
            notificationSms: data.user.preferences?.notifications?.sms ?? false,
            notificationPush: data.user.preferences?.notifications?.push ?? true,
            privacyShowEmail: data.user.preferences?.privacy?.showEmail ?? false,
            privacyShowPhone: data.user.preferences?.privacy?.showPhone ?? true,
            privacyShowLocation: data.user.preferences?.privacy?.showLocation ?? true,
          };
          
          // Set form values with merged data
          form.setFieldsValue(mergedData);
        } else {
          message.error('Failed to load profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        message.error('Failed to load profile data');
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchProfile();
  }, [isLoaded, isSignedIn, router, form, clerkUser]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      console.log('=== PROFILE UPDATE START ===');
      console.log('Form values:', values);

      // Prepare update data
      const updateData: any = {
        name: values.name,
        displayName: values.displayName,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        country: selectedCountry,
        location: values.location,
        bio: values.bio,
        preferences: {
          notifications: {
            email: values.notificationEmail,
            sms: values.notificationSms,
            push: values.notificationPush,
          },
          privacy: {
            showEmail: values.privacyShowEmail,
            showPhone: values.privacyShowPhone,
            showLocation: values.privacyShowLocation,
          }
        }
      };

      // Add breeder-specific info
      if (values.kennelName || values.license || values.experience || values.website) {
        updateData.breederInfo = {
          kennelName: values.kennelName,
          license: values.license,
          experience: values.experience || 0,
          website: values.website,
        };
      }

      // Add social links
      const socialLinks: any = {};
      if (values.facebook) socialLinks.facebook = values.facebook;
      if (values.instagram) socialLinks.instagram = values.instagram;
      if (values.twitter) socialLinks.twitter = values.twitter;
      if (values.website && !updateData.breederInfo?.website) socialLinks.website = values.website;
      
      if (Object.keys(socialLinks).length > 0) {
        updateData.socialLinks = socialLinks;
      }

      console.log('Update data:', updateData);

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Profile updated successfully');
        console.log('Response:', result);
        
        message.success('Profile updated successfully!');
        
        // Update local profile state
        if (result.user) {
          setProfile(result.user);
          
          // Also update the form values to reflect the changes
          form.setFieldsValue({
            name: result.user.name || '',
            displayName: result.user.displayName || '',
            firstName: result.user.firstName || '',
            lastName: result.user.lastName || '',
            phone: result.user.phone || '',
            location: result.user.location || '',
            bio: result.user.bio || '',
            kennelName: result.user.breederInfo?.kennelName || '',
            license: result.user.breederInfo?.license || '',
            experience: result.user.breederInfo?.experience || 0,
            website: result.user.breederInfo?.website || result.user.socialLinks?.website || '',
            facebook: result.user.socialLinks?.facebook || '',
            instagram: result.user.socialLinks?.instagram || '',
            twitter: result.user.socialLinks?.twitter || '',
            notificationEmail: result.user.preferences?.notifications?.email ?? true,
            notificationSms: result.user.preferences?.notifications?.sms ?? false,
            notificationPush: result.user.preferences?.notifications?.push ?? true,
            privacyShowEmail: result.user.preferences?.privacy?.showEmail ?? false,
            privacyShowPhone: result.user.preferences?.privacy?.showPhone ?? true,
            privacyShowLocation: result.user.preferences?.privacy?.showLocation ?? true,
          });
        }
        
        // Navigate back to dashboard
        router.push('/dashboard');
      } else {
        console.error('❌ Profile update failed:', result);
        throw new Error(result.error || 'Failed to update profile');
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      message.error(
        error instanceof Error ? error.message : 'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    
    setUploading(true);
    try {
      // Get presigned upload URL
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: (file as File).name,
          contentType: (file as File).type,
          uploadPath: 'profile-photos',
        }),
      });

      const uploadData = await uploadResponse.json();

      if (!uploadData.success || !uploadData.data) {
        throw new Error(uploadData.error || 'Failed to get upload URL');
      }

      const { uploadUrl, photoUrl } = uploadData.data;

      // Upload file to S3
      const uploadResult = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': (file as File).type,
        },
      });

      if (!uploadResult.ok) {
        throw new Error(`Failed to upload photo: ${uploadResult.statusText}`);
      }

      // Update user profile with new photo URL
      const profileUpdateResponse = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileImage: photoUrl,
        }),
      });

      if (!profileUpdateResponse.ok) {
        throw new Error('Failed to save profile photo');
      }

      const profileResult = await profileUpdateResponse.json();
      
      // Update local state
      if (profileResult.user) {
        setProfile(profileResult.user);
        
        // Update form values to reflect the new profile image
        form.setFieldsValue({
          ...form.getFieldsValue(),
          // Profile image is not part of form fields, but we can update other fields if needed
        });
      }

      message.success('Profile photo updated successfully!');
      onSuccess?.(profileResult);
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      message.error('Failed to upload photo. Please try again.');
      onError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  if (!isLoaded || fetchingProfile) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <Text>Loading profile...</Text>
      </div>
    );
  }

  if (!isSignedIn || !clerkUser) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <Alert
          message="Authentication Required"
          description="Please sign in to edit your profile."
          type="warning"
          showIcon
          action={
            <Button type="primary" href="/sign-in">
              Sign In
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Space>
          <Link href="/dashboard">
            <Button icon={<ArrowLeftOutlined />} type="text">
              Back to Dashboard
            </Button>
          </Link>
        </Space>
        <Title level={1} style={{ marginTop: '16px' }}>
          Edit Profile
        </Title>
        <Paragraph style={{ fontSize: '1.1rem', color: '#666' }}>
          Update your personal information and preferences
        </Paragraph>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
      >
        <Row gutter={[32, 32]}>
          {/* Left Column - Personal Information */}
          <Col xs={24} lg={16}>
            {/* Profile Photo */}
            <Card title="Profile Photo" style={{ marginBottom: '24px' }}>
              <Row gutter={[24, 24]} align="middle">
                <Col>
                  <Avatar
                    size={120}
                    src={profile?.profileImage}
                    icon={<UserOutlined />}
                    style={{ fontSize: '48px' }}
                  />
                </Col>
                <Col flex="auto">
                  <Upload
                    customRequest={handlePhotoUpload}
                    showUploadList={false}
                    accept="image/*"
                    disabled={uploading}
                  >
                    <Button 
                      icon={<CameraOutlined />} 
                      loading={uploading}
                      type="dashed"
                    >
                      {uploading ? 'Uploading...' : 'Change Photo'}
                    </Button>
                  </Upload>
                  <div style={{ marginTop: '8px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      JPG, PNG up to 5MB
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Personal Information */}
            <Card title="Personal Information" style={{ marginBottom: '24px' }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter your full name' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />}
                      placeholder="Enter your full name"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="displayName"
                    label="Display Name"
                  >
                    <Input 
                      prefix={<EditOutlined />}
                      placeholder="Public display name"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="firstName"
                    label="First Name"
                  >
                    <Input placeholder="Enter your first name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                  >
                    <Input placeholder="Enter your last name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Phone Number"
                  >
                    <Row gutter={8}>
                      <Col flex="90px">
                        <CountrySelector
                          value={selectedCountry?.dialCode}
                          onChange={(country) => setSelectedCountry(country)}
                          placeholder="Country"
                          style={{ width: '100%' }}
                        />
                      </Col>
                      <Col flex="auto">
                        <Form.Item
                          name="phone"
                          noStyle
                        >
                          <Input 
                            prefix={<PhoneOutlined />}
                            placeholder="Phone number"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="location"
                    label="Location"
                  >
                    <Input 
                      prefix={<EnvironmentOutlined />}
                      placeholder="City, State, Country"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="bio"
                    label="Bio"
                  >
                    <TextArea 
                      rows={4}
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Breeder Information */}
            <Card title="Breeder Information" style={{ marginBottom: '24px' }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="kennelName"
                    label="Kennel Name"
                  >
                    <Input placeholder="Your kennel name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="license"
                    label="License Number"
                  >
                    <Input placeholder="Breeding license number" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="experience"
                    label="Years of Experience"
                  >
                    <InputNumber 
                      min={0} 
                      max={50} 
                      style={{ width: '100%' }}
                      placeholder="Years"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="website"
                    label="Website"
                  >
                    <Input 
                      prefix={<GlobalOutlined />}
                      placeholder="https://yourwebsite.com"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Social Media */}
            <Card title="Social Media" style={{ marginBottom: '24px' }}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="facebook"
                    label="Facebook"
                  >
                    <Input placeholder="https://facebook.com/yourpage" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="instagram"
                    label="Instagram"
                  >
                    <Input placeholder="@yourusername" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="twitter"
                    label="Twitter"
                  >
                    <Input placeholder="@yourusername" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Right Column - Preferences */}
          <Col xs={24} lg={8}>
            {/* Notification Preferences */}
            <Card title="Notification Preferences" style={{ marginBottom: '24px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name="notificationEmail"
                  valuePropName="checked"
                  style={{ marginBottom: '16px' }}
                >
                  <Switch /> Email Notifications
                </Form.Item>
                <Form.Item
                  name="notificationSms"
                  valuePropName="checked"
                  style={{ marginBottom: '16px' }}
                >
                  <Switch /> SMS Notifications
                </Form.Item>
                <Form.Item
                  name="notificationPush"
                  valuePropName="checked"
                  style={{ marginBottom: '16px' }}
                >
                  <Switch /> Push Notifications
                </Form.Item>
              </Space>
            </Card>

            {/* Privacy Settings */}
            <Card title="Privacy Settings" style={{ marginBottom: '24px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name="privacyShowEmail"
                  valuePropName="checked"
                  style={{ marginBottom: '16px' }}
                >
                  <Switch /> Show Email Address
                </Form.Item>
                <Form.Item
                  name="privacyShowPhone"
                  valuePropName="checked"
                  style={{ marginBottom: '16px' }}
                >
                  <Switch /> Show Phone Number
                </Form.Item>
                <Form.Item
                  name="privacyShowLocation"
                  valuePropName="checked"
                  style={{ marginBottom: '16px' }}
                >
                  <Switch /> Show Location
                </Form.Item>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <Card>
          <Row justify="end">
            <Space>
              <Button 
                size="large"
                onClick={() => router.push('/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                icon={<SaveOutlined />}
                loading={loading}
              >
                Save Changes
              </Button>
            </Space>
          </Row>
        </Card>
      </Form>
    </div>
  );
};

export default EditProfilePage;
