'use client';

import React, { useState } from 'react';
import { Row, Col, Card, Typography, Select, Slider, Checkbox, Button } from 'antd';
import { HeartOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;

// Dummy puppy data
const puppies = [
  { id: 1, name: 'Bella', breed: 'Cavapoo', gender: 'Female', ageWeeks: 10, price: 2000, location: 'Seattle, WA', breeder: 'Happy Tails', rating: 5, shipping: true, image: '/puppy1.jpg' },
  { id: 2, name: 'Max', breed: 'Golden Retriever', gender: 'Male', ageWeeks: 12, price: 1800, location: 'Portland, OR', breeder: 'Golden Dreams', rating: 4, shipping: false, image: '/puppy2.jpg' },
  { id: 3, name: 'Luna', breed: 'French Bulldog', gender: 'Female', ageWeeks: 9, price: 3000, location: 'San Francisco, CA', breeder: 'Frenchie Love', rating: 5, shipping: true, image: '/puppy3.jpg' },
  { id: 4, name: 'Charlie', breed: 'Cavapoo', gender: 'Male', ageWeeks: 11, price: 2200, location: 'Los Angeles, CA', breeder: 'Cali Pups', rating: 4, shipping: false, image: '/puppy4.jpg' },
];

// Extract unique filter values
const breeds = Array.from(new Set(puppies.map(p => p.breed)));
const locations = Array.from(new Set(puppies.map(p => p.location)));

const PuppiesPage: React.FC = () => {
  const [filters, setFilters] = useState({
    breed: null as string | null,
    gender: null as string | null,
    location: null as string | null,
    price: [1000, 4000],
    shipping: false,
  });

  const filteredPuppies = puppies.filter(p => {
    return (
      (!filters.breed || p.breed === filters.breed) &&
      (!filters.gender || p.gender === filters.gender) &&
      (!filters.location || p.location === filters.location) &&
      (!filters.shipping || p.shipping === true) &&
      p.price >= filters.price[0] &&
      p.price <= filters.price[1]
    );
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      <Title level={1} style={{ color: '#08979C', marginBottom: '24px' }}>
        Available Puppies
      </Title>

      {/* Filters Bar */}
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '12px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: '#fff',
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          {/* Breed */}
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Breed"
              onChange={value => setFilters(prev => ({ ...prev, breed: value }))}
              allowClear
            >
              {breeds.map(breed => (
                <Option key={breed} value={breed}>{breed}</Option>
              ))}
            </Select>
          </Col>

          {/* Gender */}
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Gender"
              onChange={value => setFilters(prev => ({ ...prev, gender: value }))}
              allowClear
            >
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
            </Select>
          </Col>

          {/* Location */}
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Location"
              onChange={value => setFilters(prev => ({ ...prev, location: value }))}
              allowClear
            >
              {locations.map(loc => (
                <Option key={loc} value={loc}>{loc}</Option>
              ))}
            </Select>
          </Col>

          {/* Price */}
          <Col xs={24} md={6}>
            <Paragraph style={{ marginBottom: 4, fontSize: '12px' }}>Price</Paragraph>
            <Slider
              range
              min={500}
              max={5000}
              step={100}
              defaultValue={filters.price}
              onChange={value => setFilters(prev => ({ ...prev, price: value as [number, number] }))}
            />
          </Col>

          {/* Shipping */}
          <Col xs={24} sm={12} md={2}>
            <Checkbox
              checked={filters.shipping}
              onChange={e => setFilters(prev => ({ ...prev, shipping: e.target.checked }))}
            >
              Shipping
            </Checkbox>
          </Col>

          {/* Reset Button */}
          <Col xs={24} sm={12} md={24} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              style={{ background: '#FA8072', borderColor: '#FA8072' }}
              onClick={() =>
                setFilters({ breed: null, gender: null, location: null, price: [1000, 4000], shipping: false })
              }
            >
              Reset Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Puppy Listings */}  
      <Row gutter={[16, 16]}>
      {filteredPuppies.map((puppy,id) => (
        <Col xs={24} sm={12} md={6} key={puppy.id}>
          <Card
            hoverable
            style={{
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
            cover={
              <img
                src={`https://placedog.net/500?id=${id+1}&random`}
                alt={puppy.name}
                style={{
                  height: '180px',
                  objectFit: 'cover',
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px',
                }}
              />
            }
            actions={[
              <HeartOutlined key="like" style={{ color: '#FA8072' }} />,
            ]}
          >
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Title level={5} style={{ marginBottom: 0 }}>
                  {puppy.name}
                </Title>
                <Paragraph style={{ margin: 0, fontSize: '13px', color: '#595959' }}>
                  {puppy.breed} • {puppy.gender}, {puppy.ageWeeks} wks
                </Paragraph>
                <Paragraph style={{ margin: 0, fontSize: '13px' }}>
                  📍 {puppy.location}
                </Paragraph>
                <Paragraph style={{ margin: '4px 0', fontWeight: 'bold', color: '#08979C' }}>
                  ${puppy.price.toLocaleString()}
                </Paragraph>
                <Paragraph style={{ margin: 0, fontSize: '12px', color: '#595959' }}>
                  {puppy.breeder} ⭐ {puppy.rating}
                </Paragraph>
                {puppy.shipping && (
                  <Paragraph style={{ margin: 0, fontSize: '12px', color: '#08979C' }}>
                    🚚 Shipping Available
                  </Paragraph>
                )}
              </div>
            </div>
          </Card>
        </Col>
      ))}
      </Row>
    </div>
  );
};

export default PuppiesPage;
