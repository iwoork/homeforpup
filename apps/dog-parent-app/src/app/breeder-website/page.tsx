'use client';

import React, { useState } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Space,
  Tag,
  List,
  Statistic,
  Alert,
  Timeline,
  Steps,
  Modal,
  Form,
  Input,
  Select,
  message,
  Divider,
  Badge,
  Tooltip
} from 'antd';
import {
  GlobalOutlined,
  HeartOutlined,
  TeamOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  StarOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  EditOutlined,
  ShareAltOutlined,
  TrophyOutlined,
  SafetyOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  MessageOutlined,
  SettingOutlined,
  LinkOutlined,
  EyeOutlined,
  MobileOutlined,
  LaptopOutlined,
  TabletOutlined,
  RocketOutlined,
  CrownOutlined,
  GiftOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  PlayCircleOutlined,
  PictureOutlined,
  FileTextOutlined,
  ContactsOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { generateBreadcrumbSchema } from '@/lib/utils/seo';
import StructuredData from '@/components/StructuredData';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const BreederWebsitePage: React.FC = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm] = Form.useForm();
  const [contactLoading, setContactLoading] = useState(false);

  const heroStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '80px 16px',
    textAlign: 'center' as const,
    marginBottom: '32px'
  };

  const cardStyle = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    height: '100%'
  };

  const sectionStyle = {
    marginBottom: '48px'
  };

  // AI Features data
  const aiFeatures = [
    {
      title: 'AI Content Generation',
      description: 'Automatically create compelling content for your website',
      features: [
        'AI-generated puppy descriptions',
        'Automated social media posts',
        'Smart blog post suggestions',
        'Personalized family communications'
      ],
      icon: <RocketOutlined />,
      color: '#1890ff'
    },
    {
      title: 'AI Family Matching',
      description: 'Intelligent matching system for perfect puppy-family connections',
      features: [
        'AI-powered family compatibility scoring',
        'Automatic waitlist prioritization',
        'Smart recommendation engine',
        'Predictive adoption success rates'
      ],
      icon: <TeamOutlined />,
      color: '#52c41a'
    },
    {
      title: 'AI Photo Optimization',
      description: 'Automatically enhance and optimize your puppy photos',
      features: [
        'AI-powered photo enhancement',
        'Automatic background removal',
        'Smart cropping and composition',
        'Bulk photo processing'
      ],
      icon: <CameraOutlined />,
      color: '#fa8c16'
    },
    {
      title: 'AI Insights & Analytics',
      description: 'Get actionable insights about your breeding program',
      features: [
        'AI-driven performance analytics',
        'Predictive breeding insights',
        'Automated health trend analysis',
        'Smart business recommendations'
      ],
      icon: <EyeOutlined />,
      color: '#722ed1'
    }
  ];

  // Website features data
  const websiteFeatures = [
    {
      title: 'Custom Domain Integration',
      description: 'Your own .com website seamlessly integrated with the HomeForPup kennel management platform',
      features: [
        'Custom domain setup (yourkennel.com)',
        'Professional branding and design',
        'Mobile-responsive layouts',
        'SEO optimization'
      ],
      icon: <GlobalOutlined />,
      color: '#1890ff',
      examples: ['goldenretrievers.com', 'labradors.ca', 'puppiesontario.com']
    },
    {
      title: 'Integrated Puppy Management',
      description: 'All your puppies and litters automatically sync to your website',
      features: [
        'Real-time puppy listings',
        'Automatic availability updates',
        'Photo galleries and videos',
        'Application forms integration'
      ],
      icon: <HeartOutlined />,
      color: '#52c41a',
      examples: ['Available Puppies', 'Upcoming Litters', 'Past Families']
    },
    {
      title: 'Professional Kennel Showcase',
      description: 'Beautiful presentation of your breeding program and facilities',
      features: [
        'Parent dog profiles',
        'Facility photo galleries',
        'Breeding philosophy section',
        'Health testing documentation'
      ],
      icon: <HomeOutlined />,
      color: '#fa8c16',
      examples: ['Our Dogs', 'Our Facility', 'Health Testing']
    },
    {
      title: 'Automated Waitlist System',
      description: 'Integrated waitlist management with your website visitors',
      features: [
        'Online waitlist signup',
        'Automated email notifications',
        'Family preference tracking',
        'Priority queue management'
      ],
      icon: <TeamOutlined />,
      color: '#722ed1',
      examples: ['Join Waitlist', 'Family Preferences', 'Notifications']
    },
    {
      title: 'Contact & Communication',
      description: 'Professional contact forms and messaging integration',
      features: [
        'Custom contact forms',
        'Direct messaging integration',
        'Appointment scheduling',
        'FAQ management'
      ],
      icon: <MessageOutlined />,
      color: '#eb2f96',
      examples: ['Contact Us', 'Schedule Visit', 'Ask Questions']
    },
    {
      title: 'Social Media Integration',
      description: 'Connect your website with social media and online presence',
      features: [
        'Social media feeds',
        'Share buttons',
        'Instagram galleries',
        'Facebook integration'
      ],
      icon: <ShareAltOutlined />,
      color: '#13c2c2',
      examples: ['Social Updates', 'Photo Sharing', 'Community Building']
    }
  ];

  const platformIntegration = [
    {
      title: 'Seamless Data Sync',
      description: 'Your website automatically updates with all platform changes',
      icon: <CheckCircleOutlined />,
      details: [
        'Puppy listings sync instantly',
        'Availability updates automatically',
        'New photos appear immediately',
        'Waitlist changes reflect in real-time'
      ]
    },
    {
      title: 'Unified Dashboard',
      description: 'Manage both your platform profile and website from one place',
      icon: <SettingOutlined />,
      details: [
        'Single login for everything',
        'Unified content management',
        'Centralized messaging',
        'Integrated analytics'
      ]
    },
    {
      title: 'Professional Branding',
      description: 'Consistent branding across platform and website',
      icon: <CrownOutlined />,
      details: [
        'Custom logo and colors',
        'Professional design templates',
        'Brand consistency',
        'Trust-building elements'
      ]
    },
    {
      title: 'Mobile Optimization',
      description: 'Perfect experience on all devices',
      icon: <MobileOutlined />,
      details: [
        'Responsive design',
        'Mobile-first approach',
        'Fast loading times',
        'Touch-friendly interface'
      ]
    }
  ];

  const [pricingToggle, setPricingToggle] = useState<'monthly' | 'annual'>('annual');

  const pricingFeatures = [
    {
      plan: 'Starter',
      monthlyPrice: '$29',
      annualPrice: '$25',
      period: pricingToggle === 'annual' ? '/month' : '/month',
      annualSavings: '$48',
      description: 'Perfect for new breeders',
      features: [
        'Custom domain setup (included)',
        'Professional design templates',
        'Integrated puppy management',
        'Basic waitlist system',
        'Contact form integration',
        'Mobile optimization',
        'AI-powered content suggestions',
        'Basic SEO optimization',
        'Email support',
        'Setup fee: $99'
      ],
      popular: false,
      color: '#1890ff'
    },
    {
      plan: 'Professional',
      monthlyPrice: '$49',
      annualPrice: '$39',
      period: pricingToggle === 'annual' ? '/month' : '/month',
      annualSavings: '$120',
      description: 'For established breeders',
      features: [
        'Everything in Starter',
        'Advanced AI content generation',
        'Social media integration',
        'Photo/video galleries with AI optimization',
        'Appointment scheduling',
        'AI-powered family matching',
        'Advanced SEO optimization',
        'Analytics dashboard',
        'Priority support',
        'SSL certificate included',
        'Setup fee: $79'
      ],
      popular: true,
      color: '#52c41a'
    }
  ];

  const successStories = [
    {
      name: 'Golden Meadows Kennel',
      domain: 'goldenmeadows.com',
      location: 'Ontario, Canada',
      specialty: 'Golden Retrievers',
      results: '300% increase in inquiries',
      quote: 'Our professional website has transformed how families discover us. The integrated waitlist system saves us hours every week.',
      image: '/api/placeholder/300/200'
    },
    {
      name: 'Labrador Haven',
      domain: 'labradorhaven.ca',
      location: 'British Columbia, Canada',
      specialty: 'Labrador Retrievers',
      results: '500+ waitlist families',
      quote: 'The seamless integration with the platform means we never miss an update. Families love the professional presentation.',
      image: '/api/placeholder/300/200'
    },
    {
      name: 'Poodle Paradise',
      domain: 'poodleparadise.com',
      location: 'Alberta, Canada',
      specialty: 'Standard Poodles',
      results: '200% faster rehoming',
      quote: 'Our website showcases our breeding program beautifully. The automated features let us focus on what we love.',
      image: '/api/placeholder/300/200'
    }
  ];

  const handleContactSubmit = async (values: any) => {
    setContactLoading(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          subject: `Breeder Website Inquiry - ${values.websiteType || 'General'}`,
          message: values.message,
          type: 'breeder'
        }),
      });

      if (response.ok) {
        message.success('Thank you! We\'ll contact you within 24 hours to discuss your breeder website.');
        setShowContactModal(false);
        contactForm.resetFields();
      } else {
        message.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      message.error('Failed to send message. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Hero Section */}
      <div style={heroStyle}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Title level={1} style={{ color: 'white', marginBottom: '16px', fontSize: '36px' }}>
            <GlobalOutlined style={{ marginRight: '12px' }} />
            Your Own Professional Breeder Website
          </Title>
          <Paragraph style={{ color: 'white', fontSize: '18px', marginBottom: '24px', maxWidth: '700px', margin: '0 auto 24px' }}>
            Create a stunning, professional website for your kennel that seamlessly integrates with the Home for Pup's <Link href="/kennel-management">Kennel Management Platform</Link>. 
            Showcase your breeding program, manage waitlists, and connect with families - all from your own .com domain.
          </Paragraph>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Button 
              size="large" 
              type="primary" 
              style={{ height: '56px', padding: '0 32px', fontSize: '18px', width: '100%', maxWidth: '350px' }}
              onClick={() => setShowContactModal(true)}
            >
              <RocketOutlined style={{ marginRight: '8px' }} />
              Get Your Website Setup
            </Button>
            <Text style={{ color: 'white', opacity: 0.9, fontSize: '14px' }}>
              Free consultation • Custom domain included • Professional design
            </Text>
          </Space>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        {/* Key Benefits */}
        <section style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ fontSize: '28px' }}>Why Breeders Love Our Website Solution</Title>
            <Paragraph style={{ fontSize: '16px', color: '#666' }}>
              Professional websites that work seamlessly with your HomeForPup kennel management platform
            </Paragraph>
          </div>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
                <Card style={cardStyle} styles={{ body: { padding: '24px', textAlign: 'center' } }}>
                  <GlobalOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                  <Title level={4} style={{ marginBottom: '12px' }}>Your Own .com Domain</Title>
                  <Paragraph style={{ color: '#666' }}>
                    Professional web presence with your own custom domain like yourkennel.com
                  </Paragraph>
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
                <Card style={cardStyle} styles={{ body: { padding: '24px', textAlign: 'center' } }}>
                <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                <Title level={4} style={{ marginBottom: '12px' }}>Seamless Integration</Title>
                <Paragraph style={{ color: '#666' }}>
                  Everything syncs automatically - no duplicate work managing puppies and listings
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
                <Card style={cardStyle} styles={{ body: { padding: '24px', textAlign: 'center' } }}>
                  <MobileOutlined style={{ fontSize: '48px', color: '#fa8c16', marginBottom: '16px' }} />
                  <Title level={4} style={{ marginBottom: '12px' }}>Mobile Perfect</Title>
                  <Paragraph style={{ color: '#666' }}>
                    Beautiful on all devices - phones, tablets, and desktops
                  </Paragraph>
                </Card>
            </Col>
          </Row>
        </section>

        {/* Website Features */}
        <section style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ fontSize: '28px' }}>Complete Website Features</Title>
            <Paragraph style={{ fontSize: '16px', color: '#666' }}>
              Everything you need to showcase your breeding program professionally
            </Paragraph>
          </div>
          <Row gutter={[16, 16]}>
            {websiteFeatures.map((feature, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card
                  style={cardStyle}
                  hoverable
                  styles={{ body: { padding: '20px' } }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '36px', color: feature.color, marginBottom: '12px' }}>
                      {feature.icon}
                    </div>
                    <Title level={4} style={{ marginBottom: '8px', fontSize: '16px' }}>
                      {feature.title}
                    </Title>
                    <Paragraph style={{ color: '#666', marginBottom: '12px', fontSize: '14px' }}>
                      {feature.description}
                    </Paragraph>
                  </div>
                  <List
                    size="small"
                    dataSource={feature.features}
                    renderItem={(item) => (
                      <List.Item style={{ padding: '4px 0', fontSize: '12px' }}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '6px', fontSize: '12px' }} />
                        {item}
                      </List.Item>
                    )}
                  />
                  <div style={{ marginTop: '12px', padding: '8px', background: '#f8f9fa', borderRadius: '6px' }}>
                    <Text style={{ fontSize: '11px', fontWeight: 500, color: '#666' }}>Example Pages:</Text>
                    <div style={{ marginTop: '4px' }}>
                      {feature.examples.map((example, idx) => (
                        <Tag key={idx} style={{ margin: '2px', fontSize: '10px' }}>
                          {example}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Platform Integration */}
        <section style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ fontSize: '28px' }}>Seamless Platform Integration</Title>
            <Paragraph style={{ fontSize: '16px', color: '#666' }}>
              Your website and HomeForPup kennel management platform work together perfectly
            </Paragraph>
          </div>
          <Row gutter={[16, 16]}>
            {platformIntegration.map((integration, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card style={cardStyle} styles={{ body: { padding: '20px', textAlign: 'center' } }}>
                  <div style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }}>
                    {integration.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: '8px', fontSize: '16px' }}>
                    {integration.title}
                  </Title>
                  <Paragraph style={{ color: '#666', marginBottom: '12px', fontSize: '14px' }}>
                    {integration.description}
                  </Paragraph>
                  <List
                    size="small"
                    dataSource={integration.details}
                    renderItem={(item) => (
                      <List.Item style={{ padding: '2px 0', fontSize: '11px', justifyContent: 'center' }}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px', fontSize: '10px' }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Success Stories */}
        <section style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ fontSize: '28px' }}>Success Stories</Title>
            <Paragraph style={{ fontSize: '16px', color: '#666' }}>
              See how breeders are transforming their online presence
            </Paragraph>
          </div>
          <Row gutter={[16, 16]}>
            {successStories.map((story, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card style={cardStyle} styles={{ body: { padding: '20px' } }}>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ 
                      width: '100%', 
                      height: '150px', 
                      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px'
                    }}>
                      <PictureOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                    </div>
                    <Title level={4} style={{ marginBottom: '4px', fontSize: '16px' }}>
                      {story.name}
                    </Title>
                    <Text style={{ color: '#1890ff', fontSize: '14px', fontWeight: 500 }}>
                      {story.domain}
                    </Text>
                    <div style={{ marginTop: '8px' }}>
                      <Tag color="blue" style={{ fontSize: '11px' }}>{story.specialty}</Tag>
                      <Tag color="green" style={{ fontSize: '11px' }}>{story.location}</Tag>
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                    <Badge 
                      count={story.results} 
                      style={{ backgroundColor: '#52c41a' }}
                      offset={[0, 0]}
                    />
                  </div>
                  <blockquote style={{ 
                    fontStyle: 'italic', 
                    color: '#666', 
                    fontSize: '14px',
                    borderLeft: '3px solid #1890ff',
                    paddingLeft: '12px',
                    margin: 0
                  }}>
                    "{story.quote}"
                  </blockquote>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* AI Features */}
        <section style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ fontSize: '28px' }}>
              <RocketOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
              AI-Powered Features
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#666' }}>
              Advanced AI technology that revolutionizes your breeding business
            </Paragraph>
          </div>
          <Row gutter={[16, 16]}>
            {aiFeatures.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  style={cardStyle}
                  hoverable
                  styles={{ body: { padding: '20px', textAlign: 'center' } }}
                >
                  <div style={{ fontSize: '32px', color: feature.color, marginBottom: '12px' }}>
                    {feature.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: '8px', fontSize: '16px' }}>
                    {feature.title}
                  </Title>
                  <Paragraph style={{ color: '#666', marginBottom: '12px', fontSize: '14px' }}>
                    {feature.description}
                  </Paragraph>
                  <List
                    size="small"
                    dataSource={feature.features}
                    renderItem={(item) => (
                      <List.Item style={{ padding: '2px 0', fontSize: '11px', justifyContent: 'center' }}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px', fontSize: '10px' }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        {/* Pricing */}
        <section style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ fontSize: '28px' }}>Simple, Transparent Pricing</Title>
            <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
              Choose the plan that fits your breeding program with no hidden fees
            </Paragraph>
             <Alert
            message="What's Included in Every Plan"
            description={
              <div>
                <Text>• Custom domain setup and professional design</Text><br/>
                <Text>• Full integration with Home for Pup's <Link href="/kennel-management">Kennel Management Platform</Link></Text><br/>
                <Text>• AI-powered features and automation</Text><br/>
                <Text>• Mobile optimization and SSL certificate</Text><br/>
                <Text>• Email support and regular updates</Text>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: '32px', textAlign: 'left', width: '80%', margin: '30px auto' }}
          />
            {/* Pricing Toggle */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginBottom: '32px',
              background: '#f8f9fa',
              padding: '4px',
              borderRadius: '8px',
              width: 'fit-content',
              margin: '0 auto 32px'
            }}>
              <Button
                type={pricingToggle === 'monthly' ? 'primary' : 'text'}
                onClick={() => setPricingToggle('monthly')}
                style={{ 
                  borderRadius: '6px',
                  background: pricingToggle === 'monthly' ? '#1890ff' : 'transparent',
                  border: 'none'
                }}
              >
                Monthly
              </Button>
              <Button
                type={pricingToggle === 'annual' ? 'primary' : 'text'}
                onClick={() => setPricingToggle('annual')}
                style={{ 
                  borderRadius: '6px',
                  background: pricingToggle === 'annual' ? '#1890ff' : 'transparent',
                  border: 'none'
                }}
              >
                Annual (Save up to 20%)
              </Button>
            </div>
          </div>
          
         
          
          <Row gutter={[16, 16]} justify="center">
            {pricingFeatures.map((plan, index) => (
              <Col xs={24} sm={12} lg={10} key={index}>
                <Card 
                  style={{
                    ...cardStyle,
                    border: plan.popular ? '2px solid #52c41a' : undefined,
                    position: 'relative'
                  }}
                  styles={{ body: { padding: '24px' } }}
                >
                  {plan.popular && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#52c41a',
                      color: 'white',
                      padding: '4px 16px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      Most Popular
                    </div>
                  )}
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <Title level={3} style={{ marginBottom: '8px', fontSize: '20px', color: plan.color }}>
                      {plan.plan}
                    </Title>
                    <div style={{ marginBottom: '8px' }}>
                      <Text style={{ fontSize: '36px', fontWeight: 'bold', color: plan.color }}>
                        {pricingToggle === 'annual' ? plan.annualPrice : plan.monthlyPrice}
                      </Text>
                      <Text style={{ fontSize: '16px', color: '#666', marginLeft: '4px' }}>
                        {plan.period}
                      </Text>
                    </div>
                    {pricingToggle === 'annual' && (
                      <div style={{ marginBottom: '8px' }}>
                        <Tag color="green" style={{ fontSize: '12px' }}>
                          Save {plan.annualSavings}/year
                        </Tag>
                      </div>
                    )}
                    <Paragraph style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                      {plan.description}
                    </Paragraph>
                  </div>
                  <List
                    dataSource={plan.features}
                    renderItem={(item) => (
                      <List.Item style={{ padding: '6px 0', fontSize: '14px' }}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px', fontSize: '14px' }} />
                        {item}
                      </List.Item>
                    )}
                  />
                  <div style={{ marginTop: '20px' }}>
                    <Button
                      type={plan.popular ? 'primary' : 'default'}
                      size="large"
                      block
                      style={{ 
                        height: '44px',
                        background: plan.popular ? '#52c41a' : undefined,
                        borderColor: plan.popular ? '#52c41a' : undefined
                      }}
                      onClick={() => setShowContactModal(true)}
                    >
                      Get Started
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Alert
              message="All plans include:"
              description="Custom domain setup, professional design, platform integration, mobile optimization, SSL certificate, and email support"
              type="info"
              showIcon
              style={{ maxWidth: '600px', margin: '0 auto' }}
            />
          </div>
        </section>

        {/* How It Works */}
        <section style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={2} style={{ fontSize: '28px' }}>How It Works</Title>
            <Paragraph style={{ fontSize: '16px', color: '#666' }}>
              Getting your professional breeder website is simple
            </Paragraph>
          </div>
          <Card style={cardStyle} styles={{ body: { padding: '24px' } }}>
            <Steps
              direction="horizontal"
              size="small"
              items={[
                {
                  title: 'Contact Us',
                  description: 'Tell us about your kennel and vision',
                  icon: <ContactsOutlined />
                },
                {
                  title: 'Design & Setup',
                  description: 'We create your custom website',
                  icon: <EditOutlined />
                },
                {
                  title: 'Domain Setup',
                  description: 'Your .com domain goes live',
                  icon: <GlobalOutlined />
                },
                {
                  title: 'Integration',
                  description: 'Connect with Home for Pups Kennel Management Platform',
                  icon: <CheckCircleOutlined />
                },
                {
                  title: 'Launch',
                  description: 'Your professional website is live!',
                  icon: <RocketOutlined />
                }
              ]}
            />
          </Card>
        </section>

        {/* CTA Section */}
        <section style={{ ...sectionStyle, textAlign: 'center' }}>
          <Card style={cardStyle}>
            <div style={{ padding: '48px 24px' }}>
              <RocketOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '24px' }} />
              <Title level={2} style={{ marginBottom: '16px', fontSize: '24px' }}>
                Ready to Launch Your Professional Website?
              </Title>
              <Paragraph style={{ fontSize: '18px', color: '#666', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
                Join hundreds of breeders who have transformed their online presence with professional websites 
                that seamlessly integrate with their Home for Pup's <Link href="/kennel-management">Kennel Management Platform</Link>.
              </Paragraph>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Button 
                  size="large" 
                  type="primary" 
                  style={{ height: '56px', padding: '0 32px', fontSize: '18px', width: '100%', maxWidth: '350px' }}
                  onClick={() => setShowContactModal(true)}
                >
                  <RocketOutlined style={{ marginRight: '8px' }} />
                  Get Started Today
                </Button>
                <div>
                  <Text style={{ color: '#666', fontSize: '14px' }}>
                    Free consultation • No setup fees • Professional design included
                  </Text>
                </div>
              </Space>
            </div>
          </Card>
        </section>
      </div>

      {/* Contact Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <GlobalOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Get Your Professional Breeder Website
          </div>
        }
        open={showContactModal}
        onCancel={() => setShowContactModal(false)}
        footer={null}
        width={600}
      >
        <div style={{ padding: '16px 0' }}>
          <Alert
            message="Free Consultation"
            description="We'll discuss your vision and provide a custom proposal within 24 hours."
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />
          
          <Form
            form={contactForm}
            layout="vertical"
            onFinish={handleContactSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Your Name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input placeholder="John Smith" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="john@example.com" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="kennelName"
              label="Kennel Name"
              rules={[{ required: true, message: 'Please enter your kennel name' }]}
            >
              <Input placeholder="Golden Meadows Kennel" />
            </Form.Item>

            <Form.Item
              name="websiteType"
              label="Plan Interest"
            >
              <Select placeholder="Select your plan interest" allowClear>
                <Option value="starter-monthly">Starter Plan - Monthly ($29/month)</Option>
                <Option value="starter-annual">Starter Plan - Annual ($25/month)</Option>
                <Option value="professional-monthly">Professional Plan - Monthly ($49/month)</Option>
                <Option value="professional-annual">Professional Plan - Annual ($39/month)</Option>
                <Option value="consultation">Just want to learn more</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="message"
              label="Tell us about your vision"
              rules={[{ required: true, message: 'Please tell us about your kennel and website vision' }]}
            >
              <TextArea
                rows={4}
                placeholder="Tell us about your kennel, breeds you work with, and what you'd like to achieve with your website..."
              />
            </Form.Item>

            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setShowContactModal(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={contactLoading}>
                  Send Inquiry
                </Button>
              </Space>
            </div>
          </Form>
        </div>
      </Modal>

      {/* Structured Data */}
      <StructuredData 
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Breeder Website', url: '/breeder-website' }
        ])} 
      />
    </div>
  );
};

export default BreederWebsitePage;
