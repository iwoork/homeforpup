// Types
export * from './types';

// Matching
export * from './matching';

// Breeds types (client-safe)
export * from './breeds-types';

// Server-only API clients (DogsApiClient, BreedsApiClient, PuppiesApiClient)
// are in ./api, ./api-puppies, ./breeds-api but NOT re-exported here
// to avoid pulling postgres/drizzle into client bundles.
// Import directly from '@homeforpup/database' in server-side code instead.

// Hooks
export { default as useDogColors } from './hooks/useDogColors';
export * from './hooks/breeds';
export * from './hooks';

// Components
export { default as AddEditDogForm } from './components/AddEditDogForm';
export type { AddEditDogFormProps } from './components/AddEditDogForm';
export { default as PuppyCard } from './components/PuppyCard';
export type { PuppyCardProps, PuppyWithKennel } from './components/PuppyCard';
export { default as PuppyList } from './components/PuppyList';
export type { PuppyListProps } from './components/PuppyList';

// Form Components
export { default as BreedSelector } from './components/forms/BreedSelector';
export type { BreedSelectorProps, Breed } from './components/forms/BreedSelector';
export { default as ColorSelector } from './components/forms/ColorSelector';
export type { ColorSelectorProps } from './components/forms/ColorSelector';

// Puppy types (server-safe – types only, no runtime import)
export type { PuppyFilters, PuppiesResponse } from './api-puppies';

// Re-export commonly used types from shared-types
export type { Dog, DogColor, DogColorCategory } from '@homeforpup/shared-types';