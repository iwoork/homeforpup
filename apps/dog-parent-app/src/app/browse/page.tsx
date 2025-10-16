'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Select, Slider, Checkbox, Button, Rate, Tag, Space, Spin, Alert, Pagination, Statistic, Tooltip, Badge, Divider } from 'antd';
import { HeartOutlined, HeartFilled, EnvironmentOutlined, PhoneOutlined, MailOutlined, GlobalOutlined, CheckCircleOutlined, TruckOutlined, HomeOutlined, FilterOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { usePuppies, PuppyWithBreeder } from '@/hooks/api/usePuppies';
import CountryFilter from '@/components/filters/CountryFilter';
import StateFilter from '@/components/filters/StateFilter';
import ContactBreederModal from '@/components/ContactBreederModal';
import PuppySearchWizard from '@/components/PuppySearchWizard';
import { BreedSelector } from '@/components';
import { useAuth, useBulkFavoriteStatus, useFavorites } from '@/hooks';
import { generateBreadcrumbSchema } from '@/lib/utils/seo';
import StructuredData from '@/components/StructuredData';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const PuppiesPage: React.FC = () => {
  const [filters, setFilters] = useState({
    country: 'Canada', // Default to Canada
    state: [] as string[],
    breed: null as string | null,
    gender: null as string | null,
    shipping: false,
    verified: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [showSearchWizard, setShowSearchWizard] = useState(false);

  // Get user data
  const { user, loading: userLoading } = useAuth();

  // Contact modal state
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [selectedPuppy, setSelectedPuppy] = useState<PuppyWithBreeder | null>(null);

  // Use the puppies API hook
  const {
    puppies,
    totalCount,
    totalPages,
    hasNextPage,
    hasPrevPage,
    filters: availableFilters,
    stats,
    isLoading,
    error,
  } = usePuppies({
    country: filters.country,
    state: filters.state.length > 0 ? filters.state[0] : undefined,
    breed: filters.breed || undefined,
    gender: filters.gender || undefined,
    shipping: filters.shipping,
    verified: filters.verified,
    page: currentPage,
    limit: pageSize,
  });

  // Favorites functionality
  const { toggleFavorite } = useFavorites();
  const puppyIds = puppies.map(puppy => puppy.id);
  const { favoriteStatus, isLoading: favoritesLoading } = useBulkFavoriteStatus(puppyIds);
  
  // Local state for optimistic updates
  const [optimisticFavorites, setOptimisticFavorites] = useState<Record<string, boolean>>({});
  
  // Combined favorite status that merges server data with optimistic updates
  const combinedFavoriteStatus = React.useMemo(() => {
    return {
      ...favoriteStatus,
      ...optimisticFavorites
    };
  }, [favoriteStatus, optimisticFavorites]);
  
  // Helper function to get current favorite status
  const getCurrentFavoriteStatus = (puppyId: string): boolean => {
    const status = combinedFavoriteStatus[puppyId] || false;
    console.log('Getting favorite status for', puppyId, ':', status, {
      serverStatus: favoriteStatus[puppyId],
      optimisticStatus: optimisticFavorites[puppyId],
      combined: combinedFavoriteStatus[puppyId]
    });
    return status;
  };

  // Clear optimistic updates when page changes or filters change
  useEffect(() => {
    setOptimisticFavorites({});
  }, [currentPage, filters.country, filters.state, filters.breed, filters.gender, filters.shipping, filters.verified]);

  const resetFilters = () => {
    setFilters({
      country: 'Canada',
      state: [],
      breed: null,
      gender: null,
      shipping: false,
      verified: false,
    });
    setCurrentPage(1);
  };

  const handleContactBreeder = (puppy: PuppyWithBreeder) => {
    setSelectedPuppy(puppy);
    setContactModalVisible(true);
  };

  const handleCloseModal = () => {
    setContactModalVisible(false);
    setSelectedPuppy(null);
  };

  const handleToggleFavorite = async (puppy: PuppyWithBreeder) => {
    if (!user) {
      console.log('No user, cannot toggle favorite');
      return;
    }
    
    const currentStatus = getCurrentFavoriteStatus(puppy.id);
    const newStatus = !currentStatus;
    
    console.log('Toggling favorite:', {
      puppyId: puppy.id,
      puppyName: puppy.name,
      currentStatus,
      newStatus
    });
    
    // Optimistically update the UI immediately
    setOptimisticFavorites(prev => ({
      ...prev,
      [puppy.id]: newStatus
    }));
    
    try {
      await toggleFavorite(puppy.id, {
        name: puppy.name,
        breed: puppy.breed,
        image: puppy.image,
        location: puppy.location,
        country: puppy.country,
        ageWeeks: puppy.ageWeeks,
        gender: puppy.gender,
        price: puppy.price,
        breederName: puppy.breeder.businessName
      });
      
      console.log('Successfully toggled favorite for:', puppy.name);
      
      // Clear optimistic update after successful server update
      setOptimisticFavorites(prev => {
        const newState = { ...prev };
        delete newState[puppy.id];
        return newState;
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update on error
      setOptimisticFavorites(prev => {
        const newState = { ...prev };
        delete newState[puppy.id];
        return newState;
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchWizardComplete = (criteria: any) => {
    setFilters({
      country: criteria.country || 'Canada',
      state: criteria.state || [],
      breed: criteria.breeds?.[0] || null,
      gender: criteria.gender || null,
      shipping: criteria.shipping || false,
      verified: criteria.verifiedOnly || false,
    });
    setCurrentPage(1);
    setShowSearchWizard(false);
  };

  // Check if any filters are active
  const hasActiveFilters = filters.country !== 'Canada' || 
                          filters.state.length > 0 || 
                          filters.breed !== null || 
                          filters.gender !== null || 
                          filters.shipping || 
                          filters.verified;

  // Render puppy card
  const renderPuppyCard = (puppy: PuppyWithBreeder) => (
    <Card
      key={puppy.id}
      hoverable
      style={{
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        marginBottom: '16px',
        overflow: 'visible',
        height: '590px',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #f0f0f0'
      }}
      bodyStyle={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        overflow: 'visible'
      }}
      cover={
        <div style={{ position: 'relative', height: '200px' }}>
          <Image
            src={puppy.image}
            alt={puppy.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {puppy.breeder.verified && (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Verified
              </Tag>
            )}
            <Tag color="blue">
              {puppy.ageWeeks} weeks
            </Tag>
            {puppy.breeder.shipping && (
              <Tag color="orange" icon={<TruckOutlined />}>
                Ships
              </Tag>
            )}
            {puppy.breeder.pickupAvailable && (
              <Tag color="purple" icon={<HomeOutlined />}>
                Pickup
              </Tag>
            )}
          </div>
        </div>
      }
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        padding: '0 4px' 
      }}>
        {/* Header Section */}
        <div style={{ marginBottom: '8px' }}>
          <Title level={4} style={{ margin: 0, color: '#08979C', marginBottom: '4px' }}>
            {puppy.name}
          </Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            {puppy.breed} • {puppy.gender}
          </Text>
        </div>

        {/* Location Section */}
        <div style={{ marginBottom: '8px' }}>
          <Space wrap>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <EnvironmentOutlined style={{ marginRight: '4px' }} />
              {puppy.location}, {puppy.country}
            </Text>
          </Space>
        </div>

        {/* Breeder Section */}
        <div style={{ marginBottom: '8px' }}>
          <Text strong style={{ fontSize: '13px' }}>
            Breeder: {puppy.breeder.businessName}
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <Rate disabled value={puppy.breeder.rating} style={{ fontSize: '12px' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ({puppy.breeder.reviewCount} reviews)
            </Text>
          </div>
        </div>

        {/* Description Section - Flexible */}
        <div style={{ flex: 1, marginBottom: '8px' }}>
          <Paragraph 
            ellipsis={{ rows: 3, expandable: true, symbol: 'more' }} 
            style={{ margin: '8px 0', fontSize: '13px', color: '#666' }}
          >
            {puppy.description}
          </Paragraph>
        </div>

        <Divider style={{ margin: '8px 0' }} />
        
        {/* Footer Section - Fixed at bottom */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: 'auto',
          paddingTop: '8px',
          minHeight: '40px'
        }}>
          <Space size="small">
            <Text style={{ fontSize: '12px', color: '#666' }}>
              Response: {puppy.breeder.avgResponseTime}
            </Text>
            <Text style={{ fontSize: '12px', color: '#666' }}>
              Rate: {Math.round(puppy.breeder.responseRate * 100)}%
            </Text>
          </Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleContactBreeder(puppy)}
          >
            Contact Breeder
          </Button>
        </div>

        {/* Action Buttons Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginTop: '12px',
          paddingTop: '8px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Space size="middle">
            <Tooltip title={getCurrentFavoriteStatus(puppy.id) ? "Remove from favorites" : "Save to favorites"}>
              <Button 
                type="text" 
                icon={getCurrentFavoriteStatus(puppy.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} 
                size="small" 
                onClick={() => handleToggleFavorite(puppy)}
                loading={favoritesLoading}
                disabled={!user}
                style={{
                  color: getCurrentFavoriteStatus(puppy.id) ? '#ff4d4f' : '#666',
                  fontSize: '16px'
                }}
              />
            </Tooltip>
            <Tooltip title={puppy.breeder.phone}>
              <Button type="text" icon={<PhoneOutlined />} size="small" />
            </Tooltip>
            <Tooltip title={puppy.breeder.email}>
              <Button type="text" icon={<MailOutlined />} size="small" />
            </Tooltip>
            <Tooltip title={puppy.breeder.website}>
              <Button type="text" icon={<GlobalOutlined />} size="small" />
            </Tooltip>
          </Space>
        </div>
      </div>
    </Card>
  );

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        <Alert
          message="Error Loading Puppies"
          description="There was an error loading the available puppies. Please try again later."
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (showSearchWizard) {
    return (
      <PuppySearchWizard
        onComplete={handleSearchWizardComplete}
        onCancel={() => setShowSearchWizard(false)}
      />
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={1} style={{ color: '#08979C', margin: 0 }}>
          Available Puppies
        </Title>
        <Button 
          type="primary" 
          size="large"
          onClick={() => setShowSearchWizard(true)}
          style={{ background: '#08979C', borderColor: '#08979C' }}
        >
          Find My Perfect Puppy
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Puppies"
                value={stats.totalPuppies}
                prefix="🐕"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Average Age"
                value={stats.averageAge}
                suffix="weeks"
                prefix="📅"
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Verified Breeders"
                value={stats.verifiedBreeders}
                prefix="✅"
              />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={24}>
        {/* Filters Sidebar */}
        <Col xs={24} lg={6}>
          <Card
            title={
              <Space>
                <FilterOutlined />
                Filters
                {hasActiveFilters && (
                  <Badge count={Object.values(filters).filter(v => 
                    Array.isArray(v) ? v.length > 0 : v !== null && v !== false && v !== 'Canada'
                  ).length} />
                )}
              </Space>
            }
            extra={
              hasActiveFilters && (
                <Button type="link" onClick={resetFilters} size="small">
                  Clear All
                </Button>
              )
            }
            style={{ marginBottom: '24px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {/* Country Filter */}
              <div>
                <Text strong>Country</Text>
                <CountryFilter
                  value={filters.country}
                  onChange={(value) => {
                    setFilters(prev => ({ ...prev, country: value, state: [] }));
                    setCurrentPage(1);
                  }}
                  style={{ width: '100%', marginTop: '8px' }}
                />
              </div>

              {/* State Filter */}
              <div>
                <Text strong>Location</Text>
                <StateFilter
                  value={filters.state}
                  onChange={(value) => {
                    setFilters(prev => ({ ...prev, state: value }));
                    setCurrentPage(1);
                  }}
                  availableStates={availableFilters?.availableStates || []}
                  style={{ width: '100%', marginTop: '8px' }}
                />
              </div>

              {/* Breed Filter */}
              <div>
                <Text strong>Breed</Text>
                <BreedSelector
                  style={{ width: '100%', marginTop: '8px' }}
                  placeholder="Select breed"
                  value={filters.breed || undefined}
                  onChange={(value) => {
                    setFilters(prev => ({ ...prev, breed: value as string }));
                    setCurrentPage(1);
                  }}
                  allowClear
                  showSearch
                  showBreedInfo={false}
                  showBreederCount={false}
                />
              </div>

              {/* Gender Filter */}
              <div>
                <Text strong>Gender</Text>
                <Select
                  style={{ width: '100%', marginTop: '8px' }}
                  placeholder="Select gender"
                  value={filters.gender}
                  onChange={(value) => {
                    setFilters(prev => ({ ...prev, gender: value }));
                    setCurrentPage(1);
                  }}
                  allowClear
                >
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                </Select>
              </div>
              

              {/* Checkboxes */}
              <div>
                <Space direction="vertical">
                  <Checkbox
                    checked={filters.shipping}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, shipping: e.target.checked }));
                      setCurrentPage(1);
                    }}
                  >
                    Shipping Available
                  </Checkbox>
                  <Checkbox
                    checked={filters.verified}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, verified: e.target.checked }));
                      setCurrentPage(1);
                    }}
                  >
                    Verified Breeders Only
                  </Checkbox>
                </Space>
                </div>
            </Space>
          </Card>
        </Col>

        {/* Puppies Grid */}
        <Col xs={24} lg={18}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px' }}>
                <Text>Loading adorable puppies...</Text>
              </div>
            </div>
          ) : puppies.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  No puppies found matching your criteria.
                </Text>
                <br />
                <Button type="link" onClick={resetFilters}>
                  Clear filters to see all puppies
                </Button>
            </div>
          </Card>
          ) : (
            <>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>
                  Showing {puppies.length} of {totalCount} puppies
                </Text>
                <Text type="secondary">
                  Page {currentPage} of {totalPages}
                </Text>
              </div>

              <Row gutter={[16, 16]}>
                {puppies.map((puppy, index) => (
                  <Col xs={24} sm={12} lg={8} key={puppy.id}>
                    {renderPuppyCard(puppy)}
        </Col>
      ))}
              </Row>

              {totalPages > 1 && (
                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                  <Pagination
                    current={currentPage}
                    total={totalCount}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total, range) =>
                      `${range[0]}-${range[1]} of ${total} puppies`
                    }
                  />
                </div>
              )}
            </>
          )}
        </Col>
      </Row>

      {/* Contact Breeder Modal */}
      {selectedPuppy && (
        <ContactBreederModal
          visible={contactModalVisible}
          onCancel={handleCloseModal}
          puppyName={selectedPuppy.name}
          breederName={selectedPuppy.breeder.businessName}
          senderName={user?.name || user?.displayName || 'Guest User'}
          senderEmail={user?.email || 'support@homeforpup.com'}
        />
      )}

      {/* Structured Data */}
      <StructuredData 
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Browse Puppies', url: '/browse' }
        ])} 
      />
    </div>
  );
};

export default PuppiesPage;