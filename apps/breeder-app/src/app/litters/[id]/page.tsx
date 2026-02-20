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
  EditOutlined,
  PlusOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import type { Litter, PuppyInfo } from '@homeforpup/shared-types/kennel';
import { ColorSelector, useDogColors } from '@homeforpup/shared-dogs';
import BreedSelector from '@/components/forms/BreedSelector';

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

const puppyStatusColors: Record<string, string> = {
  available: 'green',
  reserved: 'orange',
  sold: 'purple',
  kept: 'blue',
};

const puppyStatusLabels: Record<string, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Adopted',
  kept: 'Kept',
};

const LitterDetailPage: React.FC = () => {
  const { message } = App.useApp();
  const params = useParams();
  const router = useRouter();
  const litterId = params?.id as string;
  const [editVisible, setEditVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [addPuppyVisible, setAddPuppyVisible] = useState(false);
  const [addPuppyForm] = Form.useForm();
  const { colors, loading: colorsLoading, error: colorsError } = useDogColors();

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

  // Fetch kennel dogs for "add existing puppy" dropdown
  const { data: dogsData } = useSWR<{ dogs: any[]; total: number }>(
    litter?.kennelId ? `/api/dogs?kennelId=${litter.kennelId}&type=puppy&limit=100` : null,
    async (url: string) => {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch dogs');
      return response.json();
    }
  );

  const savePuppies = async (updatedPuppies: PuppyInfo[]) => {
    try {
      const response = await fetch(`/api/litters/${litterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: litterId,
          puppies: updatedPuppies,
          actualPuppyCount: updatedPuppies.length,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update puppies');
      }
      mutate();
    } catch (err) {
      console.error('Error updating puppies:', err);
      message.error(err instanceof Error ? err.message : 'Failed to update puppies');
    }
  };

  const handleAddNewPuppy = async (values: any) => {
    try {
      const response = await fetch('/api/dogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...values,
          kennelId: litter?.kennelId,
          type: 'puppy',
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create puppy');
      }
      const result = await response.json();
      const createdDog = result.dog || result;
      const newPuppy: PuppyInfo = {
        id: createdDog.id,
        name: createdDog.name,
        gender: createdDog.gender,
        color: createdDog.color,
        markings: createdDog.markings,
        weight: createdDog.weight,
        status: 'available',
        notes: createdDog.notes,
      };
      const updatedPuppies = [...(litter?.puppies || []), newPuppy];
      await savePuppies(updatedPuppies);
      setAddPuppyVisible(false);
      addPuppyForm.resetFields();
      message.success('Puppy created and added to litter');
    } catch (err) {
      console.error('Error creating puppy:', err);
      message.error(err instanceof Error ? err.message : 'Failed to create puppy');
    }
  };

  const handleAddExistingPuppy = async (dogId: string) => {
    const dog = dogsData?.dogs.find((d: any) => d.id === dogId);
    if (!dog) return;
    const puppyInfo: PuppyInfo = {
      id: dog.id,
      name: dog.name,
      gender: dog.gender,
      color: dog.color,
      markings: dog.markings,
      weight: dog.weight,
      status: 'available',
      notes: dog.notes,
    };
    const updatedPuppies = [...(litter?.puppies || []), puppyInfo];
    await savePuppies(updatedPuppies);
    message.success('Puppy added to litter');
  };

  const handleRemovePuppy = async (puppyId: string) => {
    const updatedPuppies = (litter?.puppies || []).filter((p) => p.id !== puppyId);
    await savePuppies(updatedPuppies);
    message.success('Puppy removed from litter');
  };

  const handlePuppyStatusChange = async (puppyId: string, newStatus: string) => {
    const updatedPuppies = (litter?.puppies || []).map((p) =>
      p.id === puppyId ? { ...p, status: newStatus as PuppyInfo['status'] } : p
    );
    await savePuppies(updatedPuppies);
    message.success('Puppy status updated');
  };

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
      <Card title="Puppies" style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Space wrap>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => setAddPuppyVisible(true)}
            >
              Add New Puppy
            </Button>
            <Select
              placeholder="Add existing puppy"
              style={{ width: 220 }}
              showSearch
              optionFilterProp="children"
              value={undefined}
              onSelect={(value) => { if (value) handleAddExistingPuppy(value); }}
            >
              {dogsData?.dogs
                ?.filter((dog: any) => !litter.puppies?.some((p) => p.id === dog.id))
                ?.map((dog: any) => (
                  <Option key={dog.id} value={dog.id}>
                    {dog.name} ({dog.gender})
                  </Option>
                ))}
            </Select>
          </Space>
        </div>
        {!litter.puppies || litter.puppies.length === 0 ? (
          <Empty description="No puppies in this litter yet" />
        ) : (
          <Row gutter={[16, 16]}>
            {litter.puppies.map((puppy) => (
              <Col xs={24} sm={12} md={8} key={puppy.id}>
                <Card size="small" style={{ position: 'relative' }}>
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<CloseOutlined />}
                    style={{ position: 'absolute', top: 4, right: 4 }}
                    onClick={() => handleRemovePuppy(puppy.id)}
                  />
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Name">{puppy.name}</Descriptions.Item>
                    <Descriptions.Item label="Gender">
                      <Tag color={puppy.gender === 'male' ? 'blue' : 'pink'}>{puppy.gender}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Color">{puppy.color}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Select
                        value={puppy.status}
                        size="small"
                        style={{ width: 120 }}
                        onChange={(value: string) => handlePuppyStatusChange(puppy.id, value)}
                      >
                        {Object.entries(puppyStatusLabels).map(([key, label]) => (
                          <Option key={key} value={key}>{label}</Option>
                        ))}
                      </Select>
                    </Descriptions.Item>
                    {puppy.weight && (
                      <Descriptions.Item label="Weight">{puppy.weight} lbs</Descriptions.Item>
                    )}
                    {puppy.markings && (
                      <Descriptions.Item label="Markings">{puppy.markings}</Descriptions.Item>
                    )}
                  </Descriptions>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={puppyStatusColors[puppy.status] || 'default'}>
                      {puppyStatusLabels[puppy.status] || puppy.status}
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

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

      {/* Add New Puppy Modal */}
      <Modal
        title="Add New Puppy"
        open={addPuppyVisible}
        onCancel={() => {
          setAddPuppyVisible(false);
          addPuppyForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={addPuppyForm}
          layout="vertical"
          onFinish={handleAddNewPuppy}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Puppy Name"
                rules={[{ required: true, message: 'Please enter puppy name' }]}
              >
                <Input placeholder="Enter puppy name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="callName" label="Call Name (Nickname)">
                <Input placeholder="Enter nickname" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="breed"
                label="Breed"
                rules={[{ required: true, message: 'Please select breed' }]}
              >
                <BreedSelector
                  placeholder="Select breed"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: 'Please select gender' }]}
              >
                <Select placeholder="Select gender">
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="birthDate"
                label="Birth Date"
                rules={[{ required: true, message: 'Please enter birth date' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="color"
                label="Color"
                rules={[{ required: true, message: 'Please select color' }]}
                help="Select the primary color or pattern"
              >
                <ColorSelector
                  colors={colors}
                  loading={colorsLoading}
                  error={colorsError || undefined}
                  showColorSwatches={true}
                  showDescription={true}
                  placeholder="Select color or pattern"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="weight" label="Weight (lbs)">
                <InputNumber
                  min={0}
                  max={50}
                  style={{ width: '100%' }}
                  placeholder="Weight"
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="markings" label="Markings">
                <Input placeholder="Describe any markings" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="notes" label="Notes">
                <Input.TextArea
                  rows={3}
                  placeholder="Additional notes about this puppy"
                />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setAddPuppyVisible(false);
                addPuppyForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Puppy
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default LitterDetailPage;
