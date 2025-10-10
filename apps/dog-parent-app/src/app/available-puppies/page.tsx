'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Select, Checkbox, Button, Tag, Space, Spin, Alert, Pagination, Statistic, Badge, Collapse } from 'antd';
import { HeartOutlined, HeartFilled, EnvironmentOutlined, CheckCircleOutlined, TruckOutlined, HomeOutlined, FilterOutlined, MessageOutlined, DownOutlined } from '@ant-design/icons';
import { PuppyList, PuppyWithKennel } from '@homeforpup/shared-dogs';
import CountryFilter from '@/components/filters/CountryFilter';
import StateFilter from '@/components/filters/StateFilter';
import ContactBreederModal from '@/components/ContactBreederModal';
import { BreedSelector } from '@/components';
import { useAuth, useBulkFavoriteStatus, useFavorites } from '@/hooks';
import { useAvailablePuppiesWithKennels, PuppyFilters } from '@/hooks/api/useAvailablePuppiesWithKennels';
import { generateBreadcrumbSchema } from '@/lib/utils/seo';
import StructuredData from '@/components/StructuredData';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const AvailablePuppiesPage: React.FC = () => {
  const [filters, setFilters] = useState<PuppyFilters>({
    country: undefined, // Show all countries by default
    breed: undefined,
    gender: undefined,
    shipping: false,
    verified: false,
    page: 1,
    limit: 12,
  });

  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Mobile filters state
  const [isMobile, setIsMobile] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState<string[]>([]);

  // Get user data
  const { user, loading: userLoading } = useAuth();

  // Contact modal state
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [selectedPuppy, setSelectedPuppy] = useState<PuppyWithKennel | null>(null);

  // Use the new puppies API hook
  const {
    puppies,
    totalCount,
    totalPages,
    currentPage: apiCurrentPage,
    hasNextPage,
    hasPrevPage,
    filters: availableFilters,
    stats,
    isLoading,
    error,
    mutate,
  } = useAvailablePuppiesWithKennels(filters);

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

  // Clear optimistic updates when page changes or filters change
  useEffect(() => {
    setOptimisticFavorites({});
  }, [currentPage, filters.country, filters.state, filters.breed, filters.gender, filters.shipping, filters.verified]);

  // Detect screen size and set initial collapse state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 992; // lg breakpoint
      setIsMobile(mobile);
      // On mobile, start with filters collapsed
      if (mobile && filtersCollapsed.length === 0) {
        setFiltersCollapsed([]);
      } else if (!mobile && filtersCollapsed.length === 0) {
        setFiltersCollapsed(['filters']);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle favorite toggle with optimistic updates
  const handleFavoriteToggle = async (puppyId: string) => {
    const currentStatus = combinedFavoriteStatus[puppyId] || false;
    const newStatus = !currentStatus;
    
    // Optimistic update
    setOptimisticFavorites(prev => ({
      ...prev,
      [puppyId]: newStatus
    }));
    
    try {
      await toggleFavorite(puppyId);
      // Remove from optimistic updates after successful API call
      setOptimisticFavorites(prev => {
        const { [puppyId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticFavorites(prev => ({
        ...prev,
        [puppyId]: currentStatus
      }));
      console.error('Error toggling favorite:', error);
    }
  };

  // Handle contact puppy
  const handleContactPuppy = (puppy: PuppyWithKennel) => {
    setSelectedPuppy(puppy);
    setContactModalVisible(true);
  };

  const handleCloseModal = () => {
    setContactModalVisible(false);
    setSelectedPuppy(null);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof PuppyFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({
      ...prev,
      page,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle state filter change
  const handleStateChange = (states: string[]) => {
    setSelectedStates(states);
    handleFilterChange('state', states.length > 0 ? states[0] : undefined);
  };

  // Clear all filters
  const resetFilters = () => {
    setFilters({
      country: undefined,
      breed: undefined,
      gender: undefined,
      shipping: false,
      verified: false,
      page: 1,
      limit: 12,
    });
    setSelectedStates([]);
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = 
    filters.country || 
    filters.breed || 
    filters.gender || 
    selectedStates.length > 0 || 
    filters.shipping || 
    filters.verified;

  if (userLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Title level={1} style={{ color: '#08979C', marginBottom: '16px' }}>
          Available Puppies
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
          Discover adorable puppies from verified kennels across Canada and the US. 
          Connect directly with responsible breeders who prioritize the health and wellbeing of their dogs.
        </Paragraph>
      </div>

      {/* Stats */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={8} sm={8}>
            <Card>
              <Statistic
                title="Available Puppies"
                value={stats.totalPuppies}
                valueStyle={{ color: '#08979C' }}
                prefix="🐕"
              />
            </Card>
          </Col>
          <Col xs={8} sm={8}>
            <Card>
              <Statistic
                title="Active Kennels"
                value={availableFilters?.availableCountries?.length || 0}
                prefix="🏠"
              />
            </Card>
          </Col>
          <Col xs={8} sm={8}>
            <Card>
              <Statistic
                title="Breed Varieties"
                value={availableFilters?.availableBreeds?.length || 0}
                prefix="🎯"
              />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={24}>
        {/* Filters Sidebar */}
        <Col xs={24} lg={6}>
          {isMobile ? (
            <Card style={{ marginBottom: '24px' }}>
              <Collapse
                activeKey={filtersCollapsed}
                onChange={setFiltersCollapsed}
                ghost
                expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
                items={[
                  {
                    key: 'filters',
                    label: (
                      <Space>
                        <FilterOutlined />
                        Filters
                        {hasActiveFilters && (
                          <Badge count={[
                            filters.country,
                            filters.breed,
                            filters.gender,
                            selectedStates.length > 0 ? 'state' : null,
                            filters.shipping ? 'shipping' : null,
                            filters.verified ? 'verified' : null
                          ].filter(Boolean).length} />
                        )}
                        {hasActiveFilters && (
                          <Button type="link" onClick={resetFilters} size="small" style={{ marginLeft: 'auto' }}>
                            Clear All
                          </Button>
                        )}
                      </Space>
                    ),
                    children: (
                      <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        {/* Country Filter */}
                        <div>
                          <Text strong>Country</Text>
                          <CountryFilter
                            value={filters.country}
                            onChange={(value) => handleFilterChange('country', value)}
                            style={{ width: '100%', marginTop: '8px' }}
                          />
                        </div>

                        {/* State Filter */}
                        <div>
                          <Text strong>Location</Text>
                          <StateFilter
                            value={selectedStates}
                            onChange={handleStateChange}
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
                            onChange={(value) => handleFilterChange('breed', value)}
                            allowClear
                            showSearch
                            showBreedInfo={false}
                            showBreederCount={false}
                            includeOnlyBreeds={availableFilters?.availableBreeds}
                          />
                        </div>

                        {/* Gender Filter */}
                        <div>
                          <Text strong>Gender</Text>
                          <Select
                            style={{ width: '100%', marginTop: '8px' }}
                            placeholder="Select gender"
                            value={filters.gender}
                            onChange={(value) => handleFilterChange('gender', value)}
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
                              onChange={(e) => handleFilterChange('shipping', e.target.checked)}
                            >
                              Shipping Available
                            </Checkbox>
                            <Checkbox
                              checked={filters.verified}
                              onChange={(e) => handleFilterChange('verified', e.target.checked)}
                            >
                              Verified Kennels Only
                            </Checkbox>
                          </Space>
                        </div>
                      </Space>
                    ),
                  },
                ]}
              />
            </Card>
          ) : (
            <Card
              title={
                <Space>
                  <FilterOutlined />
                  Filters
                  {hasActiveFilters && (
                    <Badge count={[
                      filters.country,
                      filters.breed,
                      filters.gender,
                      selectedStates.length > 0 ? 'state' : null,
                      filters.shipping ? 'shipping' : null,
                      filters.verified ? 'verified' : null
                    ].filter(Boolean).length} />
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
                    onChange={(value) => handleFilterChange('country', value)}
                    style={{ width: '100%', marginTop: '8px' }}
                  />
                </div>

                {/* State Filter */}
                <div>
                  <Text strong>Location</Text>
                  <StateFilter
                    value={selectedStates}
                    onChange={handleStateChange}
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
                    onChange={(value) => handleFilterChange('breed', value)}
                    allowClear
                    showSearch
                    showBreedInfo={false}
                    showBreederCount={false}
                    includeOnlyBreeds={availableFilters?.availableBreeds}
                  />
                </div>

                {/* Gender Filter */}
                <div>
                  <Text strong>Gender</Text>
                  <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    placeholder="Select gender"
                    value={filters.gender}
                    onChange={(value) => handleFilterChange('gender', value)}
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
                      onChange={(e) => handleFilterChange('shipping', e.target.checked)}
                    >
                      Shipping Available
                    </Checkbox>
                    <Checkbox
                      checked={filters.verified}
                      onChange={(e) => handleFilterChange('verified', e.target.checked)}
                    >
                      Verified Kennels Only
                    </Checkbox>
                  </Space>
                </div>
              </Space>
            </Card>
          )}
        </Col>

        {/* Puppies Grid */}
        <Col xs={24} lg={18}>
          {error && (
            <Alert
              message="Error Loading Puppies"
              description="We're having trouble loading the puppies. Please try again later."
              type="error"
              showIcon
              style={{ marginBottom: '24px' }}
              action={
                <Button size="small" onClick={() => mutate()}>
                  Retry
                </Button>
              }
            />
          )}

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
                {puppies.map((puppy) => (
                  <Col xs={24} sm={12} lg={8} key={puppy.id}>
                    <Card
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
                          <img
                            src={puppy.image || puppy.photoUrl || '/placeholder-puppy.jpg'}
                            alt={puppy.name}
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              // Fallback to a generic puppy image if the current one fails
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://placedog.net/400/300';
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap'
                          }}>
                            {puppy.kennel?.isActive && (
                              <Tag color="green" icon={<CheckCircleOutlined />}>
                                Active Kennel
                              </Tag>
                            )}
                            <Tag color="blue">
                              {puppy.ageWeeks} weeks
                            </Tag>
                            <Tag color="orange" icon={<TruckOutlined />}>
                              Ships
                            </Tag>
                            <Tag color="purple" icon={<HomeOutlined />}>
                              Pickup
                            </Tag>
                          </div>
                          {user && (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                            }}>
                              <Button
                                type="text"
                                shape="circle"
                                size="large"
                                icon={combinedFavoriteStatus[puppy.id] ? 
                                  <HeartFilled style={{ color: '#ff4d4f' }} /> : 
                                  <HeartOutlined />
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFavoriteToggle(puppy.id);
                                }}
                                style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                  border: 'none',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                }}
                              />
                            </div>
                          )}
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

                        {/* Kennel Section */}
                        <div style={{ marginBottom: '8px' }}>
                          <Text strong style={{ fontSize: '13px' }}>
                            Kennel: {puppy.kennel?.name || 'Unknown Kennel'}
                          </Text>
                          {puppy.kennel?.specialties && puppy.kennel.specialties.length > 0 && (
                            <div style={{ marginTop: '4px' }}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Specializes in: {puppy.kennel.specialties.join(', ')}
                              </Text>
                            </div>
                          )}
                        </div>

                        {/* Color Section */}
                        <div style={{ marginBottom: '8px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            <strong>Color:</strong> {puppy.color}
                          </Text>
                        </div>

                        {/* Description Section */}
                        {puppy.description && (
                          <div style={{ marginBottom: '12px', flex: 1 }}>
                            <Text style={{ fontSize: '12px', lineHeight: '1.4' }}>
                              {puppy.description.length > 100 
                                ? `${puppy.description.substring(0, 100)}...` 
                                : puppy.description
                              }
                            </Text>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                          <Button
                            type="primary"
                            block
                            icon={<MessageOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContactPuppy(puppy);
                            }}
                            style={{
                              backgroundColor: '#FA8072',
                              borderColor: '#FA8072',
                              height: '40px',
                              fontSize: '14px',
                              fontWeight: '500',
                            }}
                          >
                            Contact Kennel
                          </Button>
                        </div>
                      </div>
                    </Card>
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

      {/* Contact Modal */}
      {selectedPuppy && (
        <ContactBreederModal
          visible={contactModalVisible}
          onCancel={handleCloseModal}
          puppyName={selectedPuppy.name}
          breederName={selectedPuppy.kennel?.name || 'Unknown Kennel'}
          senderName={user?.name || user?.displayName || 'Guest User'}
          senderEmail={user?.email || 'support@homeforpup.com'}
        />
      )}

      {/* Structured Data */}
      <StructuredData 
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Available Puppies', url: '/available-puppies' }
        ])} 
      />
    </div>
  );
};

export default AvailablePuppiesPage;
