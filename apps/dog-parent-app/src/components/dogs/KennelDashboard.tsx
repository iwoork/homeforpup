'use client';

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  Tabs,
  List,
  Avatar,
  Tag,
  Statistic,
  Divider,
  message,
  Modal,
  Empty,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  UserOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  YoutubeOutlined,
} from '@ant-design/icons';
import { Kennel, KennelAnnouncement } from '@/types';
import { useKennels } from '@/hooks/useKennels';
import KennelForm from './KennelForm';
import KennelAnnouncementForm from './KennelAnnouncementForm';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface KennelDashboardProps {
  userId: string;
}

const KennelDashboard: React.FC<KennelDashboardProps> = ({ userId }) => {
  const [showKennelForm, setShowKennelForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingKennel, setEditingKennel] = useState<Kennel | null>(null);
  const [selectedKennel, setSelectedKennel] = useState<Kennel | null>(null);

  const { kennels, isLoading, createKennel, updateKennel, deleteKennel } = useKennels();

  const handleAddKennel = () => {
    setEditingKennel(null);
    setShowKennelForm(true);
  };

  const handleEditKennel = (kennel: Kennel) => {
    setEditingKennel(kennel);
    setShowKennelForm(true);
  };

  const handleDeleteKennel = async (kennelId: string) => {
    Modal.confirm({
      title: 'Delete Kennel',
      content: 'Are you sure you want to delete this kennel? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteKennel(kennelId);
          message.success('Kennel deleted successfully');
        } catch (error) {
          message.error('Failed to delete kennel');
        }
      },
    });
  };

  const handleKennelSaved = (kennel: Kennel) => {
    setShowKennelForm(false);
    setEditingKennel(null);
  };

  const handleKennelFormCancel = () => {
    setShowKennelForm(false);
    setEditingKennel(null);
  };

  const handleAddAnnouncement = (kennel: Kennel) => {
    setSelectedKennel(kennel);
    setShowAnnouncementForm(true);
  };

  const handleAnnouncementSaved = (announcement: KennelAnnouncement) => {
    setShowAnnouncementForm(false);
    setSelectedKennel(null);
  };

  const handleAnnouncementFormCancel = () => {
    setShowAnnouncementForm(false);
    setSelectedKennel(null);
  };

  const getBusinessTypeColor = (type?: string) => {
    switch (type) {
      case 'hobby': return 'blue';
      case 'commercial': return 'green';
      case 'show': return 'purple';
      case 'working': return 'orange';
      default: return 'default';
    }
  };

  const getBusinessTypeLabel = (type?: string) => {
    switch (type) {
      case 'hobby': return 'Hobby Breeder';
      case 'commercial': return 'Commercial Breeder';
      case 'show': return 'Show Kennel';
      case 'working': return 'Working Dog Kennel';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Kennel Management</Title>
        <Paragraph>
          Manage your kennels, add parent dogs, and create announcements for your breeding business.
        </Paragraph>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddKennel}
          size="large"
        >
          Create New Kennel
        </Button>
      </div>

      {kennels && kennels.length > 0 ? (
        <Row gutter={[24, 24]}>
          {kennels.map((kennel) => (
            <Col xs={24} lg={12} xl={8} key={kennel.id}>
              <Card
                hoverable
                cover={
                  kennel.coverPhoto ? (
                    <img
                      alt={kennel.name}
                      src={kennel.coverPhoto}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        height: '200px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '24px',
                      }}
                    >
                      {kennel.name.charAt(0).toUpperCase()}
                    </div>
                  )
                }
                actions={[
                  <Button
                    key="view"
                    icon={<EyeOutlined />}
                    onClick={() => {/* TODO: Navigate to kennel profile */}}
                  >
                    View
                  </Button>,
                  <Button
                    key="edit"
                    icon={<EditOutlined />}
                    onClick={() => handleEditKennel(kennel)}
                  >
                    Edit
                  </Button>,
                  <Button
                    key="delete"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => handleDeleteKennel(kennel.id)}
                  >
                    Delete
                  </Button>,
                ]}
              >
                <Card.Meta
                  avatar={
                    <Avatar
                      size={64}
                      src={kennel.photoUrl}
                      icon={<UserOutlined />}
                    />
                  }
                  title={kennel.name}
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Text type="secondary">{kennel.description}</Text>
                      <Tag color={getBusinessTypeColor(kennel.businessType)}>
                        {getBusinessTypeLabel(kennel.businessType)}
                      </Tag>
                      <Tag color={kennel.isActive ? 'green' : 'red'}>
                        {kennel.isActive ? 'Active' : 'Inactive'}
                      </Tag>
                      <Tag color={kennel.isPublic ? 'blue' : 'orange'}>
                        {kennel.isPublic ? 'Public' : 'Private'}
                      </Tag>
                    </Space>
                  }
                />

                <Divider />

                {/* Kennel Details */}
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  {kennel.address && (
                    <Space>
                      <EnvironmentOutlined />
                      <Text>
                        {kennel.address.city}, {kennel.address.state}
                      </Text>
                    </Space>
                  )}
                  
                  {kennel.phone && (
                    <Space>
                      <PhoneOutlined />
                      <Text>{kennel.phone}</Text>
                    </Space>
                  )}
                  
                  {kennel.email && (
                    <Space>
                      <MailOutlined />
                      <Text>{kennel.email}</Text>
                    </Space>
                  )}
                  
                  {kennel.website && (
                    <Space>
                      <GlobalOutlined />
                      <Text>{kennel.website}</Text>
                    </Space>
                  )}

                  {kennel.establishedDate && (
                    <Space>
                      <CalendarOutlined />
                      <Text>Est. {new Date(kennel.establishedDate).getFullYear()}</Text>
                    </Space>
                  )}
                </Space>

                {/* Specialties */}
                {kennel.specialties && kennel.specialties.length > 0 && (
                  <>
                    <Divider />
                    <div>
                      <Text strong>Specialties: </Text>
                      <Space wrap>
                        {kennel.specialties.map((specialty, index) => (
                          <Tag key={index} color="blue">
                            {specialty}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  </>
                )}

                {/* Social Links */}
                {kennel.socialLinks && (
                  <>
                    <Divider />
                    <Space>
                      {kennel.socialLinks.facebook && (
                        <Button
                          type="text"
                          icon={<FacebookOutlined />}
                          href={kennel.socialLinks.facebook}
                          target="_blank"
                        />
                      )}
                      {kennel.socialLinks.instagram && (
                        <Button
                          type="text"
                          icon={<InstagramOutlined />}
                          href={kennel.socialLinks.instagram}
                          target="_blank"
                        />
                      )}
                      {kennel.socialLinks.twitter && (
                        <Button
                          type="text"
                          icon={<TwitterOutlined />}
                          href={kennel.socialLinks.twitter}
                          target="_blank"
                        />
                      )}
                      {kennel.socialLinks.youtube && (
                        <Button
                          type="text"
                          icon={<YoutubeOutlined />}
                          href={kennel.socialLinks.youtube}
                          target="_blank"
                        />
                      )}
                    </Space>
                  </>
                )}

                {/* Statistics */}
                <Divider />
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="Dogs"
                      value={kennel.totalDogs || 0}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Litters"
                      value={kennel.totalLitters || 0}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Avg. Litter"
                      value={kennel.averageLitterSize || 0}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                </Row>

                {/* Quick Actions */}
                <Divider />
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleAddAnnouncement(kennel)}
                  >
                    Add Announcement
                  </Button>
                  <Button
                    size="small"
                    icon={<SettingOutlined />}
                    onClick={() => {/* TODO: Navigate to kennel settings */}}
                  >
                    Manage Dogs
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card>
          <Empty
            description="No kennels created yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddKennel}>
              Create Your First Kennel
            </Button>
          </Empty>
        </Card>
      )}

      {/* Kennel Form Modal */}
      <Modal
        title={editingKennel ? 'Edit Kennel' : 'Create New Kennel'}
        open={showKennelForm}
        onCancel={handleKennelFormCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        <KennelForm
          kennel={editingKennel || undefined}
          onSave={handleKennelSaved}
          onCancel={handleKennelFormCancel}
        />
      </Modal>

      {/* Announcement Form Modal */}
      <Modal
        title="Create New Announcement"
        open={showAnnouncementForm}
        onCancel={handleAnnouncementFormCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedKennel && (
          <KennelAnnouncementForm
            kennelId={selectedKennel.id}
            onSave={handleAnnouncementSaved}
            onCancel={handleAnnouncementFormCancel}
          />
        )}
      </Modal>
    </div>
  );
};

export default KennelDashboard;
