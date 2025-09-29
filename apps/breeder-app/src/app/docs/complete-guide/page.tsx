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
  SettingOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  RocketOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const CompleteGuidePage: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string | string[]>(['getting-started']);

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
          📖 Complete User Guide
        </Title>
        <Paragraph style={{ fontSize: '1.1rem', marginTop: '8px' }}>
          Detailed, step-by-step instructions for all kennel management features
        </Paragraph>
      </div>

      {/* Table of Contents */}
      <Card title="📋 Table of Contents" style={{ marginBottom: '32px' }}>
        <List
          dataSource={[
            'Getting Started',
            'Setting Up Your First Kennel',
            'Managing Your Dogs',
            'Tracking Litters',
            'Understanding the Dashboard',
            'Tips and Best Practices',
            'Troubleshooting'
          ]}
          renderItem={(item, index) => (
            <List.Item>
              <Space>
                <Text strong>{index + 1}.</Text>
                <Text>{item}</Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>

      {/* Collapsible Sections */}
      <Collapse 
        activeKey={activeKey} 
        onChange={setActiveKey}
        size="large"
      >
        <Panel header="🚀 Getting Started" key="getting-started">
          <div>
            <Title level={3}>What You'll Need</Title>
            <List
              dataSource={[
                'A computer, tablet, or smartphone with internet access',
                'Your breeder account login information',
                'Basic information about your kennel and dogs'
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

            <Title level={3}>What This System Does</Title>
            <Paragraph>
              Think of this system as a digital filing cabinet for your breeding business. It helps you:
            </Paragraph>
            <List
              dataSource={[
                'Keep track of all your dogs and their information',
                'Record when puppies are born and who their parents are',
                'Share information with potential puppy families',
                'Work together with other people who help with your kennel'
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
          </div>
        </Panel>

        <Panel header="🏠 Setting Up Your First Kennel" key="kennel-setup">
          <div>
            <Title level={3}>Step 1: Create Your Kennel Profile</Title>
            <List
              dataSource={[
                'Log into your breeder account',
                'Click on "My Kennels" in the main menu',
                'Click the "Add New Kennel" button (it\'s usually blue)'
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <Text strong>•</Text>
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />

            <Title level={3}>Step 2: Fill Out Basic Information</Title>
            <Paragraph>The system will ask you to fill out information in 4 steps:</Paragraph>
            
            <Card title="Step 1: Basic Information" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  'Kennel Name: What you call your kennel (e.g., "Sunny Acres Kennel")',
                  'Business Name: Your official business name (if different from kennel name)',
                  'Description: Tell people about your kennel, your experience, and your breeding philosophy',
                  'Phone Number: Your main contact number',
                  'Email: Your email address',
                  'Website: Your website address (if you have one)'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Card title="Step 2: Location" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  'Street Address: Your kennel\'s full address',
                  'City, State, ZIP Code: Your location details',
                  'Country: Select your country from the dropdown menu',
                  'GPS Coordinates: Optional - you can add these if you know them'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Card title="Step 3: Facilities" size="small" style={{ marginBottom: '16px' }}>
              <Paragraph>Check the boxes for facilities you have:</Paragraph>
              <List
                dataSource={[
                  'Indoor Space: Covered areas for dogs',
                  'Outdoor Space: Open areas for dogs to play',
                  'Exercise Area: Special areas for dogs to run and exercise',
                  'Whelping Area: Special area for mother dogs to have puppies',
                  'Quarantine Area: Separate area for sick dogs',
                  'Grooming Area: Place where you groom dogs',
                  'Veterinary Access: Easy access to a veterinarian',
                  'Climate Control: Heating and air conditioning',
                  'Security System: Cameras, alarms, or other security'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Card title="Step 4: Capacity & Specialties" size="small">
              <List
                dataSource={[
                  'Maximum Dogs: How many dogs you can care for at once',
                  'Maximum Litters: How many litters you can handle at once',
                  'Breed Specialties: What types of dogs you breed (Golden Retrievers, Labradors, etc.)',
                  'Social Media: Links to your Facebook, Instagram, Twitter, or YouTube pages'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Alert
              message="Tip"
              description="You can always update this information later if something changes."
              type="info"
              showIcon
              style={{ marginTop: '16px' }}
            />
          </div>
        </Panel>

        <Panel header="🐕 Managing Your Dogs" key="dog-management">
          <div>
            <Title level={3}>Adding a New Dog</Title>
            <List
              dataSource={[
                'Go to your kennel page (click on your kennel name)',
                'Click the "Dogs" tab',
                'Click "Add Dog"'
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <Text strong>•</Text>
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />

            <Title level={3}>Required Information for Each Dog</Title>
            <List
              dataSource={[
                'Dog Name: The dog\'s registered name',
                'Call Name: The dog\'s nickname (what you call them every day)',
                'Breed: What type of dog (Golden Retriever, Labrador, etc.)',
                'Gender: Male or Female',
                'Type: Parent (used for breeding) or Puppy (young dog not yet used for breeding)',
                'Birth Date: When the dog was born',
                'Color: The dog\'s main color'
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#f5222d' }} />
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />

            <Title level={3}>Optional Information</Title>
            <List
              dataSource={[
                'Markings: Special color patterns or markings',
                'Weight: How much the dog weighs',
                'Height: How tall the dog is',
                'Eye Color: The color of the dog\'s eyes',
                'Temperament: The dog\'s personality (friendly, calm, energetic, etc.)',
                'Special Needs: Any special care the dog needs',
                'Notes: Any other important information'
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <InfoCircleOutlined style={{ color: '#1890ff' }} />
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />

            <Title level={3}>Understanding Dog Types</Title>
            <Card size="small">
              <List
                dataSource={[
                  'Parent Dogs: These are your breeding dogs. They are used to create puppies',
                  'Puppy Dogs: These are young dogs that haven\'t been used for breeding yet'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Space>
                      <Text strong>•</Text>
                      <Text>{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </Panel>

        <Panel header="👶 Tracking Litters" key="litter-tracking">
          <div>
            <Title level={3}>What is a Litter?</Title>
            <Paragraph>
              A litter is a group of puppies born to the same mother at the same time. 
              For example, if your female dog has 6 puppies, that's one litter of 6 puppies.
            </Paragraph>

            <Title level={3}>Creating a New Litter</Title>
            <List
              dataSource={[
                'Go to your kennel page',
                'Click the "Litters" tab',
                'Click "Add Litter"'
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <Text strong>•</Text>
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />

            <Title level={3}>Required Information</Title>
            <List
              dataSource={[
                'Litter Name: A name for this group of puppies (e.g., "Sunny Acres Spring 2024")',
                'Sire (Father): Select the male parent from your parent dogs',
                'Dam (Mother): Select the female parent from your parent dogs',
                'Expected Puppy Count: How many puppies you expect (optional)',
                'Expected Birth Date: When you think the puppies will be born (optional)',
                'Notes: Any special information about this litter'
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#f5222d' }} />
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />

            <Title level={3}>After Puppies Are Born</Title>
            <Paragraph>You can update the litter information to include:</Paragraph>
            <List
              dataSource={[
                'Actual Birth Date: When the puppies were actually born',
                'Actual Puppy Count: How many puppies were born',
                'Health Information: Any problems during birth, vet checkups, etc.',
                'Puppy Details: Information about each individual puppy'
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
          </div>
        </Panel>

        <Panel header="📊 Understanding the Dashboard" key="dashboard">
          <div>
            <Title level={3}>Main Dashboard</Title>
            <Paragraph>When you log in, you'll see your main dashboard with:</Paragraph>
            <List
              dataSource={[
                'Quick Stats: Numbers showing how many kennels, dogs, and puppies you have',
                'Quick Actions: Buttons to quickly add new kennels, dogs, or litters',
                'Recent Activity: A list of recent things you\'ve done in the system'
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <Text strong>•</Text>
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />

            <Title level={3}>Kennel Dashboard</Title>
            <Paragraph>When you click on a specific kennel, you'll see:</Paragraph>
            <List
              dataSource={[
                'Kennel Information: All the details about your kennel',
                'Statistics: How many dogs and litters you have',
                'Tabs for Dogs and Litters: Easy access to manage your dogs and litters'
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <Text strong>•</Text>
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />

            <Title level={3}>Understanding the Numbers</Title>
            <List
              dataSource={[
                'Total Dogs: How many dogs you have in this kennel',
                'Active Litters: How many litters currently have puppies',
                'Total Puppies: How many puppies you have across all litters',
                'Breeding Dogs: How many parent dogs are available for breeding'
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <Text strong>•</Text>
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        </Panel>

        <Panel header="💡 Tips and Best Practices" key="tips">
          <div>
            <Title level={3}>Keeping Information Up to Date</Title>
            <List
              dataSource={[
                'Update dog information regularly, especially health records',
                'Add new litters as soon as you know a dog is pregnant',
                'Update litter information when puppies are born',
                'Keep contact information current'
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

            <Title level={3}>Working with Others</Title>
            <List
              dataSource={[
                'Add other people as managers if they help with your kennel',
                'Only owners can delete kennels, but managers can add and edit information',
                'Share your kennel information with potential puppy families'
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

            <Title level={3}>Organizing Your Information</Title>
            <List
              dataSource={[
                'Use clear, consistent names for your dogs and litters',
                'Add detailed descriptions to help people understand your breeding program',
                'Keep notes about special care or important information'
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

            <Title level={3}>Privacy and Safety</Title>
            <List
              dataSource={[
                'Don\'t share personal information like your home address in public descriptions',
                'Use business contact information for public profiles',
                'Be careful about sharing photos of your home or family'
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#fa8c16' }} />
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        </Panel>

        <Panel header="🔧 Troubleshooting" key="troubleshooting">
          <div>
            <Title level={3}>Common Problems and Solutions</Title>
            
            <Card title="I can't see my kennel" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  'Check that you\'re logged in with the correct account',
                  'Make sure you created the kennel (it might still be saving)',
                  'Try refreshing the page (click the refresh button in your browser)'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Card title="I can't add a dog" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  'Make sure you\'re in the correct kennel (check the kennel name at the top)',
                  'Fill in all required fields (marked with red asterisks)',
                  'Check that the dog\'s birth date is correct'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Card title="The page looks strange" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  'Try refreshing the page (click the refresh button)',
                  'Check your internet connection',
                  'Try using a different browser (Chrome, Firefox, Safari, etc.)'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Card title="I made a mistake in my information" size="small" style={{ marginBottom: '16px' }}>
              <List
                dataSource={[
                  'Click the "Edit" button next to the information you want to change',
                  'Make your changes',
                  'Click "Save" or "Update"'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Card title="I can't find a dog or litter" size="small">
              <List
                dataSource={[
                  'Use the search box at the top of the page',
                  'Check the filters to make sure you\'re looking in the right place',
                  'Make sure you\'re in the correct kennel'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Title level={3}>Getting Help</Title>
            <Paragraph>If you're still having trouble:</Paragraph>
            <List
              dataSource={[
                'Check this guide again - the answer might be here',
                'Ask someone who knows computers to help you',
                'Contact our support team - we\'re here to help!'
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Space>
                    <Text strong>•</Text>
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />
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
              <Link href="/docs/visual-guide">
                <Button type="link" icon={<SettingOutlined />}>
                  Visual Guide
                </Button>
              </Link>
              <Link href="/docs/faq">
                <Button type="link" icon={<QuestionCircleOutlined />}>
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

export default CompleteGuidePage;
