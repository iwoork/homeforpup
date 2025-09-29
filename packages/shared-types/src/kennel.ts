// ============================================================================
// KENNEL MANAGEMENT TYPES
// ============================================================================

export interface Kennel {
  id: string;
  name: string;
  description?: string;
  businessName?: string;
  website?: string;
  phone?: string;
  email?: string;
  
  // Location
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Facilities
  facilities: {
    indoorSpace: boolean;
    outdoorSpace: boolean;
    exerciseArea: boolean;
    whelpingArea: boolean;
    quarantineArea: boolean;
    groomingArea: boolean;
    veterinaryAccess: boolean;
    climateControl: boolean;
    security: boolean;
    other?: string[];
  };
  
  // Capacity
  capacity: {
    maxDogs: number;
    maxLitters: number;
    currentDogs: number;
    currentLitters: number;
  };
  
  // Ownership/Management
  owners: string[]; // User IDs who own the kennel
  managers: string[]; // User IDs who can manage the kennel
  createdBy: string; // User ID who created the kennel
  
  // Status
  status: 'active' | 'inactive' | 'suspended' | 'pending_approval';
  verified: boolean;
  verificationDate?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Media
  photos?: string[];
  videos?: string[];
  
  // Additional info
  specialties?: string[]; // Breeds they specialize in
  certifications?: KennelCertification[];
  awards?: KennelAward[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export interface KennelCertification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  certificateUrl?: string;
}

export interface KennelAward {
  id: string;
  name: string;
  organization: string;
  year: number;
  description?: string;
  awardUrl?: string;
}

export interface Dog {
  id: string;
  name: string;
  callName?: string; // Nickname
  breed: string;
  gender: 'male' | 'female';
  birthDate: string;
  
  // Type classification
  type: 'parent' | 'puppy';
  
  // Physical characteristics
  color: string;
  markings?: string;
  weight?: number; // in pounds
  height?: number; // in inches
  eyeColor?: string;
  
  // Kennel association
  kennelId: string;
  kennelName: string;
  
  // Pedigree information
  sireId?: string; // Father dog ID
  damId?: string; // Mother dog ID
  sireName?: string;
  damName?: string;
  pedigree?: PedigreeInfo;
  
  // Health records
  health: {
    microchipId?: string;
    registrationNumber?: string;
    healthClearances: HealthClearance[];
    vaccinations: Vaccination[];
    medicalHistory: MedicalRecord[];
    currentHealthStatus: 'excellent' | 'good' | 'fair' | 'poor';
    lastVetVisit?: string;
  };
  
  // Breeding information
  breeding: {
    isBreedingDog: boolean;
    breedingStatus: 'available' | 'retired' | 'too_young' | 'health_issues';
    breedingHistory: BreedingRecord[];
    geneticTests: GeneticTest[];
  };
  
  // Status
  status: 'active' | 'retired' | 'deceased' | 'sold' | 'adopted';
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Media
  photos?: string[];
  videos?: string[];
  
  // Additional info
  temperament?: string;
  specialNeeds?: string;
  notes?: string;
}

export interface PedigreeInfo {
  generation: number;
  ancestors: {
    sire: string; // Father
    dam: string; // Mother
    paternalGrandsire?: string;
    paternalGranddam?: string;
    maternalGrandsire?: string;
    maternalGranddam?: string;
  };
  titles?: string[];
  achievements?: string[];
}

export interface HealthClearance {
  id: string;
  test: string; // e.g., "Hip Dysplasia", "Elbow Dysplasia", "Eye Clearance"
  organization: string; // e.g., "OFA", "PennHIP", "CERF"
  result: 'excellent' | 'good' | 'fair' | 'poor' | 'not_tested';
  testDate: string;
  expiryDate?: string;
  certificateUrl?: string;
}

export interface Vaccination {
  id: string;
  vaccine: string;
  date: string;
  nextDue?: string;
  veterinarian?: string;
  lotNumber?: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  condition: string;
  treatment: string;
  veterinarian: string;
  notes?: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

export interface BreedingRecord {
  id: string;
  mateId: string;
  mateName: string;
  breedingDate: string;
  litterId?: string;
  litterSize?: number;
  successful: boolean;
  notes?: string;
}

export interface GeneticTest {
  id: string;
  test: string;
  result: 'clear' | 'carrier' | 'affected' | 'not_tested';
  testDate: string;
  laboratory: string;
  certificateUrl?: string;
}

export interface Litter {
  id: string;
  name: string;
  kennelId: string;
  kennelName: string;
  
