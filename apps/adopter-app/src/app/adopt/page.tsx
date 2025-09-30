'use client';

import React, { useState } from 'react';
import { 
  Card, Row, Col, Typography, Input, Select, Collapse, Space, Button, 
  Tag, Divider, Statistic, Alert, Tooltip, Badge, Empty
} from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined,
  PhoneOutlined,
  GlobalOutlined,
  HeartOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  FilterOutlined,
  ClearOutlined,
  TeamOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { generateBreadcrumbSchema } from '@/lib/utils/seo';
import StructuredData from '@/components/StructuredData';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// Shelter interface
interface Shelter {
  id: string;
  name: string;
  type: 'shelter' | 'rescue' | 'humane society' | 'spca';
  location: string;
  province: string;
  website?: string;
  phone?: string;
  description?: string;
  services?: string[];
  specialties?: string[];
}

// Canadian provinces and territories data
const canadianShelters: Record<string, Shelter[]> = {
  'British Columbia': [
    {
      id: 'bc-spca',
      name: 'British Columbia SPCA',
      type: 'spca',
      location: 'Various locations across BC',
      province: 'British Columbia',
      website: 'https://spca.bc.ca',
      description: 'Operates 42 shelters and 5 animal hospitals/clinics across the province, dedicated to animal welfare and protection.',
      services: ['Adoption', 'Veterinary Services', 'Animal Control', 'Education'],
      specialties: ['Dogs', 'Cats', 'Small Animals', 'Wildlife']
    },
    {
      id: 'raps',
      name: 'Regional Animal Protection Society (RAPS)',
      type: 'shelter',
      location: 'Richmond, BC',
      province: 'British Columbia',
      website: 'https://rapsbc.com',
      description: 'A no-kill animal services agency operating Canada\'s largest cat sanctuary and a full-service animal hospital.',
      services: ['Adoption', 'Veterinary Services', 'Cat Sanctuary'],
      specialties: ['Cats', 'Dogs', 'Senior Animals']
    },
    {
      id: 'saints',
      name: 'Senior Animals in Need Today Society (SAINTS)',
      type: 'rescue',
      location: 'Mission, BC',
      province: 'British Columbia',
      website: 'https://saintsrescue.ca',
      description: 'Provides sanctuary for senior and special needs animals.',
      services: ['Adoption', 'Senior Animal Care', 'Special Needs Care'],
      specialties: ['Senior Dogs', 'Senior Cats', 'Special Needs Animals']
    }
  ],
  'Alberta': [
    {
      id: 'scars',
      name: 'Second Chance Animal Rescue Society (SCARS)',
      type: 'rescue',
      location: 'Edmonton and Athabasca, AB',
      province: 'Alberta',
      website: 'https://scarscare.ca',
      description: 'A no-kill, non-profit organization focusing on rescuing and rehoming animals in northern Alberta.',
      services: ['Adoption', 'Foster Care', 'Rescue Operations'],
      specialties: ['Dogs', 'Cats', 'Northern Alberta Rescue']
    },
    {
      id: 'calgary-humane',
      name: 'Calgary Humane Society',
      type: 'humane society',
      location: 'Calgary, AB',
      province: 'Alberta',
      website: 'https://calgaryhumane.ca',
      description: 'Provides shelter, adoption, and animal welfare services in Calgary and surrounding areas.',
      services: ['Adoption', 'Animal Control', 'Education', 'Veterinary Services'],
      specialties: ['Dogs', 'Cats', 'Small Animals']
    },
    {
      id: 'edmonton-humane',
      name: 'Edmonton Humane Society',
      type: 'humane society',
      location: 'Edmonton, AB',
      province: 'Alberta',
      website: 'https://edmontonhumanesociety.com',
      description: 'Serves Edmonton and surrounding communities with comprehensive animal welfare services.',
      services: ['Adoption', 'Spay/Neuter Programs', 'Education', 'Animal Control'],
      specialties: ['Dogs', 'Cats', 'Community Programs']
    }
  ],
  'Ontario': [
    {
      id: 'ontario-spca',
      name: 'Ontario SPCA and Humane Society',
      type: 'spca',
      location: 'Various locations across Ontario',
      province: 'Ontario',
      website: 'https://ontariospca.ca',
      description: 'Operates multiple shelters across the province, dedicated to animal welfare and protection.',
      services: ['Adoption', 'Animal Control', 'Education', 'Veterinary Services'],
      specialties: ['Dogs', 'Cats', 'Small Animals', 'Farm Animals']
    },
    {
      id: 'toronto-humane',
      name: 'Toronto Humane Society',
      type: 'humane society',
      location: 'Toronto, ON',
      province: 'Ontario',
      website: 'https://torontohumanesociety.com',
      description: 'Provides shelter and adoption services for animals in Toronto and surrounding areas.',
      services: ['Adoption', 'Behavioral Support', 'Medical Care', 'Community Programs'],
      specialties: ['Dogs', 'Cats', 'Behavioral Rehabilitation']
    },
    {
      id: 'ottawa-humane',
      name: 'Ottawa Humane Society',
      type: 'humane society',
      location: 'Ottawa, ON',
      province: 'Ontario',
      website: 'https://ottawahumane.ca',
      description: 'Serves the Ottawa area with comprehensive animal welfare and adoption services.',
      services: ['Adoption', 'Animal Control', 'Education', 'Emergency Services'],
      specialties: ['Dogs', 'Cats', 'Wildlife Rescue']
    }
  ],
  'Quebec': [
    {
      id: 'montreal-spca',
      name: 'Montreal SPCA',
      type: 'spca',
      location: 'Montreal, QC',
      province: 'Quebec',
      website: 'https://spca.com',
      description: 'Provides shelter and adoption services for animals in Montreal and surrounding areas.',
      services: ['Adoption', 'Animal Control', 'Legal Advocacy', 'Education'],
      specialties: ['Dogs', 'Cats', 'Legal Animal Protection']
    },
    {
      id: 'quebec-spca',
      name: 'Quebec SPCA',
      type: 'spca',
      location: 'Quebec City, QC',
      province: 'Quebec',
      website: 'https://spcaquebec.ca',
      description: 'Serves Quebec City and surrounding regions with animal welfare services.',
      services: ['Adoption', 'Animal Control', 'Veterinary Services'],
      specialties: ['Dogs', 'Cats', 'Small Animals']
    }
  ],
  'Manitoba': [
    {
      id: 'winnipeg-humane',
      name: 'Winnipeg Humane Society',
      type: 'humane society',
      location: 'Winnipeg, MB',
      province: 'Manitoba',
      website: 'https://winnipeghumanesociety.ca',
      description: 'Offers shelter and adoption services for animals in Winnipeg and surrounding areas.',
      services: ['Adoption', 'Animal Control', 'Education', 'Veterinary Services'],
      specialties: ['Dogs', 'Cats', 'Community Outreach']
    }
  ],
  'Saskatchewan': [
    {
      id: 'saskatoon-spca',
      name: 'Saskatoon SPCA',
      type: 'spca',
      location: 'Saskatoon, SK',
      province: 'Saskatchewan',
      website: 'https://saskatoonspca.com',
      description: 'Offers shelter and adoption services for animals in Saskatoon and surrounding areas.',
      services: ['Adoption', 'Animal Control', 'Education'],
      specialties: ['Dogs', 'Cats', 'Small Animals']
    },
    {
      id: 'regina-humane',
      name: 'Regina Humane Society',
      type: 'humane society',
      location: 'Regina, SK',
      province: 'Saskatchewan',
      website: 'https://reginahumanesociety.ca',
      description: 'Serves Regina and surrounding communities with animal welfare services.',
      services: ['Adoption', 'Animal Control', 'Education', 'Veterinary Services'],
      specialties: ['Dogs', 'Cats', 'Community Programs']
    }
  ],
  'Nova Scotia': [
    {
      id: 'ns-spca',
      name: 'Nova Scotia SPCA',
      type: 'spca',
      location: 'Various locations across Nova Scotia',
      province: 'Nova Scotia',
      website: 'https://nsspca.ca',
      description: 'Operates multiple shelters across the province, dedicated to animal welfare and protection.',
      services: ['Adoption', 'Animal Control', 'Education', 'Veterinary Services'],
      specialties: ['Dogs', 'Cats', 'Small Animals', 'Farm Animals']
    }
  ],
  'New Brunswick': [
    {
      id: 'fredericton-spca',
      name: 'Fredericton SPCA',
      type: 'spca',
      location: 'Fredericton, NB',
      province: 'New Brunswick',
      website: 'https://frederictonspca.ca',
      description: 'Provides shelter and adoption services for animals in the Fredericton area.',
      services: ['Adoption', 'Animal Control', 'Education'],
      specialties: ['Dogs', 'Cats', 'Small Animals']
    },
    {
      id: 'moncton-spca',
      name: 'Moncton SPCA',
      type: 'spca',
      location: 'Moncton, NB',
      province: 'New Brunswick',
      website: 'https://monctonspca.ca',
      description: 'Serves Moncton and surrounding areas with animal welfare services.',
      services: ['Adoption', 'Animal Control', 'Education'],
      specialties: ['Dogs', 'Cats', 'Community Programs']
    }
  ],
  'Newfoundland and Labrador': [
    {
      id: 'nl-spca',
      name: 'SPCA St. John\'s',
      type: 'spca',
      location: 'St. John\'s, NL',
      province: 'Newfoundland and Labrador',
      website: 'https://spcastjohns.ca',
      description: 'Offers shelter and adoption services for animals in St. John\'s and surrounding areas.',
      services: ['Adoption', 'Animal Control', 'Education'],
      specialties: ['Dogs', 'Cats', 'Small Animals']
    }
  ],
  'Prince Edward Island': [
    {
      id: 'pei-humane',
      name: 'PEI Humane Society',
      type: 'humane society',
      location: 'Charlottetown, PE',
      province: 'Prince Edward Island',
      website: 'https://peihumanesociety.com',
      description: 'Offers shelter and adoption services for animals in Prince Edward Island.',
      services: ['Adoption', 'Animal Control', 'Education', 'Veterinary Services'],
      specialties: ['Dogs', 'Cats', 'Small Animals']
    }
  ],
  'Northwest Territories': [
    {
      id: 'beaufort-delta-spca',
      name: 'Beaufort Delta Regional SPCA',
      type: 'spca',
      location: 'Inuvik, NT',
      province: 'Northwest Territories',
      website: 'https://bdspca.ca',
      description: 'Provides shelter and adoption services for animals in the Beaufort Delta region.',
      services: ['Adoption', 'Animal Control', 'Remote Community Support'],
      specialties: ['Dogs', 'Cats', 'Northern Communities']
    }
  ],
  'Yukon': [
    {
      id: 'humane-society-yukon',
      name: 'Humane Society Yukon (Mae Bachur Animal Shelter)',
      type: 'humane society',
      location: 'Whitehorse, YT',
      province: 'Yukon',
      website: 'https://humanesocietyyukon.ca',
      description: 'Located in Whitehorse, this organization provides shelter and adoption services for animals in the region.',
      services: ['Adoption', 'Animal Control', 'Education', 'Remote Services'],
      specialties: ['Dogs', 'Cats', 'Northern Territories']
    }
  ],
  'Nunavut': [
    {
      id: 'iqaluit-humane',
      name: 'Iqaluit Humane Society',
      type: 'humane society',
      location: 'Iqaluit, NU',
      province: 'Nunavut',
      website: 'https://iqaluithumanesociety.ca',
      description: 'Provides shelter and adoption services for animals in Iqaluit and surrounding areas.',
      services: ['Adoption', 'Animal Control', 'Remote Community Support'],
      specialties: ['Dogs', 'Cats', 'Arctic Communities']
    }
  ]
};

