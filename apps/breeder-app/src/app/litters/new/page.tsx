'use client';

import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  App
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import type { Dog } from '@homeforpup/shared-types';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const fetcher = async (url: string) => {
  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
};

const CreateLitterPage: React.FC = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedKennelId, setSelectedKennelId] = useState<string>('');

  const { data: kennelsData } = useSWR('/api/kennels', fetcher);

  const { data: dogsData } = useSWR(
    selectedKennelId ? `/api/dogs?kennelId=${selectedKennelId}&type=parent&limit=100` : null,
    fetcher
  );

  const dogs: Dog[] = dogsData?.dogs || [];
  const sireDogs = dogs.filter((d) => d.gender === 'male');
  const damDogs = dogs.filter((d) => d.gender === 'female');

  const handleKennelChange = (kennelId: string) => {
    setSelectedKennelId(kennelId);
    form.setFieldsValue({ sireId: undefined, damId: undefined });
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        name: values.name,
        kennelId: values.kennelId,
        sireId: values.sireId,
        damId: values.damId,
      };
      if (values.expectedPuppyCount != null) {
        body.expectedPuppyCount = values.expectedPuppyCount;
      }
      if (values.expectedBirthDate) {
        body.expectedBirthDate = values.expectedBirthDate.format('YYYY-MM-DD');
      }
      if (values.notes) {
        body.notes = values.notes;
      }

      const response = await fetch('/api/litters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          message.error(
            errorData.error || 'You have reached the litter limit for your subscription tier. Please upgrade to add more litters.'
          );
          return;
        }
        throw new Error(errorData.error || 'Failed to create litter');
      }

      const data = await response.json();
      message.success('Litter created successfully!');
      router.push(`/litters/${data.litter.id}`);
    } catch (err) {
      console.error('Error creating litter:', err);
      message.error(err instanceof Error ? err.message : 'Failed to create litter');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <Space style={{ marginBottom: '24px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/litters')}>
          Back to Litters
        </Button>
      </Space>

      <Title level={2}>Create New Litter</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
        Register a new litter for one of your kennels
      </Text>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          preserve={false}
        >
          <Form.Item
            name="name"
            label="Litter Name"
            rules={[{ required: true, message: 'Please enter a litter name' }]}
          >
            <Input placeholder="e.g., Spring 2026 Litter" />
          </Form.Item>

          <Form.Item
            name="kennelId"
            label="Kennel"
            rules={[{ required: true, message: 'Please select a kennel' }]}
          >
            <Select
              placeholder="Select a kennel"
              onChange={handleKennelChange}
              showSearch
              optionFilterProp="children"
            >
              {kennelsData?.kennels?.map((kennel: { id: string; name: string }) => (
                <Option key={kennel.id} value={kennel.id}>
                  {kennel.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="sireId"
            label="Sire (Father)"
            rules={[{ required: true, message: 'Please select a sire' }]}
          >
            <Select
              placeholder={selectedKennelId ? 'Select sire' : 'Select a kennel first'}
              disabled={!selectedKennelId}
              showSearch
              optionFilterProp="children"
            >
              {sireDogs.map((dog) => (
                <Option key={dog.id} value={dog.id}>
                  {dog.name} — {dog.breed}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="damId"
            label="Dam (Mother)"
            rules={[{ required: true, message: 'Please select a dam' }]}
          >
            <Select
              placeholder={selectedKennelId ? 'Select dam' : 'Select a kennel first'}
              disabled={!selectedKennelId}
              showSearch
              optionFilterProp="children"
            >
              {damDogs.map((dog) => (
                <Option key={dog.id} value={dog.id}>
                  {dog.name} — {dog.breed}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="expectedPuppyCount"
            label="Expected Puppy Count"
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter expected number of puppies" />
          </Form.Item>

          <Form.Item
            name="expectedBirthDate"
            label="Expected Birth Date"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={4} placeholder="Any additional notes about this litter..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Create Litter
              </Button>
              <Button onClick={() => router.push('/litters')}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateLitterPage;
