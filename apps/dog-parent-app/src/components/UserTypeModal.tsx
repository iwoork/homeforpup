'use client';

import React from 'react';
import { Modal, Button, Card, Row, Col, Typography } from 'antd';
import { HeartOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface UserTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onUserTypeSelect: (userType: 'breeder' | 'dog-parent') => void;
  onLogin: () => void;
}

const UserTypeModal: React.FC<UserTypeModalProps> = ({
  visible,
  onClose,
  onUserTypeSelect,
  onLogin,
}) => {
  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    height: '100%',
    textAlign: 'center',
    cursor: 'pointer',
    border: '2px solid transparent',
  };

  const handleCardClick = (userType: 'breeder' | 'dog-parent') => {
    onUserTypeSelect(userType);
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, color: '#08979C' }}>
            Join Our Community
          </Title>
          <Paragraph style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
            Choose how you'd like to participate in our community
          </Paragraph>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      style={{ top: 20 }}
    >
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={12}>
          <Card
            hoverable
            style={cardStyle}
            onClick={() => handleCardClick('dog-parent')}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FA8072';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <HeartOutlined 
              style={{ 
                fontSize: '48px', 
                color: '#FA8072', 
                marginBottom: '16px',
                display: 'block'
              }} 
            />
            <Title level={3} style={{ color: '#FA8072', marginBottom: '16px' }}>
              I'm Looking for a Dog
            </Title>
            <Paragraph style={{ marginBottom: '24px' }}>
              I want to find my perfect furry companion and connect with responsible breeders who care about their dogs' wellbeing.
            </Paragraph>
            <Button 
              type="primary" 
              size="large" 
              block
              style={{ 
                background: '#FA8072', 
                borderColor: '#FA8072',
                height: '48px',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Join as Dog Parent
            </Button>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card
            hoverable
            style={cardStyle}
            onClick={() => handleCardClick('breeder')}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#08979C';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <ShopOutlined 
              style={{ 
                fontSize: '48px', 
                color: '#08979C', 
                marginBottom: '16px',
                display: 'block'
              }} 
            />
            <Title level={3} style={{ color: '#08979C', marginBottom: '16px' }}>
              I'm a Dog Breeder
            </Title>
            <Paragraph style={{ marginBottom: '24px' }}>
              I breed dogs responsibly and want to connect with loving families who will provide excellent homes for my puppies.
            </Paragraph>
            <Button 
              type="primary" 
              size="large" 
              block
              style={{ 
                background: '#08979C', 
                borderColor: '#08979C',
                height: '48px',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Join as Breeder
            </Button>
          </Card>
        </Col>
      </Row>
      
      <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
        <Paragraph style={{ marginBottom: '16px', color: '#666' }}>
          Already have an account?
        </Paragraph>
        <Button 
          size="large" 
          onClick={onLogin}
          style={{ 
            height: '40px',
            padding: '0 24px',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          <UserOutlined style={{ marginRight: '8px' }} />
          Sign In
        </Button>
      </div>
    </Modal>
  );
};

export default UserTypeModal;
