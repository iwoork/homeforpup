'use client';

import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

interface StateFilterProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  availableStates?: string[];
  style?: React.CSSProperties;
  placeholder?: string;
  size?: 'small' | 'middle' | 'large';
  mode?: 'multiple' | 'tags';
  maxTagCount?: number;
}

const StateFilter: React.FC<StateFilterProps> = ({
  value = [],
  onChange,
  availableStates = [],
  style,
  placeholder = "Select states",
  size = 'middle',
  mode = 'multiple',
  maxTagCount = 2
}) => {
  return (
    <Select
      mode={mode}
      style={style}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      size={size}
      maxTagCount={maxTagCount}
      showSearch
      filterOption={(input, option) => {
        const label = option?.label || option?.children;
        const searchText = String(label || '');
        return searchText.toLowerCase().includes(input.toLowerCase());
      }}
    >
      {availableStates.map(state => (
        <Option key={state} value={state}>{state}</Option>
      ))}
    </Select>
  );
};

export default StateFilter;
