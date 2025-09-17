'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Typography, Input, Select, Tag, Progress, Space, Button, Divider } from 'antd';
import { 
  SearchOutlined, 
  HeartOutlined, 
  HomeOutlined,
  UserOutlined,
  ThunderboltOutlined,
  SafetyOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// Comprehensive breed data
const breeds = [
  {
    id: 1,
    name: "Golden Retriever",
    category: "Sporting",
    size: "Large",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300",
    overview: "Friendly, intelligent, and devoted dogs that make excellent family companions and are great with children.",
    characteristics: {
      energyLevel: 8,
      friendliness: 9,
      trainability: 9,
      groomingNeeds: 6,
      goodWithKids: 10,
      goodWithPets: 8
    },
    physicalTraits: {
      weight: "55-75 lbs",
      height: "21-24 inches",
      lifespan: "10-12 years",
      coat: "Dense, water-repellent double coat"
    },
    temperament: ["Friendly", "Intelligent", "Devoted", "Patient", "Gentle"],
    idealFor: ["Families with children", "Active owners", "First-time owners"],
    exerciseNeeds: "High - 60+ minutes daily",
    commonHealthIssues: ["Hip dysplasia", "Elbow dysplasia", "Heart disease", "Eye conditions"],
    groomingTips: "Weekly brushing, daily during shedding seasons. Regular baths and nail trims.",
    trainingTips: "Highly trainable and eager to please. Respond well to positive reinforcement.",
    funFacts: ["Originally bred to retrieve waterfowl", "Consistently ranks in top 3 most popular breeds", "Natural swimmers"]
  },
  {
    id: 2,
    name: "Labrador Retriever",
    category: "Sporting",
    size: "Large",
    image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300",
    overview: "Outgoing, active dogs that are friendly and outgoing companions who have more than enough affection to go around for a family.",
    characteristics: {
      energyLevel: 9,
      friendliness: 10,
      trainability: 9,
      groomingNeeds: 4,
      goodWithKids: 10,
      goodWithPets: 9
    },
    physicalTraits: {
      weight: "55-80 lbs",
      height: "21.5-24.5 inches",
      lifespan: "10-12 years",
      coat: "Short, dense, weather-resistant double coat"
    },
    temperament: ["Outgoing", "Active", "Friendly", "Loyal", "Gentle"],
    idealFor: ["Active families", "Families with children", "First-time owners"],
    exerciseNeeds: "High - 60+ minutes daily",
    commonHealthIssues: ["Hip dysplasia", "Elbow dysplasia", "Eye conditions", "Exercise induced collapse"],
    groomingTips: "Weekly brushing, more during shedding seasons. Regular nail trims and dental care.",
    trainingTips: "Very trainable and food-motivated. Excel in obedience and agility training.",
    funFacts: ["America's most popular dog breed", "Excellent swimmers", "Come in three colors: yellow, black, and chocolate"]
  },
  {
    id: 3,
    name: "French Bulldog",
    category: "Non-Sporting",
    size: "Small",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300",
    overview: "Adaptable, playful, and smart companions with an easygoing personality that makes them perfect city dogs.",
    characteristics: {
      energyLevel: 4,
      friendliness: 8,
      trainability: 6,
      groomingNeeds: 3,
      goodWithKids: 8,
      goodWithPets: 7
    },
    physicalTraits: {
      weight: "20-28 lbs",
      height: "11-13 inches",
      lifespan: "10-12 years",
      coat: "Short, smooth, fine coat"
    },
    temperament: ["Adaptable", "Playful", "Smart", "Alert", "Affectionate"],
    idealFor: ["Apartment living", "Seniors", "Singles", "Families"],
    exerciseNeeds: "Low to Moderate - 30 minutes daily",
    commonHealthIssues: ["Brachycephalic airway syndrome", "Hip dysplasia", "Eye conditions", "Spinal disorders"],
    groomingTips: "Minimal grooming needed. Weekly brushing and regular nail trims. Clean facial folds daily.",
    trainingTips: "Can be stubborn but respond to positive reinforcement. Keep training sessions short and fun.",
    funFacts: ["Originally bred as companions for lace workers", "Cannot swim well due to body structure", "One of the most popular city breeds"]
  },
  {
    id: 4,
    name: "German Shepherd",
    category: "Herding",
    size: "Large",
    image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300",
    overview: "Confident, courageous, and smart working dogs that are extremely versatile, serving as family companions, guard dogs, and service dogs.",
    characteristics: {
      energyLevel: 9,
      friendliness: 7,
      trainability: 10,
      groomingNeeds: 7,
      goodWithKids: 8,
      goodWithPets: 6
    },
    physicalTraits: {
      weight: "50-90 lbs",
      height: "22-26 inches",
      lifespan: "9-13 years",
      coat: "Double coat with dense outer coat and soft undercoat"
    },
    temperament: ["Confident", "Courageous", "Smart", "Loyal", "Versatile"],
    idealFor: ["Experienced owners", "Active families", "Those wanting a working dog"],
    exerciseNeeds: "High - 2+ hours daily",
    commonHealthIssues: ["Hip dysplasia", "Elbow dysplasia", "Bloat", "Degenerative myelopathy"],
    groomingTips: "Daily brushing required. Shed heavily twice a year. Regular nail trims and dental care.",
    trainingTips: "Highly intelligent and trainable. Need consistent, positive training and socialization.",
    funFacts: ["Originally bred for herding sheep", "Popular police and military dogs", "Second most popular breed in the US"]
  },
  {
    id: 5,
    name: "Poodle",
    category: "Non-Sporting",
    size: "Varies",
    image: "https://images.unsplash.com/photo-1616190167687-b3ebf74aa3af?w=400&h=300",
    overview: "Exceptionally smart and active dogs with a proud, elegant appearance and confident personality. Come in three sizes.",
    characteristics: {
      energyLevel: 7,
      friendliness: 8,
      trainability: 10,
      groomingNeeds: 9,
      goodWithKids: 9,
      goodWithPets: 8
    },
    physicalTraits: {
      weight: "6-70 lbs (varies by size)",
      height: "10-27 inches (varies by size)",
      lifespan: "12-15 years",
      coat: "Curly, dense, hypoallergenic coat"
    },
    temperament: ["Intelligent", "Active", "Alert", "Trainable", "Elegant"],
    idealFor: ["Families with allergies", "Active owners", "Those wanting an intelligent dog"],
    exerciseNeeds: "Moderate to High - 45-60 minutes daily",
    commonHealthIssues: ["Hip dysplasia", "Progressive retinal atrophy", "Epilepsy", "Bloat"],
    groomingTips: "Professional grooming every 6-8 weeks. Daily brushing to prevent matting.",
    trainingTips: "Extremely intelligent and trainable. Excel in obedience, agility, and tricks.",
    funFacts: ["Hypoallergenic coat", "Come in three sizes: Standard, Miniature, and Toy", "Originally water retrievers"]
  },
  {
    id: 6,
    name: "Goldendoodle",
    category: "Designer",
    size: "Medium to Large",
    image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300",
    overview: "A cross between Golden Retriever and Poodle, combining the friendly nature of Goldens with the intelligence of Poodles.",
    characteristics: {
      energyLevel: 7,
      friendliness: 9,
      trainability: 9,
      groomingNeeds: 7,
      goodWithKids: 10,
      goodWithPets: 8
    },
    physicalTraits: {
      weight: "45-75 lbs",
      height: "20-24 inches",
      lifespan: "10-15 years",
      coat: "Wavy to curly, low-shedding coat"
    },
    temperament: ["Friendly", "Intelligent", "Energetic", "Gentle", "Social"],
    idealFor: ["Families with children", "Those with mild allergies", "Active owners"],
    exerciseNeeds: "Moderate to High - 45-60 minutes daily",
    commonHealthIssues: ["Hip dysplasia", "Elbow dysplasia", "Eye conditions", "Heart disease"],
    groomingTips: "Regular brushing 2-3 times per week. Professional grooming every 6-8 weeks.",
    trainingTips: "Highly trainable and eager to please. Respond well to positive reinforcement.",
    funFacts: ["First bred in the 1990s", "Often have reduced shedding", "Popular therapy dogs"]
  },
  {
    id: 7,
    name: "Cavalier King Charles Spaniel",
    category: "Toy",
    size: "Small",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300",
    overview: "Gentle, friendly, and graceful dogs that combine the sporting nature of a spaniel with the gentle temperament of a toy dog.",
    characteristics: {
      energyLevel: 5,
      friendliness: 10,
      trainability: 7,
      groomingNeeds: 6,
      goodWithKids: 9,
      goodWithPets: 9
    },
    physicalTraits: {
      weight: "13-18 lbs",
      height: "12-13 inches",
      lifespan: "9-14 years",
      coat: "Silky, medium-length coat with feathering"
    },
    temperament: ["Gentle", "Friendly", "Graceful", "Affectionate", "Patient"],
    idealFor: ["Families with children", "Seniors", "Apartment living", "First-time owners"],
    exerciseNeeds: "Moderate - 30-45 minutes daily",
    commonHealthIssues: ["Heart conditions", "Eye problems", "Curly coat syndrome", "Episodic falling"],
    groomingTips: "Regular brushing 2-3 times per week. Professional grooming as needed.",
    trainingTips: "Gentle, positive training methods work best. Can be sensitive to harsh corrections.",
    funFacts: ["Named after King Charles II", "Known as 'comfort spaniels'", "Four recognized color patterns"]
  },
  {
    id: 8,
    name: "Border Collie",
    category: "Herding",
    size: "Medium",
    image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300",
    overview: "Remarkably bright workaholics who are affectionate toward friends but may be reserved with strangers. Bred for herding sheep.",
    characteristics: {
      energyLevel: 10,
      friendliness: 6,
      trainability: 10,
      groomingNeeds: 6,
      goodWithKids: 7,
      goodWithPets: 6
    },
    physicalTraits: {
      weight: "30-55 lbs",
      height: "18-22 inches",
      lifespan: "12-15 years",
      coat: "Double coat, either smooth or rough"
    },
    temperament: ["Intelligent", "Energetic", "Alert", "Responsive", "Tenacious"],
    idealFor: ["Very active owners", "Those wanting a working dog", "Experienced dog owners"],
    exerciseNeeds: "Very High - 2+ hours daily",
    commonHealthIssues: ["Hip dysplasia", "Epilepsy", "Eye conditions", "MDR1 gene mutation"],
    groomingTips: "Weekly brushing, daily during shedding seasons. Regular nail trims and dental care.",
    trainingTips: "Extremely intelligent but need mental stimulation. Excel in agility, obedience, and herding trials.",
    funFacts: ["Often considered the smartest dog breed", "Can learn over 1000 words", "Natural herding instinct"]
  }
];

const categories = ["All", "Sporting", "Non-Sporting", "Toy", "Herding", "Designer"];
const sizes = ["All", "Small", "Medium", "Large"];

const BreedsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [expandedBreed, setExpandedBreed] = useState<number | null>(null);

  const filteredBreeds = breeds.filter(breed => {
    const matchesSearch = breed.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || breed.category === selectedCategory;
    const matchesSize = selectedSize === 'All' || breed.size === selectedSize || 
                      (selectedSize === 'Medium' && breed.size === 'Medium to Large') ||
                      (selectedSize === 'Large' && breed.size === 'Medium to Large');
    
    return matchesSearch && matchesCategory && matchesSize;
  });

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
          <Col xs={24} md={8}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search breeds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={setSelectedCategory}
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Select
              style={{ width: '100%' }}
              value={selectedSize}
              onChange={setSelectedSize}
            >
              {sizes.map(size => (
                <Option key={size} value={size}>{size}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Results Count */}
      <div style={{ marginBottom: '24px' }}>
        <Text>
          Showing <Text strong>{filteredBreeds.length}</Text> breed{filteredBreeds.length !== 1 ? 's' : ''}
        </Text>
      </div>

      {/* Breed Cards */}
      <Row gutter={[16, 16]}>
        {filteredBreeds.map(breed => (
          <Col xs={24} lg={12} key={breed.id}>
            <Card 
              style={cardStyle}
              cover={
                <img
                  src={breed.image}
                  alt={breed.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              }
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
                    <Tag key={trait} size="small" color="default">{trait}</Tag>
                  ))}
                  {breed.temperament.length > 4 && (
                    <Tag size="small">+{breed.temperament.length - 4} more</Tag>
                  )}
                </Space>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  type="text"
                  size="small"
                  onClick={() => setExpandedBreed(expandedBreed === breed.id ? null : breed.id)}
                >
                  {expandedBreed === breed.id ? 'Show Less' : 'Learn More'}
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
              {expandedBreed === breed.id && (
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
                          <Tag key={ideal} size="small" color="blue">{ideal}</Tag>
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
                        {breed.funFacts.slice(0, 2).map((fact, index) => (
                          <li key={index}>{fact}</li>
                        ))}
                      </ul>
                    </div>
                  </Space>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* No Results */}
      {filteredBreeds.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#fafafa',
          borderRadius: '12px'
        }}>
          <Title level={4}>No breeds found</Title>
          <Paragraph>Try adjusting your search terms or filters</Paragraph>
        </div>
      )}
    </div>
  );
};

export default BreedsPage;