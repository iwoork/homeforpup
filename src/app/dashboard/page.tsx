'use client';

import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  List, 
  Spin, 
  Avatar,
  Tag,
  Space,
  message,
  Statistic,
  Empty,
  Badge,
  Progress,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined, 
  HeartOutlined, 
  EditOutlined, 
  UserOutlined,
  MessageOutlined,
  TeamOutlined,
  SettingOutlined,
  ArrowRightOutlined,
  TrophyOutlined,
  StarOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  // PawPrintOutlined, // This icon doesn't exist in antd, we'll use a different one
  CrownOutlined,
  GiftOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useDogs, useMatchedPuppies, useMessages, useKennels, useFavorites, useProfileViews } from '@/hooks';
import { AddDogForm } from '@/components';
import DogManagement from '@/components/dogs/DogManagement';
import ProfileSwitchingOverlay from '@/components/ProfileSwitchingOverlay';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

const { Title, Text } = Typography;

// Clean, consistent color scheme
const COLORS = {
  primary: '#08979C', // Brand teal - main brand color
  secondary: '#13C2C2', // Lighter teal for accents
  accent: '#FF7875', // Soft red for favorites/important actions
  neutral: '#F5F5F5', // Light gray for backgrounds
  card: '#FFFFFF', // Clean white for cards
  text: '#262626', // Dark gray for main text
  textSecondary: '#8C8C8C', // Medium gray for secondary text
  border: '#F0F0F0', // Light border color
  success: '#52C41A', // Green for success states
  warning: '#FAAD14' // Orange for warnings
};

