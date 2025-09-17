'use client';

import React, { useState, useCallback } from 'react';
import { Upload, Button, message, Row, Col, Image } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { s3Operations } from '@/lib/s3';
import { v4 as uuidv4 } from 'uuid';
import type { UploadFile, RcFile } from 'antd/es/upload';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 10 
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(async (file: RcFile): Promise<boolean> => {
    if (photos.length >= maxPhotos) {
      message.error(`Maximum ${maxPhotos} photos allowed`);
      return false;
    }

    setUploading(true);
    try {
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const key = `photos/${uuidv4()}.${fileExtension}`;
      const url = await s3Operations.uploadFile(file, key);
      
      onPhotosChange([...photos, url]);
      message.success('Photo uploaded successfully');
    } catch (error) {
      message.error('Failed to upload photo');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
    
    return false; // Prevent default upload
  }, [photos, onPhotosChange, maxPhotos]);

  const handleRemove = useCallback((photoUrl: string) => {
    onPhotosChange(photos.filter(url => url !== photoUrl));
  }, [photos, onPhotosChange]);

  return (
    <div style={{ marginBottom: '16px' }}>
      <Upload
        beforeUpload={handleUpload}
        showUploadList={false}
        accept="image/*"
        disabled={uploading || photos.length >= maxPhotos}
      >
        <Button 
          icon={<UploadOutlined />} 
          loading={uploading}
          disabled={photos.length >= maxPhotos}
        >
          Upload Photos ({photos.length}/{maxPhotos})
        </Button>
      </Upload>

      {photos.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          {photos.map((photoUrl, index) => (
            <Col xs={12} sm={8} md={6} key={`photo-${index}`}>
              <div style={{ 
                position: 'relative', 
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #d9d9d9'
              }}>
                <Image 
                  src={photoUrl} 
                  alt={`Photo ${index + 1}`}
                  style={{ 
                    width: '100%', 
                    height: '120px', 
                    objectFit: 'cover'
                  }}
                  preview={false}
                />
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'rgba(255, 255, 255, 0.8)'
                  }}
                  onClick={() => handleRemove(photoUrl)}
                />
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default PhotoUpload;