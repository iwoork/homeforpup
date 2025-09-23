'use client';

import React from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { HeartOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

const Footer: React.FC = () => {
  return (
    <AntFooter style={{ 
      textAlign: 'center', 
      background: '#f0f2f5',
      padding: '24px 50px'
    }}>
      <Row justify="center">
        <Col span={24}>
          <Space direction="vertical" size="small">
            <Text type="secondary">
              Made with <HeartOutlined style={{ color: '#ff4d4f' }} /> for pet lovers
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              © 2024 Home for Pup. All rights reserved.
            </Text>
          </Space>
        </Col>
      </Row>
    </AntFooter>
  );
};

export default Footer;
