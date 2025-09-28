'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Steps, Collapse, Space, Button, Alert, Divider, Checkbox, Affix, Progress, Badge } from 'antd';
import { 
  SearchOutlined, 
  HeartOutlined, 
  UserOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  PhoneOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  BookOutlined,
  TeamOutlined,
  MessageOutlined,
  CalendarOutlined,
  EyeOutlined,
  GiftOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const AdoptionGuidePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Brand colors for consistency
  const COLORS = {
    primary: '#08979C', // Brand teal
    secondary: '#13C2C2', // Lighter teal
    accent: '#FF7875', // Soft red for highlights
    neutral: '#F5F5F5', // Light gray
    card: '#FFFFFF', // Clean white
    text: '#262626', // Dark gray
    textSecondary: '#8C8C8C', // Medium gray
    border: '#F0F0F0', // Light border
    success: '#52C41A', // Green
    warning: '#FAAD14' // Orange
  };
  
  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    marginBottom: '24px',
    border: `1px solid ${COLORS.border}`
  };

  // Track completed steps
  const handleStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const stepData = [
    {
      title: "Research & Prepare",
      description: "Choose your breed and prepare your home",
      icon: <BookOutlined />,
      color: COLORS.primary,
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
      icon: <TeamOutlined />,
      color: COLORS.secondary,
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
      icon: <MessageOutlined />,
      color: COLORS.accent,
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
      icon: <CalendarOutlined />,
      color: COLORS.warning,
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
      icon: <EyeOutlined />,
      color: COLORS.accent,
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
      icon: <GiftOutlined />,
      color: COLORS.success,
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

  // Calculate progress percentage
  const progressPercentage = Math.round(((currentStep + 1) / stepData.length) * 100);

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Title level={1} style={{ 
          color: COLORS.text, 
          marginBottom: '16px',
          fontSize: '32px',
          fontWeight: '600'
        }}>
          Your Puppy Adoption Journey
        </Title>
        <Paragraph style={{ 
          fontSize: '16px', 
          color: COLORS.textSecondary, 
          maxWidth: '600px', 
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          A step-by-step guide to finding and welcoming your perfect puppy through our community of caring dog families.
        </Paragraph>
      </div>

      {/* Progress Overview - Sticky */}
      <Affix offsetTop={80}>
        <Card style={{ 
          ...cardStyle, 
          marginBottom: '24px',
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`
        }}>
          <Row align="middle" justify="space-between">
            <Col xs={24} md={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Badge 
                  count={currentStep + 1} 
                  style={{ backgroundColor: COLORS.primary }}
                />
                <div>
                  <Text strong style={{ fontSize: '16px', color: COLORS.text }}>
                    Step {currentStep + 1} of {stepData.length}
                  </Text>
                  <div style={{ color: COLORS.textSecondary, fontSize: '14px' }}>
                    {stepData[currentStep].title}
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <Progress 
                percent={progressPercentage} 
                size="small" 
                strokeColor={COLORS.primary}
                style={{ marginTop: '8px' }}
              />
            </Col>
          </Row>
        </Card>
      </Affix>

      {/* Step Navigation - Sticky */}
      <Affix offsetTop={160}>
        <Card style={{ 
          ...cardStyle, 
          marginBottom: '24px',
          background: COLORS.neutral,
          border: `1px solid ${COLORS.border}`
        }}>
          <Steps
            current={currentStep}
            onChange={setCurrentStep}
            direction="horizontal"
            size="small"
            items={stepData.map((step, index) => ({
              title: (
                <span style={{ 
                  fontSize: '12px',
                  color: currentStep === index ? COLORS.primary : COLORS.textSecondary
                }}>
                  {step.title}
                </span>
              ),
              description: (
                <span style={{ 
                  fontSize: '10px',
                  color: COLORS.textSecondary
                }}>
                  {step.description}
                </span>
              ),
              icon: completedSteps.includes(index) ? 
                <CheckCircleOutlined style={{ color: COLORS.success }} /> : 
                step.icon
            }))}
            style={{ marginBottom: '0' }}
          />
        </Card>
      </Affix>

      {/* Detailed Step Information */}
      <Card style={cardStyle}>
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={16}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ 
                  fontSize: '24px', 
                  color: stepData[currentStep].color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: `${stepData[currentStep].color}15`
                }}>
                  {stepData[currentStep].icon}
                </div>
                <div>
                  <Title level={3} style={{ 
                    margin: 0, 
                    color: COLORS.text,
                    fontSize: '24px'
                  }}>
                    {stepData[currentStep].title}
                  </Title>
                  <Text style={{ 
                    color: COLORS.textSecondary,
                    fontSize: '14px'
                  }}>
                    {stepData[currentStep].description}
                  </Text>
                </div>
              </div>
              
              <Paragraph style={{ 
                fontSize: '16px', 
                lineHeight: '1.6',
                color: COLORS.text,
                marginBottom: '24px'
              }}>
                {stepData[currentStep].content.overview}
              </Paragraph>
            </div>

            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card style={{ 
                  background: `${COLORS.primary}08`,
                  border: `1px solid ${COLORS.primary}20`
                }}>
                  <Title level={4} style={{ 
                    color: COLORS.primary, 
                    marginBottom: '16px',
                    fontSize: '16px'
                  }}>
                    Key Actions
                  </Title>
                  <ul style={{ 
                    paddingLeft: '20px',
                    margin: 0,
                    listStyle: 'none'
                  }}>
                    {stepData[currentStep].content.keyActions.map((action, index) => (
                      <li key={index} style={{ 
                        marginBottom: '12px',
                        position: 'relative',
                        paddingLeft: '20px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: 0,
                          top: '6px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: COLORS.primary
                        }} />
                        <span style={{ 
                          fontSize: '14px',
                          lineHeight: '1.5',
                          color: COLORS.text
                        }}>
                          {action}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card style={{ 
                  background: `${COLORS.success}08`,
                  border: `1px solid ${COLORS.success}20`
                }}>
                  <Title level={4} style={{ 
                    color: COLORS.success, 
                    marginBottom: '16px',
                    fontSize: '16px'
                  }}>
                    Pro Tips
                  </Title>
                  <ul style={{ 
                    paddingLeft: '20px',
                    margin: 0,
                    listStyle: 'none'
                  }}>
                    {stepData[currentStep].content.tips.map((tip, index) => (
                      <li key={index} style={{ 
                        marginBottom: '12px',
                        position: 'relative',
                        paddingLeft: '20px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: 0,
                          top: '6px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: COLORS.success
                        }} />
                        <span style={{ 
                          fontSize: '14px',
                          lineHeight: '1.5',
                          color: COLORS.text
                        }}>
                          {tip}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Col>
            </Row>
          </Col>

          <Col xs={24} lg={8}>
            <Card style={{ 
              background: COLORS.neutral,
              border: `1px solid ${COLORS.border}`,
              textAlign: 'center',
              height: 'fit-content'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  fontSize: '32px', 
                  color: stepData[currentStep].color,
                  marginBottom: '12px'
                }}>
                  {stepData[currentStep].icon}
                </div>
                <Title level={4} style={{ 
                  margin: 0,
                  color: COLORS.text,
                  fontSize: '18px'
                }}>
                  {stepData[currentStep].title}
                </Title>
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              <div style={{ marginBottom: '20px' }}>
                <Text strong style={{ 
                  color: COLORS.textSecondary,
                  fontSize: '14px'
                }}>
                  Typical Timeframe
                </Text>
                <div style={{ 
                  fontSize: '16px', 
                  color: stepData[currentStep].color, 
                  fontWeight: '600', 
                  marginTop: '4px' 
                }}>
                  {stepData[currentStep].content.timeframe}
                </div>
              </div>

              <Button
                type="primary"
                size="small"
                onClick={() => handleStepComplete(currentStep)}
                disabled={completedSteps.includes(currentStep)}
                style={{ 
                  background: COLORS.primary, 
                  borderColor: COLORS.primary,
                  width: '100%'
                }}
              >
                {completedSteps.includes(currentStep) ? 'Completed' : 'Mark Complete'}
              </Button>
            </Card>
          </Col>
        </Row>

        {/* Navigation Buttons */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: `1px solid ${COLORS.border}`
        }}>
          <Space size="middle">
            <Button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(currentStep - 1)}
              size="large"
              style={{ minWidth: '120px' }}
            >
              Previous
            </Button>
            <Button
              type="primary"
              disabled={currentStep === stepData.length - 1}
              onClick={() => setCurrentStep(currentStep + 1)}
              size="large"
              style={{ 
                background: COLORS.primary, 
                borderColor: COLORS.primary,
                minWidth: '120px'
              }}
              icon={<ArrowRightOutlined />}
            >
              Next Step
            </Button>
          </Space>
        </div>
      </Card>

      {/* Preparation Checklist */}
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={3} style={{ 
            marginBottom: '8px', 
            color: COLORS.text,
            fontSize: '24px'
          }}>
            Getting Ready Checklist
          </Title>
          <Text style={{ 
            color: COLORS.textSecondary,
            fontSize: '14px'
          }}>
            Use this checklist to prepare for your new puppy
          </Text>
        </div>
        <Row gutter={[24, 24]}>
          {checklist.map((section, sectionIndex) => (
            <Col xs={24} md={8} key={sectionIndex}>
              <Card style={{ 
                height: '100%', 
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '8px'
              }}>
                <Title level={4} style={{ 
                  marginBottom: '20px', 
                  textAlign: 'center',
                  color: COLORS.text,
                  fontSize: '16px'
                }}>
                  {section.category}
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '12px',
                      padding: '8px',
                      borderRadius: '6px',
                      background: COLORS.neutral
                    }}>
                      <Checkbox 
                        style={{ marginTop: '2px', flexShrink: 0 }}
                        onChange={(e) => {
                          // You could add state management for checklist items here
                          console.log(`${section.category} - ${item}: ${e.target.checked}`);
                        }}
                      />
                      <span style={{ 
                        lineHeight: '1.5', 
                        fontSize: '14px',
                        color: COLORS.text,
                        flex: 1
                      }}>
                        {item}
                      </span>
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
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={3} style={{ 
            marginBottom: '8px', 
            color: COLORS.text,
            fontSize: '24px'
          }}>
            Frequently Asked Questions
          </Title>
          <Text style={{ 
            color: COLORS.textSecondary,
            fontSize: '14px'
          }}>
            Common questions about the puppy adoption process
          </Text>
        </div>
        <Collapse 
          ghost
          expandIconPosition="right"
          style={{ background: 'transparent' }}
        >
          <Panel 
            header={
              <span style={{ 
                fontSize: '16px', 
                fontWeight: '500',
                color: COLORS.text
              }}>
                How long does the puppy journey typically take?
              </span>
            } 
            key="1"
            style={{ 
              background: COLORS.neutral,
              borderRadius: '8px',
              marginBottom: '8px',
              border: `1px solid ${COLORS.border}`
            }}
          >
            <p style={{ 
              color: COLORS.text,
              lineHeight: '1.6',
              margin: 0
            }}>
              The complete journey usually takes 3-6 months from initial research to bringing your puppy home. This includes time for research, connecting with the right dog family, waiting for a litter, and allowing puppies to mature to 8-12 weeks old before going to their new homes.
            </p>
          </Panel>
          <Panel 
            header={
              <span style={{ 
                fontSize: '16px', 
                fontWeight: '500',
                color: COLORS.text
              }}>
                What should I look for in a caring dog family?
              </span>
            } 
            key="2"
            style={{ 
              background: COLORS.neutral,
              borderRadius: '8px',
              marginBottom: '8px',
              border: `1px solid ${COLORS.border}`
            }}
          >
            <p style={{ 
              color: COLORS.text,
              lineHeight: '1.6',
              margin: 0
            }}>
              Look for families who conduct health testing on parent dogs, provide health support, allow you to meet the mother dog, keep puppies until at least 8 weeks old, ask you questions about your lifestyle, and are open about their approach to raising happy, healthy puppies.
            </p>
          </Panel>
          <Panel 
            header={
              <span style={{ 
                fontSize: '16px', 
                fontWeight: '500',
                color: COLORS.text
              }}>
                How much should I expect to invest in a puppy?
              </span>
            } 
            key="3"
            style={{ 
              background: COLORS.neutral,
              borderRadius: '8px',
              marginBottom: '8px',
              border: `1px solid ${COLORS.border}`
            }}
          >
            <p style={{ 
              color: COLORS.text,
              lineHeight: '1.6',
              margin: 0
            }}>
              Investment varies significantly by breed, location, and family reputation, typically ranging from $1,500 to $4,000 or more. Remember that initial cost is just the beginning - budget for ongoing expenses like food, veterinary care, grooming, and training for your new family member.
            </p>
          </Panel>
          <Panel 
            header={
              <span style={{ 
                fontSize: '16px', 
                fontWeight: '500',
                color: COLORS.text
              }}>
                What if I need to travel to pick up my puppy?
              </span>
            } 
            key="4"
            style={{ 
              background: COLORS.neutral,
              borderRadius: '8px',
              marginBottom: '8px',
              border: `1px solid ${COLORS.border}`
            }}
          >
            <p style={{ 
              color: COLORS.text,
              lineHeight: '1.6',
              margin: 0
            }}>
              Many dog families offer delivery services or can coordinate safe transport. If you're traveling, bring a secure carrier, plan for stops every 2-3 hours, and ensure your puppy is comfortable. Some families may recommend waiting until the puppy is slightly older for long trips.
            </p>
          </Panel>
          <Panel 
            header={
              <span style={{ 
                fontSize: '16px', 
                fontWeight: '500',
                color: COLORS.text
              }}>
                What health support should I expect?
              </span>
            } 
            key="5"
            style={{ 
              background: COLORS.neutral,
              borderRadius: '8px',
              marginBottom: '8px',
              border: `1px solid ${COLORS.border}`
            }}
          >
            <p style={{ 
              color: COLORS.text,
              lineHeight: '1.6',
              margin: 0
            }}>
              Caring dog families typically offer health support covering genetic conditions for 1-2 years, encourage a veterinary exam within 72 hours of pickup, and provide vaccination records. The specific terms vary by family, so discuss expectations openly.
            </p>
          </Panel>
        </Collapse>
      </Card>

      {/* Next Steps CTA */}
      <Card style={{ 
        ...cardStyle, 
        background: `linear-gradient(135deg, ${COLORS.primary}08 0%, ${COLORS.accent}08 100%)`, 
        textAlign: 'center',
        border: `1px solid ${COLORS.primary}20`
      }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={3} style={{ 
            marginBottom: '12px',
            color: COLORS.text,
            fontSize: '24px'
          }}>
            Ready to Start Your Puppy Journey?
          </Title>
          <Paragraph style={{ 
            marginBottom: '0',
            fontSize: '16px',
            color: COLORS.textSecondary,
            maxWidth: '600px',
            margin: '0 auto 24px'
          }}>
            Begin your heartwarming journey today by exploring our community of caring dog families and meeting available puppies.
          </Paragraph>
        </div>
        <Space size="middle" wrap>
          <Link href="/breeds">
            <Button 
              size="large" 
              icon={<BookOutlined />}
              style={{
                background: COLORS.card,
                borderColor: COLORS.primary,
                color: COLORS.primary,
                minWidth: '160px'
              }}
            >
              Research Breeds
            </Button>
          </Link>
          <Link href="/breeders">
            <Button 
              size="large" 
              icon={<TeamOutlined />}
              style={{
                background: COLORS.card,
                borderColor: COLORS.secondary,
                color: COLORS.secondary,
                minWidth: '160px'
              }}
            >
              Meet Dog Families
            </Button>
          </Link>
          <Link href="/browse">
            <Button 
              type="primary" 
              size="large" 
              icon={<HeartOutlined />}
              style={{ 
                background: COLORS.primary, 
                borderColor: COLORS.primary,
                minWidth: '160px'
              }}
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