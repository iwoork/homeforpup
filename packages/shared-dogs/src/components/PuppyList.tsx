'use client';

import React from 'react';
import { Row, Col, Spin, Empty, Typography, Pagination } from 'antd';
import PuppyCard, { PuppyWithKennel } from './PuppyCard';

const { Text } = Typography;

export interface PuppyListProps {
  puppies: PuppyWithKennel[];
  loading?: boolean;
  error?: string | null;
  favoriteStatus?: Record<string, boolean>;
  onFavoriteToggle?: (puppyId: string) => void;
  onContact?: (puppy: PuppyWithKennel) => void;
  showContactButton?: boolean;
  showFavoriteButton?: boolean;
  
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
  
  // Grid props
  gutter?: [number, number];
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
  
  // Container props
  style?: React.CSSProperties;
  className?: string;
}

const PuppyList: React.FC<PuppyListProps> = ({
  puppies,
  loading = false,
  error = null,
  favoriteStatus = {},
  onFavoriteToggle,
  onContact,
  showContactButton = true,
  showFavoriteButton = true,
  
  // Pagination
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 12,
  onPageChange,
  showPagination = true,
  
  // Grid layout
  gutter = [24, 24],
  xs = 24,
  sm = 12,
  md = 8,
  lg = 6,
  xl = 6,
  xxl = 4,
  
  // Container
  style,
  className,
}) => {
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        ...style 
      }} className={className}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        ...style 
      }} className={className}>
        <Text type="danger">Error loading puppies: {error}</Text>
      </div>
    );
  }

  if (!puppies || puppies.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        ...style 
      }} className={className}>
        <Empty
          description="No puppies available"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div style={style} className={className}>
      <Row gutter={gutter}>
        {puppies.map((puppy) => (
          <Col
            key={puppy.id}
            xs={xs}
            sm={sm}
            md={md}
            lg={lg}
            xl={xl}
            xxl={xxl}
          >
            <PuppyCard
              puppy={puppy}
              isFavorite={favoriteStatus[puppy.id] || false}
              onFavoriteToggle={onFavoriteToggle}
              onContact={onContact}
              showContactButton={showContactButton}
              showFavoriteButton={showFavoriteButton}
              href={`/puppies/${puppy.id}`}
            />
          </Col>
        ))}
      </Row>
      
      {showPagination && totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '32px' 
        }}>
          <Pagination
            current={currentPage}
            total={totalCount}
            pageSize={pageSize}
            showSizeChanger={false}
            showQuickJumper={true}
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} of ${total} puppies`
            }
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default PuppyList;
