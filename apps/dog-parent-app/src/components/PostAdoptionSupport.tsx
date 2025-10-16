'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Timeline, 
  Button, 
  Space, 
  Tag, 
  Alert, 
  List, 
  Collapse,
  Tabs,
  Badge,
  Progress,
  Divider
} from 'antd';
import { 
  HeartOutlined, 
  CalendarOutlined, 
  MedicineBoxOutlined,
  BookOutlined,
  TeamOutlined,
  PhoneOutlined,
  FileTextOutlined,
  TrophyOutlined,
  HomeOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
// TabPane is deprecated, using items prop instead

interface Milestone {
  week: number;
  title: string;
  description: string;
  tasks: string[];
  tips: string[];
  warnings?: string[];
  completed?: boolean;
}

interface Resource {
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide' | 'checklist';
  url?: string;
  icon: React.ReactNode;
}

const PostAdoptionSupport: React.FC = () => {
  const [completedMilestones, setCompletedMilestones] = useState<Set<number>>(new Set());

  const toggleMilestone = (week: number) => {
    const newCompleted = new Set(completedMilestones);
    if (newCompleted.has(week)) {
      newCompleted.delete(week);
    } else {
      newCompleted.add(week);
    }
    setCompletedMilestones(newCompleted);
  };

  const milestones: Milestone[] = [
    {
      week: 1,
      title: "First Week Home",
      description: "The critical adjustment period - focus on comfort and safety",
      tasks: [
        "Schedule vet appointment within 48-72 hours",
        "Set up safe, quiet space for puppy",
        "Establish feeding schedule",
        "Begin house training routine",
        "Introduce to family members gradually"
      ],
      tips: [
        "Keep the environment calm and quiet",
        "Don't overwhelm with too many new experiences",
        "Let the puppy explore at their own pace",
        "Start bonding through gentle play and treats"
      ],
      warnings: [
        "Watch for signs of stress or illness",
        "Don't leave puppy alone for long periods",
        "Avoid overwhelming with visitors"
      ]
    },
    {
      week: 2,
      title: "Settling In",
      description: "Building routines and beginning socialization",
      tasks: [
        "Continue house training consistency",
        "Introduce basic commands (sit, come)",
        "Begin crate training if using",
        "Start socialization with controlled exposure",
        "Establish sleep schedule"
      ],
      tips: [
        "Consistency is key for house training",
        "Keep training sessions short and positive",
        "Reward good behavior immediately",
        "Be patient with accidents"
      ]
    },
    {
      week: 4,
      title: "One Month Milestone",
      description: "Puppy should be more comfortable and showing personality",
      tasks: [
        "Complete first round of vaccinations",
        "Begin more structured training",
        "Introduce to other friendly dogs",
        "Start grooming routine",
        "Plan for spay/neuter consultation"
      ],
      tips: [
        "This is a great time to start puppy classes",
        "Socialization window is still open - expose to new experiences",
        "Continue positive reinforcement training"
      ]
    },
    {
      week: 8,
      title: "Two Month Mark",
      description: "Puppy should be well-adjusted and ready for more challenges",
      tasks: [
        "Complete vaccination series",
        "Begin more advanced training",
        "Increase socialization opportunities",
        "Consider puppy kindergarten",
        "Plan for spay/neuter surgery"
      ],
      tips: [
        "Puppy should be fully house trained by now",
        "Great time to introduce new experiences",
        "Continue building positive associations"
      ]
    },
    {
      week: 12,
      title: "Three Month Milestone",
      description: "Puppy is becoming a confident, well-adjusted family member",
      tasks: [
        "Complete spay/neuter surgery",
        "Begin adolescent training preparation",
        "Increase exercise and mental stimulation",
        "Continue socialization",
        "Plan for long-term care"
      ],
      tips: [
        "Puppy may start testing boundaries - stay consistent",
        "Continue training and socialization",
        "Prepare for adolescent phase"
      ]
    }
  ];

  const resources: Resource[] = [
    {
      title: "Puppy Training Basics",
      description: "Essential training techniques for new puppy owners",
      type: "guide",
      icon: <BookOutlined />,
      url: "/guides/puppy-training"
    },
    {
      title: "House Training Checklist",
      description: "Step-by-step guide to successful house training",
      type: "checklist",
      icon: <FileTextOutlined />,
      url: "/checklists/house-training"
    },
    {
      title: "Socialization Schedule",
      description: "Critical socialization timeline and activities",
      type: "article",
      icon: <TeamOutlined />,
      url: "/articles/socialization"
    },
    {
      title: "Health Care Timeline",
      description: "Vaccination and health check schedule",
      type: "guide",
      icon: <MedicineBoxOutlined />,
      url: "/guides/healthcare"
    },
    {
      title: "Puppy Nutrition Guide",
      description: "Feeding schedules and nutritional needs",
      type: "article",
      icon: <HeartOutlined />,
      url: "/articles/nutrition"
    },
    {
      title: "Emergency Preparedness",
      description: "What to do in case of puppy emergencies",
      type: "guide",
      icon: <SafetyOutlined />,
      url: "/guides/emergency-care"
    }
  ];

  const emergencyContacts = [
    {
      name: "Emergency Vet Hotline",
      number: "1-800-PET-HELP",
      description: "24/7 emergency veterinary assistance",
      icon: <PhoneOutlined />
    },
    {
      name: "Poison Control",
      number: "1-888-426-4435",
      description: "ASPCA Animal Poison Control Center",
      icon: <ExclamationCircleOutlined />
    },
    {
      name: "Your Breeder",
      number: "Contact via HomeForPup",
      description: "Your puppy's breeder for ongoing support",
      icon: <TeamOutlined />
    }
  ];

  const totalMilestones = milestones.length;
  const completedCount = completedMilestones.size;
  const progressPercentage = Math.round((completedCount / totalMilestones) * 100);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={1} style={{ color: '#08979C', marginBottom: '16px' }}>
          Post-Adoption Support Center
        </Title>
        <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
          Congratulations on your new family member! This comprehensive guide will help you navigate the first few months 
          and ensure your puppy grows into a happy, healthy, well-adjusted dog.
        </Paragraph>
      </div>

      {/* Progress Overview */}
      <Card style={{ marginBottom: '24px', background: '#f6ffed', border: '1px solid #b7eb8f' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
              Your Puppy Journey Progress
            </Title>
            <Text style={{ color: '#666' }}>
              Track your puppy's development milestones
            </Text>
          </Col>
          <Col>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {completedCount}/{totalMilestones}
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

      <Tabs 
        defaultActiveKey="milestones" 
        size="large"
        items={[
          {
            key: 'milestones',
            label: (
              <span>
                <CalendarOutlined />
                Development Milestones
              </span>
            ),
            children: (
              <Timeline>
                {milestones.map((milestone, index) => (
                  <Timeline.Item
                    key={milestone.week}
                    dot={
                      completedMilestones.has(milestone.week) ? 
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} /> :
                        <CalendarOutlined style={{ color: '#08979C', fontSize: '16px' }} />
                    }
                    color={completedMilestones.has(milestone.week) ? '#52c41a' : '#08979C'}
                  >
                    <Card 
                      style={{ 
                        marginBottom: '16px',
                        border: completedMilestones.has(milestone.week) ? '1px solid #52c41a' : '1px solid #f0f0f0'
                      }}
                    >
                      <Row justify="space-between" align="top">
                        <Col flex="auto">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <Title level={4} style={{ margin: 0, color: '#08979C' }}>
                              Week {milestone.week}: {milestone.title}
                            </Title>
                            {completedMilestones.has(milestone.week) && (
                              <Tag color="green" icon={<CheckCircleOutlined />}>
                                Completed
                              </Tag>
                            )}
                          </div>
                          <Paragraph style={{ marginBottom: '16px' }}>
                            {milestone.description}
                          </Paragraph>
                          
                          <Row gutter={[16, 16]}>
                            <Col xs={24} md={8}>
                              <Card size="small" title="Key Tasks" style={{ background: '#f6ffed' }}>
                                <List
                                  size="small"
                                  dataSource={milestone.tasks}
                                  renderItem={(task) => (
                                    <List.Item style={{ padding: '4px 0' }}>
                                      <Text>• {task}</Text>
                                    </List.Item>
                                  )}
                                />
                              </Card>
                            </Col>
                            <Col xs={24} md={8}>
                              <Card size="small" title="Pro Tips" style={{ background: '#fff7e6' }}>
                                <List
                                  size="small"
                                  dataSource={milestone.tips}
                                  renderItem={(tip) => (
                                    <List.Item style={{ padding: '4px 0' }}>
                                      <Text>• {tip}</Text>
                                    </List.Item>
                                  )}
                                />
                              </Card>
                            </Col>
                            {milestone.warnings && (
                              <Col xs={24} md={8}>
                                <Card size="small" title="Warnings" style={{ background: '#fff2f0' }}>
                                  <List
                                    size="small"
                                    dataSource={milestone.warnings}
                                    renderItem={(warning) => (
                                      <List.Item style={{ padding: '4px 0' }}>
                                        <Text>• {warning}</Text>
                                      </List.Item>
                                    )}
                                  />
                                </Card>
                              </Col>
                            )}
                          </Row>
                        </Col>
                        <Col>
                          <Button
                            type={completedMilestones.has(milestone.week) ? "default" : "primary"}
                            onClick={() => toggleMilestone(milestone.week)}
                            icon={completedMilestones.has(milestone.week) ? <CheckCircleOutlined /> : <CheckCircleOutlined />}
                          >
                            {completedMilestones.has(milestone.week) ? 'Completed' : 'Mark Complete'}
                          </Button>
                        </Col>
                      </Row>
                    </Card>
                  </Timeline.Item>
                ))}
              </Timeline>
            )
          },
          {
            key: 'resources',
            label: (
              <span>
                <BookOutlined />
                Resources & Guides
              </span>
            ),
            children: (
              <Row gutter={[24, 24]}>
                {resources.map((resource, index) => (
                  <Col xs={24} md={12} lg={8} key={index}>
                    <Card 
                      hoverable
                      style={{ height: '100%' }}
                      actions={[
                        <Button type="link" icon={<FileTextOutlined />}>
                          View Guide
                        </Button>
                      ]}
                    >
                      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <div style={{ fontSize: '32px', color: '#08979C', marginBottom: '8px' }}>
                          {resource.icon}
                        </div>
                        <Title level={5} style={{ margin: 0 }}>
                          {resource.title}
                        </Title>
                      </div>
                      <Paragraph style={{ textAlign: 'center', color: '#666' }}>
                        {resource.description}
                      </Paragraph>
                      <Tag color="blue" style={{ marginTop: '8px' }}>
                        {resource.type.replace('-', ' ')}
                      </Tag>
                    </Card>
                  </Col>
                ))}
              </Row>
            )
          },
          {
            key: 'emergency',
            label: (
              <span>
                <SafetyOutlined />
                Emergency Support
              </span>
            ),
            children: (
              <>
                <Alert
                  message="Emergency Situations"
                  description="If your puppy is in immediate danger or showing signs of serious illness, contact emergency veterinary services immediately."
                  type="error"
                  showIcon
                  style={{ marginBottom: '24px' }}
                />

                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Card title="Emergency Contacts" style={{ height: '100%' }}>
                      <List
                        dataSource={emergencyContacts}
                        renderItem={(contact) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<div style={{ fontSize: '20px', color: '#08979C' }}>{contact.icon}</div>}
                              title={contact.name}
                              description={
                                <div>
                                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#08979C' }}>
                                    {contact.number}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#666' }}>
                                    {contact.description}
                                  </div>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Signs of Emergency" style={{ height: '100%' }}>
                      <List
                        dataSource={[
                          "Difficulty breathing or choking",
                          "Unconsciousness or collapse",
                          "Severe bleeding",
                          "Signs of poisoning (vomiting, diarrhea, drooling)",
                          "Seizures or convulsions",
                          "Inability to urinate or defecate",
                          "Severe pain or distress",
                          "High fever (over 103°F)"
                        ]}
                        renderItem={(sign) => (
                          <List.Item style={{ padding: '8px 0' }}>
                            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
                            <Text>{sign}</Text>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                </Row>
              </>
            )
          },
          {
            key: 'community',
            label: (
              <span>
                <TeamOutlined />
                Community Support
              </span>
            ),
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Card title="Connect with Other Puppy Parents" style={{ height: '100%' }}>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <TeamOutlined style={{ fontSize: '48px', color: '#08979C', marginBottom: '16px' }} />
                      <Title level={4}>Join Our Community</Title>
                      <Paragraph>
                        Connect with other puppy parents, share experiences, and get advice from our supportive community.
                      </Paragraph>
                      <Space>
                        <Button type="primary" icon={<TeamOutlined />}>
                          Join Community
                        </Button>
                        <Button icon={<PhoneOutlined />}>
                          Find Local Groups
                        </Button>
                      </Space>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Breeder Support" style={{ height: '100%' }}>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <HomeOutlined style={{ fontSize: '48px', color: '#08979C', marginBottom: '16px' }} />
                      <Title level={4}>Stay Connected with Your Breeder</Title>
                      <Paragraph>
                        Your breeder is a valuable resource for ongoing support and advice throughout your puppy's life.
                      </Paragraph>
                      <Space>
                        <Button type="primary" icon={<PhoneOutlined />}>
                          Contact Breeder
                        </Button>
                        <Button icon={<FileTextOutlined />}>
                          View Contract
                        </Button>
                      </Space>
                    </div>
                  </Card>
                </Col>
              </Row>
            )
          }
        ]}
      />

      {/* Quick Actions */}
      <Card style={{ marginTop: '32px', textAlign: 'center' }}>
        <Title level={3} style={{ marginBottom: '16px' }}>
          Need Immediate Help?
        </Title>
        <Space size="large" wrap>
          <Button 
            type="primary" 
            size="large"
            icon={<PhoneOutlined />}
            href="tel:1-800-PET-HELP"
          >
            Call Emergency Vet
          </Button>
          <Button 
            size="large"
            icon={<TeamOutlined />}
            href="/community"
          >
            Ask Community
          </Button>
          <Button 
            size="large"
            icon={<FileTextOutlined />}
            href="/guides"
          >
            Browse Guides
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default PostAdoptionSupport;
