'use client';

import React from 'react';
import { Select, Spin, Empty, Tag, Space, Tooltip } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import type { DogColor, DogColorCategory } from '@homeforpup/shared-types';

const { Option } = Select;

export interface ColorSelectorProps {
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
  showColorSwatches?: boolean;
  showDescription?: boolean;
  filterByCategory?: DogColorCategory;
  excludeColors?: string[];
  includeOnlyColors?: string[];
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
  colors?: DogColor[];
  error?: string;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Select color',
  allowClear = true,
  showSearch = true,
  multiple = false,
  disabled = false,
  loading = false,
  style,
  className,
  size = 'middle',
  maxTagCount,
  showColorSwatches = true,
  showDescription = false,
  filterByCategory,
  excludeColors = [],
  includeOnlyColors,
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
  colors = [],
  error
}) => {
  // Filter colors based on props
  const filteredColors = React.useMemo(() => {
    let filtered = colors;

    // Filter by category
    if (filterByCategory) {
      filtered = filtered.filter(color => color.category === filterByCategory);
    }

    // Exclude specific colors
    if (excludeColors.length > 0) {
      filtered = filtered.filter(color => !excludeColors.includes(color.id));
    }

    // Include only specific colors
    if (includeOnlyColors && includeOnlyColors.length > 0) {
      filtered = filtered.filter(color => includeOnlyColors.includes(color.id));
    }

    // Apply max count limit
    if (maxCount && maxCount > 0) {
      filtered = filtered.slice(0, maxCount);
    }

    return filtered;
  }, [
    colors,
    filterByCategory,
    excludeColors,
    includeOnlyColors,
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

  // Get category color
  const getCategoryColor = (category: DogColorCategory) => {
    switch (category) {
      case 'solid':
        return 'blue';
      case 'pattern':
        return 'purple';
      case 'multi-color':
        return 'orange';
      default:
        return 'default';
    }
  };

  // Render option content
  const renderOptionContent = (color: DogColor) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {showColorSwatches && color.hexCode && (
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                backgroundColor: color.hexCode,
                border: '1px solid #d9d9d9',
                flexShrink: 0
              }}
            />
          )}
          {!color.hexCode && showColorSwatches && (
            <BgColorsOutlined style={{ fontSize: '16px', color: '#999', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, marginBottom: showDescription && color.description ? '2px' : 0 }}>
              {color.name}
            </div>
            {showDescription && color.description && (
              <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.3' }}>
                {color.description}
              </div>
            )}
          </div>
        </div>
        <div style={{ marginLeft: '8px', flexShrink: 0 }}>
          <Tag color={getCategoryColor(color.category)} style={{ margin: 0 }}>
            {color.category}
          </Tag>
        </div>
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
            <div style={{ marginTop: '8px' }}>Loading colors...</div>
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
            description="Failed to load colors"
            style={{ padding: '20px' }}
          />
        }
      />
    );
  }

  // No colors found
  if (filteredColors.length === 0) {
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
              description="No colors found"
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
        const color = option?.color as DogColor;
        if (!color) return false;
        
        return (
          color.name.toLowerCase().includes(searchText) ||
          color.category.toLowerCase().includes(searchText) ||
          (color.description?.toLowerCase().includes(searchText) || false)
        );
      }}
      notFoundContent={
        notFoundContent || (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No colors match your search"
            style={{ padding: '20px' }}
          />
        )
      }
    >
      {filteredColors.map((color) => (
        <Option
          key={color.id}
          value={color.name}
          label={color.name}
          color={color}
        >
          {renderOptionContent(color)}
        </Option>
      ))}
    </Select>
  );
};

export default ColorSelector;

