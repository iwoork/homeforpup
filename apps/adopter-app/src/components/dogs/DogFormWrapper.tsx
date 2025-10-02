'use client';

import React, { useState } from 'react';
import { Modal, message } from 'antd';
import DogForm from '../forms/DogForm';
import { useKennels } from '@/hooks/useKennels';
import { mutate } from 'swr';
import type { Dog } from '@/types';

export interface DogFormWrapperProps {
  visible: boolean;
  onClose: () => void;
  dog?: Dog | null;
  onSuccess?: (dog: Dog) => void;
}

export const DogFormWrapper: React.FC<DogFormWrapperProps> = ({
  visible,
  onClose,
  dog,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const { kennels, isLoading: kennelsLoading } = useKennels();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Convert values to FormData
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'birthDate' && value && typeof value === 'object' && 'format' in value) {
            formData.append(key, (value as any).format('YYYY-MM-DD'));
          } else if (key === 'photo' && value && typeof value === 'object' && 'fileList' in value) {
            // Handle photo upload
            if ((value as any).fileList && (value as any).fileList[0]) {
              formData.append('photo', (value as any).fileList[0].originFileObj);
            }
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const url = dog?.id ? `/api/dogs/${dog.id}` : '/api/dogs';
      const method = dog?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save dog');
      }

      const savedDog = await response.json();
      message.success(dog?.id ? 'Dog updated successfully!' : 'Dog added successfully!');
      
      // Refresh dogs data
      mutate('/api/dogs');
      
      onSuccess?.(savedDog);
      onClose();
    } catch (error) {
      console.error('Error saving dog:', error);
      message.error(error instanceof Error ? error.message : 'Failed to save dog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={dog?.id ? 'Edit Dog' : 'Add New Dog'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
      centered
    >
      <DogForm
        dog={dog}
        kennels={kennels?.map(k => ({ id: k.id, name: k.name })) || []}
        kennelsLoading={kennelsLoading}
        onSubmit={handleSubmit}
        onCancel={onClose}
        loading={loading}
        showKennelSelector={true}
        showAdvancedFields={true}
        showPhotoUpload={true}
      />
    </Modal>
  );
};

export default DogFormWrapper;

