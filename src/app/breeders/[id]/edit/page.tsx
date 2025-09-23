'use client';

import React, { useCallback, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Form, Input, Space, Alert, Spin, App } from 'antd';
import { SaveOutlined, LoadingOutlined } from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useAuth } from '@/hooks/useAuth';

const { Title } = Typography;

interface BreederProfile {
  id: number;
  name: string;
  businessName: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  about: string;
  businessHours: string;
  pricing: string;
  specialties: string[];
  breeds: string[];
  certifications: string[];
  healthTesting: string[];
}

const fetcher = async (url: string): Promise<{ breeder: BreederProfile }> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch breeder');
  return response.json();
};

const BreederEditPage: React.FC = () => {
  const { user, getToken } = useAuth();
  const params = useParams();
  const router = useRouter();
  const breederId = params?.id as string;
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { data, error, isLoading, mutate } = useSWR<{ breeder: BreederProfile }>(
    breederId ? `/api/breeders/${breederId}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  // Owner-only access
  useEffect(() => {
    if (!user || !breederId) return;
    if (String(user.userId) !== String(breederId)) {
      router.replace(`/breeders/${breederId}`);
    }
  }, [user, breederId, router]);

  useEffect(() => {
    if (data?.breeder) {
      form.setFieldsValue({
        businessName: data.breeder.businessName,
        about: data.breeder.about,
        phone: data.breeder.phone,
        email: data.breeder.email,
        website: data.breeder.website,
        location: data.breeder.location,
        businessHours: data.breeder.businessHours,
        pricing: data.breeder.pricing,
      });
    }
  }, [data, form]);

  const handleSave = useCallback(async (values: any) => {
    const token = getToken();
    try {
      const res = await fetch(`/api/breeders/${breederId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to save');
      message.success('Breeder profile updated');
      mutate();
      router.push(`/breeders/${breederId}`);
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Failed to update');
    }
  }, [breederId, getToken, message, mutate, router]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px', textAlign: 'center', paddingTop: '100px' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  if (error || !data?.breeder) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <Alert type="error" showIcon message="Unable to load breeder profile" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px' }}>
      <Card style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Edit Breeder Profile</Title>
      </Card>

      <Card>
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Business Name" name="businessName" rules={[{ required: true, message: 'Business name is required' }]}>
                <Input placeholder="Business name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Website" name="website">
                <Input placeholder="example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Phone" name="phone">
                <Input placeholder="(555) 123-4567" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Email" name="email">
                <Input type="email" placeholder="you@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Location" name="location">
            <Input placeholder="City, State" />
          </Form.Item>

          <Form.Item label="Business Hours" name="businessHours">
            <Input placeholder="Mon-Fri 9am-5pm" />
          </Form.Item>

          <Form.Item label="Pricing" name="pricing">
            <Input placeholder="$1500 - $2500" />
          </Form.Item>

          <Form.Item label="About" name="about">
            <Input.TextArea rows={6} placeholder="Tell families about your program" />
          </Form.Item>

          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button htmlType="submit" type="primary" icon={<SaveOutlined />}>Save</Button>
            <Button onClick={() => router.push(`/breeders/${breederId}`)}>Cancel</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default BreederEditPage;


