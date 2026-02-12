'use client';

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Tag,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Descriptions,
  Divider,
  App
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import type { Litter } from '@homeforpup/shared-types/kennel';

// The API stores kennelName on the litter record but it's not in the shared type
type LitterWithKennelName = Litter & { kennelName?: string };
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const statusColors: Record<string, string> = {
  expected: 'blue',
  born: 'cyan',
  weaned: 'orange',
  ready_for_homes: 'green',
  sold: 'purple',
  completed: 'default',
};

const statusLabels: Record<string, string> = {
  expected: 'Expected',
  born: 'Born',
  weaned: 'Weaned',
  ready_for_homes: 'Ready for Homes',
  sold: 'Sold',
  completed: 'Completed',
};

const allStatuses = ['expected', 'born', 'weaned', 'ready_for_homes', 'sold', 'completed'];

const LitterDetailPage: React.FC = () => {
  const { message } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const litterId = params.id as string;
  const [editVisible, setEditVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<{ litter: LitterWithKennelName }>(
    `/api/litters/${litterId}`,
    async (url: string) => {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch litter details');
      }
      return response.json();
    }
  );

  const litter = data?.litter;

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/litters/${litterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: litterId, status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      message.success('Status updated successfully');
      mutate();
    } catch (err) {
      console.error('Error updating status:', err);
      message.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleEdit = async (values: any) => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { id: litterId };

      if (values.name) body.name = values.name;
      if (values.expectedPuppyCount != null) body.expectedPuppyCount = values.expectedPuppyCount;
      if (values.actualPuppyCount != null) body.actualPuppyCount = values.actualPuppyCount;
      if (values.status) body.status = values.status;
      if (values.birthDate) body.birthDate = values.birthDate.format('YYYY-MM-DD');
      if (values.notes !== undefined) body.notes = values.notes;
      if (values.specialInstructions !== undefined) body.specialInstructions = values.specialInstructions;

      // Health fields
      const health: Record<string, unknown> = {};
      if (values.whelpingComplications !== undefined) health.whelpingComplications = values.whelpingComplications;
      if (values.vetCheckDate) health.vetCheckDate = values.vetCheckDate.format('YYYY-MM-DD');
      if (values.vetNotes !== undefined) health.vetNotes = values.vetNotes;
      if (values.vaccinationsStarted !== undefined) health.vaccinationsStarted = values.vaccinationsStarted;
      if (values.dewormingStarted !== undefined) health.dewormingStarted = values.dewormingStarted;

      if (Object.keys(health).length > 0) {
        body.health = { ...litter?.health, ...health };
      }

      const response = await fetch(`/api/litters/${litterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update litter');
      }

      message.success('Litter updated successfully');
      setEditVisible(false);
      mutate();
    } catch (err) {
      console.error('Error updating litter:', err);
      message.error(err instanceof Error ? err.message : 'Failed to update litter');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = () => {
    if (!litter) return;
    editForm.setFieldsValue({
      name: litter.name,
      expectedPuppyCount: litter.expectedPuppyCount,
      actualPuppyCount: litter.actualPuppyCount,
      status: litter.status,
      birthDate: litter.birthDate ? dayjs(litter.birthDate) : undefined,
      notes: litter.notes,
      specialInstructions: litter.specialInstructions,
      whelpingComplications: litter.health?.whelpingComplications,
      vetCheckDate: litter.health?.vetCheckDate ? dayjs(litter.health.vetCheckDate) : undefined,
      vetNotes: litter.health?.vetNotes,
      vaccinationsStarted: litter.health?.vaccinationsStarted,
      dewormingStarted: litter.health?.dewormingStarted,
    });
    setEditVisible(true);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !litter) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Card>
          <Title level={3}>Litter Not Found</Title>
          <Paragraph>The litter you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</Paragraph>
          <Button type="primary" onClick={() => router.push('/litters')}>
            Back to Litters
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Space style={{ marginBottom: '16px' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/litters')}>
            Back to Litters
          </Button>
        </Space>

        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              {litter.name}
            </Title>
            <Space style={{ marginTop: '8px' }}>
              <Tag color={statusColors[litter.status] || 'default'}>
                {statusLabels[litter.status] || litter.status}
              </Tag>
              {litter.kennelName && (
                <Text type="secondary">{litter.kennelName}</Text>
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              <Select
                value={litter.status}
                onChange={handleStatusChange}
                style={{ width: 180 }}
              >
                {allStatuses.map((s) => (
                  <Option key={s} value={s}>
                    {statusLabels[s]}
                  </Option>
                ))}
              </Select>
              <Button icon={<EditOutlined />} onClick={openEditModal}>
                Edit
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Content */}
      <Row gutter={[24, 24]}>
        {/* Parents */}
        <Col xs={24} lg={12}>
          <Card title="Parents" style={{ marginBottom: '24px' }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Sire (Father)">
                {litter.sireId ? (
                  <Link href={`/dogs/${litter.sireId}`}>{litter.sireName}</Link>
                ) : (
                  <Text type="secondary">{litter.sireName || '—'}</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Dam (Mother)">
                {litter.damId ? (
                  <Link href={`/dogs/${litter.damId}`}>{litter.damName}</Link>
                ) : (
                  <Text type="secondary">{litter.damName || '—'}</Text>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Details" style={{ marginBottom: '24px' }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Kennel">
                {litter.kennelId ? (
                  <Link href={`/kennels/${litter.kennelId}`}>{litter.kennelName || litter.kennelId}</Link>
                ) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Birth Date">
                {litter.birthDate ? dayjs(litter.birthDate).format('MMMM DD, YYYY') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Expected Puppy Count">
                {litter.expectedPuppyCount ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Actual Puppy Count">
                {litter.actualPuppyCount}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusColors[litter.status] || 'default'}>
                  {statusLabels[litter.status] || litter.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {dayjs(litter.createdAt).format('MMMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {dayjs(litter.updatedAt).format('MMMM DD, YYYY')}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          {/* Health */}
          <Card title="Health" style={{ marginBottom: '24px' }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Whelping Complications">
                {litter.health?.whelpingComplications || 'None reported'}
              </Descriptions.Item>
              <Descriptions.Item label="Vet Check Date">
                {litter.health?.vetCheckDate
                  ? dayjs(litter.health.vetCheckDate).format('MMMM DD, YYYY')
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Vet Notes">
                {litter.health?.vetNotes || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Vaccinations Started">
                <Tag color={litter.health?.vaccinationsStarted ? 'green' : 'default'}>
                  {litter.health?.vaccinationsStarted ? 'Yes' : 'No'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Deworming Started">
                <Tag color={litter.health?.dewormingStarted ? 'green' : 'default'}>
                  {litter.health?.dewormingStarted ? 'Yes' : 'No'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Notes */}
          <Card title="Notes" style={{ marginBottom: '24px' }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Notes">
                {litter.notes || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Special Instructions">
                {litter.specialInstructions || '—'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Puppies section */}
      {litter.puppies && litter.puppies.length > 0 && (
        <Card title="Puppies" style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            {litter.puppies.map((puppy) => (
              <Col xs={24} sm={12} md={8} key={puppy.id}>
                <Card size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Name">{puppy.name}</Descriptions.Item>
                    <Descriptions.Item label="Gender">
                      <Tag color={puppy.gender === 'male' ? 'blue' : 'pink'}>{puppy.gender}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Color">{puppy.color}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag>{puppy.status}</Tag>
                    </Descriptions.Item>
                    {puppy.weight && (
                      <Descriptions.Item label="Weight">{puppy.weight} lbs</Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal
        title="Edit Litter"
        open={editVisible}
        onCancel={() => {
          setEditVisible(false);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        confirmLoading={saving}
        width={700}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEdit}
          preserve={false}
        >
          <Form.Item name="name" label="Litter Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="status" label="Status">
                <Select>
                  {allStatuses.map((s) => (
                    <Option key={s} value={s}>{statusLabels[s]}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="expectedPuppyCount" label="Expected Puppies">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="actualPuppyCount" label="Actual Puppies">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="birthDate" label="Birth Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Divider>Health Information</Divider>

          <Form.Item name="whelpingComplications" label="Whelping Complications">
            <TextArea rows={2} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="vetCheckDate" label="Vet Check Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="vetNotes" label="Vet Notes">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="vaccinationsStarted" label="Vaccinations Started">
                <Select>
                  <Option value={true}>Yes</Option>
                  <Option value={false}>No</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dewormingStarted" label="Deworming Started">
                <Select>
                  <Option value={true}>Yes</Option>
                  <Option value={false}>No</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Notes</Divider>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item name="specialInstructions" label="Special Instructions">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LitterDetailPage;
