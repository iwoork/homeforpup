'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, Row, Col, Typography, Input, Tag, Spin, Alert, Pagination, Empty, Button,
  Select, Checkbox, Divider,
} from 'antd';
import {
  SearchOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  EyeOutlined,
  ShopOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import useSWR from 'swr';

const { Title, Text } = Typography;

interface KennelsFilters {
  availableStates: string[];
  availableSpecialties: string[];
  verifiedCount: number;
}

interface KennelsResponse {
  kennels: any[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters?: KennelsFilters;
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

  // Filter state
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | undefined>(undefined);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hasAvailability, setHasAvailability] = useState(false);

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
    if (selectedState) params.append('state', selectedState);
    if (selectedSpecialty) params.append('specialty', selectedSpecialty);
    if (verifiedOnly) params.append('verified', 'true');
    if (hasAvailability) params.append('hasAvailability', 'true');
    params.append('page', currentPage.toString());
    params.append('limit', pageSize.toString());
    return `/api/kennels?${params.toString()}`;
  }, [debouncedSearch, currentPage, pageSize, selectedState, selectedSpecialty, verifiedOnly, hasAvailability]);

  const { data, error, isLoading, mutate } = useSWR<KennelsResponse>(apiUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const kennels = data?.kennels || [];
  const total = data?.total || 0;
  const filters = data?.filters;

  const activeFilterCount = [selectedState, selectedSpecialty, verifiedOnly, hasAvailability].filter(Boolean).length;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedState(undefined);
    setSelectedSpecialty(undefined);
    setVerifiedOnly(false);
    setHasAvailability(false);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
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

      <Row gutter={24}>
        {/* Filter Sidebar */}
        <Col xs={24} lg={6}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span><FilterOutlined style={{ marginRight: '8px' }} />Filters</span>
                {activeFilterCount > 0 && (
                  <Tag color="cyan">{activeFilterCount} active</Tag>
                )}
              </div>
            }
            style={{ marginBottom: '24px', borderRadius: '12px' }}
          >
            {/* Search */}
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Search</Text>
              <Input
                placeholder="Name, business, or specialty..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* Location (State) */}
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                <EnvironmentOutlined style={{ marginRight: '6px' }} />
                Location
              </Text>
              <Select
                placeholder="All states"
                value={selectedState}
                onChange={(value) => { setSelectedState(value); handleFilterChange(); }}
                allowClear
                style={{ width: '100%' }}
                options={(filters?.availableStates || []).map((s) => ({ label: s, value: s }))}
              />
            </div>

            {/* Breed Expertise */}
            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Breed Expertise</Text>
              <Select
                placeholder="All specialties"
                value={selectedSpecialty}
                onChange={(value) => { setSelectedSpecialty(value); handleFilterChange(); }}
                allowClear
                showSearch
                style={{ width: '100%' }}
                options={(filters?.availableSpecialties || []).map((s) => ({ label: s, value: s }))}
              />
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* Verified Only */}
            <div style={{ marginBottom: '12px' }}>
              <Checkbox
                checked={verifiedOnly}
                onChange={(e) => { setVerifiedOnly(e.target.checked); handleFilterChange(); }}
              >
                Verified Only
                {filters?.verifiedCount != null && (
                  <Text type="secondary" style={{ marginLeft: '4px' }}>({filters.verifiedCount})</Text>
                )}
              </Checkbox>
            </div>

            {/* Has Availability */}
            <div style={{ marginBottom: '16px' }}>
              <Checkbox
                checked={hasAvailability}
                onChange={(e) => { setHasAvailability(e.target.checked); handleFilterChange(); }}
              >
                Has Availability
              </Checkbox>
            </div>

            {/* Clear All */}
            {activeFilterCount > 0 && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearFilters}
                  block
                >
                  Clear All Filters
                </Button>
              </>
            )}
          </Card>
        </Col>

        {/* Results */}
        <Col xs={24} lg={18}>
          {/* Results Header */}
          {!isLoading && !error && (
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#595959' }}>
                {total} {total === 1 ? 'kennel' : 'kennels'} found
                {activeFilterCount > 0 && (
                  <Tag color="cyan" style={{ marginLeft: '8px' }}>{activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} applied</Tag>
                )}
              </Text>
            </div>
          )}

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
                    debouncedSearch || activeFilterCount > 0
                      ? 'No kennels match your filters. Try adjusting your criteria.'
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
        </Col>
      </Row>
    </div>
  );
};

export default KennelListingPage;
