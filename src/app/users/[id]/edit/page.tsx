'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, Row, Col, Typography, Button, Form, Input, Select, Switch, 
  Spin, Alert, Tabs, Space, Divider, Tag, Avatar,
  InputNumber, App
} from 'antd';
import { 
  UserOutlined, SaveOutlined, LoadingOutlined,
  EnvironmentOutlined, PhoneOutlined,
  SafetyOutlined, PlusOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface UserProfile {
  userId: string;
  name: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  profileImage?: string;
  verified: boolean;
  userType: 'adopter' | 'breeder' | 'both';
  preferences: {
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
  adopterInfo?: {
    housingType?: 'house' | 'apartment' | 'condo' | 'townhouse' | 'farm';
    yardSize?: 'none' | 'small' | 'medium' | 'large' | 'acreage';
    hasOtherPets: boolean;
    experienceLevel: 'first-time' | 'some-experience' | 'very-experienced';
    preferredBreeds: string[];
    agePreference?: 'puppy' | 'young' | 'adult' | 'senior' | 'any';
    sizePreference?: 'toy' | 'small' | 'medium' | 'large' | 'giant' | 'any';
    activityLevel?: 'low' | 'moderate' | 'high' | 'very-high';
    familySituation?: string;
    workSchedule?: string;
    previousPets?: string[];
    dealBreakers?: string[];
    specialRequirements?: string[];
  };
  breederInfo?: {
    kennelName?: string;
    license?: string;
    specialties: string[];
    experience: number;
    website?: string;
  };
}

// Common breed options
const COMMON_BREEDS = [
  'Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'Bulldog', 'Poodle',
  'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund', 'Siberian Husky',
  'Boxer', 'Border Collie', 'Australian Shepherd', 'Cocker Spaniel', 'Chihuahua',
  'Shih Tzu', 'Boston Terrier', 'Pomeranian', 'Australian Cattle Dog', 'Mastiff'
];

// Component that uses the App context
const EditProfilePage: React.FC = () => {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const routeUserId = (params?.id as string) || '';
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [newBreed, setNewBreed] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newPreviousPet, setNewPreviousPet] = useState('');
  const [newDealBreaker, setNewDealBreaker] = useState('');
  const [newSpecialRequirement, setNewSpecialRequirement] = useState('');

  // Get message API from Ant Design App context
  const { message } = App.useApp();

  // Handle logout - replace with your auth method
  const handleLogout = useCallback(() => {
    // Clear auth data (adjust based on your auth implementation)
    localStorage.removeItem('token');
    // Redirect to login
    router.push('/login');
  }, [router]);

  // Redirect if attempting to edit someone else's profile
  useEffect(() => {
    if (!user) return;
    if (routeUserId && user.userId && routeUserId !== user.userId) {
      router.replace(`/users/${routeUserId}`);
    }
  }, [user, routeUserId, router]);

  // Create a fetcher that uses the getToken method from useAuth
  const createAuthenticatedFetcher = useCallback(() => {
    return async (url: string): Promise<{ user: UserProfile }> => {
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        throw new Error('Authentication token expired');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch profile: ${response.status}`);
      }
      
      return response.json();
    };
  }, [getToken]);

  // Fetch current user profile data
  const { data, error, isLoading } = useSWR<{ user: UserProfile }>(
    user?.userId ? `/api/users/${user.userId}` : null,
    createAuthenticatedFetcher(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      errorRetryCount: 1,
    }
  );

  const profile = data?.user;

  useEffect(() => {
    if (profile) {
      // Populate form with current data
      form.setFieldsValue({
        displayName: profile.displayName,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        // Preferences
        notificationEmail: profile.preferences?.notifications?.email,
        notificationSms: profile.preferences?.notifications?.sms,
        notificationPush: profile.preferences?.notifications?.push,
        privacyShowEmail: profile.preferences?.privacy?.showEmail,
        privacyShowPhone: profile.preferences?.privacy?.showPhone,
        privacyShowLocation: profile.preferences?.privacy?.showLocation,
        // Adopter Info
        housingType: profile.adopterInfo?.housingType,
        yardSize: profile.adopterInfo?.yardSize,
        hasOtherPets: profile.adopterInfo?.hasOtherPets,
        experienceLevel: profile.adopterInfo?.experienceLevel,
        agePreference: profile.adopterInfo?.agePreference,
        sizePreference: profile.adopterInfo?.sizePreference,
        activityLevel: profile.adopterInfo?.activityLevel,
        familySituation: profile.adopterInfo?.familySituation,
        workSchedule: profile.adopterInfo?.workSchedule,
        // Breeder Info
        kennelName: profile.breederInfo?.kennelName,
        license: profile.breederInfo?.license,
        breederExperience: profile.breederInfo?.experience,
        website: profile.breederInfo?.website,
      });
    }
  }, [profile, form]);

  const handleSubmit = async (values: any) => {
    if (!profile) return;

    setLoading(true);
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Prepare update payload
      const updateData: any = {
        displayName: values.displayName,
        phone: values.phone,
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

      // Add adopter-specific data if user is adopter or both
      if (profile.userType === 'adopter' || profile.userType === 'both') {
        updateData.adopterInfo = {
          housingType: values.housingType,
          yardSize: values.yardSize,
          hasOtherPets: values.hasOtherPets,
          experienceLevel: values.experienceLevel,
          preferredBreeds: profile.adopterInfo?.preferredBreeds || [],
          agePreference: values.agePreference,
          sizePreference: values.sizePreference,
          activityLevel: values.activityLevel,
          familySituation: values.familySituation,
          workSchedule: values.workSchedule,
          previousPets: profile.adopterInfo?.previousPets || [],
          dealBreakers: profile.adopterInfo?.dealBreakers || [],
          specialRequirements: profile.adopterInfo?.specialRequirements || [],
        };
      }

      // Add breeder-specific data if user is breeder or both
      if (profile.userType === 'breeder' || profile.userType === 'both') {
        updateData.breederInfo = {
          kennelName: values.kennelName,
          license: values.license,
          experience: values.breederExperience,
          website: values.website,
          specialties: profile?.breederInfo?.specialties || [],
        };
      }

      const response = await fetch(`/api/users/${profile.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();

      if (result) {      
        // Invalidate SWR cache to refetch data
        mutate(`/api/users/${profile.userId}`);
        
        message.success('Profile updated successfully!');
        
        // Redirect to profile view
        router.push(`/users/${profile.userId}`);
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      message.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (field: string, value: string, setterFn: (value: string) => void) => {
    if (!value.trim() || !profile) return;

    // Create a local state update for immediate UI feedback
    let currentArray: string[] = [];
    
    if (field === 'specialties' && profile.breederInfo) {
      currentArray = profile.breederInfo.specialties;
    } else if (profile.adopterInfo) {
      // Handle specific adopter info fields
      switch (field) {
        case 'preferredBreeds':
          currentArray = profile.adopterInfo.preferredBreeds || [];
          break;
        case 'previousPets':
          currentArray = profile.adopterInfo.previousPets || [];
          break;
        case 'dealBreakers':
          currentArray = profile.adopterInfo.dealBreakers || [];
          break;
        case 'specialRequirements':
          currentArray = profile.adopterInfo.specialRequirements || [];
          break;
        default:
          currentArray = [];
      }
    }

    if (currentArray.includes(value.trim())) {
      message.warning('This item already exists');
      return;
    }

    // Update local state immediately for better UX
    const newArray = [...currentArray, value.trim()];
    
    // Update the SWR cache optimistically
    mutate(`/api/users/${user?.userId}`, (currentData: any) => {
      if (!currentData) return currentData;
      
      const updatedData = { ...currentData };
      if (field === 'specialties' && updatedData.user.breederInfo) {
        updatedData.user = {
          ...updatedData.user,
          breederInfo: {
            ...updatedData.user.breederInfo,
            specialties: newArray
          }
        };
      } else if (updatedData.user.adopterInfo) {
        updatedData.user = {
          ...updatedData.user,
          adopterInfo: {
            ...updatedData.user.adopterInfo,
            [field]: newArray
          }
        };
      }
      return updatedData;
    }, false); // Don't revalidate immediately

    setterFn('');
    message.success('Item added! Remember to save your changes.');
  };

  const handleRemoveItem = (field: string, index: number) => {
    if (!profile) return;

    // Get current array
    let currentArray: string[] = [];
    
    if (field === 'specialties' && profile.breederInfo) {
      currentArray = profile.breederInfo.specialties;
    } else if (profile.adopterInfo) {
      // Handle specific adopter info fields
      switch (field) {
        case 'preferredBreeds':
          currentArray = profile.adopterInfo.preferredBreeds || [];
          break;
        case 'previousPets':
          currentArray = profile.adopterInfo.previousPets || [];
          break;
        case 'dealBreakers':
          currentArray = profile.adopterInfo.dealBreakers || [];
          break;
        case 'specialRequirements':
          currentArray = profile.adopterInfo.specialRequirements || [];
          break;
        default:
          currentArray = [];
      }
    }

    const newArray = [...currentArray];
    newArray.splice(index, 1);

    // Update the SWR cache optimistically
    mutate(`/api/users/${user?.userId}`, (currentData: any) => {
      if (!currentData) return currentData;
      
      const updatedData = { ...currentData };
      if (field === 'specialties' && updatedData.user.breederInfo) {
        updatedData.user = {
          ...updatedData.user,
          breederInfo: {
            ...updatedData.user.breederInfo,
            specialties: newArray
          }
        };
      } else if (updatedData.user.adopterInfo) {
        updatedData.user = {
          ...updatedData.user,
          adopterInfo: {
            ...updatedData.user.adopterInfo,
            [field]: newArray
          }
        };
      }
      return updatedData;
    }, false); // Don't revalidate immediately

    message.success('Item removed! Remember to save your changes.');
  };

  if (isLoading) {
    return (
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '16px',
        textAlign: 'center',
        paddingTop: '100px'
      }}>
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
        />
      </div>
    );
  }

  if (error) {
    console.error('Profile loading error:', error);
    
    // Handle different error types
    if (error.message.includes('Authentication token expired')) {
      return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
          <Alert
            message="Session Expired"
            description="Your session has expired. Please log in again to continue editing your profile."
            type="warning"
            showIcon
            style={{ marginTop: '50px' }}
            action={
              <Button type="primary" onClick={handleLogout}>
                Login Again
              </Button>
            }
          />
        </div>
      );
    }
    
    if (error.message.includes('No authentication token found')) {
      return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
          <Alert
            message="Authentication Required"
            description="Please log in to edit your profile."
            type="info"
            showIcon
            style={{ marginTop: '50px' }}
            action={
              <Button type="primary" onClick={() => router.push('/login')}>
                Go to Login
              </Button>
            }
          />
        </div>
      );
    }

    // Generic error fallback
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
        <Alert
          message="Unable to Load Profile"
          description={`There was an issue loading your profile: ${error.message}. Please try refreshing the page or logging in again.`}
          type="error"
          showIcon
          style={{ marginTop: '50px' }}
          action={
            <Space>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              <Button type="primary" onClick={handleLogout}>
                Login Again
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
        <Alert
          message="Profile Not Found"
          description="Your profile data could not be found. This might be because your account is new or there was an issue syncing your data."
          type="warning"
          showIcon
          style={{ marginTop: '50px' }}
          action={
            <Space>
              <Button onClick={() => router.push('/onboarding')}>
                Complete Profile Setup
              </Button>
              <Button type="primary" onClick={handleLogout}>
                Login Again
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  const cardStyle = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px', ...cardStyle }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="large">
              <Avatar 
                size={80} 
                src={profile.profileImage}
                icon={<UserOutlined />}
              />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  Edit Your Profile
                </Title>
                <Text type="secondary">
                  Keep your information up to date to connect with the right matches
                </Text>
                <br />
                <Space style={{ marginTop: '8px' }}>
                  <Tag color="blue">{profile.userType}</Tag>
                  {profile.verified && (
                    <Tag color="green" icon={<SafetyOutlined />}>Verified</Tag>
                  )}
                </Space>
              </div>
            </Space>
          </Col>
          <Col>
            <Button onClick={() => router.back()}>
              Cancel
            </Button>
          </Col>
        </Row>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          notificationEmail: true,
          notificationPush: true,
          notificationSms: false,
          privacyShowPhone: true,
          privacyShowLocation: true,
          privacyShowEmail: false,
        }}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          {/* Basic Information */}
          <TabPane tab="Basic Info" key="basic">
            <Card title="Personal Information" style={cardStyle}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Display Name"
                    name="displayName"
                    rules={[
                      { required: true, message: 'Please enter your display name' },
                      { min: 2, message: 'Display name must be at least 2 characters' },
                      { max: 50, message: 'Display name must be less than 50 characters' }
                    ]}
                  >
                    <Input placeholder="How you'd like to be known" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                  >
                    <Input 
                      value={profile.email} 
                      disabled 
                      addonAfter={
                        profile.verified ? 
                          <SafetyOutlined style={{ color: '#52c41a' }} /> : 
                          <Text type="secondary">Not verified</Text>
                      }
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Phone Number"
                    name="phone"
                    rules={[
                      { pattern: /^[+]?[\d\s\-\(\)]+$/, message: 'Please enter a valid phone number' }
                    ]}
                  >
                    <Input 
                      placeholder="Your phone number"
                      prefix={<PhoneOutlined />}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Location"
                    name="location"
                    rules={[
                      { max: 100, message: 'Location must be less than 100 characters' }
                    ]}
                  >
                    <Input 
                      placeholder="City, State or general area"
                      prefix={<EnvironmentOutlined />}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label="About Me"
                    name="bio"
                    rules={[
                      { max: 500, message: 'Bio must be less than 500 characters' }
                    ]}
                  >
                    <TextArea 
                      rows={4} 
                      placeholder="Tell us a bit about yourself, your experience with dogs, what you're looking for..."
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </TabPane>

          {/* Privacy & Notifications */}
          <TabPane tab="Privacy & Notifications" key="privacy">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Privacy Settings" style={cardStyle}>
                  <Paragraph type="secondary">
                    Control what information is visible to other users on your profile
                  </Paragraph>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        name="privacyShowEmail"
                        valuePropName="checked"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Switch />
                          <Text>Show email address</Text>
                        </div>
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={8}>
                      <Form.Item
                        name="privacyShowPhone"
                        valuePropName="checked"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Switch />
                          <Text>Show phone number</Text>
                        </div>
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={8}>
                      <Form.Item
                        name="privacyShowLocation"
                        valuePropName="checked"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Switch />
                          <Text>Show location</Text>
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Notification Preferences" style={cardStyle}>
                  <Paragraph type="secondary">
                    Choose how you&apos;d like to be notified about messages and updates
                  </Paragraph>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        name="notificationEmail"
                        valuePropName="checked"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Switch />
                          <Text>Email notifications</Text>
                        </div>
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={8}>
                      <Form.Item
                        name="notificationSms"
                        valuePropName="checked"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Switch />
                          <Text>SMS notifications</Text>
                        </div>
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={8}>
                      <Form.Item
                        name="notificationPush"
                        valuePropName="checked"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Switch />
                          <Text>Push notifications</Text>
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Adopter Information */}
          {(profile.userType === 'adopter' || profile.userType === 'both') && (
            <TabPane tab="Adoption Preferences" key="adopter">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card title="Living Situation" style={cardStyle}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Housing Type"
                          name="housingType"
                        >
                          <Select placeholder="Select housing type">
                            <Option value="house">House</Option>
                            <Option value="apartment">Apartment</Option>
                            <Option value="condo">Condo</Option>
                            <Option value="townhouse">Townhouse</Option>
                            <Option value="farm">Farm</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Yard Size"
                          name="yardSize"
                        >
                          <Select placeholder="Select yard size">
                            <Option value="none">No yard</Option>
                            <Option value="small">Small yard</Option>
                            <Option value="medium">Medium yard</Option>
                            <Option value="large">Large yard</Option>
                            <Option value="acreage">Acreage</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Experience Level"
                          name="experienceLevel"
                        >
                          <Select placeholder="Select experience level">
                            <Option value="first-time">First-time owner</Option>
                            <Option value="some-experience">Some experience</Option>
                            <Option value="very-experienced">Very experienced</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="hasOtherPets"
                          valuePropName="checked"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Switch />
                            <Text>I have other pets</Text>
                          </div>
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Family Situation"
                          name="familySituation"
                        >
                          <Input placeholder="e.g., Family with young children, Single adult, etc." />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          label="Work Schedule"
                          name="workSchedule"
                        >
                          <Input placeholder="e.g., Work from home, 9-5 office job, etc." />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Col>

                <Col span={24}>
                  <Card title="Dog Preferences" style={cardStyle}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          label="Age Preference"
                          name="agePreference"
                        >
                          <Select placeholder="Any age">
                            <Option value="puppy">Puppy (0-1 year)</Option>
                            <Option value="young">Young (1-3 years)</Option>
                            <Option value="adult">Adult (3-7 years)</Option>
                            <Option value="senior">Senior (7+ years)</Option>
                            <Option value="any">Any age</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={8}>
                        <Form.Item
                          label="Size Preference"
                          name="sizePreference"
                        >
                          <Select placeholder="Any size">
                            <Option value="toy">Toy (under 10 lbs)</Option>
                            <Option value="small">Small (10-25 lbs)</Option>
                            <Option value="medium">Medium (25-60 lbs)</Option>
                            <Option value="large">Large (60-100 lbs)</Option>
                            <Option value="giant">Giant (100+ lbs)</Option>
                            <Option value="any">Any size</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={8}>
                        <Form.Item
                          label="Activity Level"
                          name="activityLevel"
                        >
                          <Select placeholder="Select activity level">
                            <Option value="low">Low - Calm, enjoys lounging</Option>
                            <Option value="moderate">Moderate - Daily walks</Option>
                            <Option value="high">High - Active lifestyle</Option>
                            <Option value="very-high">Very High - Athletic companion</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Col>

                {/* Preferred Breeds */}
                <Col span={24}>
                  <Card title="Preferred Breeds" style={cardStyle}>
                    <div style={{ marginBottom: '16px' }}>
                      <Space.Compact style={{ width: '100%' }}>
                        <Select
                          style={{ flex: 1 }}
                          placeholder="Select a breed"
                          value={newBreed}
                          onChange={setNewBreed}
                          showSearch
                          filterOption={(input, option) =>
                            String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                        >
                          {COMMON_BREEDS.map(breed => (
                            <Option key={breed} value={breed}>{breed}</Option>
                          ))}
                        </Select>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => handleAddItem('preferredBreeds', newBreed, setNewBreed)}
                          disabled={!newBreed}
                        >
                          Add
                        </Button>
                      </Space.Compact>
                    </div>
                    <div>
                      {profile.adopterInfo?.preferredBreeds?.map((breed, index) => (
                        <Tag
                          key={index}
                          closable
                          onClose={() => handleRemoveItem('preferredBreeds', index)}
                          style={{ marginBottom: '8px' }}
                        >
                          {breed}
                        </Tag>
                      ))}
                      {(!profile.adopterInfo?.preferredBreeds || profile.adopterInfo.preferredBreeds.length === 0) && (
                        <Text type="secondary">No preferred breeds selected</Text>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </TabPane>
          )}

          {/* Breeder Information */}
          {(profile.userType === 'breeder' || profile.userType === 'both') && (
            <TabPane tab="Breeder Information" key="breeder">
              <Card title="Professional Information" style={cardStyle}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Kennel Name"
                      name="kennelName"
                      rules={[
                        { max: 100, message: 'Kennel name must be less than 100 characters' }
                      ]}
                    >
                      <Input placeholder="Your kennel or business name" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="License Number"
                      name="license"
                    >
                      <Input placeholder="Professional license or registration" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Years of Experience"
                      name="breederExperience"
                      rules={[
                        { type: 'number', min: 0, max: 50, message: 'Please enter a valid number of years' }
                      ]}
                    >
                      <InputNumber 
                        min={0} 
                        max={50} 
                        style={{ width: '100%' }}
                        placeholder="Years breeding dogs"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Website"
                      name="website"
                      rules={[
                        { type: 'url', message: 'Please enter a valid website URL' }
                      ]}
                    >
                      <Input placeholder="https://yourwebsite.com" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <div>
                  <Title level={5}>Specialties</Title>
                  <div style={{ marginBottom: '16px' }}>
                    <Space.Compact style={{ width: '100%' }}>
                      <Input
                        placeholder="Add a specialty (e.g., Show dogs, Therapy dogs, etc.)"
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        onPressEnter={() => handleAddItem('specialties', newSpecialty, setNewSpecialty)}
                      />
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => handleAddItem('specialties', newSpecialty, setNewSpecialty)}
                        disabled={!newSpecialty}
                      >
                        Add
                      </Button>
                    </Space.Compact>
                  </div>
                  <div>
                    {profile.breederInfo?.specialties?.map((specialty, index) => (
                      <Tag
                        key={index}
                        closable
                        onClose={() => handleRemoveItem('specialties', index)}
                        style={{ marginBottom: '8px' }}
                      >
                        {specialty}
                      </Tag>
                    ))}
                    {(!profile.breederInfo?.specialties || profile.breederInfo.specialties.length === 0) && (
                      <Text type="secondary">No specialties added</Text>
                    )}
                  </div>
                </div>
              </Card>
            </TabPane>
          )}

          {/* Additional Information for Adopters */}
          {(profile.userType === 'adopter' || profile.userType === 'both') && (
            <TabPane tab="Additional Info" key="additional">
              <Row gutter={[16, 16]}>
                {/* Previous Pets */}
                <Col span={24}>
                  <Card title="Previous Pet Experience" style={cardStyle}>
                    <Paragraph type="secondary">
                      Share your experience with previous pets to help breeders understand your background
                    </Paragraph>
                    <div style={{ marginBottom: '16px' }}>
                      <Space.Compact style={{ width: '100%' }}>
                        <Input
                          placeholder="e.g., Golden Retriever for 8 years, rescued mixed breed, etc."
                          value={newPreviousPet}
                          onChange={(e) => setNewPreviousPet(e.target.value)}
                          onPressEnter={() => handleAddItem('previousPets', newPreviousPet, setNewPreviousPet)}
                        />
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => handleAddItem('previousPets', newPreviousPet, setNewPreviousPet)}
                          disabled={!newPreviousPet}
                        >
                          Add
                        </Button>
                      </Space.Compact>
                    </div>
                    <div>
                      {profile.adopterInfo?.previousPets?.map((pet, index) => (
                        <Tag
                          key={index}
                          closable
                          onClose={() => handleRemoveItem('previousPets', index)}
                          style={{ marginBottom: '8px' }}
                          color="blue"
                        >
                          {pet}
                        </Tag>
                      ))}
                      {(!profile.adopterInfo?.previousPets || profile.adopterInfo.previousPets.length === 0) && (
                        <Text type="secondary">No previous pets listed</Text>
                      )}
                    </div>
                  </Card>
                </Col>

                {/* Special Requirements */}
                <Col span={24}>
                  <Card title="Special Requirements" style={cardStyle}>
                    <Paragraph type="secondary">
                      Any special needs or requirements for your future pet (e.g., hypoallergenic, quiet nature, etc.)
                    </Paragraph>
                    <div style={{ marginBottom: '16px' }}>
                      <Space.Compact style={{ width: '100%' }}>
                        <Input
                          placeholder="e.g., Hypoallergenic coat, good with children, etc."
                          value={newSpecialRequirement}
                          onChange={(e) => setNewSpecialRequirement(e.target.value)}
                          onPressEnter={() => handleAddItem('specialRequirements', newSpecialRequirement, setNewSpecialRequirement)}
                        />
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => handleAddItem('specialRequirements', newSpecialRequirement, setNewSpecialRequirement)}
                          disabled={!newSpecialRequirement}
                        >
                          Add
                        </Button>
                      </Space.Compact>
                    </div>
                    <div>
                      {profile.adopterInfo?.specialRequirements?.map((requirement, index) => (
                        <Tag
                          key={index}
                          closable
                          onClose={() => handleRemoveItem('specialRequirements', index)}
                          style={{ marginBottom: '8px' }}
                          color="green"
                          icon={<SafetyOutlined />}
                        >
                          {requirement}
                        </Tag>
                      ))}
                      {(!profile.adopterInfo?.specialRequirements || profile.adopterInfo.specialRequirements.length === 0) && (
                        <Text type="secondary">No special requirements listed</Text>
                      )}
                    </div>
                  </Card>
                </Col>

                {/* Deal Breakers */}
                <Col span={24}>
                  <Card title="Important Considerations" style={cardStyle}>
                    <Paragraph type="secondary">
                      Things that are important for breeders to know about your situation or preferences
                    </Paragraph>
                    <div style={{ marginBottom: '16px' }}>
                      <Space.Compact style={{ width: '100%' }}>
                        <Input
                          placeholder="e.g., No aggressive breeds, must be good with cats, etc."
                          value={newDealBreaker}
                          onChange={(e) => setNewDealBreaker(e.target.value)}
                          onPressEnter={() => handleAddItem('dealBreakers', newDealBreaker, setNewDealBreaker)}
                        />
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => handleAddItem('dealBreakers', newDealBreaker, setNewDealBreaker)}
                          disabled={!newDealBreaker}
                        >
                          Add
                        </Button>
                      </Space.Compact>
                    </div>
                    <div>
                      {profile.adopterInfo?.dealBreakers?.map((dealBreaker, index) => (
                        <Tag
                          key={index}
                          closable
                          onClose={() => handleRemoveItem('dealBreakers', index)}
                          style={{ marginBottom: '8px' }}
                          color="orange"
                        >
                          {dealBreaker}
                        </Tag>
                      ))}
                      {(!profile.adopterInfo?.dealBreakers || profile.adopterInfo.dealBreakers.length === 0) && (
                        <Text type="secondary">No important considerations listed</Text>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </TabPane>
          )}
        </Tabs>

        {/* Save Actions */}
        <Card style={{ marginTop: '24px', ...cardStyle }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button size="large" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button 
                  size="large" 
                  onClick={() => {
                    form.resetFields();
                    message.info('Form reset to original values');
                  }}
                >
                  Reset
                </Button>
              </Space>
            </Col>
            <Col>
              <Button 
                type="primary" 
                size="large" 
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                style={{ minWidth: '120px' }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Col>
          </Row>
          
          <Divider />
          
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Your profile information helps connect you with the right matches. 
              All information respects your privacy settings.
            </Text>
          </div>
        </Card>
      </Form>

      {/* Profile Preview Card */}
      <Card 
        title="Profile Preview" 
        style={{ marginTop: '24px', ...cardStyle }}
        extra={
          <Button 
            type="link" 
            onClick={() => router.push(`/profile/${profile.userId}`)}
            icon={<EyeOutlined />}
          >
            View Full Profile
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <Avatar 
                size={64} 
                src={profile.profileImage}
                icon={<UserOutlined />}
                style={{ marginBottom: '8px' }}
              />
              <div>
                <Text strong>{form.getFieldValue('displayName') || profile.displayName}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {form.getFieldValue('location') || profile.location || 'Location not set'}
                </Text>
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={16}>
            <div>
              <Text strong>About: </Text>
              <Text>{form.getFieldValue('bio') || profile.bio || 'No bio provided'}</Text>
            </div>
            <div style={{ marginTop: '8px' }}>
              <Space wrap>
                <Tag color="blue">{profile.userType}</Tag>
                {profile.verified && <Tag color="green">Verified</Tag>}
                {(profile.userType === 'adopter' || profile.userType === 'both') && (
                  <Tag color="purple">
                    {form.getFieldValue('experienceLevel')?.replace('-', ' ') || 
                     profile.adopterInfo?.experienceLevel?.replace('-', ' ') || 'Experience level not set'}
                  </Tag>
                )}
              </Space>
            </div>
            {form.getFieldValue('phone') && form.getFieldValue('privacyShowPhone') && (
              <div style={{ marginTop: '8px' }}>
                <PhoneOutlined style={{ marginRight: '4px' }} />
                <Text style={{ fontSize: '12px' }}>{form.getFieldValue('phone')}</Text>
              </div>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EditProfilePage;