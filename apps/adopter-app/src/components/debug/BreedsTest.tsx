'use client';

import React from 'react';
import { useAllBreeds } from '@homeforpup/shared-breeds';
import { Card, Spin, Alert, List } from 'antd';

export const BreedsTest: React.FC = () => {
  const { breeds, loading, error } = useAllBreeds({ limit: 10 });

  console.log('BreedsTest - Loading:', loading);
  console.log('BreedsTest - Error:', error);
  console.log('BreedsTest - Breeds count:', breeds.length);
  console.log('BreedsTest - First few breeds:', breeds.slice(0, 3));

  return (
    <Card title="Breeds API Test" style={{ margin: '20px' }}>
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <p>Loading breeds...</p>
        </div>
      )}
      
      {error && (
        <Alert
          message="Error Loading Breeds"
          description={error}
          type="error"
          showIcon
        />
      )}
      
      {!loading && !error && (
        <div>
          <p><strong>Total breeds loaded:</strong> {breeds.length}</p>
          <List
            dataSource={breeds.slice(0, 5)}
            renderItem={(breed) => (
              <List.Item>
                <List.Item.Meta
                  title={breed.name}
                  description={`${breed.category} • ${breed.size} • ${breed.breedType}`}
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </Card>
  );
};
