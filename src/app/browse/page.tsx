'use client';

import React, { useState } from 'react';
import { Row, Col, Card, Typography, Select, Slider, Checkbox, Button, Drawer, Badge } from 'antd';
import { HeartOutlined, FilterOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;

// Dummy puppy data - expanded to 12 examples
const puppies = [
  { id: 1, name: 'Bella', breed: 'Cavapoo', gender: 'Female', ageWeeks: 10, price: 2000, location: 'Seattle, WA', breeder: 'Happy Tails', rating: 5, shipping: true, image: '/puppy1.jpg' },
  { id: 2, name: 'Max', breed: 'Golden Retriever', gender: 'Male', ageWeeks: 12, price: 1800, location: 'Portland, OR', breeder: 'Golden Dreams', rating: 4, shipping: false, image: '/puppy2.jpg' },
  { id: 3, name: 'Luna', breed: 'French Bulldog', gender: 'Female', ageWeeks: 9, price: 3000, location: 'San Francisco, CA', breeder: 'Frenchie Love', rating: 5, shipping: true, image: '/puppy3.jpg' },
  { id: 4, name: 'Charlie', breed: 'Cavapoo', gender: 'Male', ageWeeks: 11, price: 2200, location: 'Los Angeles, CA', breeder: 'Cali Pups', rating: 4, shipping: false, image: '/puppy4.jpg' },
  { id: 5, name: 'Ruby', breed: 'Goldendoodle', gender: 'Female', ageWeeks: 8, price: 2500, location: 'Denver, CO', breeder: 'Mountain Pups', rating: 5, shipping: true, image: '/puppy5.jpg' },
  { id: 6, name: 'Cooper', breed: 'Labrador Retriever', gender: 'Male', ageWeeks: 10, price: 1600, location: 'Austin, TX', breeder: 'Lone Star Labs', rating: 4, shipping: true, image: '/puppy6.jpg' },
  { id: 7, name: 'Daisy', breed: 'Bernedoodle', gender: 'Female', ageWeeks: 11, price: 2800, location: 'Nashville, TN', breeder: 'Music City Doodles', rating: 5, shipping: false, image: '/puppy7.jpg' },
  { id: 8, name: 'Tucker', breed: 'Golden Retriever', gender: 'Male', ageWeeks: 9, price: 1900, location: 'Phoenix, AZ', breeder: 'Desert Goldens', rating: 4, shipping: true, image: '/puppy8.jpg' },
  { id: 9, name: 'Mia', breed: 'French Bulldog', gender: 'Female', ageWeeks: 12, price: 3200, location: 'Miami, FL', breeder: 'Sunshine Frenchies', rating: 5, shipping: true, image: '/puppy9.jpg' },
  { id: 10, name: 'Buddy', breed: 'Cavapoo', gender: 'Male', ageWeeks: 10, price: 2100, location: 'Boston, MA', breeder: 'New England Pups', rating: 4, shipping: false, image: '/puppy10.jpg' },
  { id: 11, name: 'Zoe', breed: 'Maltipoo', gender: 'Female', ageWeeks: 8, price: 2400, location: 'Chicago, IL', breeder: 'Windy City Poodles', rating: 5, shipping: true, image: '/puppy11.jpg' },
  { id: 12, name: 'Oscar', breed: 'Bernedoodle', gender: 'Male', ageWeeks: 11, price: 2700, location: 'Atlanta, GA', breeder: 'Peach State Doodles', rating: 4, shipping: true, image: '/puppy12.jpg' },
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  // Count active filters for mobile badge
  const activeFiltersCount = [
    filters.breed,
    filters.gender,
    filters.location,
    filters.shipping,
    filters.price[0] !== 1000 || filters.price[1] !== 4000
  ].filter(Boolean).length;

  const resetFilters = () => {
    setFilters({ breed: null, gender: null, location: null, price: [1000, 4000], shipping: false });
    setMobileFiltersOpen(false);
  };

  const FilterContent = () => (
    <>
      {/* Breed */}
      <div style={{ marginBottom: '16px' }}>
        <Typography.Text strong style={{ display: 'block', marginBottom: '8px' }}>Breed</Typography.Text>
        <Select
          style={{ width: '100%' }}
          placeholder="Select breed"
          value={filters.breed}
          onChange={value => setFilters(prev => ({ ...prev, breed: value }))}
          allowClear
        >
          {breeds.map(breed => (
            <Option key={breed} value={breed}>{breed}</Option>
          ))}
        </Select>
      </div>

      {/* Gender */}
      <div style={{ marginBottom: '16px' }}>
        <Typography.Text strong style={{ display: 'block', marginBottom: '8px' }}>Gender</Typography.Text>
        <Select
          style={{ width: '100%' }}
          placeholder="Select gender"
          value={filters.gender}
          onChange={value => setFilters(prev => ({ ...prev, gender: value }))}
          allowClear
        >
          <Option value="Male">Male</Option>
          <Option value="Female">Female</Option>
        </Select>
      </div>

      {/* Location */}
      <div style={{ marginBottom: '16px' }}>
        <Typography.Text strong style={{ display: 'block', marginBottom: '8px' }}>Location</Typography.Text>
        <Select
          style={{ width: '100%' }}
          placeholder="Select location"
          value={filters.location}
          onChange={value => setFilters(prev => ({ ...prev, location: value }))}
          allowClear
        >
          {locations.map(loc => (
            <Option key={loc} value={loc}>{loc}</Option>
          ))}
        </Select>
      </div>

      {/* Price */}
      <div style={{ marginBottom: '16px' }}>
        <Typography.Text strong style={{ display: 'block', marginBottom: '8px' }}>
          Price Range: ${filters.price[0].toLocaleString()} - ${filters.price[1].toLocaleString()}
        </Typography.Text>
        <Slider
          range
          min={500}
          max={5000}
          step={100}
          value={filters.price}
          onChange={value => setFilters(prev => ({ ...prev, price: value as [number, number] }))}
        />
      </div>

      {/* Shipping */}
      <div style={{ marginBottom: '24px' }}>
        <Checkbox
          checked={filters.shipping}
          onChange={e => setFilters(prev => ({ ...prev, shipping: e.target.checked }))}
        >
          <Typography.Text strong>Shipping Available</Typography.Text>
        </Checkbox>
      </div>

      {/* Reset Button */}
      <Button
        block
        type="primary"
        style={{ background: '#FA8072', borderColor: '#FA8072' }}
        onClick={resetFilters}
      >
        Reset All Filters
      </Button>
    </>
  );

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
      {filteredPuppies.map((puppy, id) => (
        <Col xs={24} sm={12} md={6} key={puppy.id}>
          <Card
            hoverable
            style={{
              borderRadius: '12px',
              height: '430px', // Fixed height for consistency
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            styles={{
              actions: {
                borderTop: '1px solid #f0f0f0',
              }
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
            bodyStyle={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              padding: '16px'
            }}
          >
            <div
              style={{
                height: '140px', // Fixed content area height
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <Title level={5} style={{ marginBottom: '4px', lineHeight: '1.2' }}>
                  {puppy.name}
                </Title>
                <Paragraph style={{ margin: 0, fontSize: '13px', color: '#595959', lineHeight: '1.3' }}>
                  {puppy.breed} • {puppy.gender}, {puppy.ageWeeks} wks
                </Paragraph>
                <Paragraph style={{ margin: '2px 0', fontSize: '13px', lineHeight: '1.3' }}>
                  📍 {puppy.location}
                </Paragraph>
              </div>
              
              <div>
                <Paragraph style={{ margin: '4px 0', fontWeight: 'bold', color: '#08979C', lineHeight: '1.3' }}>
                  ${puppy.price.toLocaleString()}
                </Paragraph>
                <Paragraph style={{ margin: 0, fontSize: '12px', color: '#595959', lineHeight: '1.3' }}>
                  {puppy.breeder} ⭐ {puppy.rating}
                </Paragraph>
                <div style={{ height: '16px', marginTop: '2px' }}>
                  {puppy.shipping && (
                    <Paragraph style={{ margin: 0, fontSize: '12px', color: '#08979C', lineHeight: '1.3' }}>
                      🚚 Shipping Available
                    </Paragraph>
                  )}
                </div>
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