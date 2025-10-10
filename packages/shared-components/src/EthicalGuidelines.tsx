'use client';

import React from 'react';
import { Card, Typography, Divider, List, Space, Alert } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, HeartOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface EthicalGuidelinesProps {
  showTitle?: boolean;
  showHeader?: boolean;
  className?: string;
}

const EthicalGuidelines: React.FC<EthicalGuidelinesProps> = ({
  showTitle = true,
  showHeader = true,
  className = ''
}) => {
  return (
    <div className={className} style={{ width: '100%' }}>
              {showHeader && (
                <div style={{
                  textAlign: 'center',
                  marginBottom: '3rem',
                  padding: '3rem 2rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  margin: '0 0 3rem 0',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Decorative background elements */}
                  <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    zIndex: 1
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '-30px',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '50%',
                    zIndex: 1
                  }} />
                  
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <HeartOutlined style={{ 
                      fontSize: '4rem', 
                      color: '#ffffff', 
                      marginBottom: '1.5rem',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                    }} />
                    <Title level={1} style={{ 
                      color: '#ffffff', 
                      marginBottom: '1rem',
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      Ethical Guidelines
                    </Title>
                    <Paragraph style={{
                      fontSize: '1.2rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      maxWidth: '700px',
                      margin: '0 auto',
                      lineHeight: '1.7',
                      fontWeight: '400',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}>
                      Our commitment to responsible pet adoption and ethical breeding practices
                    </Paragraph>
                  </div>
                </div>
              )}

      {showTitle && (
        <Title level={2} style={{ 
          marginBottom: '1.5rem', 
          color: '#1890ff',
          textAlign: 'center'
        }}>
          Ethical Guidelines for Pet Adoption
        </Title>
      )}

      <Space direction="vertical" size="large" style={{ width: '100%', padding: '0 1rem' }}>
        {/* For Dog Parents */}
        <Card 
          title="For Dog Parents" 
          style={{ 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}
          headStyle={{
            backgroundColor: '#f0f8ff',
            borderRadius: '8px 8px 0 0',
            borderBottom: '1px solid #e6f7ff'
          }}
        >
          <List
            dataSource={[
              {
                title: "Research Before Adopting",
                description: "Thoroughly research the breed, care requirements, and your ability to provide a lifelong home. Consider your lifestyle, living space, and financial capacity."
              },
              {
                title: "Adopt, Don't Shop",
                description: "Consider adopting from shelters and rescue organizations first. If purchasing from a breeder, ensure they follow ethical practices and prioritize animal welfare."
              },
              {
                title: "Lifetime Commitment",
                description: "Understand that pet ownership is a 10-15 year commitment. Be prepared for the financial, emotional, and time investment required throughout your pet's life."
              },
              {
                title: "Proper Care and Training",
                description: "Provide adequate nutrition, veterinary care, exercise, mental stimulation, and positive reinforcement training. Invest in your pet's health and well-being."
              },
              {
                title: "Responsible Ownership",
                description: "Ensure your pet is properly identified, vaccinated, spayed/neutered, and licensed according to local regulations."
              }
            ]}
            renderItem={(item) => (
              <List.Item style={{ alignItems: 'flex-start' }}>
                <List.Item.Meta
                  avatar={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '1.2rem', marginTop: '4px' }} />}
                  title={<Text strong style={{ fontSize: '1.1rem' }}>{item.title}</Text>}
                  description={<Text style={{ fontSize: '1rem', lineHeight: '1.6' }}>{item.description}</Text>}
                />
              </List.Item>
            )}
          />
        </Card>

        {/* For Breeders */}
        <Card 
          title="For Responsible Breeders" 
          style={{ 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}
          headStyle={{
            backgroundColor: '#f6ffed',
            borderRadius: '8px 8px 0 0',
            borderBottom: '1px solid #d9f7be'
          }}
        >
          <List
            dataSource={[
              {
                title: "Health Testing and Screening",
                description: "Conduct comprehensive health testing for genetic conditions, maintain detailed health records, and only breed animals that meet health standards."
              },
              {
                title: "Ethical Breeding Practices",
                description: "Limit breeding frequency, ensure proper spacing between litters, and never breed animals with known genetic defects or health issues."
              },
              {
                title: "Proper Socialization",
                description: "Provide early socialization experiences, expose puppies to various environments, people, and situations to ensure well-adjusted adult dogs."
              },
              {
                title: "Transparent Documentation",
                description: "Maintain accurate pedigrees, health certificates, and provide complete medical history to new owners. Be transparent about any health issues."
              },
              {
                title: "Lifetime Support",
                description: "Offer ongoing support to puppy buyers, take responsibility for genetic health issues, and be available for questions throughout the dog's life."
              },
              {
                title: "Responsible Placement",
                description: "Screen potential owners thoroughly, ensure they understand the breed's needs, and provide a contract with clear terms and expectations."
              }
            ]}
            renderItem={(item) => (
              <List.Item style={{ alignItems: 'flex-start' }}>
                <List.Item.Meta
                  avatar={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '1.2rem', marginTop: '4px' }} />}
                  title={<Text strong style={{ fontSize: '1.1rem' }}>{item.title}</Text>}
                  description={<Text style={{ fontSize: '1rem', lineHeight: '1.6' }}>{item.description}</Text>}
                />
              </List.Item>
            )}
          />
        </Card>

        {/* Red Flags */}
        <Alert
          message={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ExclamationCircleOutlined style={{ fontSize: '1.2rem', color: '#fa8c16' }} />
              <Text strong style={{ fontSize: '1.1rem', color: '#d46b08' }}>
                Red Flags to Watch For
              </Text>
            </div>
          }
          description={
            <div style={{ marginTop: '1rem' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #fff7e6 0%, #fff2cc 100%)',
                padding: '1rem',
                borderRadius: '6px',
                border: '1px solid #ffd591',
                marginBottom: '1rem'
              }}>
                <Text strong style={{ 
                  fontSize: '1rem', 
                  color: '#d46b08',
                  display: 'block',
                  marginBottom: '0.5rem'
                }}>
                  ⚠️ Be cautious of breeders or sellers who:
                </Text>
              </div>
              <div style={{ 
                background: '#fef7e6',
                padding: '1rem',
                borderRadius: '6px',
                border: '1px solid #ffd591'
              }}>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '1.5rem',
                  listStyle: 'none'
                }}>
                  {[
                    "Cannot provide health certificates or genetic testing results",
                    "Refuse to let you visit their facility or meet the parents",
                    "Have multiple litters available at the same time",
                    "Pressure you to make quick decisions or pay deposits without contracts",
                    "Cannot provide references from previous buyers",
                    "Offer puppies at unusually low prices or with \"special deals\"",
                    "Cannot answer basic questions about the breed or care requirements",
                    "Show signs of poor animal welfare or unsanitary conditions"
                  ].map((item, index) => (
                    <li key={index} style={{ 
                      marginBottom: '0.5rem',
                      position: 'relative',
                      paddingLeft: '1.5rem'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        top: '0.2rem',
                        color: '#fa8c16',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        ⚠️
                      </span>
                      <Text style={{ 
                        fontSize: '0.95rem',
                        lineHeight: '1.5',
                        color: '#8c4a00'
                      }}>
                        {item}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          }
          type="warning"
          showIcon={false}
          style={{ 
            marginTop: '2rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            border: '2px solid #faad14',
            background: 'linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%)',
            boxShadow: '0 2px 8px rgba(250, 173, 20, 0.15)'
          }}
        />

        {/* Our Commitment */}
        <Card 
          title="Our Platform's Commitment" 
          style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}
          headStyle={{
            backgroundColor: '#fff7e6',
            borderRadius: '8px 8px 0 0',
            borderBottom: '1px solid #ffd591',
            textAlign: 'left'
          }}
        >
          <List
            dataSource={[
              "Verify breeder credentials and ethical practices",
              "Require health testing documentation for all listings",
              "Provide educational resources for responsible pet ownership",
              "Maintain a transparent review and rating system",
              "Support rescue organizations and adoption initiatives",
              "Promote spaying and neutering to reduce overpopulation",
              "Facilitate connections between responsible breeders and educated dog parents",
              "Regularly audit and monitor platform activity for compliance"
            ]}
            renderItem={(item) => (
              <List.Item style={{ 
                alignItems: 'flex-start',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'row'
              }}>
                <CheckCircleOutlined style={{ 
                  color: '#52c41a', 
                  fontSize: '1.2rem', 
                  marginRight: '0.5rem',
                  marginTop: '4px',
                  flexShrink: 0
                }} />
                <Text style={{ 
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  textAlign: 'left',
                  flex: 1
                }}>{item}</Text>
              </List.Item>
            )}
          />
        </Card>

        {/* Resources */}
        <Card title="Additional Resources" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ fontSize: '1.1rem' }}>Educational Resources:</Text>
              <ul style={{ marginTop: '0.5rem' }}>
                <li>Breed-specific care guides and requirements</li>
                <li>Training and socialization resources</li>
                <li>Health and nutrition information</li>
                <li>Local veterinary and grooming services</li>
              </ul>
            </div>
            <Divider />
            <div>
              <Text strong style={{ fontSize: '1.1rem' }}>Support Organizations:</Text>
              <ul style={{ marginTop: '0.5rem' }}>
                <li>Local animal shelters and rescue groups</li>
                <li>Breed-specific rescue organizations</li>
                <li>Veterinary behaviorists and trainers</li>
                <li>Pet insurance providers</li>
              </ul>
            </div>
          </Space>
        </Card>

        {/* Call to Action */}
        <Card style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', textAlign: 'center' }}>
          <Title level={3} style={{ color: '#52c41a', marginBottom: '1rem' }}>
            Together, We Can Make a Difference
          </Title>
          <Paragraph style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            By following these ethical guidelines, we can ensure that every pet finds a loving, responsible home 
            and that breeding practices prioritize animal welfare above all else.
          </Paragraph>
          <Text style={{ fontSize: '1rem', color: '#666' }}>
            If you witness unethical practices or have concerns, please report them through our platform 
            or contact local animal welfare authorities.
          </Text>
        </Card>
      </Space>
    </div>
  );
};

export default EthicalGuidelines;