const Dashboard: React.FC = () => {
  const { user, effectiveUserType, canSwitchProfiles, activeProfileType, isSwitchingProfile, clearAllAuthData, getToken, refreshUserData } = useAuth();

  const { dogs, isLoading: dogsLoading, error: dogsError } = useDogs();
  const { matchedPuppies, isLoading: puppiesLoading, error: puppiesError } = useMatchedPuppies();
  const { kennels, isLoading: kennelsLoading } = useKennels();
  const { threads, unreadCount, loading: messagesLoading } = useMessages({
    userId: user?.userId || '',
    userName: user?.name || '',
    pollingInterval: 30000
  });


  // Debug messages data
  console.log('Dashboard messages state:', {
    userId: user?.userId,
    userName: user?.name,
    threadsCount: threads?.length || 0,
    unreadCount,
    messagesLoading,
    threads: threads?.slice(0, 2) // Show first 2 threads for debugging
  });
  const { favorites, count: favoritesCount, isLoading: favoritesLoading, removeFromFavorites } = useFavorites();
  const { getProfileViews } = useProfileViews();
  const [addDogModalVisible, setAddDogModalVisible] = useState(false);
  const [profileViews, setProfileViews] = useState<number>(0);

  // Force refresh auth state when dashboard mounts
  useEffect(() => {
    // Dashboard mounted
  }, []);

  // Fetch profile views when user is available
  useEffect(() => {
    const fetchProfileViews = async () => {
      if (user?.userId) {
        try {
          const views = await getProfileViews(user.userId);
          setProfileViews(views);
        } catch (error) {
          console.error('Error fetching profile views:', error);
        }
      }
    };

    fetchProfileViews();
  }, [user?.userId, getProfileViews]);

  const isLoading = dogsLoading || puppiesLoading || messagesLoading || kennelsLoading || favoritesLoading;
  const error = dogsError || puppiesError;

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Determine user type for conditional rendering based on active profile
  const isBreeder = effectiveUserType === 'breeder';
  const isAdopter = effectiveUserType === 'adopter';

  // Debug user state for messages
  console.log('Dashboard user state for messages:', {
    hasUser: !!user,
    userId: user?.userId,
    userName: user?.name,
    userType: user?.userType,
    effectiveUserType,
    isAdopter,
    isBreeder
  });
  
  // Debug logging
  console.log('Dashboard render - User state:', {
    user: user ? { userId: user.userId?.substring(0, 10) + '...', name: user.name, userType: user.userType } : null,
    effectiveUserType,
    isAdopter,
    isBreeder,
    favoritesCount
  });
  
  // Use consistent color scheme
  const colors = COLORS;
  
  // Dashboard profile switching state

  return (
    <div 
      key={`dashboard-${effectiveUserType}-${activeProfileType}`}
      style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
        padding: '32px 16px',
        position: 'relative',
        minHeight: '100vh'
      }}>
      {/* Profile Switching Overlay */}
      {activeProfileType && (
        <ProfileSwitchingOverlay 
          isSwitching={isSwitchingProfile} 
          targetProfile={activeProfileType} 
        />
      )}
      
      {/* Clean Header */}
      <div style={{ 
        marginBottom: '40px',
        padding: '24px 0',
        borderBottom: `1px solid ${colors.border}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              size={48} 
              src={user?.profileImage || undefined} 
              icon={<UserOutlined />}
              style={{ 
                marginRight: '16px',
                border: `2px solid ${colors.border}`
              }}
            />
            <div>
              <Title level={2} style={{ 
                color: colors.text, 
                margin: 0, 
                fontSize: '24px',
                fontWeight: '600'
              }}>
                Welcome back, {user?.name || 'User'}
              </Title>
              <Text style={{ 
                color: colors.textSecondary, 
                fontSize: '14px'
              }}>
                {isAdopter ? "Find your perfect puppy companion" : "Manage your breeding program"}
              </Text>
            </div>
          </div>
          
          {canSwitchProfiles && (
            <Tag 
              color="blue" 
              style={{ 
                fontSize: '12px', 
                padding: '4px 8px',
                fontWeight: '500'
              }}
            >
              Viewing as {activeProfileType}
            </Tag>
          )}
        </div>
      </div>

      {error && (
        <div style={{ 
          background: '#fff2f0', 
          border: '1px solid #ffccc7', 
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '24px',
          color: '#ff4d4f'
        }}>
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {/* Clean Stats for Adopters */}
      {(isAdopter || !effectiveUserType) && (
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={12} sm={8} lg={4}>
            <Card 
              size="small"
              style={{ 
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                textAlign: 'center'
              }}
            >
              <Statistic
                value={Array.isArray(matchedPuppies) ? matchedPuppies.length : 0}
                prefix={<HeartOutlined style={{ color: colors.primary }} />}
                valueStyle={{ color: colors.primary, fontSize: '20px', fontWeight: '600' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Matched Puppies
              </Text>
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card 
              size="small"
              style={{ 
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                textAlign: 'center'
              }}
            >
              <Statistic
                value={favoritesCount}
                prefix={<HeartOutlined style={{ color: colors.accent }} />}
                valueStyle={{ color: colors.accent, fontSize: '20px', fontWeight: '600' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Favorites
              </Text>
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card 
              size="small"
              style={{ 
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                textAlign: 'center'
              }}
            >
              <Statistic
                value={unreadCount}
                prefix={<MessageOutlined style={{ color: colors.secondary }} />}
                valueStyle={{ color: colors.secondary, fontSize: '20px', fontWeight: '600' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Messages
              </Text>
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <Card 
              size="small"
              style={{ 
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                textAlign: 'center'
              }}
            >
              <Statistic
                value={profileViews}
                prefix={<EyeOutlined style={{ color: colors.textSecondary }} />}
                valueStyle={{ color: colors.textSecondary, fontSize: '20px', fontWeight: '600' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Profile Views
              </Text>
            </Card>
          </Col>
        </Row>
      )}

      {/* Breeder Stats (unchanged) */}
      {isBreeder && (
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ 
                background: `linear-gradient(135deg, ${colors.card} 0%, ${colors.primary}05 100%)`,
                border: `1px solid ${colors.primary}20`,
                borderRadius: '12px',
                boxShadow: `0 4px 16px ${colors.primary}10`
              }}
            >
              <Statistic
                title={<span style={{ color: colors.textSecondary, fontWeight: '600' }}>My Dogs</span>}
                value={dogs.length}
                prefix={<TeamOutlined style={{ color: colors.primary }} />}
                valueStyle={{ color: colors.primary, fontSize: '28px', fontWeight: 'bold' }}
              />
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Total registered dogs
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ 
                background: `linear-gradient(135deg, ${colors.card} 0%, ${colors.secondary}05 100%)`,
                border: `1px solid ${colors.secondary}20`,
                borderRadius: '12px',
                boxShadow: `0 4px 16px ${colors.secondary}10`
              }}
            >
              <Statistic
                title={<span style={{ color: colors.textSecondary, fontWeight: '600' }}>Active Litters</span>}
                value={dogs.filter(dog => dog.breedingStatus === 'available').length}
                prefix={<HeartOutlined style={{ color: colors.secondary }} />}
                valueStyle={{ color: colors.secondary, fontSize: '28px', fontWeight: 'bold' }}
              />
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Currently breeding
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ 
                background: `linear-gradient(135deg, ${colors.card} 0%, ${colors.accent}05 100%)`,
                border: `1px solid ${colors.accent}20`,
                borderRadius: '12px',
                boxShadow: `0 4px 16px ${colors.accent}10`
              }}
            >
              <Statistic
                title={<span style={{ color: colors.textSecondary, fontWeight: '600' }}>Messages</span>}
                value={unreadCount}
                prefix={<MessageOutlined style={{ color: colors.accent }} />}
                valueStyle={{ color: colors.accent, fontSize: '28px', fontWeight: 'bold' }}
              />
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Unread conversations
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              style={{ 
                background: `linear-gradient(135deg, ${colors.card} 0%, ${colors.accent}05 100%)`,
                border: `1px solid ${colors.accent}20`,
                borderRadius: '12px',
                boxShadow: `0 4px 16px ${colors.accent}10`
              }}
            >
              <Statistic
                title={<span style={{ color: colors.textSecondary, fontWeight: '600' }}>My Kennels</span>}
                value={kennels?.length || 0}
                prefix={<HomeOutlined style={{ color: colors.accent }} />}
                valueStyle={{ color: colors.accent, fontSize: '28px', fontWeight: 'bold' }}
              />
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Total kennels
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Left Column - Main Content */}
        <Col xs={24} lg={16}>
          {/* Matched Puppies (for adopters) */}
          {(isAdopter || !effectiveUserType) && (
          <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HeartOutlined style={{ color: colors.primary }} />
                    <span style={{ color: colors.text, fontWeight: '500' }}>
                      Matched Puppies ({Array.isArray(matchedPuppies) ? matchedPuppies.length : 0})
                    </span>
                  </div>
                  <Link href="/browse">
                    <Button 
                      type="link" 
                      icon={<ArrowRightOutlined />}
                      size="small"
                    >
                      Browse All
                    </Button>
                  </Link>
                </div>
              }
              style={{ 
                marginBottom: '24px',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
            >
              {!matchedPuppies || !Array.isArray(matchedPuppies) || matchedPuppies.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    user?.puppyParentInfo?.preferredBreeds?.length ? 
                    "No puppies match your preferences right now" : 
                    "Set your puppy preferences in your profile to see matched puppies"
                  }
                >
                  <Link href={`/users/${user?.userId}/edit`}>
                    <Button type="primary" icon={<SettingOutlined />}>
                      {user?.puppyParentInfo?.preferredBreeds?.length ? 
                        'Update Preferences' : 
                        'Set Preferences'
                      }
                    </Button>
                  </Link>
                </Empty>
              ) : (
                    <List
                  dataSource={Array.isArray(matchedPuppies) ? matchedPuppies.slice(0, 6) : []}
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3 }}
                  renderItem={(puppy) => (
                    <List.Item>
                      <Card
                        hoverable
                        cover={
                          <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                            {puppy.photoUrl ? (
                              <>
                                <Image
                                  alt={puppy.name}
                                  src={puppy.photoUrl}
                                  fill
                                  style={{ 
                                    objectFit: 'cover' 
                                  }}
                                />
                                {/* Gradient overlay for better text readability */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height: '60px',
                                  background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
                                  zIndex: 1
                                }} />
                                {/* Puppy name overlay */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: '8px',
                                  left: '12px',
                                  right: '12px',
                                  zIndex: 2,
                                  color: 'white',
                                  fontWeight: '600',
                                  fontSize: '16px',
                                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
                                  lineHeight: '1.2'
                                }}>
                                  {puppy.name}
                                </div>
                              </>
                            ) : (
                              <div style={{ 
                                height: '100%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                background: '#f5f5f5',
                                position: 'relative'
                              }}>
                                <UserOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                                {/* Puppy name for placeholder */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: '8px',
                                  left: '12px',
                                  right: '12px',
                                  color: '#666',
                                  fontWeight: '600',
                                  fontSize: '16px',
                                  textAlign: 'center'
                                }}>
                                  {puppy.name}
                                </div>
                              </div>
                            )}
                          </div>
                        }
                          actions={[
                          <Link href={`/dogs/${puppy.id}`} key="view">
                            <Button type="link" icon={<EyeOutlined />}>
                              View Details
                              </Button>
                          </Link>,
                          <Link href={`/breeders/${puppy.ownerId}`} key="breeder">
                            <Button type="link" icon={<TeamOutlined />}>
                              View Breeder
                              </Button>
                          </Link>
                        ]}
                      >
                        <Card.Meta
                          description={
                            <Space direction="vertical" size="small">
                              <Space>
                                <Tag color="blue">{puppy.breed}</Tag>
                                <Tag color={puppy.gender === 'male' ? 'blue' : 'pink'}>
                                  {puppy.gender}
                                </Tag>
                              </Space>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                {puppy.description.length > 100 
                                  ? `${puppy.description.substring(0, 100)}...` 
                                  : puppy.description
                                }
                                </Text>
                              </Space>
                            }
                          />
                      </Card>
                        </List.Item>
                      )}
                    />
              )}
          </Card>
          )}

          {/* Favorites (for adopters) */}
          {(isAdopter || !effectiveUserType) && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HeartOutlined style={{ color: colors.accent }} />
                    <span style={{ color: colors.text, fontWeight: '500' }}>
                      My Favorites ({favoritesCount})
                    </span>
                  </div>
                  <Space>
                    {favoritesCount > 0 && (
                      <Link href="/favorites">
                        <Button 
                          type="link" 
                          icon={<HeartOutlined />}
                          size="small"
                          style={{ color: colors.accent }}
                        >
                          View All
                        </Button>
                      </Link>
                    )}
                    <Link href="/browse">
                      <Button 
                        type="link" 
                        icon={<ArrowRightOutlined />}
                        size="small"
                      >
                        Browse More
                      </Button>
                    </Link>
                  </Space>
                </div>
              }
              style={{ 
                marginBottom: '24px',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
            >
              {favoritesCount === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No favorites yet"
                >
                  <Link href="/browse">
                    <Button type="primary" icon={<HeartOutlined />}>
                      Browse Puppies
                    </Button>
                  </Link>
                </Empty>
              ) : (
                <List
                  dataSource={favorites.slice(0, 6)}
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3 }}
                  renderItem={(favorite) => (
                    <List.Item>
                      <Card
                        hoverable
                        cover={
                          <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                            {favorite.puppyData?.image ? (
                              <>
                                <Image
                                  alt={favorite.puppyData.name || 'Puppy'}
                                  src={favorite.puppyData.image}
                                  fill
                                  style={{ 
                                    objectFit: 'cover' 
                                  }}
                                />
                                {/* Gradient overlay for better text readability */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height: '60px',
                                  background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
                                  zIndex: 1
                                }} />
                                {/* Puppy name overlay */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: '8px',
                                  left: '12px',
                                  right: '12px',
                                  zIndex: 2,
                                  color: 'white',
                                  fontWeight: '600',
                                  fontSize: '16px',
                                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
                                  lineHeight: '1.2'
                                }}>
                                  {favorite.puppyData.name || 'Unknown Puppy'}
                                </div>
                              </>
                            ) : (
                              <div style={{ 
                                height: '100%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                background: '#f5f5f5',
                                position: 'relative'
                              }}>
                                <UserOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                                {/* Puppy name for placeholder */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: '8px',
                                  left: '12px',
                                  right: '12px',
                                  color: '#666',
                                  fontWeight: '600',
                                  fontSize: '16px',
                                  textAlign: 'center'
                                }}>
                                  {favorite.puppyData?.name || 'Unknown Puppy'}
                                </div>
                              </div>
                            )}
                          </div>
                        }
                        actions={[
                          <Link href={`/dogs/${favorite.puppyId}`} key="view">
                            <Button type="link" icon={<EyeOutlined />}>
                              View Details
                            </Button>
                          </Link>,
                          <Button 
                            type="link" 
                            icon={<HeartOutlined style={{ color: '#ff4d4f' }} />}
                            key="favorite"
                            onClick={async () => {
                              try {
                                await removeFromFavorites(favorite.puppyId);
                              } catch (error) {
                                console.error('Error removing from favorites:', error);
                              }
                            }}
                          >
                            Remove
                          </Button>
                        ]}
                      >
                        <Card.Meta
                          description={
                            <Space direction="vertical" size="small">
                              <Space>
                                {favorite.puppyData?.breed && (
                                  <Tag color="blue">{favorite.puppyData.breed}</Tag>
                                )}
                                {favorite.puppyData?.gender && (
                                  <Tag color={favorite.puppyData.gender === 'male' ? 'blue' : 'pink'}>
                                    {favorite.puppyData.gender}
                                  </Tag>
                                )}
                              </Space>
                              {favorite.puppyData?.location && (
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  📍 {favorite.puppyData.location}, {favorite.puppyData.country}
                                </Text>
                              )}
                              {favorite.puppyData?.breederName && (
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  Breeder: {favorite.puppyData.breederName}
                                </Text>
                              )}
                            </Space>
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          )}

          {/* Dog Management (for breeders) */}
          {isBreeder && user?.userId && (
            <DogManagement userId={user.userId} />
          )}

          {/* Kennel Overview (for breeders) */}
          {isBreeder && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HomeOutlined style={{ color: colors.primary, fontSize: '20px' }} />
                  <span style={{ color: colors.text, fontWeight: '600' }}>
                    My Kennels ({kennels?.length || 0})
                  </span>
                </div>
              }
              extra={
                <Link href="/dashboard/kennels">
                  <Button 
                    type="primary" 
                    icon={<ArrowRightOutlined />}
                    style={{ 
                      background: colors.primary,
                      borderColor: colors.primary,
                      borderRadius: '8px'
                    }}
                  >
                    Manage All
                  </Button>
                </Link>
              }
              style={{ 
                marginBottom: '24px',
                background: colors.card,
                border: `1px solid ${colors.primary}20`,
                borderRadius: '12px',
                boxShadow: `0 4px 16px ${colors.primary}10`
              }}
            >
              {!kennels || kennels.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No kennels created yet"
                >
                  <Link href="/dashboard/kennels">
                    <Button type="primary" icon={<PlusOutlined />}>
                      Create Your First Kennel
                    </Button>
                  </Link>
                </Empty>
              ) : (
                <Row gutter={[16, 16]}>
                  {kennels.slice(0, 3).map((kennel) => (
                    <Col xs={24} sm={12} md={8} key={kennel.id}>
                      <Card
                        hoverable
                        size="small"
                        cover={
                          kennel.coverPhoto ? (
                            <img
                              alt={kennel.name}
                              src={kennel.coverPhoto}
                              style={{ height: '120px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                height: '120px',
                                background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}20 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: colors.primary,
                                fontSize: '24px',
                                fontWeight: 'bold'
                              }}
                            >
                              {kennel.name.charAt(0).toUpperCase()}
                            </div>
                          )
                        }
                        actions={[
                          <Link href={`/kennels/${kennel.id}`} key="view">
                            <Button type="link" icon={<EyeOutlined />} size="small">
                              View
                            </Button>
                          </Link>,
                          <Link href="/dashboard/kennels" key="manage">
                            <Button type="link" icon={<SettingOutlined />} size="small">
                              Manage
                            </Button>
                          </Link>
                        ]}
                      >
                        <Card.Meta
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Text strong style={{ fontSize: '14px' }}>{kennel.name}</Text>
                              <Tag 
                                color={kennel.isActive ? 'green' : 'red'}
                              >
                                {kennel.isActive ? 'Active' : 'Inactive'}
                              </Tag>
                            </div>
                          }
                          description={
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {kennel.description?.substring(0, 60)}...
                              </Text>
                              {kennel.specialties && kennel.specialties.length > 0 && (
                                <Space wrap>
                                  {kennel.specialties.slice(0, 2).map((specialty, index) => (
                                    <Tag key={index} color="blue">
                                      {specialty}
                                    </Tag>
                                  ))}
                                  {kennel.specialties.length > 2 && (
                                    <Tag color="default">
                                      +{kennel.specialties.length - 2} more
                                    </Tag>
                                  )}
                                </Space>
                              )}
                            </Space>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card>
          )}

      {/* Quick Actions */}
          <Card 
            title={
              <span style={{ color: colors.text, fontWeight: '500' }}>
                {isBreeder ? 'Breeder Actions' : 'Quick Actions'}
              </span>
            }
            style={{ 
              border: `1px solid ${colors.border}`,
              borderRadius: '8px'
            }}
          >
        <Row gutter={[16, 16]}>
              {isBreeder && (
                <>
                  <Col xs={24} sm={12}>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      block
                      size="large" 
                      onClick={() => setAddDogModalVisible(true)}
                      style={{ 
                        height: '60px', 
                        fontSize: '16px',
                        background: colors.primary,
                        borderColor: colors.primary,
                        borderRadius: '8px',
                        fontWeight: '600'
                      }}
                    >
                      Add New Dog
                    </Button>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Link href="/dashboard/kennels">
                      <Button 
                        icon={<HomeOutlined />} 
                        block 
                        size="large"
                        style={{ 
                          height: '60px', 
                          fontSize: '16px',
                          background: colors.secondary,
                          borderColor: colors.secondary,
                          color: 'white',
                          borderRadius: '8px',
                          fontWeight: '600'
                        }}
                      >
                        Manage Kennels
                      </Button>
                    </Link>
                  </Col>
                </>
              )}
              <Col xs={12} sm={8} lg={6}>
                <Link href="/browse">
                  <Button 
                    icon={<EyeOutlined />} 
                    block 
                    style={{ 
                      background: colors.primary,
                      borderColor: colors.primary,
                      color: 'white',
                      fontWeight: '500'
                    }}
                  >
                    Browse Puppies
                  </Button>
                </Link>
              </Col>
              {(isAdopter || !effectiveUserType) && favoritesCount > 0 && (
                <Col xs={12} sm={8} lg={6}>
                  <Link href="/favorites">
                    <Button 
                      icon={<HeartOutlined />} 
                      block 
                      style={{ 
                        background: colors.accent,
                        borderColor: colors.accent,
                        color: 'white',
                        fontWeight: '500'
                      }}
                    >
                      My Favorites
                    </Button>
                  </Link>
                </Col>
              )}
              <Col xs={12} sm={8} lg={6}>
                <Link href="/dashboard/messages">
                  <Button 
                    icon={<MessageOutlined />} 
                    block
                    style={{ 
                      background: colors.secondary,
                      borderColor: colors.secondary,
                      color: 'white',
                      fontWeight: '500'
                    }}
                  >
                    Messages
                  </Button>
                </Link>
              </Col>
              <Col xs={12} sm={8} lg={6}>
                <Link href={`/users/${user?.userId}/edit`}>
                  <Button 
                    icon={<SettingOutlined />} 
                    block
                    style={{ 
                      background: colors.neutral,
                      borderColor: colors.border,
                      color: colors.text,
                      fontWeight: '500'
                    }}
                  >
                    Edit Profile
                  </Button>
                </Link>
              </Col>
        </Row>
      </Card>
        </Col>

        {/* Right Column - Sidebar */}
        <Col xs={24} lg={8}>
          {/* Profile Summary */}
          <Card 
            title={
              <span style={{ color: colors.text, fontWeight: '500' }}>
                Profile Summary
              </span>
            }
            style={{ 
              marginBottom: '24px',
              border: `1px solid ${colors.border}`,
              borderRadius: '8px'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <Avatar 
                size={60} 
                src={user?.profileImage || undefined} 
                icon={<UserOutlined />}
                style={{ 
                  border: `2px solid ${colors.border}`
                }}
              />
              <div style={{ marginTop: '8px' }}>
                <Title level={5} style={{ color: colors.text, margin: 0 }}>
                  {user?.name || 'User'}
                </Title>
                <Tag 
                  color="blue" 
                  style={{ 
                    fontSize: '11px', 
                    padding: '2px 6px',
                    fontWeight: '500'
                  }}
                >
                  {isBreeder ? 'Breeder' : 'Adopter'}
                </Tag>
              </div>
            </div>
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <Link href={`/users/${user?.userId}/edit`}>
                <Button 
                  type="primary" 
                  block 
                  icon={<EditOutlined />}
                  style={{ 
                    background: colors.primary,
                    borderColor: colors.primary,
                    fontWeight: '500'
                  }}
                >
                  Edit Profile
                </Button>
              </Link>
              <Link href={`/users/${user?.userId}`}>
                <Button 
                  block 
                  icon={<EyeOutlined />}
                  style={{ 
                    background: colors.neutral,
                    borderColor: colors.border,
                    color: colors.text,
                    fontWeight: '500'
                  }}
                >
                  View Profile
                </Button>
              </Link>
              
              <Divider style={{ margin: '12px 0' }} />
              
              <div style={{ 
                padding: '12px', 
                background: colors.neutral, 
                borderRadius: '6px'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '11px', fontWeight: '500' }}>
                    <CalendarOutlined style={{ marginRight: '4px' }} />
                    Member since:
                  </Text>
                  <br />
                  <Text style={{ fontSize: '13px', color: colors.text }}>
                    {user?.createdAt ? dayjs(user.createdAt).format('MMM YYYY') : 'Recently joined'}
                  </Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: '11px', fontWeight: '500' }}>
                    <HomeOutlined style={{ marginRight: '4px' }} />
                    Location:
                  </Text>
                  <br />
                  <Text style={{ fontSize: '13px', color: colors.text }}>
                    {user?.location || 'Not specified'}
                  </Text>
                </div>
              </div>
            </Space>
      </Card>

          {/* Messages (for adopters) */}
          {(isAdopter || !effectiveUserType) && (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageOutlined style={{ color: colors.secondary }} />
                    <span style={{ color: colors.text, fontWeight: '500' }}>
                      Messages
                    </span>
                    {unreadCount > 0 && (
                      <Badge 
                        count={unreadCount} 
                        size="small" 
                        style={{ 
                          background: colors.accent
                        }}
                      />
                    )}
                  </div>
                  <Link href="/dashboard/messages">
                    <Button 
                      type="link" 
                      size="small"
                    >
                      View All
                    </Button>
                  </Link>
                </div>
              }
              style={{ 
                marginBottom: '24px',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
            >
              {threads.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No messages yet"
                  style={{ padding: '20px 0' }}
                >
                  <Link href="/browse">
                    <Button type="primary" size="small">
                      Start Browsing
                    </Button>
                  </Link>
                </Empty>
              ) : (
              <List
                  dataSource={threads.slice(0, 3)}
                  renderItem={(thread) => (
                  <List.Item
                      style={{ padding: '8px 0' }}
                    actions={[
                        <Link href={`/dashboard/messages?thread=${thread.id}`} key="view">
                          <Button type="link" size="small">
                            View
                      </Button>
                        </Link>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                            size={32} 
                            src={thread.participantInfo?.[thread.participants.find(p => p !== user?.userId) || '']?.profileImage}
                          icon={<UserOutlined />}
                        />
                      }
                      title={
                          <Text 
                            strong={(thread.unreadCount[user?.userId || ''] || 0) > 0}
                            style={{ 
                              fontSize: '14px',
                              color: (thread.unreadCount[user?.userId || ''] || 0) > 0 ? '#1890ff' : 'inherit'
                            }}
                          >
                            {thread.participantInfo?.[thread.participants.find(p => p !== user?.userId) || '']?.name || 
                             thread.participantNames?.[thread.participants.find(p => p !== user?.userId) || ''] || 
                             'Unknown'}
                        </Text>
                      }
                      description={
                          <Space direction="vertical" size="small">
                            <Text 
                              type="secondary" 
                              style={{ 
                                fontSize: '12px',
                                fontWeight: (thread.unreadCount[user?.userId || ''] || 0) > 0 ? 'bold' : 'normal'
                              }}
                            >
                              {thread.lastMessage?.content?.substring(0, 50)}...
                          </Text>
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              {thread.lastMessage?.timestamp 
                                ? dayjs(thread.lastMessage.timestamp).fromNow()
                                : 'No messages'
                              }
                              </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
              )}
          </Card>
          )}

          {/* Puppy Preferences (for adopters) */}
          {(isAdopter || !effectiveUserType) && (
            <Card 
              title={
                <span style={{ color: colors.text, fontWeight: '500' }}>
                  Your Puppy Preferences
                </span>
              }
              style={{ 
                marginBottom: '24px',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px'
              }}
            >
              {user?.puppyParentInfo?.preferredBreeds?.length ? (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong style={{ color: colors.text, fontSize: '14px' }}>
                      Preferred Breeds:
                    </Text>
                    <br />
                    <Space wrap style={{ marginTop: '8px' }}>
                      {user.puppyParentInfo.preferredBreeds.map((breed: string) => (
                        <Tag 
                          key={breed} 
                          color="blue"
                          style={{ 
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontWeight: '500'
                          }}
                        >
                          {breed}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                  {user.puppyParentInfo.experienceLevel && (
                    <div style={{ marginBottom: '16px' }}>
                      <Text strong style={{ color: colors.text, fontSize: '14px' }}>
                        Experience Level:
                      </Text>
                      <br />
                      <Text 
                        type="secondary" 
                        style={{ 
                          textTransform: 'capitalize',
                          fontSize: '13px',
                          color: colors.textSecondary
                        }}
                      >
                        {user.puppyParentInfo.experienceLevel.replace('-', ' ')}
                      </Text>
                    </div>
                  )}
                  {user.puppyParentInfo.housingType && (
                    <div style={{ marginBottom: '16px' }}>
                      <Text strong style={{ color: colors.text, fontSize: '14px' }}>
                        Housing:
                      </Text>
                      <br />
                      <Text 
                        type="secondary" 
                        style={{ 
                          textTransform: 'capitalize',
                          fontSize: '13px',
                          color: colors.textSecondary
                        }}
                      >
                        {user.puppyParentInfo.housingType}
                      </Text>
                    </div>
                  )}
                  <Link href={`/users/${user?.userId}/edit`}>
                    <Button 
                      type="primary" 
                      size="small" 
                      block
                      style={{ 
                        background: colors.primary,
                        borderColor: colors.primary,
                        borderRadius: '6px',
                        fontWeight: '600'
                      }}
                    >
                      Update Preferences
                    </Button>
                  </Link>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    padding: '20px', 
                    background: `${colors.primary}05`, 
                    borderRadius: '8px',
                    border: `1px solid ${colors.primary}20`,
                    marginBottom: '16px'
                  }}>
                    <HeartOutlined style={{ fontSize: '32px', color: colors.primary, marginBottom: '8px' }} />
                    <Text type="secondary" style={{ display: 'block', marginBottom: '12px', fontSize: '14px' }}>
                      Set your puppy preferences to see personalized matches
                    </Text>
                  </div>
                  <Link href={`/users/${user?.userId}/edit`}>
                    <Button 
                      type="primary" 
                      size="small"
                      style={{ 
                        background: colors.primary,
                        borderColor: colors.primary,
                        borderRadius: '6px',
                        fontWeight: '600'
                      }}
                    >
                      Set Preferences
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          )}

          {/* Recent Activity / Breeder Stats */}
          {isBreeder ? (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrophyOutlined style={{ color: colors.primary, fontSize: '20px' }} />
                  <span style={{ color: colors.text, fontWeight: '600' }}>
                    Breeding Statistics
                  </span>
                </div>
              }
              style={{ 
                background: colors.card,
                border: `1px solid ${colors.primary}20`,
                borderRadius: '12px',
                boxShadow: `0 4px 16px ${colors.primary}10`
              }}
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-around', 
                  marginBottom: '20px' 
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: colors.primary,
                      marginBottom: '4px'
                    }}>
                      {dogs.length}
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Total Dogs
                    </Text>
                  </div>
                  <div>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: colors.secondary,
                      marginBottom: '4px'
                    }}>
                      {dogs.filter(dog => dog.breedingStatus === 'available').length}
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Active Litters
                    </Text>
                  </div>
                </div>
                <Progress 
                  percent={Math.min((dogs.length / 10) * 100, 100)} 
                  strokeColor={colors.primary}
                  trailColor={`${colors.primary}20`}
                  style={{ marginBottom: '12px' }}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {dogs.length < 10 ? `${10 - dogs.length} more dogs to reach 10` : 'Great! You have 10+ dogs'}
                </Text>
              </div>
            </Card>
          ) : (
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StarOutlined style={{ color: colors.primary, fontSize: '20px' }} />
                  <span style={{ color: colors.text, fontWeight: '600' }}>
                    Recent Activity
                  </span>
                </div>
              }
              style={{ 
                background: colors.card,
                border: `1px solid ${colors.primary}20`,
                borderRadius: '12px',
                boxShadow: `0 4px 16px ${colors.primary}10`
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No recent activity"
                style={{ padding: '20px 0' }}
              />
            </Card>
          )}
                    </Col>
                  </Row>

      {/* Add Dog Modal */}
      <AddDogForm
        visible={addDogModalVisible}
        onClose={() => setAddDogModalVisible(false)}
        onSuccess={() => {
          setAddDogModalVisible(false);
          message.success('Dog added successfully!');
        }}
      />
    </div>
  );
};

export default Dashboard;