'use client';

import React from 'react';
import { Select } from 'antd';
import { getRegionsByCountry } from '@/lib/constants/locations';

const { Option } = Select;

interface StateFilterProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  availableStates?: string[];
  country?: string;
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
  country,
  style,
  placeholder,
  size = 'middle',
  mode = 'multiple',
  maxTagCount = 2
}) => {
  const regions = getRegionsByCountry(country);

  const defaultPlaceholder = country === 'Canada'
    ? 'Select province'
    : country === 'US'
      ? 'Select state'
      : 'Select state/province';

  return (
    <Select
      mode={mode}
      style={style}
      placeholder={placeholder || defaultPlaceholder}
      value={value}
      onChange={onChange}
      size={size}
      maxTagCount={maxTagCount}
      allowClear
      showSearch
      filterOption={(input, option) => {
        const label = option?.label || option?.children;
        const searchText = String(label || '');
        return searchText.toLowerCase().includes(input.toLowerCase());
      }}
    >
      {regions.map(region => (
        <Option key={region.value} value={region.value}>{region.label}</Option>
      ))}
    </Select>
  );
};

export default StateFilter;
