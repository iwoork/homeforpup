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
      title: "Find Breeders",
      description: "Browse verified breeders on HomeForPup",
      icon: <UserOutlined />,
      content: {
        overview: "Use HomeForPup's breeder directory to find verified, ethical breeders who specialize in your chosen breed.",
        timeframe: "1-2 weeks",
        keyActions: [
          "Browse breeders by breed and location",
          "Read breeder profiles and reviews",
          "Check health testing and certifications",
          "Follow breeders to get updates on upcoming litters",
          "Save your favorite breeders",
          "Research breeder backgrounds and philosophies"
        ],
        tips: [
          "Look for breeders with health testing documentation",
          "Read reviews from previous puppy families",
          "Consider visiting the breeder's social media or website"
        ]
      }
    },
    {
      title: "Connect & Apply",
      description: "Reach out to breeders and complete applications",
      icon: <PhoneOutlined />,
      content: {
        overview: "Contact your chosen breeders to express interest and begin the application process.",
        timeframe: "1-2 weeks",
        keyActions: [
          "Message breeders through HomeForPup platform",
          "Complete breeder application forms",
          "Provide references if requested",
          "Schedule phone calls or video chats",
          "Ask questions about their breeding program",
          "Discuss your family's needs and preferences"
        ],
        tips: [
          "Be honest about your experience and lifestyle",
          "Ask about health guarantees and contracts",
          "Inquire about socialization practices"
        ]
      }
    },
    {
      title: "Wait for Litter",
      description: "Join waiting list and follow pregnancy updates",
      icon: <ClockCircleOutlined />,
      content: {
        overview: "Once approved, you'll be placed on a waiting list and receive updates throughout the pregnancy and puppy development.",
        timeframe: "2-4 months typically",
        keyActions: [
          "Join the breeder's waiting list",
          "Follow litter announcements and updates",
          "Continue preparing your home",
          "Stay in touch with your breeder",
          "Review and sign puppy contract",
          "Arrange for puppy pick-up or delivery"
        ],
        tips: [
          "Be patient - good breeders often have waiting lists",
          "Use this time to continue learning about puppy care",
          "Consider puppy training classes in your area"
        ]
      }
    },
    {
      title: "Meet & Choose",
      description: "Visit the litter and select your puppy",
      icon: <HeartOutlined />,
      content: {
        overview: "Once puppies are old enough (usually 6-8 weeks), you'll visit to meet the litter and choose your puppy.",
        timeframe: "1-2 visits over 2-3 weeks",
        keyActions: [
          "Schedule visit to meet the puppies",
          "Observe puppy temperaments and personalities",
          "Meet the parent dogs if possible",
          "Tour the breeding facility",
          "Ask final questions about care and health",
          "Make your selection or let breeder match you"
        ],
        tips: [
          "Don't just pick based on appearance",
          "Consider personality fit with your family",
          "Trust your breeder's guidance on temperament matching"
        ]
      }
    },
    {
      title: "Bring Home",
      description: "Complete adoption and welcome your puppy",
      icon: <HomeOutlined />,
      content: {
        overview: "Finalize the adoption process and bring your new family member home.",
        timeframe: "Pick-up day (usually 8-12 weeks old)",
        keyActions: [
          "Complete final paperwork and payment",
          "Receive health records and registration papers",
          "Get feeding instructions and schedule",
          "Take photos and videos",
          "Transport puppy safely home",
          "Schedule first vet appointment within 48-72 hours"
        ],
        tips: [
          "Bring a travel crate or carrier for safe transport",
          "Keep the first few days calm and quiet",
          "Be prepared for an adjustment period"
        ]
      }
    }
  ];

  const checklist = [
    { category: "Essential Supplies", items: [
      "Food and water bowls",
      "High-quality puppy food",
      "Dog bed or crate",
      "Collar and leash",
      "ID tag with your contact info",
      "Toys for teething and play",
      "Grooming supplies",
      "Waste bags and cleaning supplies"
    ]},
    { category: "Home Preparation", items: [
      "Remove hazardous items from puppy's reach",
      "Secure electrical cords and small objects",
      "Install baby gates if needed",
      "Designate a quiet space for puppy",
      "Set up feeding and sleeping areas",
      "Plan for supervised outdoor time"
    ]},
    { category: "Healthcare Setup", items: [
      "Find and contact a local veterinarian",
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
          Puppy Adoption Process
        </Title>
        <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '700px', margin: '0 auto' }}>
          Your complete guide to finding and adopting a puppy through HomeForPup&apos;s network of ethical breeders.
          Follow these steps for a smooth and successful adoption journey.
        </Paragraph>
      </div>

      {/* Process Overview */}
      <Card style={cardStyle}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '32px', color: '#08979C' }}>
          Adoption Timeline Overview
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
          message="Average Timeline: 3-6 months from start to bringing puppy home"
          description="This timeline can vary based on breed popularity, breeder availability, and specific requirements."
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
          Pre-Adoption Checklist
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
          <Panel header="How long does the adoption process typically take?" key="1">
            <p>The complete process usually takes 3-6 months from initial research to bringing your puppy home. This includes time for research, finding the right breeder, waiting for a litter, and allowing puppies to mature to 8-12 weeks old before going home.</p>
          </Panel>
          <Panel header="What should I look for in an ethical breeder?" key="2">
            <p>Look for breeders who conduct health testing on parent dogs, provide health guarantees, allow you to meet the mother dog, keep puppies until at least 8 weeks old, ask you questions about your lifestyle, and are transparent about their breeding practices and facility.</p>
          </Panel>
          <Panel header="How much should I expect to pay for a puppy?" key="3">
            <p>Prices vary significantly by breed, location, and breeder reputation, typically ranging from $1,500 to $4,000 or more. Remember that initial cost is just the beginning - budget for ongoing expenses like food, veterinary care, grooming, and training.</p>
          </Panel>
          <Panel header="What if I need to travel to pick up my puppy?" key="4">
            <p>Many breeders offer delivery services or can coordinate safe transport. If you&apos;re traveling, bring a secure carrier, plan for stops every 2-3 hours, and ensure your puppy is comfortable. Some breeders may recommend waiting until the puppy is slightly older for long trips.</p>
          </Panel>
          <Panel header="What health guarantees should I expect?" key="5">
            <p>Reputable breeders typically offer health guarantees covering genetic conditions for 1-2 years, require a veterinary exam within 72 hours of pickup, and provide vaccination records. The specific terms vary by breeder, so review contracts carefully.</p>
          </Panel>
        </Collapse>
      </Card>

      {/* Next Steps CTA */}
      <Card style={{ ...cardStyle, background: 'linear-gradient(135deg, #E6F7F7 0%, #FFF0ED 100%)', textAlign: 'center' }}>
        <Title level={3} style={{ marginBottom: '16px' }}>Ready to Start Your Journey?</Title>
        <Paragraph style={{ marginBottom: '24px', fontSize: '16px' }}>
          Begin your puppy adoption journey today by exploring our verified breeders and available puppies.
        </Paragraph>
        <Space size="middle">
          <Link href="/breeds">
            <Button size="large" icon={<SearchOutlined />}>
              Research Breeds
            </Button>
          </Link>
          <Link href="/b">
            <Button size="large" icon={<UserOutlined />}>
              Find Breeders
            </Button>
          </Link>
          <Link href="/browse">
            <Button 
              type="primary" 
              size="large" 
              icon={<HeartOutlined />}
              style={{ background: '#FA8072', borderColor: '#FA8072' }}
            >
              Browse Available Puppies
            </Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
};

export default AdoptionGuidePage;