'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Card,
  Typography,
  Button,
  Select,
  Input,
  List,
  Tag,
  Result,
  Spin,
  Alert,
  Space,
  message,
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useAuth } from '@homeforpup/shared-auth';
import useSWR from 'swr';

const { Title, Paragraph, Text } = Typography;

const cardStyle: React.CSSProperties = {
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  marginBottom: '24px',
};

interface UploadedDocument {
  type: 'license' | 'certification' | 'health_clearance' | 'insurance' | 'reference';
  name: string;
  url: string;
  fileName: string;
}

interface VerificationRequest {
  id: string;
  breederId: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  documents: Array<{
    type: string;
    name: string;
    url: string;
    uploadedAt: string;
  }>;
}

interface StatusResponse {
  status: string;
  verificationRequest: VerificationRequest | null;
  message?: string;
}

const DOCUMENT_TYPES = [
  { value: 'license', label: 'Breeding License' },
  { value: 'certification', label: 'Kennel Certification' },
  { value: 'health_clearance', label: 'Health Testing Records' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'reference', label: 'Reference' },
];

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

const VerificationPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string>('license');
  const [docName, setDocName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: statusData, isLoading: statusLoading, mutate } = useSWR<StatusResponse>(
    user ? '/api/verification/status' : null,
    fetcher
  );

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      message.error('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    if (!docName.trim()) {
      message.error('Please enter a document name');
      return;
    }

    setUploading(true);
    try {
      // Get presigned upload URL
      const params = new URLSearchParams({
        fileName: file.name,
        fileType: ext,
        documentType: selectedDocType,
      });
      const urlRes = await fetch(`/api/verification/upload-url?${params}`, {
        credentials: 'include',
      });
      if (!urlRes.ok) {
        const err = await urlRes.json();
        throw new Error(err.error || 'Failed to get upload URL');
      }
      const { uploadUrl, documentUrl } = await urlRes.json();

      // Upload file to S3 via presigned URL
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) {
        throw new Error('Failed to upload file');
      }

      // Add to documents list
      setDocuments(prev => [
        ...prev,
        {
          type: selectedDocType as UploadedDocument['type'],
          name: docName.trim(),
          url: documentUrl,
          fileName: file.name,
        },
      ]);
      setDocName('');
      message.success('Document uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      message.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [selectedDocType, docName]);

  const handleRemoveDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (documents.length === 0) {
      message.error('Please upload at least one document');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/verification/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          documents: documents.map(doc => ({
            type: doc.type,
            name: doc.name,
            url: doc.url,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit verification request');
      }

      message.success('Verification request submitted successfully!');
      setDocuments([]);
      mutate();
    } catch (error) {
      console.error('Submit error:', error);
      message.error(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || statusLoading) {
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
          subTitle="Please sign in to submit your verification request."
        />
      </div>
    );
  }

  const currentStatus = statusData?.status;
  const verificationRequest = statusData?.verificationRequest;

  // Show status view for existing requests (not rejected - rejected can resubmit)
  if (currentStatus && currentStatus !== 'none' && currentStatus !== 'rejected') {
    return (
      <div style={{ maxWidth: '700px', margin: '48px auto', padding: '0 24px' }}>
        <Card style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#08979C', marginBottom: '16px' }} />
            <Title level={2} style={{ margin: 0 }}>Verification Status</Title>
          </div>

          {currentStatus === 'pending' && (
            <Result
              icon={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              title="Verification Pending"
              subTitle="Your verification request has been submitted and is awaiting review. This typically takes 2-3 business days."
              extra={
                <Tag color="gold" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  Submitted {verificationRequest?.submittedAt ? new Date(verificationRequest.submittedAt).toLocaleDateString() : ''}
                </Tag>
              }
            />
          )}

          {currentStatus === 'in_review' && (
            <Result
              icon={<EyeOutlined style={{ color: '#1890ff' }} />}
              title="Under Review"
              subTitle="An admin is currently reviewing your verification documents. You'll be notified once the review is complete."
              extra={
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  In Review
                </Tag>
              }
            />
          )}

          {currentStatus === 'approved' && (
            <Result
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              title="Verified!"
              subTitle="Congratulations! Your verification has been approved. Your profile now shows a verified badge."
              extra={
                <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  Approved {verificationRequest?.reviewedAt ? new Date(verificationRequest.reviewedAt).toLocaleDateString() : ''}
                </Tag>
              }
            />
          )}

          {verificationRequest?.documents && verificationRequest.documents.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <Title level={5}>Submitted Documents</Title>
              <List
                dataSource={verificationRequest.documents}
                renderItem={(doc) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={getFileIcon(doc.name)}
                      title={doc.name}
                      description={
                        <Tag color={DOC_TYPE_COLORS[doc.type] || 'default'}>
                          {DOCUMENT_TYPES.find(d => d.value === doc.type)?.label || doc.type}
                        </Tag>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Show submission form for new or rejected requests
  return (
    <div style={{ maxWidth: '700px', margin: '48px auto', padding: '0 24px' }}>
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#08979C', marginBottom: '16px' }} />
          <Title level={2} style={{ margin: 0 }}>Breeder Verification</Title>
          <Paragraph style={{ color: '#666', marginTop: '8px' }}>
            Submit your credentials to earn a verified badge on your profile. Verified breeders
            enjoy higher visibility and greater trust from families.
          </Paragraph>
        </div>

        {currentStatus === 'rejected' && verificationRequest?.reviewerNotes && (
          <Alert
            type="warning"
            showIcon
            message="Previous Submission Rejected"
            description={verificationRequest.reviewerNotes}
            style={{ marginBottom: '24px' }}
          />
        )}

        {/* Document Upload Section */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={4}>Upload Documents</Title>
          <Paragraph style={{ color: '#666' }}>
            Upload your breeding license, certifications, health testing records, and insurance documents.
          </Paragraph>

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Document Type</Text>
              <Select
                value={selectedDocType}
                onChange={setSelectedDocType}
                style={{ width: '100%' }}
                options={DOCUMENT_TYPES}
              />
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>Document Name</Text>
              <Input
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="e.g., State Breeding License 2025"
              />
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <Button
                icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !docName.trim()}
                loading={uploading}
                style={{
                  background: '#08979C',
                  borderColor: '#08979C',
                  color: 'white',
                }}
              >
                {uploading ? 'Uploading...' : 'Choose File & Upload'}
              </Button>
              <Text type="secondary" style={{ display: 'block', marginTop: '4px', fontSize: '12px' }}>
                Accepted formats: PDF, JPG, PNG
              </Text>
            </div>
          </Space>
        </div>

        {/* Uploaded Documents List */}
        {documents.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <Title level={4}>Uploaded Documents ({documents.length})</Title>
            <List
              dataSource={documents}
              renderItem={(doc, index) => (
                <List.Item
                  actions={[
                    <Button
                      key="remove"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveDocument(index)}
                    >
                      Remove
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={getFileIcon(doc.fileName)}
                    title={doc.name}
                    description={
                      <Space>
                        <Tag color={DOC_TYPE_COLORS[doc.type] || 'default'}>
                          {DOCUMENT_TYPES.find(d => d.value === doc.type)?.label || doc.type}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{doc.fileName}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="primary"
          size="large"
          block
          onClick={handleSubmit}
          loading={submitting}
          disabled={documents.length === 0 || submitting}
          style={{
            height: '48px',
            fontSize: '16px',
            background: documents.length > 0 ? '#08979C' : undefined,
            borderColor: documents.length > 0 ? '#08979C' : undefined,
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Verification Request'}
        </Button>

        {documents.length === 0 && (
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: '8px' }}>
            Upload at least one document to submit
          </Text>
        )}
      </Card>
    </div>
  );
};

export default VerificationPage;