// Filter options
const shelterTypes = ['All', 'shelter', 'rescue', 'humane society', 'spca'];
const provinces = ['All', ...Object.keys(canadianShelters)];
const sortOptions = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'province', label: 'Province/Territory' },
  { value: 'type', label: 'Organization Type' }
];

const AdoptPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('province');
  const [expandedProvinces, setExpandedProvinces] = useState<string[]>([]);

  // Flatten all shelters for filtering
  const allShelters = Object.entries(canadianShelters).flatMap(([province, shelters]) =>
    shelters.map(shelter => ({ ...shelter, province }))
  );

  // Filter and sort shelters
  const filteredShelters = allShelters
    .filter(shelter => {
      const matchesSearch = !searchTerm || 
        shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shelter.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shelter.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProvince = selectedProvince === 'All' || shelter.province === selectedProvince;
      const matchesType = selectedType === 'All' || shelter.type === selectedType;
      
      return matchesSearch && matchesProvince && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'province':
          return a.province.localeCompare(b.province) || a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // Group filtered shelters by province
  const groupedShelters = filteredShelters.reduce((acc, shelter) => {
    if (!acc[shelter.province]) {
      acc[shelter.province] = [];
    }
    acc[shelter.province].push(shelter);
    return acc;
  }, {} as Record<string, Shelter[]>);

  // Calculate statistics
  const totalShelters = allShelters.length;
  const totalProvinces = Object.keys(canadianShelters).length;
  const filteredCount = filteredShelters.length;

  // Helper functions
  const getTypeColor = (type: string): string => {
    const colors = {
      'shelter': 'blue',
      'rescue': 'green',
      'humane society': 'orange',
      'spca': 'purple'
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'shelter':
        return <HomeOutlined />;
      case 'rescue':
        return <HeartOutlined />;
      case 'humane society':
        return <InfoCircleOutlined />;
      case 'spca':
        return <TeamOutlined />;
      default:
        return <HomeOutlined />;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedProvince('All');
    setSelectedType('All');
    setSortBy('province');
  };

  const hasActiveFilters = searchTerm !== '' || selectedProvince !== 'All' || selectedType !== 'All';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <Title level={1} style={{ color: '#08979C', marginBottom: '16px' }}>
          <HeartOutlined style={{ marginRight: '12px' }} />
          Adopt from Canadian Shelters & Rescues
        </Title>
        <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '700px', margin: '0 auto' }}>
          Connect with animal shelters and rescue organizations across Canada. 
          Find your perfect companion while supporting local animal welfare organizations.
        </Paragraph>
      </div>

      {/* Statistics Banner */}
      <Card style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: 'none' }}>
        <Row gutter={[24, 16]}>
          <Col xs={12} sm={6}>
            <Statistic 
              title="Total Organizations" 
              value={totalShelters} 
              prefix={<HeartOutlined style={{ color: '#1890ff' }} />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic 
              title="Provinces & Territories" 
              value={totalProvinces} 
              prefix={<EnvironmentOutlined style={{ color: '#52c41a' }} />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic 
              title="Showing Results" 
              value={filteredCount} 
              prefix={<SearchOutlined style={{ color: '#fa8c16' }} />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic 
              title="Organization Types" 
              value={shelterTypes.length - 1} 
              prefix={<InfoCircleOutlined style={{ color: '#722ed1' }} />}
            />
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
          <FilterOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          <Text strong>Search & Filter Organizations</Text>
          {hasActiveFilters && (
            <Badge count="Active" style={{ backgroundColor: '#1890ff', marginLeft: '8px' }} />
          )}
        </div>
        
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} lg={8}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search organizations, locations, or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={8} lg={4}>
            <Select
              style={{ width: '100%' }}
              value={selectedProvince}
              onChange={setSelectedProvince}
              placeholder="Province"
              size="large"
            >
              {provinces.map(province => (
                <Option key={province} value={province}>{province}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={8} lg={4}>
            <Select
              style={{ width: '100%' }}
              value={selectedType}
              onChange={setSelectedType}
              placeholder="Type"
              size="large"
            >
              {shelterTypes.map(type => (
                <Option key={type} value={type}>
                  {type === 'All' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={8} lg={4}>
            <Select
              style={{ width: '100%' }}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Sort by"
              size="large"
            >
              {sortOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} lg={4}>
            <Button 
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              style={{ width: '100%' }}
              icon={<ClearOutlined />}
            >
              Clear All
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Results */}
      {filteredCount > 0 ? (
        <Collapse
          activeKey={expandedProvinces}
          onChange={setExpandedProvinces}
          style={{ marginBottom: '24px' }}
        >
          {Object.entries(groupedShelters).map(([province, shelters]) => (
            <Panel
              key={province}
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <EnvironmentOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{province}</Text>
                    <Badge count={shelters.length} style={{ backgroundColor: '#52c41a' }} />
                  </Space>
                </div>
              }
            >
              <Row gutter={[16, 16]}>
                {shelters.map((shelter) => (
                  <Col xs={24} lg={12} key={shelter.id}>
                    <Card
                      style={{
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        marginBottom: '16px'
                      }}
                      hoverable
                    >
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <Title level={5} style={{ margin: 0, flex: 1 }}>
                            {shelter.name}
                          </Title>
                          <Tag 
                            color={getTypeColor(shelter.type)} 
                            icon={getTypeIcon(shelter.type)}
                            style={{ marginLeft: '8px' }}
                          >
                            {shelter.type.charAt(0).toUpperCase() + shelter.type.slice(1)}
                          </Tag>
                        </div>
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Text type="secondary" style={{ display: 'flex', alignItems: 'center' }}>
                            <EnvironmentOutlined style={{ marginRight: '6px' }} />
                            {shelter.location}
                          </Text>
                          {shelter.description && (
                            <Paragraph style={{ margin: 0, fontSize: '14px' }}>
                              {shelter.description}
                            </Paragraph>
                          )}
                        </Space>
                      </div>

                      {/* Services */}
                      {shelter.services && shelter.services.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                            Services:
                          </Text>
                          <Space wrap size={[4, 4]}>
                            {shelter.services.map(service => (
                              <Tag key={service} size="small" color="blue">{service}</Tag>
                            ))}
                          </Space>
                        </div>
                      )}

                      {/* Specialties */}
                      {shelter.specialties && shelter.specialties.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                            Specialties:
                          </Text>
                          <Space wrap size={[4, 4]}>
                            {shelter.specialties.map(specialty => (
                              <Tag key={specialty} size="small" color="green">{specialty}</Tag>
                            ))}
                          </Space>
                        </div>
                      )}

                      {/* Contact Information */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                        <Space>
                          {shelter.website && (
                            <Tooltip title="Visit Website">
                              <Button
                                type="link"
                                size="small"
                                icon={<GlobalOutlined />}
                                onClick={() => window.open(shelter.website, '_blank')}
                              >
                                Website
                              </Button>
                            </Tooltip>
                          )}
                          {shelter.phone && (
                            <Tooltip title={shelter.phone}>
                              <Button
                                type="link"
                                size="small"
                                icon={<PhoneOutlined />}
                                onClick={() => window.open(`tel:${shelter.phone}`, '_self')}
                              >
                                Call
                              </Button>
                            </Tooltip>
                          )}
                        </Space>
                        <Button
                          type="primary"
                          size="small"
                          icon={<LinkOutlined />}
                          onClick={() => window.open(shelter.website || '#', '_blank')}
                        >
                          Learn More
                        </Button>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Panel>
          ))}
        </Collapse>
      ) : (
        <Empty
          description="No organizations found matching your criteria"
          style={{ padding: '60px 20px' }}
        >
          {hasActiveFilters && (
            <Button type="primary" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </Empty>
      )}

      {/* Information Alert */}
      <Alert
        message="Important Information"
        description={
          <div>
            <Paragraph style={{ margin: 0 }}>
              This directory includes major animal shelters and rescue organizations across Canada. 
              Contact information and services may vary. Please verify details directly with each organization.
            </Paragraph>
            <Paragraph style={{ margin: '8px 0 0 0' }}>
              <Text strong>Before adopting:</Text>
              <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                <li>Research the organization and their adoption process</li>
                <li>Consider your lifestyle and ability to care for a pet</li>
                <li>Be prepared for adoption fees and ongoing pet care costs</li>
                <li>Ask about the animal's health history and behavioral needs</li>
              </ul>
            </Paragraph>
          </div>
        }
        type="info"
        showIcon
        style={{ marginTop: '32px' }}
      />

      {/* Structured Data */}
      <StructuredData 
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Adopt', url: '/adopt' }
        ])} 
      />
    </div>
  );
};

export default AdoptPage;
