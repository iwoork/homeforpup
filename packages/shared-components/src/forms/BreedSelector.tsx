// components/forms/BreedSelector.tsx
'use client';

import React from 'react';
import { Select, Spin, Empty, Typography, Tag, Space, Tooltip } from 'antd';
import { SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

export interface Breed {
  id: number;
  name: string;
  altNames: string[];
  category: string;
  size: string;
  breedType: string;
  hybrid: boolean;
  breederCount?: number;
}

export interface BreedSelectorProps {
  value?: string | string[];
  onChange?: (value: string | string[] | undefined) => void;
  placeholder?: string;
  allowClear?: boolean;
  showSearch?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
  className?: string;
  size?: 'small' | 'middle' | 'large';
  maxTagCount?: number | 'responsive';
  showBreederCount?: boolean;
  showBreedInfo?: boolean;
  filterByCategory?: string;
  filterBySize?: string;
  filterByBreedType?: string;
  excludeBreeds?: string[];
  includeOnlyBreeds?: string[];
  onSearch?: (searchText: string) => void;
  onSelect?: (value: string, option: any) => void;
  onDeselect?: (value: string) => void;
  onClear?: () => void;
  onDropdownVisibleChange?: (open: boolean) => void;
  dropdownStyle?: React.CSSProperties;
  notFoundContent?: React.ReactNode;
  optionLabelProp?: string;
  optionFilterProp?: string;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  virtual?: boolean;
  listHeight?: number;
  maxCount?: number;
  breeds?: Breed[];
  error?: string;
}

const BreedSelector: React.FC<BreedSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Select breed',
  allowClear = true,
  showSearch = true,
  multiple = false,
  disabled = false,
  loading = false,
  style,
  className,
  size = 'middle',
  maxTagCount,
  showBreederCount = false,
  showBreedInfo = false,
  filterByCategory,
  filterBySize,
  filterByBreedType,
  excludeBreeds = [],
  includeOnlyBreeds,
  onSearch,
  onSelect,
  onDeselect,
  onClear,
  onDropdownVisibleChange,
  dropdownStyle,
  notFoundContent,
  optionLabelProp = 'label',
  optionFilterProp = 'children',
  getPopupContainer,
  virtual = false,
  listHeight = 256,
  maxCount,
  breeds = [],
  error
}) => {
  // Filter breeds based on props
  const filteredBreeds = React.useMemo(() => {
    let filtered = breeds;

    // Filter by category
    if (filterByCategory && filterByCategory !== 'All') {
      filtered = filtered.filter(breed => breed.category === filterByCategory);
    }

    // Filter by size
    if (filterBySize && filterBySize !== 'All') {
      filtered = filtered.filter(breed => breed.size === filterBySize);
    }

    // Filter by breed type
    if (filterByBreedType && filterByBreedType !== 'All') {
      filtered = filtered.filter(breed => breed.breedType === filterByBreedType);
    }

    // Exclude specific breeds
    if (excludeBreeds.length > 0) {
      filtered = filtered.filter(breed => !excludeBreeds.includes(breed.name));
    }

    // Include only specific breeds
    if (includeOnlyBreeds && includeOnlyBreeds.length > 0) {
      filtered = filtered.filter(breed => includeOnlyBreeds.includes(breed.name));
    }

    // Apply max count limit
    if (maxCount && maxCount > 0) {
      filtered = filtered.slice(0, maxCount);
    }

    return filtered;
  }, [
    breeds,
    filterByCategory,
    filterBySize,
    filterByBreedType,
    excludeBreeds,
    includeOnlyBreeds,
    maxCount
  ]);

  // Handle search
  const handleSearch = (searchText: string) => {
    onSearch?.(searchText);
  };

  // Handle select
  const handleSelect = (value: string, option: any) => {
    onSelect?.(value, option);
  };

  // Handle deselect
  const handleDeselect = (value: string) => {
    onDeselect?.(value);
  };

  // Handle clear
  const handleClear = () => {
    onClear?.();
  };

  // Handle dropdown visible change
  const handleDropdownVisibleChange = (open: boolean) => {
    onDropdownVisibleChange?.(open);
  };

  // Render option content
  const renderOptionContent = (breed: Breed) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, marginBottom: '2px' }}>
            {breed.name}
          </div>
          {showBreedInfo && (
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
              <Space size={4}>
                <Tag color="blue">{breed.category}</Tag>
                <Tag color="green">{breed.size}</Tag>
                {breed.hybrid && <Tag color="orange">Hybrid</Tag>}
              </Space>
            </div>
          )}
          {breed.altNames.length > 0 && (
            <div style={{ fontSize: '11px', color: '#999' }}>
              Also known as: {breed.altNames.slice(0, 2).join(', ')}
              {breed.altNames.length > 2 && ` +${breed.altNames.length - 2} more`}
            </div>
          )}
        </div>
        {showBreederCount && breed.breederCount !== undefined && (
          <div style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
            <Tooltip title={`${breed.breederCount} available breeders`}>
              <InfoCircleOutlined style={{ marginRight: '4px' }} />
              {breed.breederCount}
            </Tooltip>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Select
        placeholder={placeholder}
        disabled={true}
        style={style}
        className={className}
        size={size}
        notFoundContent={
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="small" />
            <div style={{ marginTop: '8px' }}>Loading breeds...</div>
          </div>
        }
      />
    );
  }

  // Error state
  if (error) {
    return (
      <Select
        placeholder={placeholder}
        disabled={true}
        style={style}
        className={className}
        size={size}
        notFoundContent={
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Failed to load breeds"
            style={{ padding: '20px' }}
          />
        }
      />
    );
  }

  // No breeds found
  if (filteredBreeds.length === 0) {
    return (
      <Select
        placeholder={placeholder}
        disabled={true}
        style={style}
        className={className}
        size={size}
        notFoundContent={
          notFoundContent || (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No breeds found"
              style={{ padding: '20px' }}
            />
          )
        }
      />
    );
  }

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch={showSearch}
      mode={multiple ? 'multiple' : undefined}
      disabled={disabled}
      style={style}
      className={className}
      size={size}
      maxTagCount={maxTagCount}
      onSearch={handleSearch}
      onSelect={handleSelect}
      onDeselect={handleDeselect}
      onClear={handleClear}
      onDropdownVisibleChange={handleDropdownVisibleChange}
      dropdownStyle={dropdownStyle}
      optionLabelProp={optionLabelProp}
      optionFilterProp={optionFilterProp}
      getPopupContainer={getPopupContainer}
      virtual={virtual}
      listHeight={listHeight}
      filterOption={(input, option) => {
        const searchText = input.toLowerCase();
        const breed = option?.breed as Breed;
        if (!breed) return false;
        
        return (
          breed.name.toLowerCase().includes(searchText) ||
          breed.altNames.some(alt => alt.toLowerCase().includes(searchText)) ||
          breed.category.toLowerCase().includes(searchText) ||
          breed.size.toLowerCase().includes(searchText)
        );
      }}
      notFoundContent={
        notFoundContent || (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No breeds match your search"
            style={{ padding: '20px' }}
          />
        )
      }
    >
      {filteredBreeds.map((breed) => (
        <Option
          key={breed.id}
          value={breed.name}
          label={breed.name}
          breed={breed}
        >
          {renderOptionContent(breed)}
        </Option>
      ))}
    </Select>
  );
};

export default BreedSelector;
