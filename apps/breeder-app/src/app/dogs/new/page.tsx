'use client';

import React, { useState } from 'react';
import { Card, Typography, Button, Form, Row, Col, App } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { AddEditDogForm, useDogColors, useAllBreeds } from '@homeforpup/shared-dogs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const { Title, Paragraph } = Typography;

const CreateDogPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colors, loading: colorsLoading, error: colorsError } = useDogColors();
  const { breeds, loading: breedsLoading, error: breedsError } = useAllBreeds();

  const { data: kennelsData } = useSWR(
    '/api/kennels',
    async (url: string) => {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch kennels');
      return response.json();
    }
  );

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/dogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create dog');
      }

      message.success('Dog added successfully!');
      router.push('/dogs');
    } catch (error: any) {
      console.error('Error adding dog:', error);
      message.error(error.message || 'Failed to add dog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Add New Dog</Title>
          <Paragraph type="secondary">
            Add a new dog to your kennel
          </Paragraph>
        </Col>
        <Col>
          <Link href="/dogs">
            <Button icon={<ArrowLeftOutlined />}>Back to Dogs</Button>
          </Link>
        </Col>
      </Row>

      {/* Form */}
      <Card>
        <AddEditDogForm
          form={form}
          onFinish={handleSubmit}
          onCancel={() => router.push('/dogs')}
          mode="add"
          loading={loading}
          kennels={kennelsData?.kennels}
          colors={colors}
          colorsLoading={colorsLoading}
          colorsError={colorsError}
          breeds={breeds}
          breedsLoading={breedsLoading}
          breedsError={breedsError}
          layout="detailed"
          showAdvancedFields={true}
        />
      </Card>
    </div>
  );
};

export default CreateDogPage;
