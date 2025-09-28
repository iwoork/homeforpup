'use client';

import React, { useState } from 'react';
import { Card, Typography, Form, Input, Button, Row, Col, Space, Alert, Divider } from 'antd';
import { 
  MailOutlined, 
  UserOutlined, 
  MessageOutlined, 
  SendOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import StructuredData from '@/components/StructuredData';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const ContactPage: React.FC = () => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Us | HomeForPup",
    "description": "Get in touch with HomeForPup for support, questions, or feedback. We're here to help you find your perfect furry companion.",
    "url": "https://homeforpup.com/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "HomeForPup",
      "email": "support@homeforpup.com",
      "url": "https://homeforpup.com",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "",
        "contactType": "customer service",
        "email": "support@homeforpup.com",
        "availableLanguage": "English"
      }
    }
  };

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // EmailOctopus API integration
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
          type: values.type || 'general'
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        form.resetFields();
        
        // Scroll to top after successful submission
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        const errorData = await response.json();
        setSubmitStatus('error');
        setErrorMessage(errorData.message || 'Failed to send message. Please try again.');
        
        // Scroll to top to show error message
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
      
      // Scroll to top to show error message
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactTypes = [
    { value: 'general', label: 'General Inquiry', icon: <InfoCircleOutlined /> },
    { value: 'support', label: 'Technical Support', icon: <MessageOutlined /> },
    { value: 'breeder', label: 'Breeder Support', icon: <UserOutlined /> },
    { value: 'feedback', label: 'Feedback', icon: <CheckCircleOutlined /> },
    { value: 'partnership', label: 'Partnership', icon: <MailOutlined /> }
  ];

  return (
    <>
      <StructuredData data={structuredData} />
      <div style={{ minHeight: '100vh', width: '100%' }}>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #08979C 0%, #FA8072 100%)',
          color: 'white',
          padding: '4rem 0',
          textAlign: 'center',
          width: '100%'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <MailOutlined style={{ fontSize: '48px', marginBottom: '24px', display: 'block' }} />
            <Title level={1} style={{ color: 'white', marginBottom: '16px', fontSize: '42px' }}>
              Contact Us
            </Title>
            <Paragraph style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              We're here to help! Get in touch with our team for support, questions, or feedback about finding your perfect furry companion.
            </Paragraph>
          </div>
        </section>

        <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[32, 32]}>
            {/* Contact Form */}
            <Col xs={24} lg={16}>
              <Card 
                style={{ 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                  borderRadius: '12px',
                  height: 'fit-content'
                }}
                headStyle={{
                  backgroundColor: '#f0f8ff',
                  borderRadius: '12px 12px 0 0',
                  borderBottom: '1px solid #e6f7ff'
                }}
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <MessageOutlined style={{ marginRight: '8px', color: '#08979C' }} />
                    Send us a Message
                  </div>
                }
              >
                {submitStatus === 'success' && (
                  <Alert
                    message="Message Sent Successfully!"
                    description="Thank you for contacting us. We'll get back to you within 24 hours."
                    type="success"
                    icon={<CheckCircleOutlined />}
                    style={{ marginBottom: '24px', borderRadius: '8px' }}
                    showIcon
                  />
                )}

                {submitStatus === 'error' && (
                  <Alert
                    message="Failed to Send Message"
                    description={errorMessage}
                    type="error"
                    style={{ marginBottom: '24px', borderRadius: '8px' }}
                    showIcon
                  />
                )}

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  size="large"
                >
                  <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[
                          { required: true, message: 'Please enter your full name' },
                          { min: 2, message: 'Name must be at least 2 characters' }
                        ]}
                      >
                        <Input 
                          prefix={<UserOutlined />} 
                          placeholder="Enter your full name"
                          style={{ borderRadius: '8px' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                          { required: true, message: 'Please enter your email address' },
                          { type: 'email', message: 'Please enter a valid email address' }
                        ]}
                      >
                        <Input 
                          prefix={<MailOutlined />} 
                          placeholder="Enter your email address"
                          style={{ borderRadius: '8px' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="type"
                    label="Inquiry Type"
                    rules={[{ required: true, message: 'Please select an inquiry type' }]}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      {contactTypes.map((type) => (
                        <label
                          key={type.value}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            border: '2px solid #e8e8e8',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor: '#fafafa'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#08979C';
                            e.currentTarget.style.backgroundColor = '#f0f8ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e8e8e8';
                            e.currentTarget.style.backgroundColor = '#fafafa';
                          }}
                        >
                          <input
                            type="radio"
                            name="type"
                            value={type.value}
                            style={{ marginRight: '8px' }}
                          />
                          {type.icon}
                          <Text style={{ marginLeft: '8px', fontSize: '14px' }}>{type.label}</Text>
                        </label>
                      ))}
                    </div>
                  </Form.Item>

                  <Form.Item
                    name="subject"
                    label="Subject"
                    rules={[
                      { required: true, message: 'Please enter a subject' },
                      { min: 5, message: 'Subject must be at least 5 characters' }
                    ]}
                  >
                    <Input 
                      placeholder="What is this about?"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="message"
                    label="Message"
                    rules={[
                      { required: true, message: 'Please enter your message' },
                      { min: 10, message: 'Message must be at least 10 characters' }
                    ]}
                  >
                    <TextArea
                      rows={6}
                      placeholder="Tell us how we can help you..."
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isSubmitting}
                      icon={<SendOutlined />}
                      size="large"
                      style={{
                        width: '100%',
                        height: '48px',
                        fontSize: '16px',
                        fontWeight: '500',
                        background: '#08979C',
                        borderColor: '#08979C',
                        borderRadius: '8px'
                      }}
                    >
                      {isSubmitting ? 'Sending Message...' : 'Send Message'}
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            {/* Contact Information */}
            <Col xs={24} lg={8}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card 
                  style={{ 
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                    borderRadius: '12px'
                  }}
                  headStyle={{
                    backgroundColor: '#f6ffed',
                    borderRadius: '12px 12px 0 0',
                    borderBottom: '1px solid #d9f7be'
                  }}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <MailOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                      Get in Touch
                    </div>
                  }
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                      <Text strong style={{ fontSize: '16px', color: '#333', display: 'block', marginBottom: '8px' }}>
                        Email Support
                      </Text>
                      <Text style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                        support@homeforpup.com
                      </Text>
                      <Text style={{ color: '#999', fontSize: '12px' }}>
                        We'll respond within 24 hours
                      </Text>
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    <div>
                      <Text strong style={{ fontSize: '16px', color: '#333', display: 'block', marginBottom: '8px' }}>
                        Response Time
                      </Text>
                      <Text style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                        General inquiries: 24 hours
                      </Text>
                      <Text style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                        Technical support: 12 hours
                      </Text>
                      <Text style={{ color: '#666', fontSize: '14px' }}>
                        Urgent matters: 4 hours
                      </Text>
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    <div>
                      <Text strong style={{ fontSize: '16px', color: '#333', display: 'block', marginBottom: '8px' }}>
                        What We Can Help With
                      </Text>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '14px' }}>
                        <li>Finding the right puppy for your family</li>
                        <li>Breeder verification and recommendations</li>
                        <li>Technical support for the platform</li>
                        <li>Account and profile assistance</li>
                        <li>Feedback and suggestions</li>
                        <li>Partnership opportunities</li>
                      </ul>
                    </div>
                  </Space>
                </Card>

                <Card 
                  style={{ 
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                    borderRadius: '12px'
                  }}
                  headStyle={{
                    backgroundColor: '#fff7e6',
                    borderRadius: '12px 12px 0 0',
                    borderBottom: '1px solid #ffd591'
                  }}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <InfoCircleOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
                      Quick Links
                    </div>
                  }
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Link href="/faq" style={{ color: '#fa8c16', fontSize: '14px' }}>
                      Frequently Asked Questions
                    </Link>
                    <Link href="/about" style={{ color: '#fa8c16', fontSize: '14px' }}>
                      About HomeForPup
                    </Link>
                    <Link href="/ethical-guidelines" style={{ color: '#fa8c16', fontSize: '14px' }}>
                      Ethical Guidelines
                    </Link>
                    <Link href="/accessibility" style={{ color: '#fa8c16', fontSize: '14px' }}>
                      Accessibility Support
                    </Link>
                    <Link href="/privacy" style={{ color: '#fa8c16', fontSize: '14px' }}>
                      Privacy Policy
                    </Link>
                  </Space>
                </Card>
              </Space>
            </Col>
          </Row>
        </div>

        <Divider />

        <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
          <Paragraph>
            <Text strong>HomeForPup</Text> - Connecting families with their perfect furry companions.
          </Paragraph>
          <Space size="large">
            <Link href="/">Home</Link>
            <Link href="/browse">Browse Puppies</Link>
            <Link href="/breeders">Find Breeders</Link>
            <Link href="/about">About Us</Link>
          </Space>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
