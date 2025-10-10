# ColorSelector Implementation Example

This guide shows how to replace the existing text input color fields with the new `ColorSelector` component in both apps.

## Quick Start

### 1. Import the Required Dependencies

```tsx
// Add these imports to your form component
import { ColorSelector } from '@homeforpup/shared-components';
import { useDogColors } from '@homeforpup/shared-hooks';
```

### 2. Use the Hook in Your Component

```tsx
// Inside your component
const { colors, loading, error } = useDogColors();
```

### 3. Replace the Input with ColorSelector

```tsx
// Replace the old Input with ColorSelector
<Form.Item
  label="Color"
  name="color"
  rules={[{ required: true, message: 'Please select color' }]}
>
  <ColorSelector
    colors={colors}
    loading={loading}
    error={error || undefined}
    showColorSwatches={true}
    placeholder="Select color"
  />
</Form.Item>
```

## Example: Updating DogForm Component

### Before (Current Implementation)

```tsx
// src/components/dogs/DogForm.tsx or apps/dog-parent-app/src/components/dogs/DogForm.tsx
import { Form, Input, Select, DatePicker, InputNumber, Row, Col } from 'antd';

const DogForm: React.FC<DogFormProps> = ({ dog, onSave, onCancel, loading }) => {
  // ... existing code ...

  return (
    <Form form={form} onFinish={handleSubmit}>
      {/* ... other fields ... */}
      
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Color"
            name="color"
            rules={[{ required: true, message: 'Please enter color' }]}
          >
            <Input placeholder="e.g., Golden, Black, Brown" />
          </Form.Item>
        </Col>
        {/* ... other fields ... */}
      </Row>
      
      {/* ... rest of form ... */}
    </Form>
  );
};
```

### After (With ColorSelector)

```tsx
// src/components/dogs/DogForm.tsx or apps/dog-parent-app/src/components/dogs/DogForm.tsx
import { Form, Input, Select, DatePicker, InputNumber, Row, Col } from 'antd';
import { ColorSelector } from '@homeforpup/shared-components';
import { useDogColors } from '@homeforpup/shared-hooks';

const DogForm: React.FC<DogFormProps> = ({ dog, onSave, onCancel, loading }) => {
  // Add the colors hook
  const { colors, loading: colorsLoading, error: colorsError } = useDogColors();

  // ... existing code ...

  return (
    <Form form={form} onFinish={handleSubmit}>
      {/* ... other fields ... */}
      
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Color"
            name="color"
            rules={[{ required: true, message: 'Please select color' }]}
          >
            <ColorSelector
              colors={colors}
              loading={colorsLoading}
              error={colorsError || undefined}
              showColorSwatches={true}
              placeholder="Select color"
            />
          </Form.Item>
        </Col>
        {/* ... other fields ... */}
      </Row>
      
      {/* ... rest of form ... */}
    </Form>
  );
};
```

## Example: Updating AddDogForm Component

### Before

```tsx
// src/components/forms/AddDogForm.tsx
<Row gutter={16}>
  <Col span={12}>
    <Form.Item
      name="color"
      label="Color/Markings"
      rules={[
        { required: true, message: 'Please enter color/markings' },
        { min: 2, message: 'Color must be at least 2 characters' }
      ]}
    >
      <Input 
        placeholder="e.g., Golden, Black with white markings" 
        maxLength={100}
      />
    </Form.Item>
  </Col>
  {/* ... */}
</Row>
```

### After

```tsx
// src/components/forms/AddDogForm.tsx
import { ColorSelector } from '@homeforpup/shared-components';
import { useDogColors } from '@homeforpup/shared-hooks';

const AddDogForm: React.FC<AddDogFormProps> = ({ visible, onClose, dog, onSuccess }) => {
  const { colors, loading: colorsLoading } = useDogColors();
  
  // ... existing code ...

  return (
    <Modal>
      <Form>
        {/* ... other fields ... */}
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="color"
              label="Color/Markings"
              rules={[
                { required: true, message: 'Please select color/markings' }
              ]}
            >
              <ColorSelector
                colors={colors}
                loading={colorsLoading}
                showColorSwatches={true}
                showDescription={true}
                placeholder="Select color or markings"
              />
            </Form.Item>
          </Col>
          {/* ... */}
        </Row>
      </Form>
    </Modal>
  );
};
```

