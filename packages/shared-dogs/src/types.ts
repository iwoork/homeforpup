import { Dog } from '@homeforpup/shared-types';

// Re-export the main Dog type from shared-types
export type { Dog } from '@homeforpup/shared-types';

// Dogs API response types
export interface DogsResponse {
  dogs: Dog[];
  total: number;
  hasMore?: boolean;
  count?: number;
  page?: number;
  limit?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  totalPages?: number;
  startIndex?: number;
  endIndex?: number;
}

// Dogs API query options
export interface UseDogsOptions {
  search?: string;
  kennelId?: string;
  type?: 'parent' | 'puppy' | '' | string;
  gender?: 'male' | 'female' | '' | string;
  breed?: string;
  status?: string;
  breedingStatus?: 'available' | 'retired' | 'not_ready' | '' | string;
  page?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  ownerId?: string; // For filtering by owner
}

// Create/Update dog request types
export interface CreateDogRequest {
  name: string;
  callName?: string;
  breed: string;
  gender: 'male' | 'female';
  birthDate: string;
  weight?: number;
  color: string;
  kennelId?: string;
  description?: string;
  dogType?: 'parent' | 'puppy';
  breedingStatus?: 'available' | 'retired' | 'not_ready';
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor';
  sireId?: string;
  damId?: string;
  photoUrl?: string;
  registrationNumber?: string;
  microchipNumber?: string;
  notes?: string;
}

export interface UpdateDogRequest extends Partial<CreateDogRequest> {
  id: string;
}

// Matched dogs response (for adopter app)
export interface MatchedDogsResponse {
  matchedPuppies: Dog[];
  total?: number;
}

// Dog filters for search
export interface DogFilters {
  breeds?: string[];
  genders?: string[];
  ageRanges?: string[];
  sizes?: string[];
  locations?: string[];
  breedingStatuses?: string[];
}
