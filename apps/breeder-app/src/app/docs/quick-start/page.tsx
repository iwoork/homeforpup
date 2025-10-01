'use client';

import React from 'react';
import { 
  Card, 
  Typography, 
  Steps, 
  Alert, 
  Space, 
  Button,
  Divider,
  List,
  Tag,
  Row,
  Col
} from 'antd';
import { 
  ArrowLeftOutlined,
  HomeOutlined,
  TeamOutlined,
  HeartOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const QuickStartPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/docs">
          <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: '16px' }}>
            Back to Documentation
          </Button>
        </Link>
        <Title level={1} style={{ margin: 0 }}>
          🚀 Quick Start Guide
        </Title>
        <Paragraph style={{ fontSize: '1.1rem', marginTop: '8px' }}>
          Get up and running with the kennel management system in just 5 minutes
        </Paragraph>
      </div>

      {/* Overview */}
      <Alert
        message="What You'll Learn"
        description="This guide will walk you through creating your first kennel, adding your dogs, and tracking your first litter."
        type="info"
        showIcon
        style={{ marginBottom: '32px' }}
      />

      {/* Steps */}
      <Card title="📋 Step-by-Step Instructions">
        <Steps direction="vertical">
          <Step
            title="Create Your Kennel"
            icon={<HomeOutlined />}
            description={
              <div>
                <Paragraph>
                  <strong>1. Click "My Kennels" in the main menu</strong>
                </Paragraph>
                <Paragraph>
                  <strong>2. Click "Add New Kennel" (blue button)</strong>
                </Paragraph>
                <Paragraph>
                  <strong>3. Fill out the 4 steps:</strong>
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    'Step 1: Kennel name, description, contact info',
                    'Step 2: Your address and location',
                    'Step 3: Check facilities you have',
                    'Step 4: Set capacity and breed specialties'
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>• {item}</Text>
                    </List.Item>
                  )}
                />
                <Paragraph>
                  <strong>4. Click "Create Kennel"</strong>
                </Paragraph>
                <Link href="/kennels/new">
                  <Button type="primary" icon={<HomeOutlined />}>
                    Create Kennel Now
                  </Button>
                </Link>
              </div>
            }
          />

          <Step
            title="Add Your Dogs"
            icon={<TeamOutlined />}
            description={
              <div>
                <Paragraph>
                  <strong>1. Go to your kennel page (click on your kennel name)</strong>
                </Paragraph>
                <Paragraph>
                  <strong>2. Click the "Dogs" tab</strong>
                </Paragraph>
                <Paragraph>
                  <strong>3. Click "Add Dog"</strong>
                </Paragraph>
                <Paragraph>
                  <strong>4. Fill in the required information:</strong>
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    'Dog name and nickname',
                    'Breed and gender',
                    'Birth date',
                    'Choose "Parent" or "Puppy"',
                    'Color'
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>• {item}</Text>
                    </List.Item>
                  )}
                />
                <Paragraph>
                  <strong>5. Click "Add Dog"</strong>
                </Paragraph>
                <Alert
                  message="Tip"
                  description="You can add optional information like weight, height, and temperament later."
                  type="info"
                  showIcon
                  style={{ marginTop: '16px' }}
                />
              </div>
            }
          />

          <Step
            title="Track Your First Litter"
            icon={<HeartOutlined />}
            description={
              <div>
                <Paragraph>
                  <strong>1. Click the "Litters" tab</strong>
                </Paragraph>
                <Paragraph>
                  <strong>2. Click "Add Litter"</strong>
                </Paragraph>
                <Paragraph>
                  <strong>3. Fill in the information:</strong>
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    'Litter name (e.g., "Spring 2024 Litter")',
                    'Choose the father (sire) from your parent dogs',
                    'Choose the mother (dam) from your parent dogs',
                    'Expected number of puppies (optional)',
                    'Expected birth date (optional)'
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>• {item}</Text>
                    </List.Item>
                  )}
                />
                <Paragraph>
                  <strong>4. Click "Add Litter"</strong>
                </Paragraph>
                <Alert
                  message="Note"
                  description="You can update the litter information after the puppies are born with actual birth details."
                  type="info"
                  showIcon
                  style={{ marginTop: '16px' }}
                />
              </div>
            }
          />
        </Steps>
      </Card>

      {/* Key Terms */}
      <Card title="🔑 Key Terms" style={{ marginTop: '32px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <List
              dataSource={[
                { term: 'Kennel', definition: 'Your breeding facility or business' },
                { term: 'Parent Dog', definition: 'A dog used for breeding' },
                { term: 'Puppy Dog', definition: 'A young dog not yet used for breeding' },
                { term: 'Litter', definition: 'A group of puppies born to the same mother' }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <Text strong>{item.term}:</Text>
                    <Text>{item.definition}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Col>
          <Col xs={24} md={12}>
            <List
              dataSource={[
                { term: 'Sire', definition: 'The father dog' },
                { term: 'Dam', definition: 'The mother dog' },
                { term: 'Manager', definition: 'Someone who helps manage your kennel' },
                { term: 'Owner', definition: 'The person who created the kennel' }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <Text strong>{item.term}:</Text>
                    <Text>{item.definition}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </Card>

      {/* Quick Actions */}
      <Card title="⚡ Quick Actions" style={{ marginTop: '32px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card 
              hoverable
              style={{ textAlign: 'center', height: '100%' }}
              bodyStyle={{ padding: '20px' }}
            >
              <HomeOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
              <Title level={4} style={{ margin: '0 0 8px 0' }}>Add Kennel</Title>
              <Paragraph style={{ margin: '0 0 16px 0' }}>
                Start a new breeding facility
              </Paragraph>
              <Link href="/kennels/new">
                <Button type="primary" block>
                  Create Kennel
                </Button>
              </Link>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              hoverable
              style={{ textAlign: 'center', height: '100%' }}
              bodyStyle={{ padding: '20px' }}
            >
              <TeamOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '12px' }} />
              <Title level={4} style={{ margin: '0 0 8px 0' }}>Add Dog</Title>
              <Paragraph style={{ margin: '0 0 16px 0' }}>
                Add a new dog to your kennel
              </Paragraph>
              <Link href="/dogs">
                <Button type="primary" block>
                  Manage Dogs
                </Button>
              </Link>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              hoverable
              style={{ textAlign: 'center', height: '100%' }}
              bodyStyle={{ padding: '20px' }}
            >
              <HeartOutlined style={{ fontSize: '32px', color: '#f5222d', marginBottom: '12px' }} />
              <Title level={4} style={{ margin: '0 0 8px 0' }}>Add Litter</Title>
              <Paragraph style={{ margin: '0 0 16px 0' }}>
                Record when puppies are born
              </Paragraph>
              <Link href="/kennels">
                <Button type="primary" block>
                  Manage Litters
                </Button>
              </Link>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Pro Tips */}
      <Card title="💡 Pro Tips" style={{ marginTop: '32px' }}>
        <List
          dataSource={[
            'Keep information up to date - especially health records',
            'Use clear, consistent names for your dogs and litters',
            'Add other people as managers if they help with your kennel',
            'Take your time - there\'s no rush to fill everything out at once',
            'Don\'t hesitate to ask for help if you get stuck!'
          ]}
          renderItem={(item) => (
            <List.Item>
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text>{item}</Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>

      {/* Next Steps */}
      <Card title="🎯 What's Next?" style={{ marginTop: '32px' }}>
        <Paragraph>
          Now that you know the basics, you might want to:
        </Paragraph>
        <List
          dataSource={[
            'Read the Complete User Guide for detailed instructions',
            'Check out the Visual Guide for screenshots and layouts',
            'Browse the FAQ for answers to common questions',
            'Start adding your dogs and creating litters!'
          ]}
          renderItem={(item) => (
            <List.Item>
              <Text>• {item}</Text>
            </List.Item>
          )}
        />
        <Space style={{ marginTop: '16px' }}>
          <Link href="/docs/complete-guide">
            <Button type="primary">
              Read Complete Guide
            </Button>
          </Link>
          <Link href="/docs/visual-guide">
            <Button>
              View Visual Guide
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
};

export default QuickStartPage;
