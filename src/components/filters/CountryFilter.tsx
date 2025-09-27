'use client';

import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

interface CountryFilterProps {
  value?: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
  size?: 'small' | 'middle' | 'large';
}

const CountryFilter: React.FC<CountryFilterProps> = ({
  value,
  onChange,
  style,
  placeholder = "Select country",
  size = 'middle'
}) => {
  return (
    <Select
      style={style}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      size={size}
    >
      <Option value="Canada">🇨🇦 Canada</Option>
      <Option value="USA">🇺🇸 United States</Option>
    </Select>
  );
};

export default CountryFilter;
