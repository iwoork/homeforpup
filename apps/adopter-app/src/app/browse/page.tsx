'use client';

import React, { useState } from 'react';
import { Row, Col, Card, Typography, Select, Button, Space, Spin, Alert, Pagination, Statistic, Tag, Tooltip, Badge, Divider } from 'antd';
import { HeartOutlined, HeartFilled, EnvironmentOutlined, PhoneOutlined, MailOutlined, GlobalOutlined, CheckCircleOutlined, TruckOutlined, HomeOutlined, FilterOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useAuth } from '@homeforpup/shared-auth';
import { generateBreadcrumbSchema } from '@/lib/utils/seo';
import StructuredData from '@/components/StructuredData';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// Mock data for demonstration
const mockPuppies = [
  {
    id: '1',
    name: 'Bella',
    breed: 'Golden Retriever',
    gender: 'Female',
    ageWeeks: 12,
    location: 'Toronto',
    country: 'Canada',
    price: 1200,
    image: '/api/placeholder/300/200',
    description: 'Bella is a sweet and playful Golden Retriever puppy. She loves to play fetch and is great with children. She has been socialized with other dogs and cats.',
    breeder: {
      businessName: 'Golden Dreams Kennel',
      verified: true,
      rating: 4.8,
      reviewCount: 24,
      phone: '+1 (416) 555-0123',
      email: 'info@goldendreams.com',
      website: 'www.goldendreams.com',
      shipping: true,
      pickupAvailable: true,
      avgResponseTime: '2 hours',
      responseRate: 0.95
    }
  },
  {
    id: '2',
    name: 'Max',
    breed: 'Labrador Retriever',
    gender: 'Male',
    ageWeeks: 10,
    location: 'Vancouver',
    country: 'Canada',
    price: 1100,
    image: '/api/placeholder/300/200',
    description: 'Max is an energetic and friendly Labrador puppy. He loves water and is perfect for an active family. He has been crate trained and is housebroken.',
    breeder: {
      businessName: 'Vancouver Labs',
      verified: true,
      rating: 4.9,
      reviewCount: 18,
      phone: '+1 (604) 555-0456',
      email: 'contact@vancouverlabs.com',
      website: 'www.vancouverlabs.com',
      shipping: false,
      pickupAvailable: true,
      avgResponseTime: '1 hour',
      responseRate: 0.98
    }
  },
  {
    id: '3',
    name: 'Luna',
    breed: 'French Bulldog',
    gender: 'Female',
    ageWeeks: 14,
    location: 'Montreal',
    country: 'Canada',
    price: 2500,
    image: '/api/placeholder/300/200',
    description: 'Luna is a charming French Bulldog with a gentle personality. She is perfect for apartment living and gets along well with other pets.',
    breeder: {
      businessName: 'Montreal Frenchies',
      verified: true,
      rating: 4.7,
      reviewCount: 32,
      phone: '+1 (514) 555-0789',
      email: 'hello@montrealfrenchies.com',
      website: 'www.montrealfrenchies.com',
      shipping: true,
      pickupAvailable: true,
      avgResponseTime: '3 hours',
      responseRate: 0.92
    }
  },
  {
    id: '4',
    name: 'Charlie',
    breed: 'Border Collie',
    gender: 'Male',
    ageWeeks: 16,
    location: 'Calgary',
    country: 'Canada',
    price: 900,
    image: '/api/placeholder/300/200',
    description: 'Charlie is an intelligent and active Border Collie puppy. He would be perfect for someone who enjoys outdoor activities and has experience with high-energy dogs.',
    breeder: {
      businessName: 'Prairie Collies',
      verified: false,
      rating: 4.5,
      reviewCount: 12,
      phone: '+1 (403) 555-0321',
      email: 'info@prairiecollies.com',
      website: 'www.prairiecollies.com',
      shipping: true,
      pickupAvailable: true,
      avgResponseTime: '4 hours',
      responseRate: 0.88
    }
  },
  {
    id: '5',
    name: 'Daisy',
    breed: 'Cocker Spaniel',
    gender: 'Female',
    ageWeeks: 11,
    location: 'Ottawa',
    country: 'Canada',
    price: 1300,
    image: '/api/placeholder/300/200',
    description: 'Daisy is a gentle and loving Cocker Spaniel puppy. She has a beautiful coat and loves to cuddle. She is great with children and other pets.',
    breeder: {
      businessName: 'Capital Spaniels',
      verified: true,
      rating: 4.6,
      reviewCount: 21,
      phone: '+1 (613) 555-0654',
      email: 'contact@capitalspaniels.com',
      website: 'www.capitalspaniels.com',
      shipping: false,
      pickupAvailable: true,
      avgResponseTime: '2 hours',
      responseRate: 0.94
    }
  },
  {
    id: '6',
    name: 'Rocky',
    breed: 'German Shepherd',
    gender: 'Male',
    ageWeeks: 13,
    location: 'Edmonton',
    country: 'Canada',
    price: 1500,
    image: '/api/placeholder/300/200',
    description: 'Rocky is a confident and loyal German Shepherd puppy. He shows great potential for training and would make an excellent family protector.',
    breeder: {
      businessName: 'Alberta Shepherds',
      verified: true,
      rating: 4.8,
      reviewCount: 28,
      phone: '+1 (780) 555-0987',
      email: 'info@albertashepherds.com',
      website: 'www.albertashepherds.com',
      shipping: true,
      pickupAvailable: true,
      avgResponseTime: '1 hour',
      responseRate: 0.96
    }
  }
];

