import React, { useState } from 'react';
import { Upload, Button, List, message } from 'antd';
import { FileOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { s3Operations } from '@/lib/s3';
import { v4 as uuidv4 } from 'uuid';

interface DocumentUploadProps {
  documents: string[];
  onDocumentsChange: (documents: string[]) => void;
  maxDocuments?: number;
  acceptedTypes?: string;
  title?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  documents, 
  onDocumentsChange, 
  maxDocuments = 5,
  acceptedTypes = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  title = "Documents"
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (documents.length >= maxDocuments) {
      message.error(`Maximum ${maxDocuments} documents allowed`);
      return false;
    }

    setUploading(true);
    try {
      const key = `documents/${uuidv4()}_${file.name}`;
      const url = await s3Operations.uploadFile(file, key);
      
      onDocumentsChange([...documents, url]);
      message.success('Document uploaded successfully');
    } catch (error) {
      message.error('Failed to upload document');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
    
    return false;
  };

  const handleRemove = (docUrl: string) => {
    onDocumentsChange(documents.filter(url => url !== docUrl));
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'Document';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">{title}</h4>
        <Upload
          beforeUpload={handleUpload}
          showUploadList={false}
          accept={acceptedTypes}
          disabled={uploading || documents.length >= maxDocuments}
        >
          <Button 
            icon={<FileOutlined />} 
            loading={uploading}
            disabled={documents.length >= maxDocuments}
            size="small"
          >
            Upload ({documents.length}/{maxDocuments})
          </Button>
        </Upload>
      </div>

      {documents.length > 0 && (
        <List
          size="small"
          dataSource={documents}
          renderItem={(docUrl) => (
            <List.Item
              actions={[
                <Button
                  key="download"
                  type="text"
                  size="small"
                  icon={<DownloadOutlined />}
                  href={docUrl}
                  target="_blank"
                />,
                <Button
                  key="delete"
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemove(docUrl)}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={<FileOutlined />}
                title={getFileName(docUrl)}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default DocumentUpload;