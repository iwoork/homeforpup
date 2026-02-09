'use client';

import React, { useState, useRef } from 'react';
import { Form, Input, Button, Space, Select, message, Image } from 'antd';
import { SendOutlined, PaperClipOutlined, CloseCircleFilled } from '@ant-design/icons';
import { MessageAttachment } from '../types';
import { v4 as uuidv4 } from 'uuid';

const { TextArea } = Input;
const { Option } = Select;

interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  url?: string;
  error?: boolean;
}

interface InlineReplyFormProps {
  threadId: string;
  onSendMessage: (content: string, messageType: string, attachments?: MessageAttachment[]) => Promise<void>;
  loading?: boolean;
}

const InlineReplyForm: React.FC<InlineReplyFormProps> = ({
  threadId,
  onSendMessage,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const remaining = 3 - files.length;
    if (remaining <= 0) {
      message.warning('Maximum 3 images allowed');
      return;
    }

    const newFiles: UploadingFile[] = [];
    for (let i = 0; i < Math.min(selectedFiles.length, remaining); i++) {
      const file = selectedFiles[i];
      if (!file.type.startsWith('image/')) {
        message.warning(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.warning(`${file.name} is too large (max 5MB)`);
        continue;
      }
      newFiles.push({
        id: uuidv4(),
        file,
        preview: URL.createObjectURL(file),
        uploading: true,
      });
    }

    if (newFiles.length === 0) return;

    setFiles(prev => [...prev, ...newFiles]);

    // Upload each file
    for (const uploadFile of newFiles) {
      try {
        const key = `messages/${threadId}/${uploadFile.id}-${uploadFile.file.name}`;
        const formData = new FormData();
        formData.append('file', uploadFile.file);
        formData.append('key', key);

        const response = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, uploading: false, url: data.url }
              : f
          )
        );
      } catch {
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, uploading: false, error: true }
              : f
          )
        );
        message.error(`Failed to upload ${uploadFile.file.name}`);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleSubmit = async (values: any) => {
    if (!values.content?.trim() && files.length === 0) {
      message.warning('Please enter a message or attach an image');
      return;
    }

    const isUploading = files.some(f => f.uploading);
    if (isUploading) {
      message.warning('Please wait for images to finish uploading');
      return;
    }

    const hasErrors = files.some(f => f.error);
    if (hasErrors) {
      message.warning('Please remove failed uploads before sending');
      return;
    }

    setSending(true);
    try {
      const attachments: MessageAttachment[] = files
        .filter(f => f.url)
        .map(f => ({
          id: f.id,
          filename: f.file.name,
          url: f.url!,
          size: f.file.size,
          type: f.file.type,
        }));

      await onSendMessage(
        values.content || '',
        values.messageType || 'general',
        attachments.length > 0 ? attachments : undefined
      );
      form.resetFields();
      // Clean up previews
      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles([]);
      message.success('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
      message.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#fff',
        position: 'sticky',
        bottom: 0,
        zIndex: 10
      }}
    >
      {/* Attachment previews */}
      {files.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '8px',
          flexWrap: 'wrap'
        }}>
          {files.map(f => (
            <div
              key={f.id}
              style={{
                position: 'relative',
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: f.error ? '2px solid #ff4d4f' : '1px solid #d9d9d9',
                opacity: f.uploading ? 0.6 : 1,
              }}
            >
              <img
                src={f.preview}
                alt={f.file.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {f.uploading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  Uploading...
                </div>
              )}
              <CloseCircleFilled
                onClick={() => removeFile(f.id)}
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  fontSize: '16px',
                  color: '#ff4d4f',
                  cursor: 'pointer',
                  background: 'white',
                  borderRadius: '50%',
                }}
              />
            </div>
          ))}
        </div>
      )}

      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        size="middle"
      >
        <Form.Item
          name="content"
          style={{ marginBottom: '8px' }}
        >
          <TextArea
            placeholder="Type your message..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            style={{
              resize: 'none',
              fontSize: '16px',
              borderRadius: '20px',
              padding: '12px 16px'
            }}
          />
        </Form.Item>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Button
            icon={<PaperClipOutlined />}
            onClick={() => fileInputRef.current?.click()}
            disabled={files.length >= 3}
            title="Attach images (max 3)"
            style={{ borderRadius: '20px' }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <Form.Item
            name="messageType"
            initialValue="general"
            style={{ marginBottom: 0, flex: 1 }}
          >
            <Select
              placeholder="Type"
              style={{ width: '100%' }}
              size="middle"
            >
              <Option value="general">General</Option>
              <Option value="inquiry">Inquiry</Option>
              <Option value="business">Business</Option>
              <Option value="urgent">Urgent</Option>
            </Select>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={sending || loading}
            size="middle"
            style={{
              minWidth: '80px',
              height: '40px',
              borderRadius: '20px'
            }}
          >
            Send
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default InlineReplyForm;
