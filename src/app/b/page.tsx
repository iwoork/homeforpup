'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Typography, Select, Input, Button, Rate, Tag, Avatar, Space, Checkbox, Slider, Badge, Divider } from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  CheckCircleOutlined, 
  StarOutlined,
  HeartOutlined,
  EyeOutlined,
  FilterOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// Breeder interface for type safety
interface Breeder {
  id: number;
  name: string;
  businessName: string;
  location: string;
  state: string;
  distance: number;
  phone: string;
  email: string;
  website: string;
  experience: number;
  breeds: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  profileImage: string;
  coverImage: string;
  about: string;
  certifications: string[];
  healthTesting: string[];
  currentLitters: number;
  availablePuppies: number;
  pricing: string;
  shipping: boolean;
  specialties: string[];
}

// Mock breeder data
const breeders: Breeder[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    businessName: "Happy Tails Breeding",
    location: "Seattle, WA",
    state: "WA",
    distance: 25,
    phone: "(206) 555-0123",
    email: "sarah@happytails.com",
    website: "happytails.com",
    experience: 15,
    breeds: ["Cavapoo", "Goldendoodle", "Bernedoodle"],
    rating: 4.9,
    reviewCount: 127,
    verified: true,
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616c4e4a6b0?w=200",
    coverImage: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=200",
    about: "Breeding healthy, well-socialized puppies for 15+ years with focus on temperament and health testing.",
    certifications: ["AKC Breeder of Merit", "GANA Member"],
    healthTesting: ["Hip/Elbow", "Eye Clearance", "Genetic Panel"],
    currentLitters: 2,
    availablePuppies: 8,
    pricing: "$2000-$3000",
    shipping: true,
    specialties: ["Family Dogs", "Therapy Dogs"]
  },
  {
    id: 2,
    name: "Michael Chen",
    businessName: "Golden Dreams Kennel",
    location: "Portland, OR", 
    state: "OR",
    distance: 45,
    phone: "(503) 555-0456",
    email: "mike@goldendreams.com",
    website: "goldendreams.com",
    experience: 12,
    breeds: ["Golden Retriever", "Labrador Retriever"],
    rating: 4.8,
    reviewCount: 89,
    verified: true,
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    coverImage: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=200",
    about: "Champion bloodline golden retrievers with emphasis on health, temperament, and conformation.",
    certifications: ["AKC Member", "GRCA Member"],
    healthTesting: ["Hip/Elbow", "Eye Clearance", "Heart Clearance", "EIC Clear"],
    currentLitters: 1,
    availablePuppies: 3,
    pricing: "$1500-$2500",
    shipping: false,
    specialties: ["Show Dogs", "Hunting Dogs"]
  },
  {
    id: 3,
    name: "Lisa Martinez",
    businessName: "Frenchie Love Breeding",
    location: "San Francisco, CA",
    state: "CA", 
    distance: 120,
    phone: "(415) 555-0789",
    email: "lisa@frenchielove.com",
    website: "frenchielove.com",
    experience: 8,
    breeds: ["French Bulldog"],
    rating: 4.9,
    reviewCount: 156,
    verified: true,
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    coverImage: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=200",
    about: "Specializing in healthy French Bulldogs with excellent temperaments and breathing quality.",
    certifications: ["FBDCA Member", "Health Tested Lines"],
    healthTesting: ["BOAS Assessment", "Hip Scoring", "Genetic Panel", "Spine Assessment"],
    currentLitters: 3,
    availablePuppies: 12,
    pricing: "$2500-$4000",
    shipping: true,
    specialties: ["Companion Dogs", "Apartment Living"]
  },
  {
    id: 4,
    name: "Robert & Jane Wilson",
    businessName: "Cali Pups",
    location: "Los Angeles, CA",
    state: "CA",
    distance: 150,
    phone: "(310) 555-0321",
    email: "info@calipups.com", 
    website: "calipups.com",
    experience: 20,
    breeds: ["Cavapoo", "Maltipoo", "Yorkipoo"],
    rating: 4.7,
    reviewCount: 203,
    verified: true,
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    coverImage: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=200",
    about: "Two decades of breeding designer dogs with focus on health, size consistency, and loving temperaments.",
    certifications: ["Multi-Generation Breeding", "Health Guarantee"],
    healthTesting: ["Full Genetic Panel", "Eye Clearance", "Hip Assessment"],
    currentLitters: 4,
    availablePuppies: 15,
    pricing: "$1800-$3200",
    shipping: true,
    specialties: ["Hypoallergenic Dogs", "Small Breeds"]
  }
];