## Advanced Example: Multiple Colors with Filters

If you want to allow users to select a primary color and secondary colors/markings:

```tsx
import { ColorSelector } from '@homeforpup/shared-components';
import { useDogColors } from '@homeforpup/shared-hooks';
import { Form, Row, Col } from 'antd';

function DogColorForm() {
  const { colors, loading } = useDogColors();

  return (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="primaryColor"
            label="Primary Color"
            rules={[{ required: true, message: 'Please select primary color' }]}
          >
            <ColorSelector
              colors={colors}
              loading={loading}
              showColorSwatches={true}
              filterByCategory="solid"
              placeholder="Select primary solid color"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} md={12}>
          <Form.Item
            name="markings"
            label="Markings/Patterns (Optional)"
            help="Select any patterns or additional markings"
          >
            <ColorSelector
              colors={colors}
              loading={loading}
              multiple={true}
              showColorSwatches={true}
              showDescription={true}
              filterByCategory="pattern"
              placeholder="Select markings or patterns"
              maxTagCount="responsive"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item
            name="allColors"
            label="All Colors (Optional)"
            help="Select all applicable colors for multi-color dogs"
          >
            <ColorSelector
              colors={colors}
              loading={loading}
              multiple={true}
              showColorSwatches={true}
              placeholder="Select all applicable colors"
              maxTagCount={5}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
```

## Files to Update

### Dog Parent App
1. `/apps/dog-parent-app/src/components/dogs/DogForm.tsx` - Line 204-209
2. `/apps/dog-parent-app/src/components/forms/AddDogForm.tsx` - Line 260-273

### Breeder App
Similar files in the breeder app that use color input fields

### Root App
1. `/src/components/dogs/DogForm.tsx` - Line 204-209
2. `/src/components/forms/AddDogForm.tsx` - Line 260-273

## Testing the Implementation

### 1. Test the API Endpoint

```bash
# In dog-parent-app (typically port 3001)
curl http://localhost:3001/api/dog-colors

# In breeder-app (typically port 3002)
curl http://localhost:3002/api/dog-colors
```

### 2. Test the Component

1. Navigate to the dog form in your app
2. Click on the color field
3. You should see:
   - A searchable dropdown with color options
   - Color swatches for solid colors
   - Category tags (solid, pattern, multi-color)
   - Descriptions for patterns

### 3. Test Features

- **Search**: Type "black" to filter black colors
- **Selection**: Click on a color to select it
- **Multiple**: If enabled, select multiple colors
- **Clear**: Click the X to clear selection
- **Categories**: Colors should be grouped by type

## Migration Checklist

- [ ] Build all shared packages
  ```bash
  cd packages/shared-types && npm run build
  cd ../shared-hooks && npm run build
  cd ../shared-components && npm run build
  ```

- [ ] Update imports in dog forms
- [ ] Add `useDogColors` hook to components
- [ ] Replace `Input` with `ColorSelector`
- [ ] Test in dog-parent-app
- [ ] Test in breeder-app
- [ ] Update any color validation rules
- [ ] Test form submission with new color values
- [ ] Verify data is saved correctly to database

## Benefits of This Implementation

✅ **Consistency**: Same color options across all apps  
✅ **User Experience**: Better than free-text input  
✅ **Data Quality**: Standardized color values  
✅ **Visual Feedback**: Color swatches help users  
✅ **Searchable**: Easy to find specific colors  
✅ **Extensible**: Easy to add more colors  
✅ **Type-Safe**: Full TypeScript support  

## Rollback Plan

If you need to rollback to the old implementation:

1. Remove the ColorSelector import
2. Remove the useDogColors hook
3. Restore the original Input component
4. The API endpoints won't interfere with existing functionality

## Support

For issues or questions:
1. Check the main documentation: `/packages/shared-components/COLOR_SELECTOR_USAGE.md`
2. Review the component source: `/packages/shared-components/src/forms/ColorSelector.tsx`
3. Check the API implementation: `/apps/*/src/app/api/dog-colors/route.ts`

