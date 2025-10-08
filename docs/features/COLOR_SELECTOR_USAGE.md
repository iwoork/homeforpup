# ColorSelector Component Usage Guide

The `ColorSelector` is a generic, reusable component for selecting dog colors in both the adopter-app and breeder-app. It provides a rich selection interface with color swatches, categories, and descriptions.

## Features

- 🎨 **45+ Predefined Dog Colors**: Includes solid colors, patterns, and multi-color combinations
- 🔍 **Search Functionality**: Search colors by name, description, or category
- 🎯 **Category Filtering**: Filter by solid, pattern, or multi-color categories
- 🌈 **Color Swatches**: Visual hex color swatches for solid colors
- 📱 **Responsive Design**: Works seamlessly on all device sizes
- 🔄 **Multi-select Support**: Select single or multiple colors
- 🚀 **API-Driven**: Fetches colors from API endpoint with caching

## Installation

The component is already installed as part of the `@homeforpup/shared-components` package.

## API Endpoints

Both apps have the `/api/dog-colors` endpoint available:

### Adopter App
```
GET /api/dog-colors
```

### Breeder App
```
GET /api/dog-colors
```

### Query Parameters
- `category`: Filter by category (`solid`, `pattern`, `multi-color`)
- `search`: Search term for filtering colors
- `limit`: Maximum number of colors to return

### Response Format
```json
{
  "colors": [
    {
      "id": "black",
      "name": "Black",
      "hexCode": "#000000",
      "category": "solid",
      "description": "..."
    }
  ],
  "total": 45,
  "categories": {
    "solid": 17,
    "pattern": 11,
    "multi-color": 17
  }
}
```

## Usage Examples

### Basic Usage with Hook

```tsx
import { ColorSelector } from '@homeforpup/shared-components';
import { useDogColors } from '@homeforpup/shared-hooks';
import { Form } from 'antd';

function DogForm() {
  const { colors, loading, error } = useDogColors();
  
  return (
    <Form>
      <Form.Item
        name="color"
        label="Color"
        rules={[{ required: true, message: 'Please select a color' }]}
      >
        <ColorSelector
          colors={colors}
          loading={loading}
          error={error || undefined}
          placeholder="Select dog color"
          showColorSwatches={true}
          showDescription={true}
        />
      </Form.Item>
    </Form>
  );
}
```

### Single Selection

```tsx
import { ColorSelector } from '@homeforpup/shared-components';
import { useDogColors } from '@homeforpup/shared-hooks';

function SingleColorPicker() {
  const [selectedColor, setSelectedColor] = useState<string>();
  const { colors, loading } = useDogColors();

  return (
    <ColorSelector
      value={selectedColor}
      onChange={setSelectedColor}
      colors={colors}
      loading={loading}
      placeholder="Select a color"
    />
  );
}
```

### Multiple Selection

```tsx
import { ColorSelector } from '@homeforpup/shared-components';
import { useDogColors } from '@homeforpup/shared-hooks';

function MultiColorPicker() {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const { colors, loading } = useDogColors();

  return (
    <ColorSelector
      value={selectedColors}
      onChange={setSelectedColors}
      colors={colors}
      loading={loading}
      multiple={true}
      maxTagCount="responsive"
      placeholder="Select one or more colors"
    />
  );
}
```

### Filtered by Category

```tsx
import { ColorSelector } from '@homeforpup/shared-components';
import { useDogColors } from '@homeforpup/shared-hooks';

function SolidColorsOnly() {
  const { colors, loading } = useDogColors({ category: 'solid' });

  return (
    <ColorSelector
      colors={colors}
      loading={loading}
      filterByCategory="solid"
      placeholder="Select a solid color"
    />
  );
}
```

### With Search

```tsx
import { ColorSelector } from '@homeforpup/shared-components';
import { useDogColors } from '@homeforpup/shared-hooks';

function SearchableColorPicker() {
  const [searchTerm, setSearchTerm] = useState('');
  const { colors, loading } = useDogColors({ search: searchTerm });

  return (
    <ColorSelector
      colors={colors}
      loading={loading}
      showSearch={true}
      onSearch={setSearchTerm}
      placeholder="Search for a color"
    />
  );
}
```

### Advanced Example with All Features

```tsx
import { ColorSelector } from '@homeforpup/shared-components';
import { useDogColors } from '@homeforpup/shared-hooks';
import { Form, Button, Space } from 'antd';

function AdvancedColorForm() {
  const [form] = Form.useForm();
  const { colors, loading, error, refetch } = useDogColors();

  const handleSubmit = (values: any) => {
    console.log('Selected color:', values.color);
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        name="color"
        label="Primary Color"
        rules={[
          { required: true, message: 'Please select a color' },
        ]}
        help="Select the primary color of your dog"
      >
        <ColorSelector
          colors={colors}
          loading={loading}
          error={error || undefined}
          placeholder="Select primary color"
          showColorSwatches={true}
          showDescription={true}
          size="large"
          allowClear={true}
          onSelect={(value, option) => {
            console.log('Selected:', value, option);
          }}
          onClear={() => {
            console.log('Cleared selection');
          }}
        />
      </Form.Item>

      <Form.Item
        name="secondaryColors"
        label="Secondary Colors (Optional)"
        help="Select any additional colors or markings"
      >
        <ColorSelector
          colors={colors}
          loading={loading}
          multiple={true}
          maxTagCount="responsive"
          placeholder="Select secondary colors"
          showColorSwatches={true}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
          <Button onClick={() => refetch()}>
            Reload Colors
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
```

