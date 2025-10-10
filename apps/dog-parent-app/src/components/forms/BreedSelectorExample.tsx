// components/forms/BreedSelectorExample.tsx
'use client';

import React, { useState } from 'react';
import { Card, Typography, Space, Form, Button, Divider, Row, Col } from 'antd';
import { BreedSelector } from '@/components';

const { Title, Text, Paragraph } = Typography;

const BreedSelectorExample: React.FC = () => {
  const [form] = Form.useForm();
  const [selectedBreed, setSelectedBreed] = useState<string | undefined>();
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);

  const handleSingleChange = (value: string | string[] | undefined) => {
    setSelectedBreed(value as string);
  };

  const handleMultipleChange = (value: string | string[] | undefined) => {
    setSelectedBreeds(value as string[]);
  };

  const handleFormSubmit = (values: any) => {
    console.log('Form values:', values);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>BreedSelector Component Examples</Title>
      <Paragraph>
        The BreedSelector component fetches breed data from the API and provides a rich selection interface.
      </Paragraph>

      <Row gutter={[24, 24]}>
        {/* Basic Usage */}
        <Col xs={24} lg={12}>
          <Card title="Basic Usage" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Single Selection:</Text>
              <BreedSelector
                placeholder="Select a breed"
                value={selectedBreed}
                onChange={handleSingleChange}
                allowClear
                showSearch
              />
              <Text type="secondary">Selected: {selectedBreed || 'None'}</Text>
            </Space>
          </Card>
        </Col>

        {/* Multiple Selection */}
        <Col xs={24} lg={12}>
          <Card title="Multiple Selection" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Multiple Selection:</Text>
              <BreedSelector
                placeholder="Select multiple breeds"
                value={selectedBreeds}
                onChange={handleMultipleChange}
                multiple
                allowClear
                showSearch
                maxTagCount={3}
              />
              <Text type="secondary">Selected: {selectedBreeds.length} breeds</Text>
            </Space>
          </Card>
        </Col>

        {/* With Breed Info */}
        <Col xs={24} lg={12}>
          <Card title="With Breed Information" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Enhanced Display:</Text>
              <BreedSelector
                placeholder="Select breed with info"
                showBreedInfo={true}
                showBreederCount={true}
                allowClear
                showSearch
              />
              <Text type="secondary">Shows category, size, and breeder count</Text>
            </Space>
          </Card>
        </Col>

        {/* Filtered by Category */}
        <Col xs={24} lg={12}>
          <Card title="Filtered by Category" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Sporting Breeds Only:</Text>
              <BreedSelector
                placeholder="Select sporting breed"
                filterByCategory="Sporting"
                allowClear
                showSearch
              />
              <Text type="secondary">Only shows breeds from Sporting category</Text>
            </Space>
          </Card>
        </Col>

        {/* Form Integration */}
        <Col xs={24}>
          <Card title="Form Integration" size="small">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFormSubmit}
              initialValues={{
                primaryBreed: undefined,
                secondaryBreeds: []
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Primary Breed"
                    name="primaryBreed"
                    rules={[{ required: true, message: 'Please select a primary breed' }]}
                  >
                    <BreedSelector
                      placeholder="Select primary breed"
                      showBreedInfo={true}
                      showBreederCount={true}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Secondary Breeds"
                    name="secondaryBreeds"
                  >
                    <BreedSelector
                      placeholder="Select additional breeds"
                      multiple
                      maxTagCount={2}
                      showBreedInfo={false}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit Form
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Advanced Features */}
        <Col xs={24}>
          <Card title="Advanced Features" size="small">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Small Size Only:</Text>
                  <BreedSelector
                    placeholder="Small breeds"
                    filterBySize="Small"
                    size="small"
                    showBreedInfo={true}
                  />
                </Space>
              </Col>
              <Col xs={24} md={8}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Hybrid Breeds Only:</Text>
                  <BreedSelector
                    placeholder="Hybrid breeds"
                    filterByBreedType="hybrid"
                    showBreedInfo={true}
                  />
                </Space>
              </Col>
              <Col xs={24} md={8}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Exclude Specific Breeds:</Text>
                  <BreedSelector
                    placeholder="Available breeds"
                    excludeBreeds={['Golden Retriever', 'Labrador Retriever']}
                    showBreedInfo={true}
                  />
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="Props Reference" size="small">
        <Paragraph>
          <Text strong>Key Props:</Text>
        </Paragraph>
        <ul>
          <li><Text code>value</Text> - Current selected value(s)</li>
          <li><Text code>onChange</Text> - Callback when selection changes</li>
          <li><Text code>multiple</Text> - Enable multiple selection</li>
          <li><Text code>showBreedInfo</Text> - Show category, size, and hybrid tags</li>
          <li><Text code>showBreederCount</Text> - Show available breeder count</li>
          <li><Text code>filterByCategory</Text> - Filter by breed category</li>
          <li><Text code>filterBySize</Text> - Filter by breed size</li>
          <li><Text code>filterByBreedType</Text> - Filter by breed type</li>
          <li><Text code>excludeBreeds</Text> - Array of breed names to exclude</li>
          <li><Text code>includeOnlyBreeds</Text> - Array of breed names to include only</li>
          <li><Text code>maxCount</Text> - Maximum number of breeds to show</li>
        </ul>
      </Card>
    </div>
  );
};

export default BreedSelectorExample;
