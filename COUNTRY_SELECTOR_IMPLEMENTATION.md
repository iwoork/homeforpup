# Country Selector Implementation for Phone Number Prefix

## Overview
Added comprehensive country selector dropdowns to both mobile and breeder apps to provide proper phone number formatting with international dial codes. This ensures accurate E.164 format for AWS Cognito phone number validation.

## Features Implemented

### 1. Mobile App Country Selector (`apps/mobile-app/src/components/CountrySelector.tsx`)

**Key Features:**
- **Comprehensive Country List**: 180+ countries with flags, names, and dial codes
- **Search Functionality**: Real-time search by country name, code, or dial code
- **Modal Interface**: Full-screen modal with search input and scrollable list
- **Visual Design**: Country flags, formatted display with dial codes
- **Touch-Friendly**: Optimized for mobile interaction
- **Error Handling**: Proper validation and error states

**UI Components:**
- Country selector button with flag and country info
- Searchable modal with filtered results
- Keyboard-friendly input handling
- Responsive design for various screen sizes

### 2. Breeder App Country Selector (`apps/breeder-app/src/components/CountrySelector.tsx`)

**Key Features:**
- **Ant Design Integration**: Uses Select component for consistent styling
- **Search Functionality**: Built-in search with filter options
- **Compact Display**: Shows flag, country name, and dial code
- **Form Integration**: Seamless integration with Ant Design forms
- **TypeScript Support**: Full type safety and IntelliSense

### 3. Updated Phone Input Components

#### Mobile App (`EditProfileScreen.tsx`)
```typescript
{/* Phone with Country Selector */}
<View style={styles.phoneContainer}>
  <View style={styles.countrySelectorContainer}>
    <CountrySelector
      value={selectedCountry?.dialCode}
      onCountrySelect={(country) => setSelectedCountry(country)}
      placeholder="Country"
      error={!!errors.phone}
      editable={true}
    />
  </View>
  <View style={styles.phoneInputContainer}>
    <TextInput
      value={formData.phone}
      onChangeText={text => setFormData({ ...formData, phone: text })}
      placeholder="Phone number"
      keyboardType="phone-pad"
    />
  </View>
</View>
```

#### Breeder App (`profile/edit/page.tsx`)
```typescript
<Form.Item label="Phone Number">
  <Row gutter={8}>
    <Col flex="120px">
      <CountrySelector
        value={selectedCountry?.dialCode}
        onChange={(country) => setSelectedCountry(country)}
        placeholder="Country"
        style={{ width: '100%' }}
      />
    </Col>
    <Col flex="auto">
      <Form.Item name="phone" noStyle>
        <Input 
          prefix={<PhoneOutlined />}
          placeholder="Enter your phone number"
        />
      </Form.Item>
    </Col>
  </Row>
</Form.Item>
```

### 4. Enhanced Phone Formatting Logic

**Updated Formatting Function:**
```typescript
const formatPhoneForCognito = (phone: string, country?: Country | null): string | null => {
  if (!phone) return null;
  
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If we have a selected country, use its dial code
  if (country?.dialCode) {
    return country.dialCode + digitsOnly;
  }
  
  // Fallback logic for backward compatibility
  // ... existing fallback logic
};
```

**Key Improvements:**
- **Country-Aware Formatting**: Uses selected country's dial code
- **Backward Compatibility**: Falls back to existing logic if no country selected
- **Error Prevention**: Validates phone format before Cognito sync
- **International Support**: Handles all international dial codes

### 5. API Integration Updates

#### Mobile App
- Updated profile update to include selected country
- Enhanced Cognito sync with country-specific formatting
- Improved error handling and logging

#### Breeder App (`apps/breeder-app/src/app/api/profile/route.ts`)
- Added country field to ProfileUpdateRequest interface
- Updated phone formatting to use country data
- Enhanced API logging for debugging

## Country Data Structure

```typescript
interface Country {
  code: string;        // ISO country code (e.g., 'US', 'GB')
  name: string;        // Full country name (e.g., 'United States')
  dialCode: string;    // International dial code (e.g., '+1', '+44')
  flag: string;        // Unicode flag emoji (e.g., '🇺🇸', '🇬🇧')
}
```

## Supported Countries

The implementation includes **180+ countries** covering:
- **North America**: US, Canada, Mexico
- **Europe**: All EU countries, UK, Norway, Switzerland, etc.
- **Asia**: China, Japan, India, Singapore, Philippines, etc.
- **Oceania**: Australia, New Zealand, Fiji, etc.
- **Africa**: South Africa, Nigeria, Kenya, Egypt, etc.
- **South America**: Brazil, Argentina, Chile, Colombia, etc.

## Benefits

### User Experience
- ✅ **Intuitive Interface**: Clear country selection with flags
- ✅ **Search Functionality**: Quick country lookup
- ✅ **Visual Feedback**: Country flags and formatted display
- ✅ **Mobile Optimized**: Touch-friendly modal interface
- ✅ **Consistent Design**: Matches app design language

### Technical Benefits
- ✅ **Cognito Compatibility**: Proper E.164 format for AWS
- ✅ **International Support**: Global phone number handling
- ✅ **Error Prevention**: Eliminates phone format validation errors
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Reusable Components**: Can be used across the application

### Data Accuracy
- ✅ **Proper Formatting**: Country-specific dial codes
- ✅ **Validation**: Prevents invalid phone number formats
- ✅ **Database Sync**: Consistent data across all systems
- ✅ **Cognito Sync**: Reliable AWS authentication integration

## Usage Examples

### Mobile App
1. User taps country selector
2. Modal opens with searchable country list
3. User selects country (e.g., United Kingdom 🇬🇧 +44)
4. User enters phone number (e.g., 7700 900123)
5. System formats as +447700900123 for Cognito

### Breeder App
1. User selects country from dropdown (e.g., Germany 🇩🇪 +49)
2. User enters phone number in input field
3. Form submission includes both country and phone data
4. API formats phone number with German dial code
5. Cognito receives properly formatted E.164 number

## Files Modified

### Mobile App
- `apps/mobile-app/src/components/CountrySelector.tsx` (new)
- `apps/mobile-app/src/components/index.ts` (updated)
- `apps/mobile-app/src/screens/forms/EditProfileScreen.tsx` (updated)

### Breeder App
- `apps/breeder-app/src/components/CountrySelector.tsx` (new)
- `apps/breeder-app/src/app/profile/edit/page.tsx` (updated)
- `apps/breeder-app/src/app/api/profile/route.ts` (updated)

## Testing Scenarios

1. **Country Selection**: Verify all countries are selectable and searchable
2. **Phone Formatting**: Test various phone number formats with different countries
3. **Cognito Sync**: Ensure properly formatted numbers sync to AWS
4. **Error Handling**: Test invalid phone numbers and missing country selection
5. **Cross-Platform**: Verify consistent behavior on mobile and web
6. **International Numbers**: Test with various international formats

## Future Enhancements

- **Auto-Detection**: Detect country from user's location/IP
- **Recent Countries**: Remember recently selected countries
- **Favorites**: Allow users to mark favorite countries
- **Validation**: Real-time phone number validation
- **Format Display**: Show formatted phone number as user types
