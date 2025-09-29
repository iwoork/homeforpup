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
  Input,
  Row,
  Col
} from 'antd';
import { 
  ArrowLeftOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  DollarOutlined,
  MobileOutlined,
  LockOutlined
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { Search } = Input;

const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqData = [
    {
      category: 'General Questions',
      icon: <QuestionCircleOutlined style={{ color: '#1890ff' }} />,
      questions: [
        {
          q: 'What is this system for?',
          a: 'This system helps you manage your dog breeding business online. You can keep track of your kennels, dogs, and litters all in one place.'
        },
        {
          q: 'Do I need to be good with computers to use this?',
          a: 'No! We designed this system to be easy for everyone. If you can use email or browse the internet, you can use this system.'
        },
        {
          q: 'Is my information safe?',
          a: 'Yes! Your information is stored securely and only you (and people you choose) can see it.'
        },
        {
          q: 'Can I use this on my phone or tablet?',
          a: 'Yes! The system works on computers, tablets, and smartphones.'
        }
      ]
    },
    {
      category: 'Kennel Questions',
      icon: <InfoCircleOutlined style={{ color: '#52c41a' }} />,
      questions: [
        {
          q: 'What\'s the difference between a kennel name and business name?',
          a: 'Kennel Name: What you call your breeding operation (e.g., "Sunny Acres Kennel"). Business Name: Your official business name for legal purposes (e.g., "Sunny Acres LLC").'
        },
        {
          q: 'Can I have more than one kennel?',
          a: 'Yes! You can create multiple kennels if you have breeding facilities in different locations.'
        },
        {
          q: 'What if I don\'t have all the facilities listed?',
          a: 'That\'s okay! Only check the boxes for facilities you actually have. You can always add more later.'
        },
        {
          q: 'Can other people see my kennel information?',
          a: 'Some information (like your kennel name and description) can be seen by potential puppy families. Your personal contact information stays private.'
        }
      ]
    },
    {
      category: 'Dog Questions',
      icon: <SettingOutlined style={{ color: '#fa8c16' }} />,
      questions: [
        {
          q: 'What\'s the difference between a "Parent" and "Puppy" dog?',
          a: 'Parent: A dog you use for breeding (usually adults). Puppy: A young dog that hasn\'t been used for breeding yet.'
        },
        {
          q: 'Do I have to add all my dogs at once?',
          a: 'No! You can add dogs one at a time, whenever you\'re ready.'
        },
        {
          q: 'What if I don\'t know all the information about a dog?',
          a: 'Only fill in what you know. You can always add more information later by editing the dog\'s record.'
        },
        {
          q: 'Can I delete a dog if I sell it?',
          a: 'Yes, but be careful! Once you delete a dog, all their information is gone forever. You might want to just change their status instead.'
        }
      ]
    },
    {
      category: 'Litter Questions',
      icon: <QuestionCircleOutlined style={{ color: '#f5222d' }} />,
      questions: [
        {
          q: 'When should I create a litter record?',
          a: 'You can create it as soon as you know a dog is pregnant, or wait until the puppies are born.'
        },
        {
          q: 'What if I don\'t know how many puppies to expect?',
          a: 'That\'s fine! You can leave the expected count blank and update it after the puppies are born.'
        },
        {
          q: 'Can I add information about individual puppies?',
          a: 'Yes! After creating a litter, you can add details about each puppy.'
        },
        {
          q: 'What if a puppy dies or is stillborn?',
          a: 'You can update the litter information to reflect the actual number of living puppies.'
        }
      ]
    },
    {
      category: 'Technical Questions',
      icon: <SettingOutlined style={{ color: '#722ed1' }} />,
      questions: [
        {
          q: 'The page looks strange or broken. What should I do?',
          a: 'Try these steps in order: 1) Refresh the page (press F5 or click the refresh button), 2) Check your internet connection, 3) Try a different browser (Chrome, Firefox, Safari), 4) Clear your browser\'s cache and cookies'
        },
        {
          q: 'I can\'t log in. What\'s wrong?',
          a: 'Check these things: 1) Make sure you\'re using the correct email and password, 2) Check if Caps Lock is on, 3) Try typing your password in a text document first to make sure it\'s correct, 4) If you forgot your password, use the "Forgot Password" link'
        },
        {
          q: 'The system is running slowly. Is this normal?',
          a: 'Sometimes the system can be slow if: your internet connection is slow, many people are using the system at once, or you\'re trying to upload large photos. Try refreshing the page or waiting a few minutes.'
        },
        {
          q: 'Can I use this system without internet?',
          a: 'No, you need an internet connection to use this system. It\'s designed to work online so you can access it from anywhere.'
        }
      ]
    },
    {
      category: 'Working with Others',
      icon: <InfoCircleOutlined style={{ color: '#13c2c2' }} />,
      questions: [
        {
          q: 'Can I let other people help manage my kennel?',
          a: 'Yes! You can add other people as "managers" who can help add and edit information.'
        },
        {
          q: 'What\'s the difference between an owner and a manager?',
          a: 'Owner: Can do everything, including deleting the kennel. Manager: Can add and edit information, but cannot delete the kennel.'
        },
        {
          q: 'How do I add someone as a manager?',
          a: 'Contact our support team and we\'ll help you set this up.'
        },
        {
          q: 'Can I remove someone\'s access?',
          a: 'Yes, you can remove someone\'s access at any time.'
        }
      ]
    },
    {
      category: 'Cost and Billing',
      icon: <DollarOutlined style={{ color: '#52c41a' }} />,
      questions: [
        {
          q: 'How much does this system cost?',
          a: 'Please check our pricing page or contact us for current pricing information.'
        },
        {
          q: 'Can I try it before I pay?',
          a: 'Yes! We offer a free trial period so you can see if the system works for you.'
        },
        {
          q: 'What happens if I stop paying?',
          a: 'Your account will be suspended, but your information will be kept safe. You can reactivate your account by updating your payment information.'
        }
      ]
    },
    {
      category: 'Mobile and Tablet Questions',
      icon: <MobileOutlined style={{ color: '#fa8c16' }} />,
      questions: [
        {
          q: 'Does this work on my iPad?',
          a: 'Yes! The system works on iPads, Android tablets, and other tablets.'
        },
        {
          q: 'Can I use it on my phone?',
          a: 'Yes! The system is designed to work on smartphones, though some features might be easier to use on a larger screen.'
        },
        {
          q: 'Do I need to download an app?',
          a: 'No! You can use the system through your web browser. No app download required.'
        }
      ]
    },
    {
      category: 'Privacy and Security',
      icon: <LockOutlined style={{ color: '#f5222d' }} />,
      questions: [
        {
          q: 'Who can see my information?',
          a: 'Only you and people you specifically give access to can see your private information. Some basic information (like kennel name) may be visible to potential puppy families.'
        },
        {
          q: 'Can I control what information is public?',
          a: 'Yes! You can choose what information to share publicly and what to keep private.'
        },
        {
          q: 'Is my payment information safe?',
          a: 'Yes! We use secure payment processing and never store your full payment information.'
        }
      ]
    }
  ];

  const filteredData = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
          ❓ Frequently Asked Questions
        </Title>
        <Paragraph style={{ fontSize: '1.1rem', marginTop: '8px' }}>
          Quick answers to common questions about the kennel management system
        </Paragraph>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: '32px' }}>
        <Title level={4}>🔍 Search Questions</Title>
        <Search
          placeholder="Search for a question or topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '400px' }}
          prefix={<SearchOutlined />}
        />
        {searchTerm && (
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">
              Found {filteredData.reduce((acc, cat) => acc + cat.questions.length, 0)} results
            </Text>
          </div>
        )}
      </Card>

      {/* FAQ Categories */}
      {filteredData.map((category, categoryIndex) => (
        <Card 
          key={categoryIndex}
          title={
            <Space>
              {category.icon}
              {category.category}
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <Collapse size="small">
            {category.questions.map((item, questionIndex) => (
              <Panel 
                header={item.q} 
                key={`${categoryIndex}-${questionIndex}`}
              >
                <Paragraph style={{ margin: 0 }}>
                  {item.a}
                </Paragraph>
              </Panel>
            ))}
          </Collapse>
        </Card>
      ))}

      {/* No Results */}
      {searchTerm && filteredData.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <QuestionCircleOutlined style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
            <Title level={4} type="secondary">No questions found</Title>
            <Paragraph type="secondary">
              Try searching with different keywords or browse all questions above.
            </Paragraph>
            <Button onClick={() => setSearchTerm('')}>
              Clear Search
            </Button>
          </div>
        </Card>
      )}

      {/* Help Section */}
      <Card title="🆘 Still Need Help?" style={{ marginTop: '32px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Title level={4}>Contact Support</Title>
            <Paragraph>
              If you can't find the answer to your question, our support team is here to help!
            </Paragraph>
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
                <Button type="link" icon={<QuestionCircleOutlined />}>
                  Quick Start Guide
                </Button>
              </Link>
              <Link href="/docs/complete-guide">
                <Button type="link" icon={<InfoCircleOutlined />}>
                  Complete User Guide
                </Button>
              </Link>
              <Link href="/docs/visual-guide">
                <Button type="link" icon={<SettingOutlined />}>
                  Visual Guide
                </Button>
              </Link>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tips */}
      <Card title="💡 Tips for Getting Help" style={{ marginTop: '32px' }}>
        <List
          dataSource={[
            'Try searching for keywords related to your question',
            'Check if your question is answered in the guides above',
            'Be specific when describing your problem',
            'Include what you were trying to do when the problem occurred',
            'Don\'t hesitate to ask - we\'re here to help you succeed!'
          ]}
          renderItem={(item) => (
            <List.Item>
              <Space>
                <Text>•</Text>
                <Text>{item}</Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default FAQPage;
