'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Typography, Input, Select, Tag, Progress, Space, Button, 
  Spin, Alert, Pagination, Badge, Tooltip, Statistic, Avatar
} from 'antd';
import { 
  SearchOutlined, 
  HomeOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  LoadingOutlined,
  StarOutlined,
  InfoCircleOutlined,
  UserOutlined,
  FilterOutlined,
  SortAscendingOutlined
} from '@ant-design/icons';
import Image from 'next/image';
import useSWR from 'swr';
import { useMemo } from 'react';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// Enhanced breed interface matching API
interface Breed {
  id: string;
  name: string;
  category: string;
  size: string;
  image: string;
  images?: string[];
  overview: string;
  characteristics: {
    energyLevel: number;
    friendliness: number;
    trainability: number;
    groomingNeeds: number;
    goodWithKids: number;
    goodWithPets: number;
  };
  physicalTraits: {
    weight: string;
    height: string;
    lifespan: string;
    coat: string;
  };
  temperament: string[];
  idealFor: string[];
  exerciseNeeds: string;
  commonHealthIssues: string[];
  groomingTips: string;
  trainingTips: string;
  funFacts: string[];
  breedType: string; // 'purebred', 'hybrid', 'designer'
  hybrid: boolean;
  altNames: string[];
  url: string;
  breederCount?: number;
}

interface BreedsResponse {
  breeds: Breed[];
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
    availableCategories: string[];
    availableSizes: string[];
    availableBreedTypes: string[];
    totalBreeders: number;
  };
}

// SWR fetcher
const fetcher = async (url: string): Promise<BreedsResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch breeds');
  }
  return response.json();
};

// Filter options
const categories = ["All", "Sporting", "Non-Sporting", "Toy", "Herding", "Working", "Hound", "Terrier", "Mixed"];
const sizes = ["All", "Small", "Medium", "Large"];
const breedTypes = ["All", "purebred", "hybrid", "designer"];
const sortOptions = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'popularity', label: 'Popularity (Most Breeders)' },
  { value: 'breedType', label: 'Breed Type' }
];
const pageSizeOptions = [6, 12, 24, 48];

const BreedsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedBreedType, setSelectedBreedType] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [expandedBreed, setExpandedBreed] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Build API URL
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    if (selectedCategory !== 'All') params.append('category', selectedCategory);
    if (selectedSize !== 'All') params.append('size', selectedSize);
    if (selectedBreedType !== 'All') params.append('breedType', selectedBreedType);
    params.append('sortBy', sortBy);
    params.append('page', currentPage.toString());
    params.append('limit', pageSize.toString());
    
    return `/api/breeds?${params.toString()}`;
  }, [debouncedSearchTerm, selectedCategory, selectedSize, selectedBreedType, sortBy, currentPage, pageSize]);

  // SWR data fetching
  const { data, error, isLoading, mutate } = useSWR<BreedsResponse>(apiUrl, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  const breeds = data?.breeds || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const filters = data?.filters;

  // Breed type color mapping
  const getBreedTypeColor = (breedType: string): string => {
    const colors = {
      'purebred': 'blue',
      'hybrid': 'orange',
      'designer': 'purple'
    };
    return colors[breedType as keyof typeof colors] || 'default';
  };

  // Characteristic bar component
  const renderCharacteristicBar = (label: string, value: number, color: string) => (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <Text style={{ fontSize: '12px', fontWeight: 500 }}>{label}</Text>
        <Text style={{ fontSize: '12px', color: '#666' }}>{value}/10</Text>
      </div>
      <Progress 
        percent={value * 10} 
        showInfo={false} 
        strokeColor={color}
        trailColor="#f0f0f0"
        size="small"
        strokeWidth={6}
      />
    </div>
  );

  // Enhanced breed image component
  const renderBreedImage = (breed: Breed) => {
    const fallbackImage = `https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&q=80&auto=format&fit=crop`;
    
    const handleImageError = (e: any) => {
      e.currentTarget.src = fallbackImage;
    };

    return (
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <Image
          src={breed.image || fallbackImage}
          alt={breed.name}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={handleImageError}
          priority
        />
        
        {/* Breed type badge */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          zIndex: 2
        }}>
          <Tag color={getBreedTypeColor(breed.breedType)} style={{ fontSize: '11px', fontWeight: 500 }}>
            {breed.breedType.charAt(0).toUpperCase() + breed.breedType.slice(1)}
          </Tag>
        </div>

        {/* Breeder count badge */}
        {breed.breederCount !== undefined && breed.breederCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(22, 119, 255, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 500,
            zIndex: 2
          }}>
            {breed.breederCount} breeder{breed.breederCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  };

  // Event handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
    setExpandedBreed(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedCategory('All');
    setSelectedSize('All');
    setSelectedBreedType('All');
    setSortBy('name');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'All' || 
                          selectedSize !== 'All' || selectedBreedType !== 'All';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <Title level={1} style={{ color: '#08979C', marginBottom: '16px' }}>
          Dog Breed Explorer
        </Title>
        <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '700px', margin: '0 auto' }}>
          Discover the perfect breed for your lifestyle. Explore detailed information about temperament, 
          care requirements, available breeders, and what makes each breed unique.
        </Paragraph>
      </div>

      {/* Statistics Banner */}
      {filters && (
        <Card style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: 'none' }}>
          <Row gutter={[24, 16]}>
            <Col xs={12} sm={6}>
              <Statistic 
                title="Total Breeds" 
                value={totalCount} 
                prefix={<StarOutlined style={{ color: '#1890ff' }} />}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic 
                title="Available Breeders" 
                value={filters.totalBreeders} 
                prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic 
                title="Breed Groups" 
                value={filters.availableCategories.length} 
                prefix={<HomeOutlined style={{ color: '#fa8c16' }} />}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic 
                title="Size Categories" 
                value={filters.availableSizes.length} 
                prefix={<InfoCircleOutlined style={{ color: '#722ed1' }} />}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Enhanced Filters */}
      <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
          <FilterOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          <Text strong>Search & Filter</Text>
          {hasActiveFilters && (
            <Badge count="Active" style={{ backgroundColor: '#1890ff', marginLeft: '8px' }} />
          )}
        </div>
        
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={8}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search breeds, temperament, alt names..."
              value={searchTerm}
              onChange={handleSearchChange}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={12} lg={4}>
            <Select
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Category"
              size="large"
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} lg={3}>
            <Select
              style={{ width: '100%' }}
              value={selectedSize}
              onChange={setSelectedSize}
              placeholder="Size"
              size="large"
            >
              {sizes.map(size => (
                <Option key={size} value={size}>{size}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} lg={3}>
            <Select
              style={{ width: '100%' }}
              value={selectedBreedType}
              onChange={setSelectedBreedType}
              placeholder="Type"
              size="large"
            >
              {breedTypes.map(type => (
                <Option key={type} value={type}>
                  {type === 'All' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} lg={3}>
            <Select
              style={{ width: '100%' }}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Sort by"
              size="large"
              suffixIcon={<SortAscendingOutlined />}
            >
              {sortOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} lg={3}>
            <Space style={{ width: '100%' }}>
              <Button 
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                style={{ width: '100%' }}
              >
                Clear All
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Results per page */}
        <Row style={{ marginTop: '16px' }}>
          <Col>
            <Space align="center">
              <Text>Show:</Text>
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
          </Col>
        </Row>
      </Card>

      {/* Error State */}
      {error && (
        <Alert
          message="Error Loading Breeds"
          description="There was an error loading the breed data. Please try again later."
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
            tip="Loading breeds..."
          />
        </div>
      )}

      {/* Results Count */}
      {!isLoading && !error && (
        <div style={{ marginBottom: '24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Text>
                  Showing <Text strong>{data?.startIndex || 0}-{data?.endIndex || 0}</Text> of <Text strong>{totalCount}</Text> breed{totalCount !== 1 ? 's' : ''}
                </Text>
                {hasActiveFilters && (
                  <Text type="secondary">(filtered results)</Text>
                )}
              </Space>
            </Col>
            <Col>
              {totalPages > 1 && (
                <Text type="secondary">Page {currentPage} of {totalPages}</Text>
              )}
            </Col>
          </Row>
        </div>
      )}

      {/* Breed Cards */}
      {!isLoading && !error && (
        <>
          <Row gutter={[16, 16]}>
            {breeds.map((breed, index) => (
              <Col xs={24} lg={8} key={breed.id}>
                <Card 
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    marginBottom: '16px',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer'
                  }}
                  cover={renderBreedImage(breed)}
                  loading={isLoading}
                  hoverable
                >
                  {/* Header */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <Title level={4} style={{ margin: 0, marginBottom: '4px' }}>{breed.name}</Title>
                        {breed.altNames.length > 0 && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Also: {breed.altNames.slice(0, 2).join(', ')}
                            {breed.altNames.length > 2 && '...'}
                          </Text>
                        )}
                      </div>
                      <Space direction="vertical" size={4}>
                        <Tag color="blue">{breed.category}</Tag>
                        <Tag color="green">{breed.size}</Tag>
                      </Space>
                    </div>
                    <Paragraph style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                      {breed.overview}
                    </Paragraph>
                  </div>

                  {/* Physical Traits */}
                  <Row gutter={[8, 8]} style={{ marginBottom: '16px' }}>
                    <Col span={8}>
                      <div style={{ textAlign: 'center', padding: '8px', background: '#f8f9fa', borderRadius: '6px' }}>
                        <Text style={{ fontSize: '11px', color: '#666', display: 'block' }}>Weight</Text>
                        <Text style={{ fontWeight: 'bold', fontSize: '13px' }}>{breed.physicalTraits.weight}</Text>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: 'center', padding: '8px', background: '#f8f9fa', borderRadius: '6px' }}>
                        <Text style={{ fontSize: '11px', color: '#666', display: 'block' }}>Height</Text>
                        <Text style={{ fontWeight: 'bold', fontSize: '13px' }}>{breed.physicalTraits.height}</Text>
                      </div>
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: 'center', padding: '8px', background: '#f8f9fa', borderRadius: '6px' }}>
                        <Text style={{ fontSize: '11px', color: '#666', display: 'block' }}>Lifespan</Text>
                        <Text style={{ fontWeight: 'bold', fontSize: '13px' }}>{breed.physicalTraits.lifespan}</Text>
                      </div>
                    </Col>
                  </Row>

                  {/* Characteristics */}
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>Key Traits:</Text>
                    <Row gutter={8}>
                      <Col span={12}>
                        {renderCharacteristicBar("Energy", breed.characteristics.energyLevel, "#FA8072")}
                        {renderCharacteristicBar("Friendly", breed.characteristics.friendliness, "#08979C")}
                        {renderCharacteristicBar("Trainable", breed.characteristics.trainability, "#52c41a")}
                      </Col>
                      <Col span={12}>
                        {renderCharacteristicBar("w/ Kids", breed.characteristics.goodWithKids, "#1890ff")}
                        {renderCharacteristicBar("Grooming", breed.characteristics.groomingNeeds, "#722ed1")}
                        {renderCharacteristicBar("w/ Pets", breed.characteristics.goodWithPets, "#fa8c16")}
                      </Col>
                    </Row>
                  </div>

                  {/* Temperament */}
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>Temperament:</Text>
                    <Space wrap size={[4, 4]}>
                      {breed.temperament.slice(0, 4).map(trait => (
                        <Tag key={trait} color="default" style={{ fontSize: '11px' }}>{trait}</Tag>
                      ))}
                      {breed.temperament.length > 4 && (
                        <Tooltip title={breed.temperament.slice(4).join(', ')}>
                          <Tag style={{ fontSize: '11px' }}>+{breed.temperament.length - 4} more</Tag>
                        </Tooltip>
                      )}
                    </Space>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      type="text"
                      size="small"
                      onClick={() => setExpandedBreed(expandedBreed === index ? null : index)}
                    >
                      {expandedBreed === index ? 'Show Less' : 'Learn More'}
                    </Button>
                    
                    <Space>
                      {breed.breederCount && breed.breederCount > 0 ? (
                        <Button
                          type="primary"
                          size="small"
                          style={{ background: '#1890ff', borderColor: '#1890ff' }}
                          onClick={() => window.open(`/breeders?breed=${encodeURIComponent(breed.name)}`, '_blank')}
                        >
                          Find Breeders ({breed.breederCount})
                        </Button>
                      ) : (
                        <Tooltip title="No active breeders found">
                          <Button
                            size="small"
                            disabled
                          >
                            No Breeders
                          </Button>
                        </Tooltip>
                      )}
                    </Space>
                  </div>

                  {/* Expanded Details */}
                  {expandedBreed === index && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {/* Exercise & Care */}
                        <div>
                          <Text strong style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <ThunderboltOutlined style={{ marginRight: '6px', color: '#FA8072' }} />
                            Exercise & Care
                          </Text>
                          <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '6px' }}>
                            <div style={{ marginBottom: '8px' }}>
                              <Text style={{ fontSize: '13px', fontWeight: 500 }}>Exercise Needs: </Text>
                              <Text style={{ fontSize: '13px' }}>{breed.exerciseNeeds}</Text>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              <Text style={{ fontSize: '13px', fontWeight: 500 }}>Coat: </Text>
                              <Text style={{ fontSize: '13px' }}>{breed.physicalTraits.coat}</Text>
                            </div>
                            <div>
                              <Text style={{ fontSize: '13px', fontWeight: 500 }}>Grooming: </Text>
                              <Text style={{ fontSize: '13px' }}>{breed.groomingTips}</Text>
                            </div>
                          </div>
                        </div>

                        {/* Ideal For */}
                        <div>
                          <Text strong style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <HomeOutlined style={{ marginRight: '6px', color: '#08979C' }} />
                            Ideal For
                          </Text>
                          <Space wrap size={[4, 4]}>
                            {breed.idealFor.map(ideal => (
                              <Tag key={ideal} color="blue" style={{ fontSize: '11px' }}>{ideal}</Tag>
                            ))}
                          </Space>
                        </div>

                        {/* Health & Training */}
                        <div>
                          <Text strong style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <SafetyOutlined style={{ marginRight: '6px', color: '#52c41a' }} />
                            Health & Training
                          </Text>
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            <div style={{ marginBottom: '4px' }}>
                              <Text strong>Training: </Text>{breed.trainingTips}
                            </div>
                            <div>
                              <Text strong>Health: </Text>{breed.commonHealthIssues.join(', ')}
                            </div>
                          </div>
                        </div>

                        {/* Fun Facts */}
                        <div>
                          <Text strong style={{ marginBottom: '8px', display: 'block' }}>Did You Know?</Text>
                          <div style={{ background: '#f0f9ff', padding: '10px', borderRadius: '6px', border: '1px solid #e6f7ff' }}>
                            {breed.funFacts.slice(0, 3).map((fact, factIndex) => (
                              <div key={factIndex} style={{ fontSize: '13px', marginBottom: factIndex < 2 ? '4px' : 0 }}>
                                • {fact}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Breed Type Info */}
                        <div style={{ 
                          background: `linear-gradient(135deg, ${getBreedTypeColor(breed.breedType) === 'blue' ? '#e6f7ff' : getBreedTypeColor(breed.breedType) === 'orange' ? '#fff2e6' : '#f6f0ff'} 0%, #fafafa 100%)`,
                          padding: '12px',
                          borderRadius: '6px',
                          border: `1px solid ${getBreedTypeColor(breed.breedType) === 'blue' ? '#91d5ff' : getBreedTypeColor(breed.breedType) === 'orange' ? '#ffd591' : '#d3adf7'}`
                        }}>
                          <Text strong style={{ fontSize: '13px', textTransform: 'capitalize' }}>
                            {breed.breedType} Breed
                          </Text>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            {breed.breedType === 'purebred' && 'Recognized purebred with established standards'}
                            {breed.breedType === 'hybrid' && 'Cross between two purebred parents'}
                            {breed.breedType === 'designer' && 'Intentionally bred hybrid with specific traits'}
                          </div>
                        </div>
                      </Space>
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>

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
                  `${range[0]}-${range[1]} of ${total} breeds`
                }
                pageSizeOptions={pageSizeOptions.map(String)}
                showSizeChanger
                showQuickJumper={totalPages > 10}
                size="default"
                style={{ marginBottom: '16px' }}
              />
            </div>
          )}
        </>
      )}

      {/* No Results */}
      {!isLoading && !error && breeds.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#fafafa',
          borderRadius: '12px'
        }}>
          <Title level={4}>No breeds found</Title>
          <Paragraph>
            {hasActiveFilters 
              ? 'Try adjusting your search terms or filters to find more breeds'
              : 'No breed data available at the moment'
            }
          </Paragraph>
          <Space>
            {hasActiveFilters && (
              <Button type="primary" onClick={clearFilters}>Clear All Filters</Button>
            )}
            <Button onClick={() => mutate()}>Refresh Data</Button>
          </Space>
        </div>
      )}
    </div>
  );
};

export default BreedsPage;