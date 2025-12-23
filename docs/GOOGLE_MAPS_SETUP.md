# Google Maps API Setup Guide

## Overview
This project now uses Google Places Autocomplete for location input across all profile editing screens in both web and mobile applications.

## Features Implemented
- ✅ Location autocomplete in mobile app (React Native)
- ✅ Location autocomplete in web apps (Next.js)  
- ✅ Auto-fill address fields in kennel forms
- ✅ City and state formatting for cleaner UX
- ✅ Coordinates extraction for mapping features

## Getting Started

### 1. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API** (required)
   - **Geocoding API** (recommended for address details)
   - **Maps JavaScript API** (if you plan to show maps)
4. Go to **Credentials** and create an API key
5. (Recommended) Restrict the API key:
   - For web: Add your domain(s) to HTTP referrer restrictions
   - For mobile: Add your iOS bundle ID and Android package name

### 2. Configure Environment Variables

#### For Mobile App (React Native)
Create or update `.env` file in `apps/mobile-app/`:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

#### For Web Apps (Next.js)
Create or update `.env.local` file in both `apps/dog-parent-app/` and `apps/breeder-app/`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Important:** The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser.

### 3. Restart Development Servers

After adding the environment variables, restart your development servers:

```bash
# For mobile app
cd apps/mobile-app
npm start -- --reset-cache

# For web apps
npm run dev
```

## Usage

### Mobile App - LocationAutocomplete Component

```tsx
import { LocationAutocomplete } from '../../components';

<LocationAutocomplete
  value={formData.location}
  onLocationSelect={(address, details) => {
    setFormData({ ...formData, location: address });
    console.log('Selected:', address);
    console.log('Details:', details); // { lat, lng, city, state, country, fullAddress }
  }}
  placeholder="City, State"
  error={!!errors.location}
  editable={true}
/>
```

### Web App - LocationAutocomplete Component

```tsx
import { LocationAutocomplete } from '@/components';

<Form.Item
  label="Location"
  name="location"
>
  <LocationAutocomplete
    placeholder="City, State or general area"
    prefix={<EnvironmentOutlined />}
  />
</Form.Item>
```

### Auto-filling Address Fields

For forms with multiple address fields (like kennel forms), use the onChange callback:

```tsx
<LocationAutocomplete
  placeholder="Search for your address"
  onChange={(value, details) => {
    if (details) {
      form.setFieldValue('street', details.fullAddress?.split(',')[0]);
      form.setFieldValue('city', details.city);
      form.setFieldValue('state', details.state);
      form.setFieldValue('country', details.country);
      form.setFieldValue('latitude', details.lat);
      form.setFieldValue('longitude', details.lng);
    }
  }}
/>
```

## Updated Files

### Mobile App
- ✅ `/apps/mobile-app/src/components/LocationAutocomplete.tsx` (new)
- ✅ `/apps/mobile-app/src/screens/forms/EditProfileScreen.tsx`

### Web Apps
- ✅ `/src/components/forms/LocationAutocomplete.tsx` (new)
- ✅ `/src/features/users/pages/[id]/edit/page.tsx`
- ✅ `/src/features/breeders/pages/[id]/edit/page.tsx`
- ✅ `/src/app/breeders/[id]/edit/page.tsx`
- ✅ `/src/components/dogs/KennelForm.tsx`
- ✅ `/apps/breeder-app/src/app/kennels/new/page.tsx`

## API Response Details

The `details` object returned by the autocomplete contains:

```typescript
{
  lat: number;           // Latitude
  lng: number;           // Longitude
  city: string;          // City name
  state: string;         // State/Province abbreviation
  country: string;       // Country code (e.g., 'US', 'CA')
  fullAddress: string;   // Complete formatted address
}
```

## Fallback Behavior

If the Google Maps API key is not configured:
- **Mobile App**: The component will show a warning in the console and use a regular TextInput as fallback
- **Web Apps**: The component will automatically fallback to a regular Ant Design Input component

## Troubleshooting

### "Places API not enabled" Error
- Ensure you've enabled the Places API in Google Cloud Console
- Wait a few minutes for the changes to propagate

### "API key not valid" Error  
- Check that your API key is correctly set in environment variables
- Verify the API key restrictions match your domain/app

### Suggestions not appearing
- Check browser console for CORS or API errors
- Verify the API key has proper referrer restrictions for web apps
- For mobile: ensure the API key is not restricted to HTTP referrers

### Mobile app not loading suggestions
- Clear the React Native cache: `npm start -- --reset-cache`
- Check that the .env file is in the correct location
- Verify you're using the correct environment variable name (no NEXT_PUBLIC prefix)

### "VirtualizedLists should never be nested" Warning (Mobile)
This is a **known warning** when using GooglePlacesAutocomplete inside a ScrollView. This warning:
- **Does not break functionality** - the component works correctly
- Appears because the autocomplete uses FlatList internally for suggestions
- Is common in production apps and can be safely ignored
- Doesn't impact user experience or performance in this use case

If you want to suppress this warning completely, you can use LogBox in your app entry point:
```javascript
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
```

## Cost Considerations

Google Places Autocomplete pricing (as of 2024):
- Autocomplete requests: $2.83 per 1,000 requests (first tier)
- Place Details: $17 per 1,000 requests

**Tip:** The implementation includes a 300ms debounce to reduce the number of API calls while typing.

## Security Best Practices

1. **Never commit API keys** to version control
2. Add `.env` and `.env.local` to `.gitignore` (already done)
3. Use API key restrictions:
   - HTTP referrer restrictions for web apps
   - Application restrictions for mobile apps
4. Set up billing alerts in Google Cloud Console
5. Consider using a backend proxy for API calls in production

## Future Enhancements

Potential improvements to consider:
- [ ] Add support for custom location types (neighborhoods, landmarks, etc.)
- [ ] Implement caching for frequently searched locations
- [ ] Add map preview when selecting a location
- [ ] Support for multiple languages
- [ ] Custom styling options for suggestions dropdown

## Support

For issues or questions about the location autocomplete feature, check:
1. This documentation
2. Google Maps Platform documentation: https://developers.google.com/maps/documentation/javascript/places-autocomplete
3. React Native Google Places Autocomplete: https://github.com/FaridSafi/react-native-google-places-autocomplete
4. use-places-autocomplete: https://github.com/wellyshen/use-places-autocomplete

