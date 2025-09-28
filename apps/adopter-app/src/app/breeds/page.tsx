'use client';

import React, { useState } from 'react';
import { Row, Col, Card, Typography, Tag, Space, Input, Button } from 'antd';
import { SearchOutlined, HeartOutlined, EnvironmentOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { generateBreadcrumbSchema } from '@/lib/utils/seo';
import StructuredData from '@/components/StructuredData';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

// Mock breed data
const breeds = [
  {
    id: 'golden-retriever',
    name: 'Golden Retriever',
    description: 'Friendly, intelligent, and devoted. Golden Retrievers are excellent family dogs known for their gentle temperament.',
    size: 'Large',
    energy: 'High',
    temperament: ['Friendly', 'Intelligent', 'Devoted', 'Reliable'],
    lifeSpan: '10-12 years',
    origin: 'Scotland',
    popularity: 95
  },
  {
    id: 'labrador-retriever',
    name: 'Labrador Retriever',
    description: 'Outgoing, active, and friendly. Labs are America\'s most popular dog breed for good reason.',
    size: 'Large',
    energy: 'High',
    temperament: ['Outgoing', 'Active', 'Friendly', 'Trustworthy'],
    lifeSpan: '10-12 years',
    origin: 'Canada',
    popularity: 98
  },
  {
    id: 'french-bulldog',
    name: 'French Bulldog',
    description: 'Adaptable, playful, and smart. French Bulldogs are perfect for apartment living and city life.',
    size: 'Small',
    energy: 'Low',
    temperament: ['Adaptable', 'Playful', 'Smart', 'Patient'],
    lifeSpan: '10-12 years',
    origin: 'France',
    popularity: 92
  },
  {
    id: 'german-shepherd',
    name: 'German Shepherd',
    description: 'Confident, intelligent, and courageous. German Shepherds excel as working dogs and family protectors.',
    size: 'Large',
    energy: 'High',
    temperament: ['Confident', 'Intelligent', 'Courageous', 'Loyal'],
    lifeSpan: '9-13 years',
    origin: 'Germany',
    popularity: 88
  },
  {
    id: 'border-collie',
    name: 'Border Collie',
    description: 'Intelligent, energetic, and work-oriented. Border Collies are the smartest dog breed and need lots of activity.',
    size: 'Medium',
    energy: 'Very High',
    temperament: ['Intelligent', 'Energetic', 'Work-oriented', 'Alert'],
    lifeSpan: '12-15 years',
    origin: 'United Kingdom',
    popularity: 75
  },
  {
    id: 'cocker-spaniel',
    name: 'Cocker Spaniel',
    description: 'Gentle, smart, and happy. Cocker Spaniels are known for their beautiful coats and sweet disposition.',
    size: 'Medium',
    energy: 'Medium',
    temperament: ['Gentle', 'Smart', 'Happy', 'Adaptable'],
    lifeSpan: '12-15 years',
    origin: 'United Kingdom',
    popularity: 82
  }
];

const BreedsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBreeds = breeds.filter(breed =>
    breed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    breed.temperament.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'Very High': return 'red';
      case 'High': return 'orange';
      case 'Medium': return 'blue';
      case 'Low': return 'green';
      default: return 'default';
    }
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'Large': return 'red';
      case 'Medium': return 'orange';
      case 'Small': return 'green';
      default: return 'default';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      <Title level={1} style={{ color: '#08979C', marginBottom: '8px' }}>
        Dog Breeds Guide
      </Title>
      <Paragraph style={{ fontSize: '16px', marginBottom: '32px', color: '#666' }}>
        Discover the perfect breed for your lifestyle. Learn about temperament, size, care requirements, and more.
      </Paragraph>

      {/* Search */}
      <div style={{ marginBottom: '32px' }}>
        <Search
          placeholder="Search breeds by name or temperament..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '500px' }}
        />
      </div>

      {/* Breeds Grid */}
      <Row gutter={[24, 24]}>
        {filteredBreeds.map((breed) => (
          <Col xs={24} md={12} lg={8} key={breed.id}>
            <Card
              hoverable
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              bodyStyle={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '20px'
              }}
            >
              <div style={{ flex: 1 }}>
                <Title level={3} style={{ color: '#08979C', marginBottom: '12px' }}>
                  {breed.name}
                </Title>
                
                <Paragraph style={{ marginBottom: '16px', color: '#666' }}>
                  {breed.description}
                </Paragraph>

                <Space wrap style={{ marginBottom: '16px' }}>
                  <Tag color={getSizeColor(breed.size)}>
                    {breed.size} Size
                  </Tag>
                  <Tag color={getEnergyColor(breed.energy)}>
                    {breed.energy} Energy
                  </Tag>
                  <Tag color="blue">
                    {breed.lifeSpan}
                  </Tag>
                </Space>

                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                    Temperament:
                  </Text>
                  <Space wrap>
                    {breed.temperament.map((trait) => (
                      <Tag key={trait} color="default">
                        {trait}
                      </Tag>
                    ))}
                  </Space>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <Space>
                    <Text type="secondary">
                      <EnvironmentOutlined style={{ marginRight: '4px' }} />
                      Origin: {breed.origin}
                    </Text>
                    <Text type="secondary">
                      <HeartOutlined style={{ marginRight: '4px' }} />
                      Popularity: {breed.popularity}%
                    </Text>
                  </Space>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                <Link href={`/browse?breed=${breed.name}`}>
                  <Button type="primary" block>
                    Find {breed.name} Puppies
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredBreeds.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '50px' }}>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            No breeds found matching your search.
          </Text>
        </Card>
      )}

      {/* Structured Data */}
      <StructuredData 
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Dog Breeds', url: '/breeds' }
        ])} 
      />
    </div>
  );
};

export default BreedsPage;