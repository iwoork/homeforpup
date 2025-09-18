'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Input, Select, Tag, Progress, Space, Button, Spin, Alert, Pagination, Carousel } from 'antd';
import { 
  SearchOutlined, 
  HomeOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  LoadingOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import Image from 'next/image';
import useSWR from 'swr';
import { useMemo } from 'react';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// Types
interface Breed {
  id: string;
  name: string;
  category: string;
  size: string;
  image: string;
  images?: string[]; // Array of all available images
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
}

// SWR fetcher function
const fetcher = async (url: string): Promise<BreedsResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch breeds');
  }
  return response.json();
};

// Available filter options
const categories = ["All", "Sporting", "Non-Sporting", "Toy", "Herding", "Working", "Hound", "Terrier", "Mixed"];
const sizes = ["All", "Small", "Medium", "Large"];
const pageSizeOptions = [6, 12, 24, 48];

// Custom Arrow components for carousel
const CustomPrevArrow: React.FC<any> = ({ onClick }) => (
  <div 
    className="custom-arrow custom-arrow-prev" 
    onClick={onClick}
    style={{
      position: 'absolute',
      left: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 2,
      background: 'rgba(0,0,0,0.5)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      opacity: 0.8,
      transition: 'opacity 0.3s'
    }}
    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
  >
    <LeftOutlined />
  </div>
);

const CustomNextArrow: React.FC<any> = ({ onClick }) => (
  <div 
    className="custom-arrow custom-arrow-next" 
    onClick={onClick}
    style={{
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 2,
      background: 'rgba(0,0,0,0.5)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      opacity: 0.8,
      transition: 'opacity 0.3s'
    }}
    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
  >
    <RightOutlined />
  </div>
);

const BreedsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [expandedBreed, setExpandedBreed] = useState<number | null>(null);

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Build API URL with query parameters
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    if (selectedCategory !== 'All') params.append('category', selectedCategory);
    if (selectedSize !== 'All') params.append('size', selectedSize);
    params.append('page', currentPage.toString());
    params.append('limit', pageSize.toString());
    
    const url = `/api/breeds?${params.toString()}`;
    console.log('Frontend API URL:', url);
    return url;
  }, [debouncedSearchTerm, selectedCategory, selectedSize, currentPage, pageSize]);

  // SWR hook for data fetching
  const { data, error, isLoading, mutate } = useSWR<BreedsResponse>(apiUrl, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // Cache for 1 minute
  });

  const breeds = data?.breeds || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginBottom: '16px',
    overflow: 'hidden'
  };

  const renderCharacteristicBar = (label: string, value: number, color: string) => (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <Text style={{ fontSize: '12px' }}>{label}</Text>
        <Text style={{ fontSize: '12px' }}>{value}/10</Text>
      </div>
      <Progress 
        percent={value * 10} 
        showInfo={false} 
        strokeColor={color}
        trailColor="#f0f0f0"
        size="small"
      />
    </div>
  );

  // Image rendering component with fallback handling
  const renderBreedImage = (breed: Breed) => {
    const hasMultipleImages = breed.images && breed.images.length > 1;
    
    const fallbackImage = `https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&q=80&auto=format&fit=crop`;
    
    const handleImageError = (e: any) => {
      console.log(`Image failed to load for ${breed.name}:`, e.currentTarget.src);
      e.currentTarget.src = fallbackImage;
    };

    if (hasMultipleImages) {
      return (
        <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
          <Carousel
            autoplay
            autoplaySpeed={4000}
            dots={breed.images!.length > 1}
            arrows={breed.images!.length > 1}
            prevArrow={<CustomPrevArrow />}
            nextArrow={<CustomNextArrow />}
            dotPosition="bottom"
            style={{ height: '100%' }}
          >
            {breed.images!.map((imageUrl, index) => (
              <div key={index}>
                <div style={{ 
                  height: '200px', 
                  position: 'relative',
                  width: '100%'
                }}>
                  <Image
                    src={imageUrl}
                    alt={`${breed.name} - Image ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={handleImageError}
                    priority={index === 0} // Only prioritize the first image
                  />
                </div>
              </div>
            ))}
          </Carousel>
          {/* Image count indicator */}
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            zIndex: 3
          }}>
            {breed.images!.length} photos
          </div>
        </div>
      );
    } else {
      // Single image or fallback
      const imageUrl = breed.image || fallbackImage;
      return (
        <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
          <Image
            src={imageUrl}
            alt={breed.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={handleImageError}
            priority
          />
        </div>
      );
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Note: debouncedSearch will handle setting debouncedSearchTerm and resetting currentPage
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSizeChange = (value: string) => {
    setSelectedSize(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
    setExpandedBreed(null); // Collapse any expanded breed cards
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedCategory('All');
    setSelectedSize('All');
    setCurrentPage(1);
  };

  const refreshData = () => {
    mutate();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <Title level={1} style={{ color: '#08979C', marginBottom: '16px' }}>
          Dog Breed Guide
        </Title>
        <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
          Find the perfect breed for your lifestyle. Learn about temperament, care requirements, 
          and what makes each breed special.
        </Paragraph>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search breeds..."
              value={searchTerm}
              onChange={handleSearchChange}
              allowClear
            />
          </Col>
          <Col xs={24} md={5}>
            <Select
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={handleCategoryChange}
              placeholder="Select category"
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Select
              style={{ width: '100%' }}
              value={selectedSize}
              onChange={handleSizeChange}
              placeholder="Select size"
            >
              {sizes.map(size => (
                <Option key={size} value={size}>{size}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Select
              style={{ width: '100%' }}
              value={pageSize}
              onChange={(value) => handlePageSizeChange(currentPage, value)}
              placeholder="Per page"
            >
              {pageSizeOptions.map(size => (
                <Option key={size} value={size}>{size} per page</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={5}>
            <Space>
              <Button 
                onClick={clearFilters}
                disabled={searchTerm === '' && selectedCategory === 'All' && selectedSize === 'All'}
              >
                Clear Filters
              </Button>
              <Button 
                onClick={refreshData}
                loading={isLoading}
              >
                Refresh
              </Button>
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
          action={
            <Button size="small" onClick={refreshData}>
              Retry
            </Button>
          }
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

      {/* Results Count and Pagination Info */}
      {!isLoading && !error && (
        <div style={{ marginBottom: '24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Text>
                  Showing <Text strong>{data?.startIndex || 0}-{data?.endIndex || 0}</Text> of <Text strong>{totalCount}</Text> breed{totalCount !== 1 ? 's' : ''}
                </Text>
                {(debouncedSearchTerm || selectedCategory !== 'All' || selectedSize !== 'All') && (
                  <Text type="secondary">
                    (Page {currentPage} of {totalPages})
                  </Text>
                )}
              </Space>
            </Col>
            <Col>
              {totalPages > 1 && (
                <Text type="secondary">
                  Total: {totalCount} breeds
                </Text>
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
                  style={cardStyle}
                  cover={renderBreedImage(breed)}
                  loading={isLoading}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <Title level={4} style={{ margin: 0 }}>{breed.name}</Title>
                      <Space>
                        <Tag color="blue">{breed.category}</Tag>
                        <Tag color="green">{breed.size}</Tag>
                      </Space>
                    </div>
                    <Paragraph style={{ margin: 0, color: '#666' }}>
                      {breed.overview}
                    </Paragraph>
                  </div>

                  {/* Quick Stats */}
                  <Row gutter={[8, 8]} style={{ marginBottom: '16px' }}>
                    <Col span={12}>
                      <div style={{ textAlign: 'center', padding: '8px', background: '#f8f9fa', borderRadius: '6px' }}>
                        <Text style={{ fontSize: '12px', color: '#666' }}>Weight</Text>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{breed.physicalTraits.weight}</div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ textAlign: 'center', padding: '8px', background: '#f8f9fa', borderRadius: '6px' }}>
                        <Text style={{ fontSize: '12px', color: '#666' }}>Lifespan</Text>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{breed.physicalTraits.lifespan}</div>
                      </div>
                    </Col>
                  </Row>

                  {/* Key Characteristics */}
                  <div style={{ marginBottom: '16px' }}>
                    <Row gutter={8}>
                      <Col span={12}>
                        {renderCharacteristicBar("Energy Level", breed.characteristics.energyLevel, "#FA8072")}
                        {renderCharacteristicBar("Friendliness", breed.characteristics.friendliness, "#08979C")}
                        {renderCharacteristicBar("Trainability", breed.characteristics.trainability, "#52c41a")}
                      </Col>
                      <Col span={12}>
                        {renderCharacteristicBar("Good with Kids", breed.characteristics.goodWithKids, "#1890ff")}
                        {renderCharacteristicBar("Grooming Needs", breed.characteristics.groomingNeeds, "#722ed1")}
                        {renderCharacteristicBar("Good with Pets", breed.characteristics.goodWithPets, "#fa8c16")}
                      </Col>
                    </Row>
                  </div>

                  {/* Temperament Tags */}
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>Temperament:</Text>
                    <Space wrap size={[4, 4]}>
                      {breed.temperament.slice(0, 4).map(trait => (
                        <Tag key={trait} color="default">{trait}</Tag>
                      ))}
                      {breed.temperament.length > 4 && (
                        <Tag>+{breed.temperament.length - 4} more</Tag>
                      )}
                    </Space>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      type="text"
                      size="small"
                      onClick={() => setExpandedBreed(expandedBreed === index ? null : index)}
                    >
                      {expandedBreed === index ? 'Show Less' : 'Learn More'}
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      style={{ background: '#FA8072', borderColor: '#FA8072' }}
                      onClick={() => window.open(`/browse?breed=${breed.name}`, '_blank')}
                    >
                      Find {breed.name}s
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {expandedBreed === index && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {/* Exercise Needs */}
                        <div>
                          <Text strong style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                            <ThunderboltOutlined style={{ marginRight: '6px', color: '#FA8072' }} />
                            Exercise Needs
                          </Text>
                          <Text style={{ fontSize: '14px' }}>{breed.exerciseNeeds}</Text>
                        </div>

                        {/* Ideal For */}
                        <div>
                          <Text strong style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                            <HomeOutlined style={{ marginRight: '6px', color: '#08979C' }} />
                            Ideal For
                          </Text>
                          <Space wrap size={[4, 4]}>
                            {breed.idealFor.map(ideal => (
                              <Tag key={ideal} color="blue">{ideal}</Tag>
                            ))}
                          </Space>
                        </div>

                        {/* Health Considerations */}
                        <div>
                          <Text strong style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                            <SafetyOutlined style={{ marginRight: '6px', color: '#52c41a' }} />
                            Common Health Issues
                          </Text>
                          <Text style={{ fontSize: '14px' }}>
                            {breed.commonHealthIssues.slice(0, 3).join(', ')}
                            {breed.commonHealthIssues.length > 3 && '...'}
                          </Text>
                        </div>

                        {/* Fun Facts */}
                        <div>
                          <Text strong style={{ marginBottom: '4px', display: 'block' }}>Fun Facts:</Text>
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '14px' }}>
                            {breed.funFacts.slice(0, 2).map((fact, factIndex) => (
                              <li key={factIndex}>{fact}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Image Gallery Info */}
                        {breed.images && breed.images.length > 1 && (
                          <div>
                            <Text strong style={{ marginBottom: '4px', display: 'block' }}>Photo Gallery:</Text>
                            <Text style={{ fontSize: '14px', color: '#666' }}>
                              {breed.images.length} photos available - hover over the image above to browse
                            </Text>
                          </div>
                        )}
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
                onShowSizeChange={handlePageSizeChange}
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} of ${total} breeds`
                }
                pageSizeOptions={pageSizeOptions.map(String)}
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
            {(debouncedSearchTerm || selectedCategory !== 'All' || selectedSize !== 'All') 
              ? 'Try adjusting your search terms or filters'
              : 'No breed data available at the moment'
            }
          </Paragraph>
          <Space>
            {(debouncedSearchTerm || selectedCategory !== 'All' || selectedSize !== 'All') && (
              <Button onClick={clearFilters}>Clear All Filters</Button>
            )}
            <Button onClick={refreshData}>Refresh Data</Button>
          </Space>
        </div>
      )}
    </div>
  );
};

export default BreedsPage;