'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Typography, Select, Input, Button, Rate, Tag, Avatar, Space, 
  Checkbox, Slider, Badge, Divider, Spin, Alert, Pagination, Statistic, Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  CheckCircleOutlined, 
  HeartOutlined,
  EyeOutlined,
  FilterOutlined,
  TrophyOutlined,
  LoadingOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  CalendarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import useSWR from 'swr';
import { useMemo } from 'react';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// Breeder interface matching API response
interface Breeder {
  id: number;
  name: string;
  businessName: string;
  location: string;
  state: string;
  city: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
  phone: string;
  email: string;
  website: string;
  experience: number;
  breeds: string[];
  breedIds: number[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  profileImage: string;
  coverImage: string;
  about: string;
  certifications: string[];
  healthTesting: string[];
  specialties: string[];
  currentLitters: number;
  availablePuppies: number;
  pricing: string;
  shipping: boolean;
  pickupAvailable: boolean;
  establishedYear?: number;
  businessHours: string;
  appointmentRequired: boolean;
  socialMedia: Record<string, string>;
  tags: string[];
  responseRate: number;
  avgResponseTime: string;
  lastUpdated: string;
}

interface BreedersResponse {
  breeders: Breeder[];
  count: number;
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  filters: {
    availableStates: string[];
    availableBreeds: string[];
    availableCertifications: string[];
    availableSpecialties: string[];
    averageRating: number;
    totalAvailablePuppies: number;
    verifiedCount: number;
  };
  stats: {
    averageExperience: number;
    verifiedPercentage: number;
    shippingAvailable: number;
    withAvailablePuppies: number;
  };
}

// SWR fetcher
const fetcher = async (url: string): Promise<BreedersResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch breeders');
  }
  return response.json();
};

// Sort options
const sortOptions = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'experience', label: 'Most Experience' },
  { value: 'distance', label: 'Nearest' },
  { value: 'reviews', label: 'Most Reviews' },
  { value: 'availability', label: 'Most Available Puppies' },
  { value: 'name', label: 'Name (A-Z)' }
];

const pageSizeOptions = [10, 20, 30, 50];

const BreederDirectoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [filters, setFilters] = useState({
    states: [] as string[],
    verified: false,
    shipping: false,
    availablePuppies: false,
    minRating: 0,
    experienceRange: [0, 25] as [number, number]
  });
  const [sortBy, setSortBy] = useState('rating');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Get user location for distance calculation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or failed:', error);
        }
      );
    }
  }, []);

  // Build API URL
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    if (selectedBreed) params.append('breed', selectedBreed);
    if (filters.states.length > 0) params.append('state', filters.states[0]); // For simplicity, use first state
    if (filters.verified) params.append('verified', 'true');
    if (filters.shipping) params.append('shipping', 'true');
    if (filters.availablePuppies) params.append('availablePuppies', 'true');
    if (filters.minRating > 0) params.append('minRating', filters.minRating.toString());
    if (filters.experienceRange[0] > 0) params.append('minExperience', filters.experienceRange[0].toString());
    if (filters.experienceRange[1] < 25) params.append('maxExperience', filters.experienceRange[1].toString());
    
    params.append('sortBy', sortBy);
    params.append('page', currentPage.toString());
    params.append('limit', pageSize.toString());
    
    if (userLocation) {
      params.append('userLat', userLocation.lat.toString());
      params.append('userLon', userLocation.lon.toString());
    }
    
    return `/api/breeders?${params.toString()}`;
  }, [debouncedSearchTerm, selectedBreed, filters, sortBy, currentPage, pageSize, userLocation]);

  // SWR data fetching
  const { data, error, isLoading, mutate } = useSWR<BreedersResponse>(apiUrl, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  const breeders = data?.breeders || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const breederFilters = data?.filters;
  const stats = data?.stats;

  // Check if any filters are active
  const hasActiveFilters = debouncedSearchTerm !== '' || selectedBreed !== '' || 
                          filters.states.length > 0 || filters.verified || 
                          filters.shipping || filters.availablePuppies || 
                          filters.minRating > 0 || filters.experienceRange[0] > 0 || 
                          filters.experienceRange[1] < 25;

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedBreed('');
    setFilters({
      states: [],
      verified: false,
      shipping: false,
      availablePuppies: false,
      minRating: 0,
      experienceRange: [0, 25]
    });
    setSortBy('rating');
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRandomCoverPhoto = (breederId: number) => {
  const dogPhotos = [
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=300&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=300&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&h=300&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=300&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1559190394-90ab6371c552?w=800&h=300&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=300&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=300&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800&h=300&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=300&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=800&h=300&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800&h=300&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1546975490-e8b92a360b24?w=800&h=300&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=800&h=300&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&h=300&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&h=300&fit=crop&crop=faces'
  ];
  
  // Use breeder ID as seed for consistent random selection
  return dogPhotos[breederId % dogPhotos.length];
};

  // Render breeder card
  const renderBreederCard = (breeder: Breeder) => (
    <Card 
      key={breeder.id} 
      style={{
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        marginBottom: '16px',
        overflow: 'hidden'
      }} 
      hoverable
    >
      <Row gutter={16}>
        {/* Cover Image */}
        <Col span={24}>
          <div 
            style={{
              height: '120px',
              backgroundImage: `url(${breeder.coverImage || getRandomCoverPhoto(breeder.id)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '8px',
              position: 'relative',
              marginBottom: '16px'
            }}
            onError={(e) => {
              e.currentTarget.style.backgroundImage = `url(${getRandomCoverPhoto(breeder.id)})`;
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: '12px', 
              right: '12px',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {breeder.verified && (
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  Verified
                </Tag>
              )}
              {breeder.availablePuppies > 0 && (
                <Tag color="red">
                  {breeder.availablePuppies} Available
                </Tag>
              )}
              {breeder.shipping && (
                <Tag color="blue">
                  Ships Nationwide
                </Tag>
              )}
            </div>

            {/* Distance badge */}
            {breeder.distance && (
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {breeder.distance} miles
              </div>
            )}
          </div>
        </Col>

        {/* Profile Section */}
        <Col xs={24} sm={6}>
          <div style={{ textAlign: 'center' }}>
            <Avatar 
              size={80} 
              src={breeder.profileImage} 
              style={{ 
                marginBottom: '8px', 
                border: '3px solid white', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
              }}
              onError={() => true}
            />
            <div>
              <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
                {breeder.businessName}
              </Title>
              <Text type="secondary" style={{ fontSize: '13px' }}>
                {breeder.name}
              </Text>
            </div>
            <div style={{ marginTop: '8px' }}>
              <Rate 
                disabled 
                value={breeder.rating} 
                style={{ fontSize: '12px' }} 
                allowHalf
              />
              <div style={{ fontSize: '11px', color: '#666' }}>
                {breeder.rating.toFixed(1)} ({breeder.reviewCount} reviews)
              </div>
            </div>
          </div>
        </Col>

        {/* Details Section */}
        <Col xs={24} sm={18}>
          <Row gutter={[16, 8]}>
            {/* Contact Info */}
            <Col xs={24} sm={12}>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <div>
                  <EnvironmentOutlined style={{ color: '#08979C', marginRight: '6px' }} />
                  <Text style={{ fontSize: '13px' }}>
                    {breeder.location}
                    {breeder.distance && ` (${breeder.distance} mi)`}
                  </Text>
                </div>
                <div>
                  <TrophyOutlined style={{ color: '#FA8072', marginRight: '6px' }} />
                  <Text style={{ fontSize: '13px' }}>
                    {breeder.experience} years experience
                  </Text>
                </div>
                <div>
                  <TeamOutlined style={{ color: '#1890ff', marginRight: '6px' }} />
                  <Text style={{ fontSize: '13px' }}>
                    {breeder.currentLitters} litter{breeder.currentLitters !== 1 ? 's' : ''}, {breeder.availablePuppies} available
                  </Text>
                </div>
                {breeder.establishedYear && (
                  <div>
                    <CalendarOutlined style={{ color: '#722ed1', marginRight: '6px' }} />
                    <Text style={{ fontSize: '13px' }}>
                      Est. {breeder.establishedYear}
                    </Text>
                  </div>
                )}
              </Space>
            </Col>

            {/* Breeds & Specialties */}
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: '12px' }}>
                <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                  Breeds:
                </Text>
                <div>
                  {breeder.breeds.slice(0, 3).map((breed: string) => (
                    <Tag key={breed} color="blue" style={{ marginBottom: '2px', fontSize: '11px' }}>
                      {breed}
                    </Tag>
                  ))}
                  {breeder.breeds.length > 3 && (
                    <Tooltip title={breeder.breeds.slice(3).join(', ')}>
                      <Tag style={{ fontSize: '11px' }}>
                        +{breeder.breeds.length - 3} more
                      </Tag>
                    </Tooltip>
                  )}
                </div>
              </div>

              {breeder.specialties.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                    Specialties:
                  </Text>
                  <div>
                    {breeder.specialties.slice(0, 2).map((specialty: string) => (
                      <Tag key={specialty} color="purple" style={{ fontSize: '11px' }}>
                        {specialty}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Col>

            {/* About */}
            <Col span={24}>
              <Paragraph 
                ellipsis={{ rows: 2, expandable: true, symbol: 'more' }} 
                style={{ margin: '8px 0', fontSize: '13px', color: '#666' }}
              >
                {breeder.about}
              </Paragraph>
            </Col>

            {/* Health Testing & Certifications */}
            <Col span={24}>
              <Row gutter={16}>
                {breeder.healthTesting.length > 0 && (
                  <Col xs={24} sm={12}>
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong style={{ fontSize: '12px', color: '#52c41a' }}>
                        Health Testing:
                      </Text>
                      <div style={{ marginTop: '2px' }}>
                        {breeder.healthTesting.slice(0, 2).map((test: string) => (
                          <Tag key={test} color="green" style={{ fontSize: '10px', marginBottom: '2px' }}>
                            {test}
                          </Tag>
                        ))}
                        {breeder.healthTesting.length > 2 && (
                          <Tooltip title={breeder.healthTesting.slice(2).join(', ')}>
                            <Tag style={{ fontSize: '10px' }}>
                              +{breeder.healthTesting.length - 2}
                            </Tag>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </Col>
                )}

                {breeder.certifications.length > 0 && (
                  <Col xs={24} sm={12}>
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong style={{ fontSize: '12px', color: '#1890ff' }}>
                        Certifications:
                      </Text>
                      <div style={{ marginTop: '2px' }}>
                        {breeder.certifications.slice(0, 2).map((cert: string) => (
                          <Tag key={cert} color="cyan" style={{ fontSize: '10px', marginBottom: '2px' }}>
                            {cert}
                          </Tag>
                        ))}
                        {breeder.certifications.length > 2 && (
                          <Tooltip title={breeder.certifications.slice(2).join(', ')}>
                            <Tag style={{ fontSize: '10px' }}>
                              +{breeder.certifications.length - 2}
                            </Tag>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </Col>

            {/* Business Info & Actions */}
            <Col span={24}>
              <Divider style={{ margin: '12px 0' }} />
              <Row justify="space-between" align="middle">
                <Col xs={24} sm={16}>
                  <Space wrap>
                    <Text strong style={{ color: '#08979C', fontSize: '14px' }}>
                      {breeder.pricing}
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#666' }}>
                      Response: {breeder.avgResponseTime}
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#666' }}>
                      Rate: {Math.round(breeder.responseRate * 100)}%
                    </Text>
                  </Space>
                  
                  <div style={{ marginTop: '4px' }}>
                    <Space wrap size={[4, 4]}>
                      {breeder.appointmentRequired && (
                        <Tag color="orange" style={{ fontSize: '10px' }}>
                          Appointment Required
                        </Tag>
                      )}
                      {breeder.pickupAvailable && (
                        <Tag color="geekblue" style={{ fontSize: '10px' }}>
                          Pickup Available
                        </Tag>
                      )}
                    </Space>
                  </div>
                </Col>

                <Col xs={24} sm={8}>
                  <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
                    <Tooltip title="Save to favorites">
                      <Button 
                        type="text" 
                        icon={<HeartOutlined />} 
                        size="small"
                      />
                    </Tooltip>
                    
                    {/* Contact buttons */}
                    {breeder.phone && (
                      <Tooltip title={breeder.phone}>
                        <Button 
                          type="text" 
                          icon={<PhoneOutlined />} 
                          size="small"
                          onClick={() => window.open(`tel:${breeder.phone}`)}
                        />
                      </Tooltip>
                    )}
                    
                    {breeder.email && (
                      <Tooltip title={breeder.email}>
                        <Button 
                          type="text" 
                          icon={<MailOutlined />} 
                          size="small"
                          onClick={() => window.open(`mailto:${breeder.email}`)}
                        />
                      </Tooltip>
                    )}
                    
                    {breeder.website && (
                      <Tooltip title={breeder.website}>
                        <Button 
                          type="text" 
                          icon={<GlobalOutlined />} 
                          size="small"
                          onClick={() => window.open(`https://${breeder.website}`, '_blank')}
                        />
                      </Tooltip>
                    )}

                    <Link href={`/breeders/${breeder.id}`}>
                      <Button 
                        type="primary" 
                        icon={<EyeOutlined />}
                        size="small"
                        style={{ background: '#FA8072', borderColor: '#FA8072' }}
                      >
                        View Profile
                      </Button>
                    </Link>
                  </Space>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Title level={1} style={{ color: '#08979C' }}>
          Connect with Caring Dog Families
        </Title>
        <Paragraph style={{ fontSize: '18px', color: '#595959', maxWidth: '700px', margin: '0 auto' }}>
          Get to know passionate dog lovers dedicated to raising happy, healthy pups with lots of love
        </Paragraph>
      </div>

      {/* Statistics Banner */}
      {stats && breederFilters && (
        <Card style={{ 
          marginBottom: '24px', 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
          border: 'none' 
        }}>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Statistic 
                title="Total Breeders" 
                value={totalCount} 
                prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic 
                title="Available Puppies" 
                value={breederFilters.totalAvailablePuppies} 
                prefix={<HeartOutlined style={{ color: '#fa8c16' }} />}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic 
                title="Verified Breeders" 
                value={`${stats.verifiedPercentage}%`} 
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic 
                title="Avg Experience" 
                value={`${stats.averageExperience} years`} 
                prefix={<TrophyOutlined style={{ color: '#722ed1' }} />}
              />
            </Col>
          </Row>
        </Card>
      )}

      <Row gutter={[24, 24]}>
        {/* Filters Sidebar */}
        <Col xs={24} lg={6}>
          <Card 
            title={
              <Space>
                <FilterOutlined />
                <span>Filters</span>
                {hasActiveFilters && (
                  <Badge count="Active" style={{ backgroundColor: '#1890ff' }} />
                )}
              </Space>
            }
            style={{ position: 'sticky', top: '20px' }}
          >
            {/* Search */}
            <div style={{ marginBottom: '16px' }}>
              <Input
                placeholder="Search breeders, breeds..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                size="large"
              />
            </div>

            {/* Breed Filter */}
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Breed</Text>
              <Select
                style={{ width: '100%', marginTop: '8px' }}
                placeholder="Select breed"
                value={selectedBreed}
                onChange={setSelectedBreed}
                allowClear
                showSearch
                filterOption={(input, option) => {
                  // Use label property which is more reliable in newer Ant Design versions
                  const label = option?.label || option?.children;
                  const searchText = String(label || '');
                  return searchText.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {breederFilters?.availableBreeds.map(breed => (
                  <Option key={breed} value={breed}>{breed}</Option>
                ))}
              </Select>
            </div>

            {/* State Filter */}
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Location</Text>
              <Select
                mode="multiple"
                style={{ width: '100%', marginTop: '8px' }}
                placeholder="Select states"
                value={filters.states}
                onChange={(value) => setFilters(prev => ({ ...prev, states: value }))}
                maxTagCount={2}
              >
                {breederFilters?.availableStates.map(state => (
                  <Option key={state} value={state}>{state}</Option>
                ))}
              </Select>
            </div>

            {/* Experience Range */}
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Experience (Years)</Text>
              <Slider
                range
                min={0}
                max={25}
                step={1}
                value={filters.experienceRange}
                onChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  experienceRange: value as [number, number] 
                }))}
                style={{ marginTop: '8px' }}
              />
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
                {filters.experienceRange[0]} - {filters.experienceRange[1]}+ years
              </div>
            </div>

            {/* Rating Filter */}
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Minimum Rating</Text>
              <div style={{ marginTop: '8px' }}>
                <Rate
                  value={filters.minRating}
                  onChange={(value) => setFilters(prev => ({ ...prev, minRating: value }))}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ marginBottom: '16px' }}>
              <Space direction="vertical">
                <Checkbox
                  checked={filters.verified}
                  onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                >
                  Verified Breeders Only
                </Checkbox>
                <Checkbox
                  checked={filters.shipping}
                  onChange={(e) => setFilters(prev => ({ ...prev, shipping: e.target.checked }))}
                >
                  Shipping Available
                </Checkbox>
                <Checkbox
                  checked={filters.availablePuppies}
                  onChange={(e) => setFilters(prev => ({ ...prev, availablePuppies: e.target.checked }))}
                >
                  Available Puppies Now
                </Checkbox>
              </Space>
            </div>

            <Button
              block
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              Clear All Filters
            </Button>
          </Card>
        </Col>

        {/* Main Content */}
        <Col xs={24} lg={18}>
          {/* Sort and Results Count */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px',
            padding: '16px',
            background: '#fafafa',
            borderRadius: '8px'
          }}>
            <Text>
              <Text strong>{data?.startIndex || 0}-{data?.endIndex || 0}</Text> of <Text strong>{totalCount}</Text> dog families
              {hasActiveFilters && <Text type="secondary"> (filtered)</Text>}
            </Text>
            <Space>
              <Text style={{ marginRight: '8px' }}>Sort by:</Text>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: '160px' }}
              >
                {sortOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
              
              <Select
                value={pageSize}
                onChange={(value) => {
                  setPageSize(value);
                  setCurrentPage(1);
                }}
                style={{ width: '120px' }}
              >
                {pageSizeOptions.map(size => (
                  <Option key={size} value={size}>{size} per page</Option>
                ))}
              </Select>
            </Space>
          </div>

          {/* Error State */}
          {error && (
            <Alert
              message="Error Loading Breeders"
              description="There was an error loading the breeder data. Please try again later."
              type="error"
              showIcon
              style={{ marginBottom: '24px' }}
              action={<Button size="small" onClick={() => mutate()}>Retry</Button>}
            />
          )}

          {/* Loading State */}
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Spin 
                indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
                tip="Loading breeders..."
              />
            </div>
          )}

          {/* Breeder Listings */}
          {!isLoading && !error && (
            <>
              <div>
                {breeders.map(renderBreederCard)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ 
                  marginTop: '32px', 
                  textAlign: 'center',
                  padding: '24px',
                  background: '#fafafa',
                  borderRadius: '12px',
                }}>
                  <Pagination
                    current={currentPage}
                    total={totalCount}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                    onShowSizeChange={(current, size) => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                    showTotal={(total, range) => 
                      `${range[0]}-${range[1]} of ${total} breeders`
                    }
                    pageSizeOptions={pageSizeOptions.map(String)}
                    showSizeChanger
                    showQuickJumper={totalPages > 10}
                    size="default"
                  />
                </div>
              )}
            </>
          )}

          {/* No Results */}
          {!isLoading && !error && breeders.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: '#fafafa',
              borderRadius: '12px'
            }}>
              <Title level={4}>No dog families found</Title>
              <Paragraph>
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search terms to find more breeders'
                  : 'No breeder data available at the moment'
                }
              </Paragraph>
              <Space>
                {hasActiveFilters && (
                  <Button type="primary" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                )}
                <Button onClick={() => mutate()}>
                  Refresh Data
                </Button>
              </Space>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default BreederDirectoryPage;