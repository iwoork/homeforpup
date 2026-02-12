'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, Row, Col, Typography, Input, Tag, Spin, Alert, Pagination, Empty, Button,
} from 'antd';
import {
  SearchOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  EyeOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import useSWR from 'swr';

const { Title, Text } = Typography;

interface KennelsResponse {
  kennels: any[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

const fetcher = async (url: string): Promise<KennelsResponse> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch kennels');
  return response.json();
};

const KennelListingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.append('search', debouncedSearch);
    params.append('page', currentPage.toString());
    params.append('limit', pageSize.toString());
    return `/api/kennels?${params.toString()}`;
  }, [debouncedSearch, currentPage, pageSize]);

  const { data, error, isLoading, mutate } = useSWR<KennelsResponse>(apiUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const kennels = data?.kennels || [];
  const total = data?.total || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Title level={1} style={{ color: '#08979C' }}>
          <ShopOutlined style={{ marginRight: '12px' }} />
          Browse Kennels
        </Title>
        <Text style={{ fontSize: '16px', color: '#595959' }}>
          Discover trusted kennels and find the perfect breeder for your family
        </Text>
      </div>

      {/* Search */}
      <div style={{ maxWidth: '600px', margin: '0 auto 32px' }}>
        <Input
          placeholder="Search by name, business, or specialty..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          size="large"
        />
      </div>

      {/* Error State */}
      {error && (
        <Alert
          message="Error Loading Kennels"
          description="There was an error loading kennel data. Please try again later."
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
          action={<Button size="small" onClick={() => mutate()}>Retry</Button>}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </div>
      )}

      {/* Kennel Cards */}
      {!isLoading && !error && (
        <>
          {kennels.length === 0 ? (
            <Empty
              description={
                debouncedSearch
                  ? 'No kennels match your search. Try different keywords.'
                  : 'No kennels available at the moment.'
              }
            />
          ) : (
            <Row gutter={[24, 24]}>
              {kennels.map((kennel) => (
                <Col xs={24} sm={12} lg={8} key={kennel.id}>
                  <Link href={`/kennels/${kennel.id}`} style={{ textDecoration: 'none' }}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        height: '100%',
                      }}
                    >
                      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Title level={4} style={{ margin: 0, flex: 1, marginRight: '8px' }}>
                          {kennel.name}
                        </Title>
                        {kennel.verified && (
                          <Tag color="green" icon={<CheckCircleOutlined />}>
                            Verified
                          </Tag>
                        )}
                      </div>

                      {kennel.businessName && (
                        <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                          {kennel.businessName}
                        </Text>
                      )}

                      {(kennel.address?.city || kennel.address?.state) && (
                        <div style={{ marginBottom: '12px' }}>
                          <EnvironmentOutlined style={{ color: '#08979C', marginRight: '6px' }} />
                          <Text style={{ fontSize: '13px' }}>
                            {[kennel.address?.city, kennel.address?.state].filter(Boolean).join(', ')}
                          </Text>
                        </div>
                      )}

                      {kennel.specialties && kennel.specialties.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          {kennel.specialties.slice(0, 3).map((s: string) => (
                            <Tag key={s} color="purple" style={{ marginBottom: '4px' }}>
                              {s}
                            </Tag>
                          ))}
                          {kennel.specialties.length > 3 && (
                            <Tag>+{kennel.specialties.length - 3} more</Tag>
                          )}
                        </div>
                      )}

                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        block
                        style={{ background: '#08979C', borderColor: '#08979C', marginTop: '8px' }}
                      >
                        View Details
                      </Button>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          )}

          {/* Pagination */}
          {total > pageSize && (
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={handlePageChange}
                showTotal={(t, range) => `${range[0]}-${range[1]} of ${t} kennels`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default KennelListingPage;
