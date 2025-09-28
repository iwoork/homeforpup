'use client';

import React from 'react';
import { Select, Form, Button, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Kennel } from '@/types';

const { Option } = Select;
const { Text } = Typography;

interface KennelSelectorProps {
  kennels?: Kennel[];
  value?: string;
  onChange?: (value: string) => void;
  onAddKennel?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const KennelSelector: React.FC<KennelSelectorProps> = ({
  kennels = [],
  value,
  onChange,
  onAddKennel,
  loading = false,
  disabled = false,
}) => {
  return (
    <Form.Item label="Kennel" name="kennelId">
      <Select
        placeholder="Select a kennel (optional)"
        value={value}
        onChange={onChange}
        loading={loading}
        disabled={disabled}
        allowClear
        dropdownRender={(menu) => (
          <div>
            {menu}
            {onAddKennel && (
              <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f0f0' }}>
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={onAddKennel}
                  style={{ width: '100%' }}
                >
                  Add New Kennel
                </Button>
              </div>
            )}
          </div>
        )}
      >
        {kennels.map((kennel) => (
          <Option key={kennel.id} value={kennel.id}>
            <div>
              <div style={{ fontWeight: 500 }}>{kennel.name}</div>
              {kennel.address && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {kennel.address.city}, {kennel.address.state}
                </Text>
              )}
            </div>
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default KennelSelector;
