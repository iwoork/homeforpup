'use client';

import React from 'react';
import { ColorSelector } from '@homeforpup/shared-components';
import { useDogColors } from '@homeforpup/shared-hooks';
import { Card, Typography, Space } from 'antd';

const { Title, Text } = Typography;

export default function TestColorSelector() {
  const { colors, loading, error } = useDogColors();
  const [selectedColor, setSelectedColor] = React.useState<string>();

  return (
    <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
      <Title>ColorSelector Test Page</Title>
      
      <Card style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>Debug Info:</Text>
          <Text>Colors loaded: <strong>{colors.length}</strong></Text>
          <Text>Loading: <strong>{loading ? 'Yes' : 'No'}</strong></Text>
          <Text>Error: <strong>{error || 'None'}</strong></Text>
          <Text>Selected: <strong>{selectedColor || 'None'}</strong></Text>
        </Space>
      </Card>

      <Card title="ColorSelector Component">
        <div style={{ marginBottom: '10px' }}>
          <Text>This should show a dropdown with 45+ colors:</Text>
        </div>
        <ColorSelector
          value={selectedColor}
          onChange={(value) => setSelectedColor(value as string)}
          colors={colors}
          loading={loading}
          error={error || undefined}
          showColorSwatches={true}
          showDescription={true}
          placeholder="Select a color to test"
          style={{ width: '100%' }}
        />
      </Card>

      <Card style={{ marginTop: '20px' }} title="Instructions">
        <ol>
          <li>Click on the dropdown above</li>
          <li>You should see 45+ colors with swatches</li>
          <li>Try searching for "black" or "merle"</li>
          <li>Select a color</li>
          <li>The "Selected" value should update</li>
        </ol>
        
        <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
          <Text strong>If this works but DogForm doesn't:</Text>
          <ul>
            <li>The component itself is fine</li>
            <li>The issue is specific to how DogForm renders</li>
            <li>Check for JavaScript errors in the console</li>
            <li>Make sure you're on the actual Add/Edit Dog form, not the list</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

