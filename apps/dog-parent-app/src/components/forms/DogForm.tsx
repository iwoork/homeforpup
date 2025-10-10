'use client';

import React from 'react';
import { Form } from 'antd';
import { AddEditDogForm, useDogColors, useAllBreeds } from '@homeforpup/shared-dogs';
import type { Dog } from '@/types';

export interface DogFormProps {
  dog?: Dog | null;
  kennels?: Array<{ id: string; name: string }>;
  kennelsLoading?: boolean;
  onSubmit: (values: any) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  showKennelSelector?: boolean;
  showAdvancedFields?: boolean;
  showPhotoUpload?: boolean;
}

const DogForm: React.FC<DogFormProps> = ({
  dog,
  kennels,
  kennelsLoading,
  onSubmit,
  onCancel,
  loading,
  showKennelSelector = true,
  showAdvancedFields = false,
  showPhotoUpload = false,
}) => {
  const [form] = Form.useForm();
  const { colors, loading: colorsLoading, error: colorsError } = useDogColors();
  const { breeds, loading: breedsLoading, error: breedsError } = useAllBreeds();

  return (
    <AddEditDogForm
      form={form}
      onFinish={onSubmit}
      onCancel={onCancel || (() => {})}
      mode={dog?.id ? 'edit' : 'add'}
      initialValues={dog || undefined}
      loading={loading}
      kennels={showKennelSelector ? kennels : undefined}
      colors={colors}
      colorsLoading={colorsLoading}
      colorsError={colorsError}
      breeds={breeds}
      breedsLoading={breedsLoading}
      breedsError={breedsError}
      layout={showAdvancedFields ? 'detailed' : 'simple'}
      showAdvancedFields={showAdvancedFields}
      showPhotos={showPhotoUpload}
    />
  );
};

export default DogForm;
