'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Typography, Steps, Collapse, Space, Button, Alert, Divider, Checkbox } from 'antd';
import { 
  SearchOutlined, 
  HeartOutlined, 
  UserOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const AdoptionGuidePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px'
  };

  const stepData = [
    {
      title: "Research & Prepare",
      description: "Choose your breed and prepare your home",
      icon: <SearchOutlined />,
      content: {
        overview: "Before you start looking for a puppy, it's important to research breeds and prepare your home for your new family member.",
        timeframe: "2-4 weeks before searching",
        keyActions: [
          "Research dog breeds that match your lifestyle",
          "Puppy-proof your home and yard",
          "Purchase essential supplies (bed, food, toys, etc.)",
          "Find a local veterinarian",
          "Budget for initial and ongoing costs",
          "Discuss responsibilities with family members"
        ],
        tips: [
          "Consider your living situation, activity level, and time availability",
          "Remember that puppies require significant time and attention",
          "Budget for unexpected veterinary costs"
        ]
      }
    },
    {
      title: "Meet Dog Families",
      description: "Connect with caring dog families in our community",
      icon: <UserOutlined />,
      content: {
        overview: "Use HomeForPup's community directory to connect with passionate dog families who specialize in your chosen breed.",
        timeframe: "1-2 weeks",
        keyActions: [
          "Browse dog families by breed and location",
          "Read family profiles and community reviews",
          "Check health testing and care practices",
          "Follow families to get updates on upcoming litters",
          "Save your favorite dog families",
          "Learn about their breeding philosophies and values"
        ],
        tips: [
          "Look for families with comprehensive health testing",
          "Read stories from previous puppy families",
          "Consider visiting the family's social media or website"
        ]
      }
    },
    {
      title: "Connect & Chat",
      description: "Reach out to dog families and start conversations",
      icon: <PhoneOutlined />,
      content: {
        overview: "Contact your chosen dog families to express interest and begin getting to know each other.",
        timeframe: "1-2 weeks",
        keyActions: [
          "Message families through HomeForPup platform",
          "Share information about your family and lifestyle",
          "Provide references if requested",
          "Schedule phone calls or video chats",
          "Ask questions about their dogs and approach",
          "Discuss your family's needs and what you're looking for"
        ],
        tips: [
          "Be open about your experience and lifestyle",
          "Ask about health guarantees and support",
          "Learn about their puppy socialization practices"
        ]
      }
    },
    {
      title: "Wait with Excitement",
      description: "Join waiting list and follow the puppy journey",
      icon: <ClockCircleOutlined />,
      content: {
        overview: "Once matched, you'll be part of the journey and receive updates throughout the pregnancy and puppy development.",
        timeframe: "2-4 months typically",
        keyActions: [
          "Join the family's puppy waiting list",
          "Follow litter announcements and puppy updates",
          "Continue preparing your home with excitement",
          "Stay connected with your dog family",
          "Review and discuss the puppy agreement",
          "Plan for puppy pick-up or welcome home day"
        ],
        tips: [
          "Enjoy the anticipation - great dog families often have waiting lists",
          "Use this time to continue learning about puppy care",
          "Consider puppy training classes in your area"
        ]
      }
    },
    {
      title: "Meet & Fall in Love",
      description: "Visit the litter and choose your perfect match",
      icon: <HeartOutlined />,
      content: {
        overview: "Once puppies are old enough (usually 6-8 weeks), you'll visit to meet the litter and find your perfect match.",
        timeframe: "1-2 visits over 2-3 weeks",
        keyActions: [
          "Schedule visit to meet the adorable puppies",
          "Observe puppy personalities and play styles",
          "Meet the parent dogs and see the family dynamic",
          "Tour their loving home environment",
          "Ask final questions about care and health",
          "Choose your puppy or let the family help match you"
        ],
        tips: [
          "Don't just pick based on appearance",
          "Consider personality fit with your family",
          "Trust the dog family's guidance on temperament matching"
        ]
      }
    },
    {
      title: "Welcome Home",
      description: "Complete the process and welcome your new family member",
      icon: <HomeOutlined />,
      content: {
        overview: "Finalize everything and bring your new furry family member home for the adventure to begin.",
        timeframe: "Welcome home day (usually 8-12 weeks old)",
        keyActions: [
          "Complete final paperwork and arrangements",
          "Receive health records and family information",
          "Get feeding instructions and care guidance",
          "Take lots of photos and videos to remember the moment",
          "Transport puppy safely to their new home",
          "Schedule first vet appointment within 48-72 hours"
        ],
        tips: [
          "Bring a comfortable travel crate or carrier",
          "Keep the first few days calm and full of love",
          "Be patient during the adjustment period"
        ]
      }
    }
  ];

  const checklist = [
    { category: "Essential Supplies", items: [
      "Food and water bowls",
      "High-quality puppy food",
      "Cozy dog bed or crate",
      "Collar and leash",
      "ID tag with your contact info",
      "Fun toys for teething and play",
      "Grooming supplies",
      "Waste bags and cleaning supplies"
    ]},
    { category: "Home Preparation", items: [
      "Remove hazardous items from puppy's reach",
      "Secure electrical cords and small objects",
      "Install baby gates if needed",
      "Designate a quiet, safe space for puppy",
      "Set up feeding and cozy sleeping areas",
      "Plan for supervised outdoor exploration"
    ]},
    { category: "Healthcare Setup", items: [
      "Find and contact a caring local veterinarian",
      "Schedule initial health check appointment",
      "Research pet insurance options",
      "Learn about vaccination schedules",
      "Understand spay/neuter timing",
      "Keep emergency vet contact handy"
    ]}
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <Title level={1} style={{ color: '#08979C', marginBottom: '16px' }}>
          Your Puppy Welcome Home Journey
        </Title>
        <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '700px', margin: '0 auto' }}>
          Your complete guide to finding and welcoming a puppy through HomeForPup&apos;s community of caring dog families.
          Follow these steps for a joyful and heartwarming journey to finding your perfect match.
        </Paragraph>
      </div>

      {/* Process Overview */}
      <Card style={cardStyle}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '32px', color: '#08979C' }}>
          Your Journey Timeline
        </Title>
        <Steps
          current={currentStep}
          onChange={setCurrentStep}
          direction="horizontal"
          size="small"
          items={stepData.map((step) => ({
            title: step.title,
            description: step.description,
            icon: step.icon
          }))}
          style={{ marginBottom: '32px' }}
        />
        
        <Alert
          message="Average Journey: 3-6 months from start to welcome home day"
          description="This timeline can vary based on breed popularity, family availability, and the perfect match-making process."
          type="info"
          showIcon
          style={{ marginTop: '24px' }}
        />
      </Card>

      {/* Detailed Step Information */}
      <Card style={cardStyle}>
        <Title level={3} style={{ marginBottom: '24px' }}>
          Step {currentStep + 1}: {stepData[currentStep].title}
        </Title>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <div style={{ marginBottom: '24px' }}>
              <Title level={4} style={{ color: '#FA8072', marginBottom: '12px' }}>Overview</Title>
              <Paragraph>{stepData[currentStep].content.overview}</Paragraph>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Title level={4} style={{ color: '#08979C', marginBottom: '12px' }}>Key Actions</Title>
              <ul style={{ paddingLeft: '20px' }}>
                {stepData[currentStep].content.keyActions.map((action, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>{action}</li>
                ))}
              </ul>
            </div>

            <div>
              <Title level={4} style={{ color: '#52c41a', marginBottom: '12px' }}>Helpful Tips</Title>
              <ul style={{ paddingLeft: '20px', color: '#666' }}>
                {stepData[currentStep].content.tips.map((tip, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>{tip}</li>
                ))}
              </ul>
            </div>
          </Col>

          <Col xs={24} md={8}>
            <Card style={{ background: '#f8f9fa' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '48px', 
                  color: '#08979C',
                  marginBottom: '8px'
                }}>
                  {stepData[currentStep].icon}
                </div>
                <Title level={4} style={{ margin: 0 }}>{stepData[currentStep].title}</Title>
              </div>
              
              <Divider />
              
              <div style={{ textAlign: 'center' }}>
                <Text strong>Typical Timeframe</Text>
                <div style={{ fontSize: '18px', color: '#FA8072', fontWeight: 'bold', marginTop: '4px' }}>
                  {stepData[currentStep].content.timeframe}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Navigation Buttons */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Space size="middle">
            <Button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous Step
            </Button>
            <Button
              type="primary"
              disabled={currentStep === stepData.length - 1}
              onClick={() => setCurrentStep(currentStep + 1)}
              style={{ background: '#08979C', borderColor: '#08979C' }}
            >
              Next Step
            </Button>
          </Space>
        </div>
      </Card>

      {/* Preparation Checklist */}
      <Card style={cardStyle}>
        <Title level={3} style={{ marginBottom: '24px', color: '#FA8072' }}>
          Getting Ready Checklist
        </Title>
        <Row gutter={[24, 24]}>
          {checklist.map((section, sectionIndex) => (
            <Col xs={24} md={8} key={sectionIndex}>
              <Card style={{ height: '100%', background: '#fafafa' }}>
                <Title level={4} style={{ marginBottom: '16px', textAlign: 'center' }}>
                  {section.category}
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Checkbox style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ lineHeight: '1.5', fontSize: '14px' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* FAQ Section */}
      <Card style={cardStyle}>
        <Title level={3} style={{ marginBottom: '24px' }}>
          Frequently Asked Questions
        </Title>
        <Collapse ghost>
          <Panel header="How long does the puppy journey typically take?" key="1">
            <p>The complete journey usually takes 3-6 months from initial research to bringing your puppy home. This includes time for research, connecting with the right dog family, waiting for a litter, and allowing puppies to mature to 8-12 weeks old before going to their new homes.</p>
          </Panel>
          <Panel header="What should I look for in a caring dog family?" key="2">
            <p>Look for families who conduct health testing on parent dogs, provide health support, allow you to meet the mother dog, keep puppies until at least 8 weeks old, ask you questions about your lifestyle, and are open about their approach to raising happy, healthy puppies.</p>
          </Panel>
          <Panel header="How much should I expect to invest in a puppy?" key="3">
            <p>Investment varies significantly by breed, location, and family reputation, typically ranging from $1,500 to $4,000 or more. Remember that initial cost is just the beginning - budget for ongoing expenses like food, veterinary care, grooming, and training for your new family member.</p>
          </Panel>
          <Panel header="What if I need to travel to pick up my puppy?" key="4">
            <p>Many dog families offer delivery services or can coordinate safe transport. If you&apos;re traveling, bring a secure carrier, plan for stops every 2-3 hours, and ensure your puppy is comfortable. Some families may recommend waiting until the puppy is slightly older for long trips.</p>
          </Panel>
          <Panel header="What health support should I expect?" key="5">
            <p>Caring dog families typically offer health support covering genetic conditions for 1-2 years, encourage a veterinary exam within 72 hours of pickup, and provide vaccination records. The specific terms vary by family, so discuss expectations openly.</p>
          </Panel>
        </Collapse>
      </Card>

      {/* Next Steps CTA */}
      <Card style={{ ...cardStyle, background: 'linear-gradient(135deg, #E6F7F7 0%, #FFF0ED 100%)', textAlign: 'center' }}>
        <Title level={3} style={{ marginBottom: '16px' }}>Ready to Start Your Puppy Journey?</Title>
        <Paragraph style={{ marginBottom: '24px', fontSize: '16px' }}>
          Begin your heartwarming journey today by exploring our community of caring dog families and meeting available puppies.
        </Paragraph>
        <Space size="middle">
          <Link href="/breeds">
            <Button size="large" icon={<SearchOutlined />}>
              Research Breeds
            </Button>
          </Link>
          <Link href="/b">
            <Button size="large" icon={<UserOutlined />}>
              Meet Dog Families
            </Button>
          </Link>
          <Link href="/browse">
            <Button 
              type="primary" 
              size="large" 
              icon={<HeartOutlined />}
              style={{ background: '#FA8072', borderColor: '#FA8072' }}
            >
              Meet Available Puppies
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
};

export default AdoptionGuidePage;