// Component exports organized by type

// Form components
export { default as AddDogForm } from './dogs/DogFormWrapper'; // Using shared DogForm component
export { default as UserTypeModal } from './forms/UserTypeModal';
export { default as ProfilePhotoUpload } from './forms/Upload/ProfilePhotoUpload';
export { default as CoverPhotoUpload } from './forms/Upload/CoverPhotoUpload';
export { default as PhotoUpload } from './forms/Upload/PhotoUpload';
export { default as ImageCropperModal } from './forms/Upload/ImageCropperModal';
export { default as DocumentUpload } from './forms/Upload/DocumentUpload';
export { default as BreedSelector } from './forms/BreedSelector';
export { default as LocationAutocomplete } from './forms/LocationAutocomplete';

// Core components
export { Providers } from './Providers';
export { default as GoogleAnalytics } from './GoogleAnalytics';

// Note: Feature-specific components are now exported from their respective features
// Import them like: import { ProfileHeader } from '@/features/users';
//                   import { ComposeMessage } from '@/features/messaging';
