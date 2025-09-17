export interface Breeder {
  id: string;
  userId: string; // Cognito user ID
  name: string;
  email: string;
  phone: string;
  location: string;
  description: string;
  website?: string;
  profileImage?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Dog {
  id: string;
  breederId: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  birthDate: string;
  weight: number;
  color: string;
  photos: string[];
  healthTests: string[]; // URLs to health test documents
  pedigree?: string; // URL to pedigree document
  description: string;
  
  // Parent information
  sireId?: string; // Father's ID (reference to another dog)
  damId?: string;  // Mother's ID (reference to another dog)
  
  // Breeding status
  breedingStatus: 'available' | 'retired' | 'not_for_breeding';
  
  // Litter information (if this dog is a puppy)
  litterId?: string;
  litterPosition?: number; // Position in litter (1st born, 2nd born, etc.)
  
  createdAt: string;
  updatedAt: string;
}

export interface Litter {
  id: string;
  breederId: string;
  sireId: string; // Father dog ID
  damId: string;  // Mother dog ID
  breed: string;
  
  // Dates and timing
  breedingDate: string; // When breeding occurred
  expectedDate: string; // Expected birth date (63 days from breeding)
  birthDate?: string;   // Actual birth date
  season: 'spring' | 'summer' | 'fall' | 'winter';
  
  // Litter details
  puppyCount?: number;
  maleCount?: number;
  femaleCount?: number;
  availablePuppies?: number;
  
  description: string;
  photos: string[];
  status: 'planned' | 'expecting' | 'born' | 'weaning' | 'ready' | 'sold_out';
  
  // Pricing
  priceRange?: {
    min: number;
    max: number;
  };
  
  // Health and documentation
  healthClearances: string[]; // URLs to parent health documents
  
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isBreeder: boolean;
}