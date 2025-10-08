# Message API Migration Guide

This guide explains how to migrate from the old Ant Design message API to the new centralized message system.

## Problem

In Ant Design v5, the `message` API changed. Direct imports like `import { message } from 'antd'` no longer work in React components. This caused errors like `message.success is not a function`.

## Solution

We've created two centralized solutions:

### 1. `useMessage` Hook (Recommended for React Components)

Use this hook inside React components:

```tsx
import { useMessage } from '@/hooks';

const MyComponent = () => {
  const message = useMessage();
  
  const handleClick = () => {
    message.success('Operation completed!');
    message.error('Something went wrong!');
    message.warning('Please check your input');
    message.info('Here is some information');
  };
  
  return <button onClick={handleClick}>Click me</button>;
};
```

### 2. Global Message Utility (For Non-React Contexts)

Use this for utility functions, API routes, or other non-React contexts:

```tsx
import { message } from '@/lib';

// In a utility function
export const saveData = async () => {
  try {
    await api.save();
    message.success('Data saved successfully!');
  } catch (error) {
    message.error('Failed to save data');
  }
};
```

## Migration Steps

### Step 1: Update Imports

**Before:**
```tsx
import { message } from 'antd';
```

**After (for React components):**
```tsx
import { useMessage } from '@/hooks';

const MyComponent = () => {
  const message = useMessage();
  // ... rest of component
};
```

**After (for non-React contexts):**
```tsx
import { message } from '@/lib';
```

### Step 2: Update Usage

The API remains the same, just the import changes:

```tsx
// All of these work the same way
message.success('Success message');
message.error('Error message');
message.warning('Warning message');
message.info('Info message');
message.loading('Loading message');
```

### Step 3: Remove Old App.useApp() Usage

**Before:**
```tsx
const { message } = App.useApp();
```

**After:**
```tsx
const message = useMessage();
```

## Benefits

1. **Consistent API**: Same message API across the entire app
2. **Type Safety**: Full TypeScript support
3. **Centralized**: Easy to modify message behavior globally
4. **Performance**: Optimized for React components
5. **Flexibility**: Two options for different use cases

## Files to Update

Search for these patterns and update them:

```bash
# Find files using old message import
grep -r "import.*message.*from.*antd" src/

# Find files using App.useApp for message
grep -r "App.useApp" src/

# Find direct message usage
grep -r "message\." src/
```

## Examples

### Profile Edit Page (Before/After)

**Before:**
```tsx
import { App, message } from 'antd';

const EditProfilePage = () => {
  const { message } = App.useApp();
  
  const handleSubmit = () => {
    message.success('Profile updated!');
  };
};
```

**After:**
```tsx
import { useMessage } from '@/hooks';

const EditProfilePage = () => {
  const message = useMessage();
  
  const handleSubmit = () => {
    message.success('Profile updated!');
  };
};
```

## Testing

After migration, test that:
1. Success messages appear correctly
2. Error messages show properly
3. Warning messages display as expected
4. Info messages work as intended
5. No console errors about `message.success is not a function`
