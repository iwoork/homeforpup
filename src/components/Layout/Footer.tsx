import React from 'react';
import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

const Footer: React.FC = () => {
  return (
    <AntFooter style={{ 
      background: '#fafafa', 
      textAlign: 'center',
      padding: '32px 24px'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ color: '#8b4513', fontSize: '16px', marginBottom: '8px' }}>
          © 2025 HomeForPup.com - Connecting Ethical Breeders with Loving Families
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Promoting responsible breeding and puppy welfare
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;