  // Parents
  sireId: string;
  sireName: string;
  damId: string;
  damName: string;
  
  // Birth information
  birthDate: string;
  expectedPuppyCount?: number;
  actualPuppyCount: number;
  
  // Puppies
  puppies: PuppyInfo[];
  
  // Status
  status: 'expected' | 'born' | 'weaned' | 'ready_for_homes' | 'sold' | 'completed';
  
  // Health
  health: {
    whelpingComplications?: string;
    vetCheckDate?: string;
    vetNotes?: string;
    vaccinationsStarted: boolean;
    dewormingStarted: boolean;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Additional info
  notes?: string;
  specialInstructions?: string;
}

export interface PuppyInfo {
  id: string; // Dog ID
  name: string;
  gender: 'male' | 'female';
  color: string;
  markings?: string;
  weight?: number;
  status: 'available' | 'reserved' | 'sold' | 'kept';
  price?: number;
  notes?: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateKennelRequest {
  name: string;
  description?: string;
  businessName?: string;
  website?: string;
  phone?: string;
  email?: string;
  address: Kennel['address'];
  facilities: Kennel['facilities'];
  capacity: Kennel['capacity'];
  specialties?: string[];
  socialMedia?: Kennel['socialMedia'];
}

export interface UpdateKennelRequest extends Partial<CreateKennelRequest> {
  id: string;
}

export interface CreateDogRequest {
  name: string;
  callName?: string;
  breed: string;
  gender: 'male' | 'female';
  birthDate: string;
  type: 'parent' | 'puppy';
  color: string;
  markings?: string;
  weight?: number;
  height?: number;
  eyeColor?: string;
  kennelId: string;
  sireId?: string;
  damId?: string;
  temperament?: string;
  specialNeeds?: string;
  notes?: string;
}

export interface UpdateDogRequest extends Partial<CreateDogRequest> {
  id: string;
}

export interface CreateLitterRequest {
  name: string;
  kennelId: string;
  sireId: string;
  damId: string;
  expectedPuppyCount?: number;
  expectedBirthDate?: string;
  notes?: string;
}

export interface UpdateLitterRequest extends Partial<CreateLitterRequest> {
  id: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface KennelResponse {
  kennel: Kennel;
  dogs: Dog[];
  litters: Litter[];
  stats: {
    totalDogs: number;
    totalLitters: number;
    totalPuppies: number;
    activeBreedingDogs: number;
  };
}

export interface KennelsResponse {
  kennels: Kennel[];
  total: number;
  hasMore: boolean;
}

export interface DogsResponse {
  dogs: Dog[];
  total: number;
  hasMore: boolean;
}

export interface LittersResponse {
  litters: Litter[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface KennelFilter {
  search?: string;
  status?: Kennel['status'];
  verified?: boolean;
  specialties?: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  capacity?: {
    minDogs?: number;
    maxDogs?: number;
  };
}

export interface DogFilter {
  search?: string;
  kennelId?: string;
  type?: 'parent' | 'puppy';
  gender?: 'male' | 'female';
  breed?: string;
  status?: Dog['status'];
  breedingStatus?: Dog['breeding']['breedingStatus'];
  ageRange?: {
    min?: number; // in months
    max?: number; // in months
  };
}

export interface LitterFilter {
  search?: string;
  kennelId?: string;
  status?: Litter['status'];
  breed?: string;
  birthDateRange?: {
    start?: string;
    end?: string;
  };
  puppyCount?: {
    min?: number;
    max?: number;
  };
}