const PuppiesPage: React.FC = () => {
  const [filters, setFilters] = useState({
    country: 'Canada',
    state: [] as string[],
    breed: null as string | null,
    gender: null as string | null,
    shipping: false,
    verified: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Get user data
  const { user, loading: userLoading } = useAuth();

  // Filter puppies based on current filters
  const filteredPuppies = mockPuppies.filter(puppy => {
    if (filters.country && puppy.country !== filters.country) return false;
    if (filters.breed && puppy.breed !== filters.breed) return false;
    if (filters.gender && puppy.gender !== filters.gender) return false;
    if (filters.shipping && !puppy.breeder.shipping) return false;
    if (filters.verified && !puppy.breeder.verified) return false;
    return true;
  });

  // Pagination
  const totalCount = filteredPuppies.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentPuppies = filteredPuppies.slice(startIndex, startIndex + pageSize);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.country !== 'Canada' || 
                          filters.state.length > 0 || 
                          filters.breed !== null || 
                          filters.gender !== null || 
                          filters.shipping || 
                          filters.verified;

  // Get unique breeds for filter
  const availableBreeds = [...new Set(mockPuppies.map(p => p.breed))];

  // Render puppy card
  const renderPuppyCard = (puppy: typeof mockPuppies[0]) => (
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
        <div style={{ position: 'relative', height: '200px', backgroundColor: '#f5f5f5' }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#999',
            fontSize: '16px'
          }}>
            🐕 Puppy Photo
          </div>
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
            <div style={{ fontSize: '12px', color: '#faad14' }}>
              {'★'.repeat(Math.floor(puppy.breeder.rating))}
              {'☆'.repeat(5 - Math.floor(puppy.breeder.rating))}
            </div>
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
            onClick={() => alert(`Contact ${puppy.breeder.businessName} about ${puppy.name}`)}
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
            <Tooltip title="Save to favorites">
              <Button 
                type="text" 
                icon={<HeartOutlined />} 
                size="small" 
                disabled={!user}
                style={{
                  color: '#666',
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      <Title level={1} style={{ color: '#08979C', marginBottom: '24px' }}>
        Available Puppies
      </Title>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Puppies"
              value={totalCount}
              prefix="🐕"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Average Age"
              value={Math.round(mockPuppies.reduce((sum, p) => sum + p.ageWeeks, 0) / mockPuppies.length)}
              suffix="weeks"
              prefix="📅"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Verified Breeders"
              value={mockPuppies.filter(p => p.breeder.verified).length}
              prefix="✅"
            />
          </Card>
        </Col>
      </Row>

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
                <Select
                  style={{ width: '100%', marginTop: '8px' }}
                  value={filters.country}
                  onChange={(value) => {
                    setFilters(prev => ({ ...prev, country: value, state: [] }));
                    setCurrentPage(1);
                  }}
                >
                  <Option value="Canada">Canada</Option>
                  <Option value="United States">United States</Option>
                </Select>
              </div>

              {/* Breed Filter */}
              <div>
                <Text strong>Breed</Text>
                <Select
                  style={{ width: '100%', marginTop: '8px' }}
                  placeholder="Select breed"
                  value={filters.breed}
                  onChange={(value) => {
                    setFilters(prev => ({ ...prev, breed: value }));
                    setCurrentPage(1);
                  }}
                  allowClear
                >
                  {availableBreeds.map(breed => (
                    <Option key={breed} value={breed}>{breed}</Option>
                  ))}
                </Select>
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
                  <label>
                    <input
                      type="checkbox"
                      checked={filters.shipping}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, shipping: e.target.checked }));
                        setCurrentPage(1);
                      }}
                      style={{ marginRight: '8px' }}
                    />
                    Shipping Available
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, verified: e.target.checked }));
                        setCurrentPage(1);
                      }}
                      style={{ marginRight: '8px' }}
                    />
                    Verified Breeders Only
                  </label>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Puppies Grid */}
        <Col xs={24} lg={18}>
          {currentPuppies.length === 0 ? (
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
                  Showing {currentPuppies.length} of {totalCount} puppies
                </Text>
                <Text type="secondary">
                  Page {currentPage} of {totalPages}
                </Text>
              </div>

              <Row gutter={[16, 16]}>
                {currentPuppies.map((puppy) => (
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
