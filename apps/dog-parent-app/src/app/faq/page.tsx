'use client';

import React, { useState } from 'react';
import { 
  Card, Row, Col, Typography, Collapse, Space, Tag, Divider, 
  Alert, Button, Affix, Anchor
} from 'antd';
import { 
  QuestionCircleOutlined, HeartOutlined, TeamOutlined, 
  SafetyOutlined, MessageOutlined, HomeOutlined,
  TrophyOutlined, UserOutlined, PhoneOutlined,
  MailOutlined, GlobalOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { generateBreadcrumbSchema } from '@/lib/utils/seo';
import StructuredData from '@/components/StructuredData';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const FAQPage: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string | string[]>([]);

  const faqSections = [
    {
      key: 'about',
      title: 'About HomeForPup',
      icon: <HeartOutlined />,
      color: '#ff4d4f',
      questions: [
        {
          q: 'What is HomeForPup?',
          a: 'HomeForPup is a community-driven platform dedicated to connecting puppies with their forever homes while building lasting relationships between breeders and families. We focus on ethical breeding practices, transparent health information, and maintaining connections even after adoption.'
        },
        {
          q: 'Is HomeForPup a marketplace for selling animals?',
          a: 'No, HomeForPup is not a transactional marketplace. We do not facilitate the direct sale of animals. Instead, we focus on connecting families with ethical breeders, providing educational resources, and building a supportive community around responsible dog ownership.'
        },
        {
          q: 'What makes HomeForPup different from other pet platforms?',
          a: 'Our platform emphasizes relationship-building over transactions. We promote ethical breeding practices, provide comprehensive educational resources, and maintain connections between breeders and families long after adoption. We also feature transparent health declarations and actively discourage puppy mill practices.'
        }
      ]
    },
    {
      key: 'mission',
      title: 'Our Mission & Values',
      icon: <TrophyOutlined />,
      color: '#52c41a',
      questions: [
        {
          q: 'What is our mission?',
          a: 'To connect puppies with their forever homes while building lasting family relationships. We aim to promote ethical breeding practices, educate both breeders and families, and maintain connections that extend beyond the initial adoption process.'
        },
        {
          q: 'How do we promote ethical breeding?',
          a: 'We require transparent health declarations from parent dogs, verify breeder credentials, and provide educational resources about responsible breeding practices. We actively discourage and do not support puppy mills or unethical breeding operations.'
        },
        {
          q: 'Why do we maintain connections after adoption?',
          a: 'We believe that bringing a dog into your family is a lifelong commitment. By maintaining connections between breeders and families, we ensure ongoing support, health tracking, and a sense of community that benefits both the dog and the family.'
        }
      ]
    },
    {
      key: 'features',
      title: 'Platform Features',
      icon: <CheckCircleOutlined />,
      color: '#1890ff',
      questions: [
        {
          q: 'What features are available for families looking for a puppy?',
          a: 'Families can browse available puppies, learn about different breeds, connect with ethical breeders, access educational resources about dog ownership, and maintain ongoing relationships with breeders after adoption. We also provide breed matching based on lifestyle and preferences.'
        },
        {
          q: 'What features help breeders?',
          a: 'Breeders can create detailed profiles, announce upcoming litters, share transparent health information about parent dogs, connect with potential families, and maintain relationships with families who have adopted their puppies. They also have access to educational resources about ethical breeding practices.'
        },
        {
          q: 'How do we ensure transparency in health information?',
          a: 'We require breeders to provide detailed health declarations for parent dogs, including genetic testing results, health clearances, and veterinary records. This information is displayed transparently to help families make informed decisions.'
        },
        {
          q: 'What educational resources are available?',
          a: 'We provide comprehensive guides on breed selection, choosing the right breeder, preparing for a new puppy, training resources, health information, and ongoing care. These resources are available to both breeders and families throughout their journey.'
        }
      ]
    },
    {
      key: 'journey',
      title: 'Your Journey with Us',
      icon: <UserOutlined />,
      color: '#722ed1',
      questions: [
        {
          q: 'How does the journey work for families?',
          a: '1. Research: Learn about different breeds and their characteristics\n2. Breed Selection: Use our matching tools to find breeds that fit your lifestyle\n3. Breeder Research: Review breeder profiles and health information\n4. Connection: Connect with breeders through our messaging system\n5. Preparation: Access resources to prepare for your new family member\n6. Ongoing Support: Maintain relationships with breeders and access ongoing resources'
        },
        {
          q: 'How does the journey work for breeders?',
          a: '1. Profile Creation: Set up a detailed breeder profile with credentials\n2. Health Documentation: Upload transparent health information for parent dogs\n3. Litter Announcements: Announce upcoming litters with detailed information\n4. Family Connections: Connect with interested families\n5. Ongoing Relationships: Maintain connections with families after adoption\n6. Community Support: Access resources and connect with other ethical breeders'
        },
        {
          q: 'What happens after a puppy goes to their forever home?',
          a: 'The relationship doesn\'t end there! Families and breeders can maintain contact through our platform, share updates about the puppy\'s growth and development, access ongoing educational resources, and be part of a supportive community. Breeders can provide ongoing guidance and support.'
        }
      ]
    },
    {
      key: 'safety',
      title: 'Safety & Ethics',
      icon: <SafetyOutlined />,
      color: '#fa8c16',
      questions: [
        {
          q: 'How do we prevent puppy mills?',
          a: 'We have strict verification processes for breeders, require detailed health documentation, and actively monitor for signs of unethical breeding practices. We also provide education about identifying and avoiding puppy mills.'
        },
        {
          q: 'What verification do we require from breeders?',
          a: 'We verify breeder credentials, require health clearances for parent dogs, check veterinary references, and ensure compliance with local breeding regulations. We also require transparent documentation of breeding practices and facilities.'
        },
        {
          q: 'How do we protect families from scams?',
          a: 'All breeders go through our verification process, we provide secure messaging within the platform, and we offer guidance on red flags to watch for. We also maintain a community reporting system for any suspicious activity.'
        },
        {
          q: 'What if I have concerns about a breeder or family?',
          a: 'We have a reporting system where you can flag concerns about breeders or families. Our team reviews all reports and takes appropriate action to maintain the integrity of our community.'
        }
      ]
    },
    {
      key: 'community',
      title: 'Community & Support',
      icon: <TeamOutlined />,
      color: '#13c2c2',
      questions: [
        {
          q: 'How can I connect with other families or breeders?',
          a: 'Our platform includes messaging features, community forums, and networking opportunities. You can connect with families who have adopted from the same breeder, join breed-specific groups, and participate in educational discussions.'
        },
        {
          q: 'What ongoing support is available?',
          a: 'We provide ongoing educational resources, access to veterinary advice, training resources, and a supportive community. Breeders often provide ongoing guidance to families who have adopted their puppies.'
        },
        {
          q: 'Can I share updates about my dog?',
          a: 'Absolutely! We encourage families to share updates, photos, and milestones about their dogs. This helps maintain connections with breeders and provides joy to the community.'
        },
        {
          q: 'How do I get help if I\'m struggling with my new puppy?',
          a: 'We provide access to training resources, behavioral guidance, and community support. Many breeders also offer ongoing support to families who have adopted their puppies. You can also connect with other families who have gone through similar experiences.'
        }
      ]
    },
    {
      key: 'technical',
      title: 'Technical & Account',
      icon: <GlobalOutlined />,
      color: '#eb2f96',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'You can create an account by clicking the "Sign Up" button on our homepage. Choose whether you\'re a family looking for a puppy or a breeder, and follow the simple registration process.'
        },
        {
          q: 'Is there a cost to use HomeForPup?',
          a: 'Basic features are free for families. Breeders may have access to premium features for enhanced visibility and additional tools. We believe in making ethical breeding and responsible pet ownership accessible to everyone.'
        },
        {
          q: 'How do I update my profile information?',
          a: 'You can update your profile information by going to your dashboard and selecting "Edit Profile". Make sure to keep your information current, especially contact details and preferences.'
        },
        {
          q: 'How do I contact support?',
          a: 'You can contact our support team through the contact form on our website, email us at support@homeforpup.com, or use the help section in your dashboard. We\'re here to help with any questions or concerns.'
        }
      ]
    }
  ];

  const quickLinks = [
    { title: 'Getting Started Guide', href: '/adoption-guide' },
    { title: 'Browse Available Puppies', href: '/browse' },
    { title: 'Find Breeders', href: '/kennels' },
    { title: 'Learn About Breeds', href: '/breeds' },
    { title: 'Contact Support', href: 'mailto:support@homeforpup.com' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '24px 0'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <Card 
          style={{ 
            marginBottom: '32px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '16px',
            color: 'white'
          }}
        >
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
              <HeartOutlined style={{ marginRight: '12px' }} />
              Frequently Asked Questions
            </Title>
            <Paragraph style={{ color: 'white', fontSize: '18px', marginBottom: '0' }}>
              Everything you need to know about HomeForPup and our mission to connect puppies with their forever homes
            </Paragraph>
          </div>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Main FAQ Content */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {faqSections.map((section) => (
                <Card 
                  key={section.key}
                  title={
                    <Space>
                      <span style={{ color: section.color, fontSize: '20px' }}>
                        {section.icon}
                      </span>
                      <span style={{ fontSize: '20px', fontWeight: '600' }}>
                        {section.title}
                      </span>
                    </Space>
                  }
                  style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
                >
                  <Collapse 
                    activeKey={activeKey}
                    onChange={setActiveKey}
                    expandIconPosition="right"
                    style={{ background: 'transparent' }}
                  >
                    {section.questions.map((item, index) => (
                      <Panel 
                        header={
                          <Text strong style={{ fontSize: '16px' }}>
                            {item.q}
                          </Text>
                        }
                        key={`${section.key}-${index}`}
                        style={{ 
                          marginBottom: '8px',
                          borderRadius: '8px',
                          border: '1px solid #f0f0f0'
                        }}
                      >
                        <Paragraph style={{ marginBottom: '0', whiteSpace: 'pre-line' }}>
                          {item.a}
                        </Paragraph>
                      </Panel>
                    ))}
                  </Collapse>
                </Card>
              ))}
            </Space>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Quick Links */}
              <Card 
                title="Quick Links" 
                style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {quickLinks.map((link, index) => (
                    <Link key={index} href={link.href}>
                      <Button 
                        type="link" 
                        style={{ 
                          width: '100%', 
                          textAlign: 'left',
                          height: 'auto',
                          padding: '8px 0'
                        }}
                      >
                        {link.title}
                      </Button>
                    </Link>
                  ))}
                </Space>
              </Card>

              {/* Mission Statement */}
              <Card 
                title="Our Mission" 
                style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              >
                <Paragraph style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <HeartOutlined style={{ fontSize: '24px', color: '#ff4d4f', marginBottom: '8px' }} />
                </Paragraph>
                <Paragraph style={{ textAlign: 'center', fontStyle: 'italic' }}>
                  "Connecting puppies with their forever homes while building lasting family relationships through ethical breeding and ongoing community support."
                </Paragraph>
              </Card>

              {/* Key Features */}
              <Card 
                title="Key Features" 
                style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Transparent Health Information</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Ethical Breeding Focus</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Ongoing Community Support</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Educational Resources</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Breed Matching Tools</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Post-Adoption Connections</Text>
                  </div>
                </Space>
              </Card>

              {/* Contact Info */}
              <Card 
                title="Need Help?" 
                style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MailOutlined style={{ color: '#1890ff' }} />
                    <Text>support@homeforpup.com</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageOutlined style={{ color: '#1890ff' }} />
                    <Text>Live Chat Available</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PhoneOutlined style={{ color: '#1890ff' }} />
                    <Text>Response within 24 hours</Text>
                  </div>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>

        {/* Call to Action */}
        <Card 
          style={{ 
            marginTop: '32px',
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            border: 'none',
            borderRadius: '16px',
            textAlign: 'center'
          }}
        >
          <div style={{ padding: '32px 0' }}>
            <Title level={2} style={{ marginBottom: '16px' }}>
              Ready to Start Your Journey?
            </Title>
            <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
              Whether you're looking for your perfect companion or want to connect with families, 
              HomeForPup is here to support you every step of the way.
            </Paragraph>
            <Space size="large">
              <Link href="/browse">
                <Button type="primary" size="large" icon={<HeartOutlined />}>
                  Browse Puppies
                </Button>
              </Link>
              <Link href="/kennels">
                <Button size="large" icon={<TeamOutlined />}>
                  Find Breeders
                </Button>
              </Link>
            </Space>
          </div>
        </Card>
      </div>

      {/* Structured Data */}
      <StructuredData 
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'FAQ', url: '/faq' }
        ])} 
      />
    </div>
  );
};

export default FAQPage;