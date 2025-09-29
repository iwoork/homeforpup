'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Collapse, 
  Space, 
  Button,
  Alert,
  List,
  Tag,
  Divider,
  Row,
  Col
} from 'antd';
import { 
  ArrowLeftOutlined,
  HomeOutlined,
  TeamOutlined,
  HeartOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  RocketOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const VisualGuidePage: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string | string[]>(['creating-kennel']);

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
          📸 Visual Step-by-Step Guide
        </Title>
        <Paragraph style={{ fontSize: '1.1rem', marginTop: '8px' }}>
          See exactly what to click and where to find things in the system
        </Paragraph>
      </div>

      {/* Overview */}
      <Alert
        message="Visual Learning"
        description="This guide shows you exactly what to click and where to find things in the system. Perfect for visual learners!"
        type="info"
        showIcon
        style={{ marginBottom: '32px' }}
      />

      {/* Collapsible Sections */}
      <Collapse 
        activeKey={activeKey} 
        onChange={setActiveKey}
        size="large"
      >
        <Panel header="🏠 Creating Your First Kennel" key="creating-kennel">
          <div>
            <Title level={3}>Step 1: Access the Kennel Management</Title>
            <Card size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  '1. Log into your breeder account',
                  '2. Look for "My Kennels" in the main menu',
                  '3. Click on "My Kennels"'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>
            <Alert
              message="What you'll see"
              description="A page with a blue 'Add New Kennel' button"
              type="info"
              showIcon
            />

            <Title level={3}>Step 2: Start the Kennel Creation Process</Title>
            <Card size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  '1. Click the blue "Add New Kennel" button',
                  '2. You\'ll see a form with 4 steps at the top'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>
            <Alert
              message="What you'll see"
              description="A multi-step form with progress indicators"
              type="info"
              showIcon
            />

            <Title level={3}>Step 3: Fill Out Basic Information</Title>
            <Card title="Step 1: Basic Information" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  'Kennel Name: [Text box] - Enter your kennel name',
                  'Business Name: [Text box] - Optional',
                  'Description: [Large text box] - Tell about your kennel',
                  'Phone: [Text box] - Your phone number',
                  'Email: [Text box] - Your email',
                  'Website: [Text box] - Optional'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />
              <Divider />
              <Text strong>Click "Next" to continue</Text>
            </Card>

            <Title level={3}>Step 4: Add Location Details</Title>
            <Card title="Step 2: Location" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  'Street Address: [Text box] - Your full address',
                  'City: [Text box] - Your city',
                  'State: [Text box] - Your state',
                  'ZIP Code: [Text box] - Your ZIP code',
                  'Country: [Dropdown] - Select your country',
                  'Latitude: [Number box] - Optional GPS coordinates',
                  'Longitude: [Number box] - Optional GPS coordinates'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />
              <Divider />
              <Text strong>Click "Next" to continue</Text>
            </Card>

            <Title level={3}>Step 5: Select Your Facilities</Title>
            <Card title="Step 3: Facilities" size="small" style={{ marginBottom: '16px' }}>
              <Text strong>Check the boxes for facilities you have:</Text>
              <List
                dataSource={[
                  '☐ Indoor Space',
                  '☐ Outdoor Space',
                  '☐ Exercise Area',
                  '☐ Whelping Area',
                  '☐ Quarantine Area',
                  '☐ Grooming Area',
                  '☐ Veterinary Access',
                  '☐ Climate Control',
                  '☐ Security System',
                  '☐ Other (specify)'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
              <Divider />
              <Text strong>Click "Next" to continue</Text>
            </Card>

            <Title level={3}>Step 6: Set Capacity and Specialties</Title>
            <Card title="Step 4: Capacity & Specialties" size="small">
              <List
                dataSource={[
                  'Maximum Dogs: [Number] - How many dogs you can handle',
                  'Maximum Litters: [Number] - How many litters at once',
                  'Breed Specialties: [Checkboxes] - Select breeds you work with',
                  'Social Media: [Text boxes] - Optional social media links'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />
              <Divider />
              <Text strong>Click "Create Kennel" to finish</Text>
            </Card>
          </div>
        </Panel>

        <Panel header="🐕 Adding Your First Dog" key="adding-dog">
          <div>
            <Title level={3}>Step 1: Navigate to Your Kennel</Title>
            <Card size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  '1. Click on your kennel name from the kennels list',
                  '2. You\'ll see your kennel details page',
                  '3. Click the "Dogs" tab'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Title level={3}>Step 2: Add a New Dog</Title>
            <Card size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  '1. Click the "Add Dog" button',
                  '2. A popup form will appear'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Title level={3}>Step 3: Fill Out Dog Information</Title>
            <Card title="Required Information" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  'Dog Name: [Text box] - The dog\'s registered name',
                  'Call Name: [Text box] - Nickname (optional)',
                  'Breed: [Text box] - Type of dog',
                  'Gender: [Dropdown] - Male or Female',
                  'Type: [Dropdown] - Parent or Puppy',
                  'Birth Date: [Date picker] - When the dog was born',
                  'Color: [Text box] - Main color'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Card title="Optional Information" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  'Markings: [Text box] - Special patterns',
                  'Weight: [Number box] - In pounds',
                  'Height: [Number box] - In inches',
                  'Eye Color: [Text box] - Eye color',
                  'Temperament: [Text box] - Personality',
                  'Special Needs: [Text box] - Special care needed',
                  'Notes: [Text box] - Other information'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Alert
              message="Click 'Add Dog' to save"
              type="success"
              showIcon
            />
          </div>
        </Panel>

        <Panel header="👶 Creating Your First Litter" key="creating-litter">
          <div>
            <Title level={3}>Step 1: Navigate to Litters</Title>
            <Card size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  '1. From your kennel page, click the "Litters" tab',
                  '2. Click "Add Litter" button'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Title level={3}>Step 2: Fill Out Litter Information</Title>
            <Card title="Required Information" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  'Litter Name: [Text box] - Name for this group of puppies',
                  'Sire (Father): [Dropdown] - Select from your parent dogs',
                  'Dam (Mother): [Dropdown] - Select from your parent dogs'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Card title="Optional Information" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  'Expected Puppy Count: [Number] - How many puppies expected',
                  'Expected Birth Date: [Date picker] - When puppies are due',
                  'Notes: [Text box] - Special information'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Alert
              message="Click 'Add Litter' to save"
              type="success"
              showIcon
            />
          </div>
        </Panel>

        <Panel header="📊 Understanding Your Dashboard" key="dashboard-layout">
          <div>
            <Title level={3}>Main Dashboard Layout</Title>
            <Card size="small" style={{ marginBottom: '16px' }}>
              <pre style={{ fontSize: '12px', margin: 0 }}>
{`┌─────────────────────────────────────────────────────────┐
│ HomeForPup Breeders - Manage Your Kennel                │
├─────────────────────────────────────────────────────────┤
│ Quick Stats:                                            │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ Active  │ │ Total   │ │ Available│ │ New     │        │
│ │ Kennels │ │ Dogs    │ │ Puppies  │ │ Messages│        │
│ │    2    │ │    8    │ │    3    │ │    5    │        │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
├─────────────────────────────────────────────────────────┤
│ Quick Actions:                                          │
│ ┌─────────────────┐ ┌─────────────────┐                │
│ │ Kennel          │ │ Dog             │                │
│ │ Management      │ │ Management      │                │
│ │ [View Kennels]  │ │ [View Dogs]     │                │
│ │ [Add Kennel]    │ │ [Add Dog]       │                │
│ └─────────────────┘ └─────────────────┘                │
└─────────────────────────────────────────────────────────┘`}
              </pre>
            </Card>

            <Title level={3}>Kennel Detail Page Layout</Title>
            <Card size="small" style={{ marginBottom: '16px' }}>
              <pre style={{ fontSize: '12px', margin: 0 }}>
{`┌─────────────────────────────────────────────────────────┐
│ [Kennel Name] - [Business Name]                         │
│ Status: Active | Verified ✓                             │
├─────────────────────────────────────────────────────────┤
│ Contact Info:                                           │
│ 📍 [City, State] | 📞 [Phone] | ✉️ [Email] | 🌐 [Website]│
├─────────────────────────────────────────────────────────┤
│ Stats:                                                  │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ Total   │ │ Active  │ │ Total   │ │ Breeding│        │
│ │ Dogs    │ │ Litters │ │ Puppies │ │ Dogs    │        │
│ │    8    │ │    2    │ │    12   │ │    4    │        │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
├─────────────────────────────────────────────────────────┤
│ Tabs: [Overview] [Dogs (8)] [Litters (2)]              │
└─────────────────────────────────────────────────────────┘`}
              </pre>
            </Card>
          </div>
        </Panel>

        <Panel header="🔍 Finding and Editing Information" key="finding-editing">
          <div>
            <Title level={3}>How to Edit a Kennel</Title>
            <Card size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  '1. Go to "My Kennels" page',
                  '2. Find your kennel in the list',
                  '3. Click the "Edit" button (pencil icon)',
                  '4. Make your changes',
                  '5. Click "Save" or "Update"'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Title level={3}>How to Edit a Dog</Title>
            <Card size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  '1. Go to your kennel page',
                  '2. Click "Dogs" tab',
                  '3. Find the dog you want to edit',
                  '4. Click "Edit" button',
                  '5. Make your changes',
                  '6. Click "Save"'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Title level={3}>How to Search for Something</Title>
            <Card size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  '1. Look for the search box (usually at the top)',
                  '2. Type what you\'re looking for',
                  '3. Press Enter or click the search button',
                  '4. Results will appear below'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </Panel>

        <Panel header="⚠️ Important Buttons and What They Do" key="buttons">
          <div>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Action Buttons" size="small">
                  <List
                    dataSource={[
                      { button: 'Add New Kennel', action: 'Creates a new kennel', when: 'When starting a new breeding facility' },
                      { button: 'Add Dog', action: 'Adds a new dog', when: 'When you get a new dog' },
                      { button: 'Add Litter', action: 'Records a new litter', when: 'When a dog is pregnant or has puppies' },
                      { button: 'Edit', action: 'Changes existing information', when: 'When you need to update something' }
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Text strong>{item.button}</Text>
                          <Text type="secondary">{item.action}</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>{item.when}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Control Buttons" size="small">
                  <List
                    dataSource={[
                      { button: 'Save/Update', action: 'Saves your changes', when: 'After making changes' },
                      { button: 'Cancel', action: 'Discards your changes', when: 'When you don\'t want to save changes' },
                      { button: 'Next', action: 'Goes to next step', when: 'In multi-step forms' },
                      { button: 'Previous', action: 'Goes back a step', when: 'In multi-step forms' }
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Text strong>{item.button}</Text>
                          <Text type="secondary">{item.action}</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>{item.when}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        </Panel>

        <Panel header="🆘 Common Problems and Solutions" key="problems">
          <div>
            <Title level={3}>Visual Problem Solving</Title>
            
            <Card title="I can't see my kennel" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  'Problem: Kennel doesn\'t appear in the list',
                  'Solution:',
                  '  1. Check you\'re logged in correctly',
                  '  2. Refresh the page (F5 key)',
                  '  3. Make sure you completed the kennel creation process'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Card title="The form won't save" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  'Problem: Can\'t save information',
                  'Solution:',
                  '  1. Check all required fields are filled (marked with *)',
                  '  2. Make sure dates are in the correct format',
                  '  3. Try refreshing the page and starting over'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Card title="I can't find a dog" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  'Problem: Dog doesn\'t appear in the list',
                  'Solution:',
                  '  1. Check you\'re in the correct kennel',
                  '  2. Use the search box',
                  '  3. Check the filters aren\'t hiding it'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </Panel>
      </Collapse>

      {/* Help Section */}
      <Card title="🆘 Need More Help?" style={{ marginTop: '32px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Title level={4}>Contact Support</Title>
            <Space direction="vertical">
              <Text>📧 Email us: support@homeforpup.com</Text>
              <Text>📞 Call us: 1-800-HOMEFORPUP</Text>
              <Text>🕒 Hours: Monday-Friday, 9 AM - 5 PM</Text>
            </Space>
          </Col>
          <Col xs={24} md={12}>
            <Title level={4}>Other Resources</Title>
            <Space direction="vertical">
              <Link href="/docs/quick-start">
                <Button type="link" icon={<RocketOutlined />}>
                  Quick Start Guide
                </Button>
              </Link>
              <Link href="/docs/complete-guide">
                <Button type="link" icon={<HomeOutlined />}>
                  Complete Guide
                </Button>
              </Link>
              <Link href="/docs/faq">
                <Button type="link" icon={<InfoCircleOutlined />}>
                  FAQ
                </Button>
              </Link>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default VisualGuidePage;
