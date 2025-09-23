// Component exports organized by type

// Layout components
export { default as Layout } from './layout/ServerLayout';
export { default as Header } from './layout/Header';
export { default as Footer } from './layout/Footer';

// Form components
export { default as AddDogForm } from './forms/AddDogForm';
export { default as UserTypeModal } from './forms/UserTypeModal';
export { default as ProfilePhotoUpload } from './forms/Upload/ProfilePhotoUpload';
export { default as CoverPhotoUpload } from './forms/Upload/CoverPhotoUpload';
export { default as PhotoUpload } from './forms/Upload/PhotoUpload';
export { default as ImageCropperModal } from './forms/Upload/ImageCropperModal';
export { default as DocumentUpload } from './forms/Upload/DocumentUpload';

// Core components
export { AuthProvider } from './AuthProvider';
export { Providers } from './Providers';
export { default as GoogleAnalytics } from './GoogleAnalytics';

// Note: Feature-specific components are now exported from their respective features
// Import them like: import { ProfileHeader } from '@/features/users';
//                   import { ComposeMessage } from '@/features/messaging';
