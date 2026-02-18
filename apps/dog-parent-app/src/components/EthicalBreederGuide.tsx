'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Collapse, 
  Tag, 
  Alert, 
  List, 
  Checkbox, 
  Button, 
  Space,
  Divider,
  Badge,
  Tooltip,
  Progress
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
  HeartOutlined,
  TeamOutlined,
  HomeOutlined,
  FileTextOutlined,
  PhoneOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

interface BreederChecklist {
  category: string;
  items: {
    item: string;
    importance: 'critical' | 'important' | 'nice-to-have';
    description: string;
    redFlag?: string;
  }[];
}

const EthicalBreederGuide: React.FC = () => {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const toggleChecklistItem = (itemKey: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemKey)) {
      newCompleted.delete(itemKey);
    } else {
      newCompleted.add(itemKey);
    }
    setCompletedItems(newCompleted);
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return '#ff4d4f';
      case 'important': return '#fa8c16';
      case 'nice-to-have': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'critical': return <ExclamationCircleOutlined />;
      case 'important': return <InfoCircleOutlined />;
      case 'nice-to-have': return <CheckCircleOutlined />;
      default: return null;
    }
  };

  const breederChecklist: BreederChecklist[] = [
    {
      category: "Health & Testing",
      items: [
        {
          item: "Health clearances on parent dogs",
          importance: "critical",
          description: "Both parents should have health clearances for breed-specific conditions (hips, elbows, eyes, heart, etc.)",
          redFlag: "Breeder cannot provide health certificates or says 'my dogs are healthy' without testing"
        },
        {
          item: "Genetic testing results",
          importance: "critical", 
          description: "DNA testing for breed-specific genetic conditions",
          redFlag: "No genetic testing or breeder doesn't understand what tests are needed"
        },
        {
          item: "Veterinary relationship",
          importance: "important",
          description: "Breeder has a good relationship with a veterinarian and regular health checks",
          redFlag: "Breeder doesn't have a regular vet or avoids veterinary care"
        },
        {
          item: "Health guarantee",
          importance: "important",
          description: "Written health guarantee covering genetic conditions for at least 1-2 years",
          redFlag: "No health guarantee or very limited coverage"
        }
      ]
    },
    {
      category: "Breeding Practices",
      items: [
        {
          item: "Limited breeding frequency",
          importance: "critical",
          description: "Female dogs bred no more than once per year, maximum 3-4 litters in lifetime",
          redFlag: "Breeder has multiple litters per year or breeds dogs too young/old"
        },
        {
          item: "Proper age for breeding",
          importance: "critical",
          description: "Dogs should be at least 2 years old before first breeding",
          redFlag: "Breeding dogs under 2 years old or over 8 years old"
        },
        {
          item: "Breeding for improvement",
          importance: "important",
          description: "Breeder focuses on improving the breed, not just producing puppies",
          redFlag: "Breeder admits to breeding for profit only or has no breeding goals"
        },
        {
          item: "Stud selection",
          importance: "important",
          description: "Careful selection of stud dogs with complementary traits and health clearances",
          redFlag: "Random stud selection or using unproven dogs"
        }
      ]
    },
    {
      category: "Puppy Care & Socialization",
      items: [
        {
          item: "Home-raised puppies",
          importance: "critical",
          description: "Puppies raised in the breeder's home, not in kennels or outdoor facilities",
          redFlag: "Puppies kept in kennels, garages, or outdoor-only facilities"
        },
        {
          item: "Early socialization",
          importance: "critical",
          description: "Puppies exposed to various people, sounds, and experiences from birth",
          redFlag: "Puppies isolated or not socialized with people and new experiences"
        },
        {
          item: "Proper weaning process",
          importance: "important",
          description: "Gradual weaning process starting around 4-5 weeks",
          redFlag: "Puppies weaned too early (before 4 weeks) or too late"
        },
        {
          item: "Age-appropriate activities",
          importance: "important",
          description: "Puppies provided with age-appropriate toys, challenges, and learning opportunities",
          redFlag: "No enrichment or inappropriate activities for puppy age"
        }
      ]
    },
    {
      category: "Breeder Transparency",
      items: [
        {
          item: "Home visits allowed",
          importance: "critical",
          description: "Breeder welcomes visits to see the breeding facility and parent dogs",
          redFlag: "Breeder refuses home visits or only meets in public places"
        },
        {
          item: "Meet the parents",
          importance: "critical",
          description: "You can meet at least the mother dog, preferably both parents",
          redFlag: "Cannot meet parent dogs or they're 'not available'"
        },
        {
          item: "Open about practices",
          importance: "important",
          description: "Breeder openly discusses their breeding practices, goals, and philosophy",
          redFlag: "Breeder is secretive or defensive about their practices"
        },
        {
          item: "References provided",
          importance: "important",
          description: "Breeder provides references from previous puppy families",
          redFlag: "No references or only family/friends as references"
        }
      ]
    },
    {
      category: "Support & Responsibility",
      items: [
        {
          item: "Take-back policy",
          importance: "critical",
          description: "Breeder will take back any puppy/dog at any time for any reason",
          redFlag: "No take-back policy or limited return window"
        },
        {
          item: "Lifetime support",
          importance: "important",
          description: "Breeder offers ongoing support and advice throughout the dog's life",
          redFlag: "No ongoing support or 'sold as-is' mentality"
        },
        {
          item: "Spay/neuter requirements",
          importance: "important",
          description: "Breeder requires spay/neuter for pet-quality dogs",
          redFlag: "No spay/neuter requirements or encourages breeding of pet dogs"
        },
        {
          item: "Contract and paperwork",
          importance: "important",
          description: "Written contract with clear terms, health records, and registration papers",
          redFlag: "No written contract or incomplete paperwork"
        }
      ]
    }
  ];

  const redFlags = [
    {
      flag: "Multiple litters available immediately",
      description: "Ethical breeders typically have waiting lists. Immediate availability often indicates overbreeding or poor planning.",
      severity: "high"
    },
    {
      flag: "Won't let you visit the breeding facility",
      description: "Transparent breeders welcome visits. Refusing home visits is a major red flag.",
      severity: "critical"
    },
    {
      flag: "Puppies available before 8 weeks",
      description: "Puppies should stay with their mother and littermates until at least 8 weeks for proper development.",
      severity: "critical"
    },
    {
      flag: "No health testing or clearances",
      description: "Responsible breeders test for breed-specific health conditions. No testing means higher risk of health problems.",
      severity: "critical"
    },
    {
      flag: "Pressure to buy immediately",
      description: "Good breeders want you to be sure. High-pressure sales tactics are concerning.",
      severity: "high"
    },
    {
      flag: "Puppies raised in kennels or outdoor facilities",
      description: "Puppies should be raised in the breeder's home for proper socialization and care.",
      severity: "high"
    },
    {
      flag: "No health guarantee or very limited",
      description: "Ethical breeders stand behind their puppies with comprehensive health guarantees.",
      severity: "high"
    },
    {
      flag: "Breeding dogs too young or too old",
      description: "Dogs should be at least 2 years old and not over 8 years old for breeding.",
      severity: "high"
    },
    {
      flag: "Cannot meet parent dogs",
      description: "You should be able to meet at least the mother dog to assess temperament and health.",
      severity: "critical"
    },
    {
      flag: "No references or only family references",
      description: "Good breeders have multiple satisfied customers willing to provide references.",
      severity: "medium"
    }
  ];

  const totalItems = breederChecklist.reduce((total, category) => total + category.items.length, 0);
  const completedCount = completedItems.size;
  const progressPercentage = Math.round((completedCount / totalItems) * 100);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={1} style={{ color: '#08979C', marginBottom: '16px' }}>
          Ethical Breeder Evaluation Guide
        </Title>
        <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
          Learn how to identify responsible, ethical breeders who prioritize the health and wellbeing of their dogs. 
          Use this guide to evaluate breeders and avoid puppy mills or irresponsible breeding operations.
        </Paragraph>
      </div>

      {/* Progress Overview */}
      <Card style={{ marginBottom: '24px', background: '#f6ffed', border: '1px solid #b7eb8f' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
              Breeder Evaluation Checklist
            </Title>
            <Text style={{ color: '#666' }}>
              Use this checklist to evaluate breeders you're considering
            </Text>
          </Col>
          <Col>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {completedCount}/{totalItems}
              </div>
              <Progress 
                percent={progressPercentage} 
                size="small" 
                strokeColor="#52c41a"
                style={{ width: '120px' }}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Checklist Categories */}
      <Row gutter={[24, 24]}>
        {breederChecklist.map((category, categoryIndex) => (
          <Col xs={24} lg={12} key={categoryIndex}>
            <Card 
              title={
                <Space>
                  <SafetyOutlined style={{ color: '#08979C' }} />
                  {category.category}
                </Space>
              }
              style={{ height: '100%' }}
            >
              <List
                dataSource={category.items}
                renderItem={(item, itemIndex) => {
                  const itemKey = `${categoryIndex}-${itemIndex}`;
                  const isCompleted = completedItems.has(itemKey);
                  
                  return (
                    <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <Checkbox
                            checked={isCompleted}
                            onChange={() => toggleChecklistItem(itemKey)}
                            style={{ marginTop: '2px' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <Text strong style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
                                {item.item}
                              </Text>
                              <Tag 
                                color={getImportanceColor(item.importance)}
                                icon={getImportanceIcon(item.importance)}
                                style={{ fontSize: '10px' }}
                              >
                                {item.importance.replace('-', ' ')}
                              </Tag>
                            </div>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                              {item.description}
                            </Text>
                            {item.redFlag && (
                              <Alert
                                message="Red Flag"
                                description={item.redFlag}
                                type="error"
                                showIcon
                                style={{ marginTop: '8px' }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Red Flags Section */}
      <Card 
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
            Warning Signs & Red Flags
          </Space>
        }
        style={{ marginTop: '24px' }}
      >
        <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
          Be aware of these warning signs that may indicate irresponsible breeding practices or puppy mills:
        </Paragraph>
        
        <Row gutter={[16, 16]}>
          {redFlags.map((flag, index) => (
            <Col xs={24} md={12} key={index}>
              <Alert
                message={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge 
                      color={flag.severity === 'critical' ? '#ff4d4f' : flag.severity === 'high' ? '#fa8c16' : '#faad14'}
                      text={flag.flag}
                    />
                  </div>
                }
                description={flag.description}
                type={flag.severity === 'critical' ? 'error' : flag.severity === 'high' ? 'warning' : 'info'}
                showIcon
                style={{ marginBottom: '8px' }}
              />
            </Col>
          ))}
        </Row>
      </Card>

      {/* Questions to Ask Section */}
      <Card 
        title={
          <Space>
            <FileTextOutlined style={{ color: '#08979C' }} />
            Questions to Ask Breeders
          </Space>
        }
        style={{ marginTop: '24px' }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Title level={4} style={{ color: '#08979C' }}>Health & Testing Questions</Title>
            <List
              dataSource={[
                "What health clearances do the parent dogs have?",
                "Can you provide copies of health certificates?",
                "What genetic testing has been done?",
                "What health guarantee do you provide?",
                "Have there been any health issues in previous litters?",
                "Do you have a relationship with a veterinarian?"
              ]}
              renderItem={(question) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <Text>• {question}</Text>
                </List.Item>
              )}
            />
          </Col>
          <Col xs={24} md={12}>
            <Title level={4} style={{ color: '#08979C' }}>Breeding & Care Questions</Title>
            <List
              dataSource={[
                "How often do you breed your female dogs?",
                "Where are the puppies raised?",
                "How do you socialize the puppies?",
                "Can I meet the parent dogs?",
                "What is your take-back policy?",
                "Do you provide references from previous families?"
              ]}
              renderItem={(question) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <Text>• {question}</Text>
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </Card>

      {/* Resources Section */}
      <Card 
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#08979C' }} />
            Additional Resources
          </Space>
        }
        style={{ marginTop: '24px' }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card size="small" style={{ textAlign: 'center', height: '100%' }}>
              <HeartOutlined style={{ fontSize: '32px', color: '#08979C', marginBottom: '12px' }} />
              <Title level={5}>Breed-Specific Health</Title>
              <Paragraph>
                Research health issues specific to your chosen breed and ensure breeders test for these conditions.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" style={{ textAlign: 'center', height: '100%' }}>
              <TeamOutlined style={{ fontSize: '32px', color: '#08979C', marginBottom: '12px' }} />
              <Title level={5}>Breed Clubs</Title>
              <Paragraph>
                Contact local and national breed clubs for breeder referrals and breed-specific information.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" style={{ textAlign: 'center', height: '100%' }}>
              <HomeOutlined style={{ fontSize: '32px', color: '#08979C', marginBottom: '12px' }} />
              <Title level={5}>Visit in Person</Title>
              <Paragraph>
                Always visit the breeder's home to see the environment and meet the parent dogs.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Action Buttons */}
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <Space size="large">
          <Button 
            type="primary" 
            size="large"
            icon={<EyeOutlined />}
            href="/kennels"
          >
            Browse Verified Breeders
          </Button>
          <Button 
            size="large"
            icon={<FileTextOutlined />}
            href="/adoption-guide"
          >
            Read Adoption Guide
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default EthicalBreederGuide;