## Component Props

### ColorSelectorProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| string[]` | - | Selected color value(s) |
| `onChange` | `(value: string \| string[] \| undefined) => void` | - | Callback when selection changes |
| `placeholder` | `string` | `'Select color'` | Placeholder text |
| `allowClear` | `boolean` | `true` | Show clear button |
| `showSearch` | `boolean` | `true` | Enable search functionality |
| `multiple` | `boolean` | `false` | Allow multiple selection |
| `disabled` | `boolean` | `false` | Disable the selector |
| `loading` | `boolean` | `false` | Show loading state |
| `colors` | `DogColor[]` | `[]` | Array of color options |
| `error` | `string` | - | Error message to display |
| `size` | `'small' \| 'middle' \| 'large'` | `'middle'` | Size of the selector |
| `showColorSwatches` | `boolean` | `true` | Show color hex swatches |
| `showDescription` | `boolean` | `false` | Show color descriptions |
| `filterByCategory` | `DogColorCategory` | - | Filter colors by category |
| `excludeColors` | `string[]` | `[]` | Color IDs to exclude |
| `includeOnlyColors` | `string[]` | - | Only include these color IDs |
| `maxTagCount` | `number \| 'responsive'` | - | Max tags to show in multiple mode |
| `maxCount` | `number` | - | Maximum number of colors to display |

## Hook: useDogColors

### Options

```typescript
interface UseDogColorsOptions {
  category?: 'solid' | 'pattern' | 'multi-color';
  search?: string;
  limit?: number;
  enabled?: boolean;
  apiBaseUrl?: string;
}
```

### Return Value

```typescript
interface UseDogColorsResult {
  colors: DogColor[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  categories: {
    solid: number;
    pattern: number;
    'multi-color': number;
  } | null;
}
```

### Example

```tsx
const { colors, loading, error, refetch, categories } = useDogColors({
  category: 'solid',
  search: '',
  limit: 20,
  enabled: true,
  apiBaseUrl: '/api'
});
```

## Available Colors

### Solid Colors (17)
Black, White, Brown, Chocolate, Liver, Red, Golden, Cream, Tan, Fawn, Apricot, Silver, Gray, Blue, Blue Gray, Isabella, Champagne

### Patterns (11)
Brindle, Merle, Blue Merle, Red Merle, Sable, Harlequin, Ticked, Roan, Piebald, Parti-Color, Saddled, Masked, Tuxedo

### Multi-Color (17)
Black and White, Black and Tan, Brown and White, Tricolor, Black Tan and White, Red and White, Blue and Tan, Liver and White, Lemon and White, Orange and White, and more

## Integration with Existing Forms

### Replacing Input with ColorSelector in DogForm

**Before:**
```tsx
<Form.Item
  label="Color"
  name="color"
  rules={[{ required: true, message: 'Please enter color' }]}
>
  <Input placeholder="e.g., Golden, Black, Brown" />
</Form.Item>
```

**After:**
```tsx
import { ColorSelector } from '@homeforpup/shared-components';
import { useDogColors } from '@homeforpup/shared-hooks';

// In component:
const { colors, loading } = useDogColors();

// In JSX:
<Form.Item
  label="Color"
  name="color"
  rules={[{ required: true, message: 'Please select color' }]}
>
  <ColorSelector
    colors={colors}
    loading={loading}
    showColorSwatches={true}
    placeholder="Select color"
  />
</Form.Item>
```

## TypeScript Types

All types are exported from `@homeforpup/shared-types`:

```typescript
import type { 
  DogColor, 
  DogColorCategory,
  DOG_COLORS 
} from '@homeforpup/shared-types';

import type { 
  ColorSelectorProps 
} from '@homeforpup/shared-components';
```

## Caching

The API endpoint includes cache headers for optimal performance:
- `s-maxage=3600`: Cache for 1 hour
- `stale-while-revalidate=86400`: Serve stale content for up to 24 hours while revalidating

## Testing

### Test the API Endpoint

```bash
# Get all colors
curl http://localhost:3000/api/dog-colors

# Filter by category
curl http://localhost:3000/api/dog-colors?category=solid

# Search colors
curl http://localhost:3000/api/dog-colors?search=black

# Limit results
curl http://localhost:3000/api/dog-colors?limit=10
```

## Troubleshooting

### Colors not loading
1. Check that the API endpoint is accessible
2. Verify the `useDogColors` hook is being called correctly
3. Check browser console for errors

### Build errors
1. Ensure all shared packages are built:
   ```bash
   cd packages/shared-types && npm run build
   cd ../shared-hooks && npm run build
   cd ../shared-components && npm run build
   ```

### Type errors
1. Make sure you're importing types from `@homeforpup/shared-types`
2. Check that TypeScript can resolve the shared packages

## License

Part of the HomeForPup monorepo project.

