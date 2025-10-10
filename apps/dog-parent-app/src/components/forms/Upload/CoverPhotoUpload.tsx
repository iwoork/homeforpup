'use client';

import React, { useState } from 'react';
import { Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import ImageCropperModal from './ImageCropperModal';
import { s3Operations } from '@/lib';

interface CoverPhotoUploadProps {
  value?: string;
  onChange?: (url: string) => void;
}

const CoverPhotoUpload: React.FC<CoverPhotoUploadProps> = ({ onChange }) => {
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
    <div>
      <Button icon={<UploadOutlined />} loading={uploading} onClick={handlePick}>Upload Cover Photo</Button>
      <ImageCropperModal
        open={open}
        file={file}
        aspect="cover"
        onCancel={() => { setOpen(false); setFile(null); }}
        onCropped={async (blob) => {
          try {
            setUploading(true);
            const croppedFile = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
            const key = `covers/${uuidv4()}.jpg`;
            const url = await s3Operations.uploadFile(croppedFile, key);
            onChange?.(url);
            message.success('Cover photo updated');
          } catch {
            message.error('Failed to upload cover photo');
          } finally {
            setUploading(false);
            setOpen(false);
            setFile(null);
          }
        }}
      />
    </div>
  );
};

export default CoverPhotoUpload;


