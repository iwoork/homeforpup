// API and Types
export * from './api';
export * from './types';

// Breeds functionality
export * from './breeds-api';
export * from './breeds-types';

// Hooks
export { default as useDogColors } from './hooks/useDogColors';
export * from './hooks/breeds';
export * from './hooks';

// Components
export { default as AddEditDogForm } from './components/AddEditDogForm';
export type { AddEditDogFormProps } from './components/AddEditDogForm';

// Form Components
export { default as BreedSelector } from './components/forms/BreedSelector';
export type { BreedSelectorProps, Breed } from './components/forms/BreedSelector';
export { default as ColorSelector } from './components/forms/ColorSelector';
export type { ColorSelectorProps } from './components/forms/ColorSelector';

// Re-export commonly used types from shared-types
export type { Dog, DogColor, DogColorCategory } from '@homeforpup/shared-types';