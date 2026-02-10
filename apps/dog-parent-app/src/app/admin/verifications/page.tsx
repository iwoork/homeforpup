'use client';

import React, { useState, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Tabs,
  Modal,
  Input,
  Result,
  Spin,
  Space,
  List,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '@homeforpup/shared-auth';
import useSWR from 'swr';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const cardStyle: React.CSSProperties = {
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  marginBottom: '24px',
};

interface VerificationDocument {
  type: string;
  name: string;
  url: string;
  uploadedAt: string;
}

interface VerificationRequest {
  id: string;
  breederId: string;
  kennelId?: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  documents: VerificationDocument[];
  breederName?: string;
  kennelName?: string;
}

interface VerificationsResponse {
  verificationRequests: VerificationRequest[];
  nextKey: string | null;
  count: number;
}

interface DetailResponse {
  verificationRequest: VerificationRequest;
}

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: { color: 'gold', icon: <ClockCircleOutlined />, label: 'Pending' },
  in_review: { color: 'blue', icon: <EyeOutlined />, label: 'In Review' },
  approved: { color: 'green', icon: <CheckCircleOutlined />, label: 'Approved' },
  rejected: { color: 'red', icon: <CloseCircleOutlined />, label: 'Rejected' },
};

const DOC_TYPE_LABELS: Record<string, string> = {
  license: 'Breeding License',
  certification: 'Kennel Certification',
  health_clearance: 'Health Testing Records',
  insurance: 'Insurance',
  reference: 'Reference',
};

const DOC_TYPE_COLORS: Record<string, string> = {
  license: 'blue',
  certification: 'green',
  health_clearance: 'purple',
  insurance: 'orange',
  reference: 'cyan',
};

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
  if (['jpg', 'jpeg', 'png'].includes(ext || '')) return <FileImageOutlined style={{ color: '#1890ff' }} />;
  return <FileOutlined />;
};

const AdminVerificationsPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const statusFilter = activeTab === 'all' ? '' : activeTab;
  const apiUrl = user
    ? `/api/admin/verifications${statusFilter ? `?status=${statusFilter}` : ''}`
    : null;

  const { data, isLoading, mutate } = useSWR<VerificationsResponse>(apiUrl, fetcher);

  const handleViewDetail = useCallback(async (request: VerificationRequest) => {
    try {
      const res = await fetch(`/api/admin/verifications/${request.id}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch details');
      const detail: DetailResponse = await res.json();
      setSelectedRequest(detail.verificationRequest);
      setDetailModalOpen(true);
    } catch {
      message.error('Failed to load verification details');
    }
  }, []);

  const handleApprove = useCallback(async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/verifications/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to approve');
      }
      message.success('Verification request approved');
      setDetailModalOpen(false);
      setSelectedRequest(null);
      mutate();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  }, [selectedRequest, mutate]);

  const handleRejectConfirm = useCallback(async () => {
    if (!selectedRequest) return;
    if (!rejectNotes.trim()) {
      message.error('Please provide rejection notes');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/verifications/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'rejected', reviewerNotes: rejectNotes.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to reject');
      }
      message.success('Verification request rejected');
      setRejectModalOpen(false);
      setDetailModalOpen(false);
      setRejectNotes('');
      setSelectedRequest(null);
      mutate();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  }, [selectedRequest, rejectNotes, mutate]);

  const openRejectModal = useCallback(() => {
    setRejectNotes('');
    setRejectModalOpen(true);
  }, []);

  if (authLoading || isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
        <Paragraph style={{ marginTop: '16px', color: '#666' }}>Loading...</Paragraph>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '48px auto', padding: '0 24px' }}>
        <Result
          status="403"
          title="Sign In Required"
          subTitle="Please sign in with an admin account to access this page."
        />
      </div>
    );
  }

  const requests = data?.verificationRequests || [];

  const columns = [
    {
      title: 'Breeder',
      key: 'breeder',
      render: (_: unknown, record: VerificationRequest) => (
        <div>
          <Text strong>{record.breederName || record.breederId}</Text>
          {record.kennelName && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.kennelName}
              </Text>
            </div>
          )}
          {!record.kennelName && record.kennelId && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Kennel: {record.kennelId}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: VerificationRequest, b: VerificationRequest) =>
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
    },
    {
      title: 'Documents',
      key: 'documents',
      render: (_: unknown, record: VerificationRequest) => (
        <Text>{record.documents?.length || 0} file(s)</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = STATUS_CONFIG[status] || { color: 'default', icon: null, label: status };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: VerificationRequest) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
          style={{ color: '#08979C' }}
        >
          Review
        </Button>
      ),
    },
  ];

  const tabItems = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_review', label: 'In Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '48px auto', padding: '0 24px' }}>
      <Card style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <SafetyCertificateOutlined style={{ fontSize: '32px', color: '#08979C' }} />
          <div>
            <Title level={2} style={{ margin: 0 }}>Verification Requests</Title>
            <Text type="secondary">Review and manage breeder verification submissions</Text>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: '16px' }}
        />

        <Table
          dataSource={requests}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: 'No verification requests found' }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: '#08979C' }} />
            <span>Verification Request Details</span>
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedRequest(null);
        }}
        width={700}
        footer={
          selectedRequest && ['pending', 'in_review'].includes(selectedRequest.status)
            ? [
                <Button key="reject" danger onClick={openRejectModal} disabled={actionLoading}>
                  Reject
                </Button>,
                <Button
                  key="approve"
                  type="primary"
                  onClick={handleApprove}
                  loading={actionLoading}
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                  Approve
                </Button>,
              ]
            : [
                <Button key="close" onClick={() => {
                  setDetailModalOpen(false);
                  setSelectedRequest(null);
                }}>
                  Close
                </Button>,
              ]
        }
      >
        {selectedRequest && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Breeder ID:</Text>
                  <Text>{selectedRequest.breederName || selectedRequest.breederId}</Text>
                </div>
                {(selectedRequest.kennelName || selectedRequest.kennelId) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Kennel:</Text>
                    <Text>{selectedRequest.kennelName || selectedRequest.kennelId}</Text>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Submitted:</Text>
                  <Text>{new Date(selectedRequest.submittedAt).toLocaleString()}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Status:</Text>
                  {(() => {
                    const config = STATUS_CONFIG[selectedRequest.status] || { color: 'default', icon: null, label: selectedRequest.status };
                    return (
                      <Tag color={config.color} icon={config.icon}>
                        {config.label}
                      </Tag>
                    );
                  })()}
                </div>
                {selectedRequest.reviewedAt && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Reviewed:</Text>
                    <Text>{new Date(selectedRequest.reviewedAt).toLocaleString()}</Text>
                  </div>
                )}
                {selectedRequest.reviewerNotes && (
                  <div style={{ marginTop: '8px' }}>
                    <Text strong>Reviewer Notes:</Text>
                    <Paragraph style={{ marginTop: '4px', color: '#666' }}>
                      {selectedRequest.reviewerNotes}
                    </Paragraph>
                  </div>
                )}
              </Space>
            </div>

            <Title level={5} style={{ marginTop: '16px' }}>
              Documents ({selectedRequest.documents?.length || 0})
            </Title>
            <List
              dataSource={selectedRequest.documents || []}
              renderItem={(doc: VerificationDocument) => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#08979C' }}
                    >
                      View Document
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={getFileIcon(doc.name || doc.url)}
                    title={doc.name}
                    description={
                      <Space>
                        <Tag color={DOC_TYPE_COLORS[doc.type] || 'default'}>
                          {DOC_TYPE_LABELS[doc.type] || doc.type}
                        </Tag>
                        {doc.uploadedAt && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No documents attached' }}
            />
          </div>
        )}
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
            <span>Reject Verification Request</span>
          </Space>
        }
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectNotes('');
        }}
        onOk={handleRejectConfirm}
        confirmLoading={actionLoading}
        okText="Confirm Rejection"
        okButtonProps={{ danger: true }}
      >
        <Paragraph>
          Please provide notes explaining why this verification request is being rejected.
          The breeder will see these notes and can resubmit.
        </Paragraph>
        <TextArea
          rows={4}
          value={rejectNotes}
          onChange={(e) => setRejectNotes(e.target.value)}
          placeholder="e.g., Breeding license is expired. Please submit a current license."
        />
      </Modal>
    </div>
  );
};

export default AdminVerificationsPage;
