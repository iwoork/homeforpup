export interface Breed {
  id: string;
  name: string;
  altNames: string[];
  category: string;
  size: string;
  breedType: string;
  image: string;
  images?: string[];
  overview: string;
  characteristics: {
    energyLevel: number;
    trainability: number;
    friendliness: number;
    groomingNeeds: number;
    exerciseNeeds: number;
    barking: number;
    shedding: number;
    goodWithKids: number;
    goodWithDogs: number;
    goodWithCats: number;
    goodWithStrangers: number;
    protective: number;
    playful: number;
    calm: number;
    intelligent: number;
    independent: number;
    affectionate: number;
    social: number;
    confident: number;
    gentle: number;
    patient: number;
    energetic: number;
    loyal: number;
    alert: number;
    brave: number;
    stubborn: number;
    sensitive: number;
    adaptable: number;
    vocal: number;
    territorial: number;
  };
  physicalTraits: string[];
  temperament: string[];
  idealFor: string[];
  exerciseNeeds: string;
  commonHealthIssues: string[];
  groomingTips: string;
  trainingTips: string;
  funFacts: string[];
  breederCount?: number;
}

export interface BreedsResponse {
  breeds: Breed[];
  count: number;
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  filters: {
    availableCategories: string[];
    availableSizes: string[];
    availableBreedTypes: string[];
    totalBreeders: number;
  };
}

export interface UseBreedsOptions {
  search?: string;
  category?: string;
  size?: string;
  breedType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface BreedItem {
  id: number;
  name: string;
  alt_names: string[];
  overview_page: boolean;
  url: string;
  cover_photo_url: string;
  live: string;
  hybrid: boolean;
  slug: string;
  search_terms: string[];
  breed_type: string;
  size_category: string;
  breed_group: string;
}
