'use client';

import React from 'react';
import { Modal, Card, Row, Col, Typography, Button } from 'antd';
import { HeartOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface UserTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onUserTypeSelect: (userType: 'breeder' | 'adopter') => void;
  onLogin: () => void;
}

const userTypeCardStyle: React.CSSProperties = {
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  height: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  border: '2px solid transparent',
};

const UserTypeModal: React.FC<UserTypeModalProps> = ({
  visible,
  onClose,
  onUserTypeSelect,
  onLogin
}) => {
  return (
    <>
      <style jsx global>{`
        .user-type-card:hover {
          transform: translateY(-4px);
          border-color: #08979C !important;
          box-shadow: 0 8px 24px rgba(8, 151, 156, 0.2) !important;
        }
        
        @media (max-width: 576px) {
          .user-type-card {
            height: 160px !important;
            margin-bottom: 16px;
          }
          .user-type-modal .ant-modal-content {
            margin: 16px !important;
          }
        }
      `}</style>
      
      <Modal
        title={
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <Title level={3} style={{ margin: 0, color: '#08979C' }}>
              Join Our Community
            </Title>
            <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
              Tell us how you&apos;d like to participate
            </Paragraph>
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width={600}
        centered
        className="user-type-modal"
      >
        <Row gutter={[24, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24} sm={12}>
            <Card 
              className="user-type-card"
              style={userTypeCardStyle}
              onClick={() => onUserTypeSelect('breeder')}
            >
              <TeamOutlined style={{ fontSize: '48px', color: '#08979C', marginBottom: '16px' }} />
              <Title level={4} style={{ margin: '0 0 8px 0' }}>I&apos;m a Breeder</Title>
              <Paragraph style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                Share your puppies with loving families
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card 
              className="user-type-card"
              style={userTypeCardStyle}
              onClick={() => onUserTypeSelect('adopter')}
            >
              <HeartOutlined style={{ fontSize: '48px', color: '#FA8072', marginBottom: '16px' }} />
              <Title level={4} style={{ margin: '0 0 8px 0' }}>I&apos;m Looking for a Pet</Title>
              <Paragraph style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                Find my perfect furry companion
              </Paragraph>
            </Card>
          </Col>
        </Row>
        
        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Paragraph style={{ margin: 0, fontSize: '12px', color: '#999' }}>
            Already have an account? 
            <Button type="link" onClick={onLogin} style={{ padding: '0 4px', fontSize: '12px' }}>
              Sign in here
            </Button>
          </Paragraph>
        </div>
      </Modal>
    </>
  );
};

export default UserTypeModal;