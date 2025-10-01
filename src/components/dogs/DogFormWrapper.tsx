'use client';

import React, { useState } from 'react';
import { message } from 'antd';
import { DogForm } from '@homeforpup/shared-components';
import { useKennels } from '@/hooks/useKennels';
import type { Dog } from '@/types';

interface DogFormWrapperProps {
  dog?: Dog | null;
  onSave?: (dog: Dog) => void;
  onCancel?: () => void;
}

export const DogFormWrapper: React.FC<DogFormWrapperProps> = ({
  dog,
  onSave,
  onCancel,
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
        throw new Error('Failed to save dog');
      }

      const savedDog = await response.json();
      message.success(dog ? 'Dog updated successfully' : 'Dog created successfully');
      
      onSave?.(savedDog);
    } catch (error) {
      console.error('Error saving dog:', error);
      message.error('Failed to save dog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DogForm
      dog={dog}
      kennels={kennels?.map(k => ({ id: k.id, name: k.name })) || []}
      kennelsLoading={kennelsLoading}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      loading={loading}
      showKennelSelector={true}
      showAdvancedFields={true}
      showPhotoUpload={true}
    />
  );
};

export default DogFormWrapper;