// Extract filter options
const allBreeds = Array.from(new Set(breeders.flatMap(b => b.breeds))).sort();
const allStates = Array.from(new Set(breeders.map(b => b.state))).sort();

const BreederDirectoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    breeds: [] as string[],
    states: [] as string[],
    experience: [0, 25],
    rating: 0,
    verified: false,
    shipping: false,
    currentLitters: false,
    certifications: [] as string[],
    pricing: [1000, 5000]
  });
  const [sortBy, setSortBy] = useState('rating');

  // Filter and sort breeders
  const filteredBreeders = breeders.filter(breeder => {
    const matchesSearch = !searchTerm || 
      breeder.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      breeder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      breeder.breeds.some(breed => breed.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesBreeds = filters.breeds.length === 0 || 
      filters.breeds.some(breed => breeder.breeds.includes(breed));
    
    const matchesStates = filters.states.length === 0 || 
      filters.states.includes(breeder.state);
    
    const matchesExperience = breeder.experience >= filters.experience[0] && 
      breeder.experience <= filters.experience[1];
    
    const matchesRating = breeder.rating >= filters.rating;
    
    const matchesVerified = !filters.verified || breeder.verified;
    
    const matchesShipping = !filters.shipping || breeder.shipping;
    
    const matchesCurrentLitters = !filters.currentLitters || breeder.currentLitters > 0;

    return matchesSearch && matchesBreeds && matchesStates && matchesExperience && 
           matchesRating && matchesVerified && matchesShipping && matchesCurrentLitters;
  });

  // Sort breeders
  const sortedBreeders = [...filteredBreeders].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'experience':
        return b.experience - a.experience;
      case 'distance':
        return a.distance - b.distance;
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      default:
        return 0;
    }
  });

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginBottom: '16px',
    overflow: 'hidden'
  };

  const renderBreederCard = (breeder: Breeder) => (
    <Card key={breeder.id} style={cardStyle} hoverable>
      <Row gutter={16}>
        {/* Cover Image */}
        <Col span={24}>
          <div 
            style={{
              height: '120px',
              backgroundImage: `url(${breeder.coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '8px',
              position: 'relative',
              marginBottom: '16px'
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: '12px', 
              right: '12px',
              display: 'flex',
              gap: '8px'
            }}>
              {breeder.verified && (
                <Badge count={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
              )}
              {breeder.currentLitters > 0 && (
                <Tag color="red">Available Puppies</Tag>
              )}
            </div>
          </div>
        </Col>

        {/* Profile Section */}
        <Col xs={24} sm={6}>
          <div style={{ textAlign: 'center' }}>
            <Avatar 
              size={80} 
              src={breeder.profileImage} 
              style={{ marginBottom: '8px', border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <div>
              <Title level={5} style={{ margin: 0 }}>
                {breeder.businessName}
              </Title>
              <Text type="secondary">{breeder.name}</Text>
            </div>
            <Space style={{ marginTop: '8px' }}>
              <Rate disabled defaultValue={breeder.rating} style={{ fontSize: '12px' }} />
              <Text style={{ fontSize: '12px' }}>
                {breeder.rating} ({breeder.reviewCount})
              </Text>
            </Space>
          </div>
        </Col>

        {/* Details Section */}
        <Col xs={24} sm={18}>
          <Row gutter={[16, 8]}>
            <Col xs={24} sm={12}>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <div>
                  <EnvironmentOutlined style={{ color: '#08979C', marginRight: '6px' }} />
                  <Text>{breeder.location} ({breeder.distance} miles)</Text>
                </div>
                <div>
                  <TrophyOutlined style={{ color: '#FA8072', marginRight: '6px' }} />
                  <Text>{breeder.experience} years experience</Text>
                </div>
                <div>
                  <StarOutlined style={{ color: '#08979C', marginRight: '6px' }} />
                  <Text>{breeder.availablePuppies} available puppies</Text>
                </div>
              </Space>
            </Col>

            <Col xs={24} sm={12}>
              <div style={{ marginBottom: '8px' }}>
                <Text strong>Breeds:</Text>
                <div style={{ marginTop: '4px' }}>
                  {breeder.breeds.map((breed: string) => (
                    <Tag key={breed} color="blue" style={{ marginBottom: '2px' }}>
                      {breed}
                    </Tag>
                  ))}
                </div>
              </div>
            </Col>

            <Col span={24}>
              <Paragraph ellipsis={{ rows: 2 }} style={{ margin: '8px 0' }}>
                {breeder.about}
              </Paragraph>
            </Col>

            <Col span={24}>
              <div style={{ marginBottom: '8px' }}>
                <Text strong style={{ fontSize: '12px' }}>Health Testing: </Text>
                {breeder.healthTesting.slice(0, 2).map((test: string) => (
                  <Tag key={test} color="green">
                    {test}
                  </Tag>
                ))}
                {breeder.healthTesting.length > 2 && (
                  <Text style={{ fontSize: '12px' }}>+{breeder.healthTesting.length - 2} more</Text>
                )}
              </div>
            </Col>

            <Col span={24}>
              <Divider style={{ margin: '12px 0' }} />
              <Row justify="space-between" align="middle">
                <Col>
                  <Space>
                    <Text strong style={{ color: '#08979C' }}>
                      {breeder.pricing}
                    </Text>
                    {breeder.shipping && (
                      <Tag color="orange">Shipping Available</Tag>
                    )}
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button 
                      type="text" 
                      icon={<HeartOutlined />} 
                      size="small"
                    >
                      Save
                    </Button>
                    <Link href={`/b/${breeder.id}`}>
                      <Button 
                        type="primary" 
                        icon={<EyeOutlined />}
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
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Title level={1} style={{ color: '#08979C' }}>
          Connect with Caring Dog Families
        </Title>
        <Paragraph style={{ fontSize: '18px', color: '#595959', maxWidth: '600px', margin: '0 auto' }}>
          Get to know passionate dog lovers dedicated to raising happy, healthy pups with lots of love
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* Filters Sidebar */}
        <Col xs={24} lg={6}>
          <Card 
            title={
              <Space>
                <FilterOutlined />
                <span>Filters</span>
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
              />
            </div>

            {/* Breeds */}
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Breeds</Text>
              <Select
                mode="multiple"
                style={{ width: '100%', marginTop: '8px' }}
                placeholder="Select breeds"
                value={filters.breeds}
                onChange={(value) => setFilters(prev => ({ ...prev, breeds: value }))}
                maxTagCount={2}
              >
                {allBreeds.map(breed => (
                  <Option key={breed} value={breed}>{breed}</Option>
                ))}
              </Select>
            </div>

            {/* Location */}
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Location</Text>
              <Select
                mode="multiple"
                style={{ width: '100%', marginTop: '8px' }}
                placeholder="Select states"
                value={filters.states}
                onChange={(value) => setFilters(prev => ({ ...prev, states: value }))}
              >
                {allStates.map(state => (
                  <Option key={state} value={state}>{state}</Option>
                ))}
              </Select>
            </div>

            {/* Experience */}
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Experience (Years)</Text>
              <Slider
                range
                min={0}
                max={25}
                step={1}
                value={filters.experience}
                onChange={(value) => setFilters(prev => ({ ...prev, experience: value as [number, number] }))}
                style={{ marginTop: '8px' }}
              />
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
                {filters.experience[0]} - {filters.experience[1]}+ years
              </div>
            </div>

            {/* Rating */}
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Minimum Rating</Text>
              <div style={{ marginTop: '8px' }}>
                <Rate
                  value={filters.rating}
                  onChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}
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
                  checked={filters.currentLitters}
                  onChange={(e) => setFilters(prev => ({ ...prev, currentLitters: e.target.checked }))}
                >
                  Available Puppies Now
                </Checkbox>
              </Space>
            </div>

            <Button
              block
              onClick={() => setFilters({
                breeds: [],
                states: [],
                experience: [0, 25],
                rating: 0,
                verified: false,
                shipping: false,
                currentLitters: false,
                certifications: [],
                pricing: [1000, 5000]
              })}
            >
              Clear Filters
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
              <Text strong>{sortedBreeders.length}</Text> dog families found
            </Text>
            <div>
              <Text style={{ marginRight: '8px' }}>Sort by:</Text>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: '140px' }}
              >
                <Option value="rating">Rating</Option>
                <Option value="experience">Experience</Option>
                <Option value="distance">Distance</Option>
                <Option value="reviews">Reviews</Option>
              </Select>
            </div>
          </div>

          {/* Breeder Listings */}
          <div>
            {sortedBreeders.map(renderBreederCard)}
            
            {sortedBreeders.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                background: '#fafafa',
                borderRadius: '12px'
              }}>
                <Title level={4}>No dog families found</Title>
                <Paragraph>Try adjusting your filters or search terms</Paragraph>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default BreederDirectoryPage;