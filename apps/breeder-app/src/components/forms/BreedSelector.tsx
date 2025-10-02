// components/forms/BreedSelector.tsx
'use client';

import React from 'react';
import { Select, Spin, Empty, Typography, Tag, Space, Tooltip } from 'antd';
import { SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAllBreeds, Breed } from '@homeforpup/shared-dogs';

const { Option } = Select;
const { Text } = Typography;

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
  maxCount
}) => {
  const { breeds, loading: breedsLoading, error } = useAllBreeds({
    category: filterByCategory,
    size: filterBySize,
    breedType: filterByBreedType,
    limit: maxCount || 1000
  });

  // Filter breeds based on props
  const filteredBreeds = React.useMemo(() => {
    let filtered = breeds;

    // Exclude specific breeds
    if (excludeBreeds.length > 0) {
      filtered = filtered.filter(breed => !excludeBreeds.includes(breed.name));
    }

    // Include only specific breeds
    if (includeOnlyBreeds && includeOnlyBreeds.length > 0) {
      filtered = filtered.filter(breed => includeOnlyBreeds.includes(breed.name));
    }

    return filtered;
  }, [breeds, excludeBreeds, includeOnlyBreeds]);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text strong>{breed.name}</Text>
            {breed.altNames.length > 0 && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                ({breed.altNames[0]})
              </Text>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Tag color="blue">{breed.category}</Tag>
            <Tag color="green">{breed.size}</Tag>
            <Tag color="orange">{breed.breedType}</Tag>
          </div>
          {showBreedInfo && (
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {breed.overview.substring(0, 100)}...
              </Text>
            </div>
          )}
        </div>
        {showBreederCount && breed.breederCount !== undefined && (
          <div style={{ marginLeft: 8 }}>
            <Tooltip title={`${breed.breederCount} breeders available`}>
              <Tag color="purple">
                {breed.breederCount}
              </Tag>
            </Tooltip>
          </div>
        )}
      </div>
    );
  };

  // Show loading state
  if (breedsLoading || loading) {
    return (
      <Select
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={style}
        className={className}
        size={size}
        loading={true}
        notFoundContent={
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="small" />
            <div style={{ marginTop: 8 }}>Loading breeds...</div>
          </div>
        }
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <Select
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={style}
        className={className}
        size={size}
        notFoundContent={
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Error loading breeds"
            style={{ padding: '20px' }}
          />
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
