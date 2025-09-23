'use client';

import React, { useState } from 'react';
import { Avatar, Button, Space, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import ImageCropperModal from './ImageCropperModal';
import { s3Operations } from '@/lib/s3';

interface ProfilePhotoUploadProps {
  value?: string;
  onChange?: (url: string) => void;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePick = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const f = input.files?.[0] || null;
      if (f) {
        setFile(f);
        setOpen(true);
      }
    };
    input.click();
  };

  return (
    <Space direction="vertical" size="middle">
      <Avatar size={96} src={value} />
      <Button icon={<UploadOutlined />} loading={uploading} onClick={handlePick}>Update Profile Photo</Button>
      <ImageCropperModal
        open={open}
        file={file}
        aspect="square"
        onCancel={() => { setOpen(false); setFile(null); }}
        onCropped={async (blob) => {
          try {
            setUploading(true);
            const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
            const key = `avatars/${uuidv4()}.jpg`;
            const url = await s3Operations.uploadFile(croppedFile, key);
            onChange?.(url);
            message.success('Profile photo updated');
          } catch (e) {
            message.error('Failed to upload profile photo');
          } finally {
            setUploading(false);
            setOpen(false);
            setFile(null);
          }
        }}
      />
    </Space>
  );
};

export default ProfilePhotoUpload;


