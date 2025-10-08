import { User } from '../types';
import config from '../config/config';

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  totalKennels: number;
  totalDogs: number;
  activeMessages: number;
  newInquiries: number;
}

export interface Kennel {
  id: string;
  name: string;
  description?: string;
  location?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dog {
  id: string;
  name: string;
  callName?: string;
  breed: string;
  gender: 'male' | 'female';
  birthDate: string;
  weight?: number;
  color?: string;
  kennelId?: string;
  description?: string;
  dogType: 'parent' | 'puppy';
  breedingStatus: 'available' | 'retired' | 'not_ready';
  healthStatus: 'good' | 'fair' | 'poor';
  photoUrl?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DogsResponse {
  dogs: Dog[];
  total: number;
  count: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
  hasMore: boolean;
}

export interface KennelsResponse {
  kennels: Kennel[];
  total: number;
  count: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
}

export interface Breed {
  id: string;
  name: string;
  altNames?: string[];
  category: string;
  size: string;
  breedType: string;
  image?: string;
  images?: string[];
  overview?: string;
  characteristics?: any;
  physicalTraits?: string[];
  temperament?: string[];
  idealFor?: string[];
  exerciseNeeds?: string;
  commonHealthIssues?: string[];
  groomingTips?: string;
  trainingTips?: string;
  funFacts?: string[];
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
  filters?: {
    availableCategories: string[];
    availableSizes: string[];
    availableBreedTypes: string[];
    totalBreeders: number;
  };
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = config.api.baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (this.authToken) {
        // Ensure token is a valid string and doesn't already have Bearer prefix
        const tokenStr = String(this.authToken).trim();
        if (tokenStr && tokenStr !== '[object Object]') {
          headers.Authorization = `Bearer ${tokenStr}`;
          console.log('API request with auth:', { 
            endpoint, 
            hasAuth: true, 
            tokenLength: tokenStr.length 
          });
        } else {
          console.warn('Invalid auth token detected:', { token: this.authToken });
        }
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API request failed:', { 
          url, 
          status: response.status, 
          error: data.message || data.error 
        });
        return {
          success: false,
          error: data.message || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Dashboard API
  async getDashboardStats(userId?: string): Promise<ApiResponse<DashboardStats>> {
    // For now, we'll fetch kennels and dogs to calculate stats
    // In the future, this could be a dedicated endpoint
    const [kennelsResponse, dogsResponse] = await Promise.all([
      this.getKennels({ page: 1, limit: 100 }),
      this.getDogs({ page: 1, limit: 100, ownerId: userId }),
    ]);

    if (!kennelsResponse.success || !dogsResponse.success) {
      return {
        success: false,
        error: 'Failed to fetch dashboard data',
      };
    }

    // Filter kennels by user if userId is provided
    let userKennels = kennelsResponse.data?.kennels || [];
    if (userId) {
      userKennels = userKennels.filter((kennel: Kennel) => kennel.ownerId === userId);
    }

    const stats: DashboardStats = {
      totalKennels: userKennels.length,
      totalDogs: dogsResponse.data?.dogs?.length || 0,
      activeMessages: 0, // TODO: Implement messages API
      newInquiries: 0, // TODO: Implement inquiries API
    };

    return {
      success: true,
      data: stats,
    };
  }

  // Kennels API
  // Ready to deploy! See apps/homeforpup-api/KENNELS_DEPLOYMENT_GUIDE.md
  async getKennels(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<ApiResponse<KennelsResponse>> {
    const queryParams = new URLSearchParams();
    if (params.page) {
      // Convert page to offset (page 1 = offset 0, page 2 = offset limit, etc.)
      const offset = (params.page - 1) * (params.limit || 10);
      queryParams.append('offset', offset.toString());
    }
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    const endpoint = `/kennels?${queryParams.toString()}`;
    return this.makeRequest<KennelsResponse>(endpoint);
  }

  async getKennelById(id: string): Promise<ApiResponse<Kennel>> {
    return this.makeRequest<Kennel>(`/kennels/${id}`);
  }

  async createKennel(kennelData: Partial<Kennel>): Promise<ApiResponse<Kennel>> {
    return this.makeRequest<Kennel>('/kennels', {
      method: 'POST',
      body: JSON.stringify(kennelData),
    });
  }

  async updateKennel(id: string, kennelData: Partial<Kennel>): Promise<ApiResponse<Kennel>> {
    return this.makeRequest<Kennel>(`/kennels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(kennelData),
    });
  }

  async deleteKennel(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/kennels/${id}`, {
      method: 'DELETE',
    });
  }

  // Dogs API
  async getDogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    kennelId?: string;
    ownerId?: string;
    breederId?: string;
    type?: string;
    gender?: string;
    breed?: string;
    status?: string;
    breedingStatus?: string;
  } = {}): Promise<ApiResponse<DogsResponse>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.kennelId) queryParams.append('kennelId', params.kennelId);
    if (params.ownerId) queryParams.append('ownerId', params.ownerId);
    if (params.breederId) queryParams.append('breederId', params.breederId);
    if (params.type) queryParams.append('type', params.type);
    if (params.gender) queryParams.append('gender', params.gender);
    if (params.breed) queryParams.append('breed', params.breed);
    if (params.status) queryParams.append('status', params.status);
    if (params.breedingStatus) queryParams.append('breedingStatus', params.breedingStatus);

    const endpoint = `/dogs?${queryParams.toString()}`;
    return this.makeRequest<DogsResponse>(endpoint);
  }

  async getDogById(id: string): Promise<ApiResponse<Dog>> {
    return this.makeRequest<Dog>(`/dogs/${id}`);
  }

  async createDog(dogData: Partial<Dog>): Promise<ApiResponse<Dog>> {
    return this.makeRequest<Dog>('/dogs', {
      method: 'POST',
      body: JSON.stringify(dogData),
    });
  }

  async updateDog(id: string, dogData: Partial<Dog>): Promise<ApiResponse<Dog>> {
    return this.makeRequest<Dog>(`/dogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dogData),
    });
  }

  async deleteDog(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/dogs/${id}`, {
      method: 'DELETE',
    });
  }

  // Breeds API
  async getBreeds(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    size?: string;
    breedType?: string;
    sortBy?: string;
  } = {}): Promise<ApiResponse<BreedsResponse>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.size) queryParams.append('size', params.size);
    if (params.breedType) queryParams.append('breedType', params.breedType);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);

    const endpoint = `/breeds?${queryParams.toString()}`;
    return this.makeRequest<BreedsResponse>(endpoint);
  }

  async getBreedById(id: string): Promise<ApiResponse<Breed>> {
    return this.makeRequest<Breed>(`/breeds/${id}`);
  }

  // Users API
  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.makeRequest<User>(`/users/${id}`);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Activities API (for recent activity)
  // Note: This endpoint may not be deployed yet. See API_ENDPOINTS.md
  async getActivities(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/activities?${queryParams.toString()}`;
    return this.makeRequest<any>(endpoint);
  }
}

// Create a singleton instance
export const apiService = new ApiService();
export default apiService;
