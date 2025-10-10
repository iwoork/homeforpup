# ColorSelector Quick Start Guide

## 🚀 1-Minute Setup

### Step 1: Import
```tsx
import { ColorSelector } from '@homeforpup/shared-components';
import { useDogColors } from '@homeforpup/shared-hooks';
```

### Step 2: Use Hook
```tsx
const { colors, loading } = useDogColors();
```

### Step 3: Add Component
```tsx
<Form.Item name="color" label="Color">
  <ColorSelector 
    colors={colors} 
    loading={loading}
    showColorSwatches={true}
  />
</Form.Item>
```

## 📦 What's Included

- ✅ **45+ Dog Colors** (solid, patterns, multi-color)
- ✅ **API Endpoints** in both apps (`/api/dog-colors`)
- ✅ **React Hook** (`useDogColors`)
- ✅ **UI Component** (`ColorSelector`)
- ✅ **TypeScript Types** (fully typed)

## 🎨 Available Colors

### Solid (17)
Black, White, Brown, Chocolate, Liver, Red, Golden, Cream, Tan, Fawn, Apricot, Silver, Gray, Blue, Blue Gray, Isabella, Champagne

### Patterns (11)
Brindle, Merle, Blue Merle, Red Merle, Sable, Harlequin, Ticked, Roan, Piebald, Parti-Color, Saddled, Masked, Tuxedo

### Multi-Color (17)
Black and White, Black and Tan, Brown and White, Tricolor, etc.

## 🔧 Common Use Cases

### Basic Selection
```tsx
const { colors, loading } = useDogColors();

<ColorSelector 
  colors={colors} 
  loading={loading}
/>
```

### Multiple Selection
```tsx
<ColorSelector 
  colors={colors}
  multiple={true}
  maxTagCount={3}
/>
```

### Filter by Category
```tsx
// Only solid colors
const { colors } = useDogColors({ category: 'solid' });

// Or filter in component
<ColorSelector 
  colors={colors}
  filterByCategory="solid"
/>
```

### With Search
```tsx
const [search, setSearch] = useState('');
const { colors } = useDogColors({ search });

<ColorSelector 
  colors={colors}
  onSearch={setSearch}
/>
```

## 📡 API Usage

### Endpoints
- Dog Parent App: `http://localhost:3001/api/dog-colors`
- Breeder App: `http://localhost:3002/api/dog-colors`

### Query Parameters
```bash
# All colors
curl /api/dog-colors

# Filter by category
curl /api/dog-colors?category=solid

# Search
curl /api/dog-colors?search=black

# Limit results
curl /api/dog-colors?limit=10
```

### Response
```json
{
  "colors": [
    {
      "id": "black",
      "name": "Black",
      "hexCode": "#000000",
      "category": "solid"
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

## 🧪 Testing

### Test API
```bash
# Test dog-parent-app (port 3001)
node scripts/test-color-api.js 3001

# Test breeder-app (port 3002)  
node scripts/test-color-api.js 3002
```

### Build Packages
```bash
cd packages/shared-types && npm run build
cd ../shared-hooks && npm run build
cd ../shared-components && npm run build
```

## 📝 Props Reference

### ColorSelector

| Prop | Type | Default |
|------|------|---------|
| `colors` | `DogColor[]` | `[]` |
| `loading` | `boolean` | `false` |
| `value` | `string \| string[]` | - |
| `onChange` | `function` | - |
| `multiple` | `boolean` | `false` |
| `showColorSwatches` | `boolean` | `true` |
| `showDescription` | `boolean` | `false` |
| `filterByCategory` | `'solid' \| 'pattern' \| 'multi-color'` | - |
| `placeholder` | `string` | `'Select color'` |

### useDogColors Hook

| Option | Type | Default |
|--------|------|---------|
| `category` | `'solid' \| 'pattern' \| 'multi-color'` | - |
| `search` | `string` | - |
| `limit` | `number` | - |
| `enabled` | `boolean` | `true` |
| `apiBaseUrl` | `string` | `'/api'` |

**Returns:**
- `colors`: Array of dog colors
- `loading`: Loading state
- `error`: Error message (if any)
- `refetch`: Function to reload colors
- `categories`: Count of colors by category

## 📍 Files Created

```
packages/shared-types/src/color.ts
packages/shared-components/src/forms/ColorSelector.tsx
packages/shared-hooks/src/api/useDogColors.ts
apps/dog-parent-app/src/app/api/dog-colors/route.ts
apps/breeder-app/src/app/api/dog-colors/route.ts
```

## 📚 Documentation

- **Full Guide**: `packages/shared-components/COLOR_SELECTOR_USAGE.md`
- **Examples**: `COLOR_SELECTOR_IMPLEMENTATION_EXAMPLE.md`
- **Summary**: `DOG_COLOR_SELECTOR_README.md`

## 🎯 Replace Text Input

**Before:**
```tsx
<Input placeholder="Enter color" />
```

**After:**
```tsx
import { ColorSelector } from '@homeforpup/shared-components';
import { useDogColors } from '@homeforpup/shared-hooks';

const { colors, loading } = useDogColors();

<ColorSelector colors={colors} loading={loading} />
```

## ✨ Features

- 🎨 Visual color swatches
- 🔍 Searchable dropdown
- 🏷️ Category tags
- 📱 Responsive design
- ♿ Accessible
- 🚄 Cached API responses
- 📘 TypeScript support
- 🔄 Multi-select option

## 🆘 Troubleshooting

**Colors not loading?**
1. Check API: `curl http://localhost:3001/api/dog-colors`
2. Check console for errors
3. Verify packages are built

**Build errors?**
```bash
cd packages/shared-types && npm run build
cd ../shared-hooks && npm run build
cd ../shared-components && npm run build
```

**Type errors?**
- Restart TypeScript server
- Check imports are correct
- Ensure packages are built

## 🎉 You're Done!

The ColorSelector is ready to use in both dog-parent-app and breeder-app. Enjoy better color selection! 🐕🎨

