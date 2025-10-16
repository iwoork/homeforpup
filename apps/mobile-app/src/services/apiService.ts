import { User, Litter } from '../types';
import config from '../config/config';

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  totalLitters: number;
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
  price?: number; // Price for puppies
  location?: string; // Breeder location
  breederName?: string; // Breeder's name (populated from owner)
  age?: string; // Calculated age (e.g., "8 weeks")
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

export interface LittersResponse {
  litters: Litter[];
  total: number;
  count: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;
  hasMore: boolean;
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
    options: RequestInit = {},
    retryOnAuth = true,
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
            tokenLength: tokenStr.length,
            tokenPreview: tokenStr.substring(0, 50),
            isJWT: tokenStr.split('.').length === 3,
            startsWithEyJ: tokenStr.startsWith('eyJ'),
            // Add more token debugging
            tokenParts: tokenStr.split('.').length,
            tokenEnd: tokenStr.substring(tokenStr.length - 20),
          });
        } else {
          console.warn('Invalid auth token detected:', {
            token: this.authToken,
            tokenType: typeof this.authToken,
          });
        }
      } else {
        console.warn('No auth token available for request:', endpoint);
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('API Response Status:', {
        url,
        status: response.status,
        ok: response.ok,
      });

      const data = await response.json();
      
      console.log('API Response Data:', {
        endpoint,
        dataKeys: Object.keys(data),
        hasData: !!data,
        dataPreview: JSON.stringify(data).substring(0, 200),
      });

      if (!response.ok) {
        // Log 404s as warnings (resource not found is expected sometimes)
        // Log other errors as actual errors
        const logMessage = {
          url,
          status: response.status,
          error: data.message || data.error,
        };
        
        if (response.status === 404) {
          console.warn('API resource not found:', logMessage);
        } else {
          console.error('API request failed:', logMessage);
        }

        // Handle token expiration - refresh and retry once
        if (response.status === 401 && retryOnAuth) {
          console.log('⚠️ Token expired (401), attempting to refresh...');
          try {
            const authService = require('./authService').default;
            const isValid = await authService.refreshSession();
            if (isValid) {
              const newToken = await authService.getAuthToken();
              if (newToken) {
                this.authToken = newToken;
                console.log('✅ Token refreshed successfully, retrying request...');
                console.log('🔄 Retry with new token:', {
                  tokenLength: newToken.length,
                  tokenPreview: newToken.substring(0, 50),
                });
                // Retry with fresh options (don't pass old headers)
                return this.makeRequest<T>(endpoint, { ...options, headers: {} }, false);
              }
            }
            
            // If ID token refresh failed, try access token
            console.log('🔄 ID token failed, trying access token...');
            const accessToken = await authService.getAccessToken();
            if (accessToken) {
              this.authToken = accessToken;
              console.log('✅ Using access token, retrying request...');
              console.log('🔄 Retry with access token:', {
                tokenLength: accessToken.length,
                tokenPreview: accessToken.substring(0, 50),
              });
              return this.makeRequest<T>(endpoint, { ...options, headers: {} }, false);
            }
            
            // Both tokens failed - clear token and let AuthContext handle logout
            console.error('❌ Both ID and access token failed - user needs to login again');
            this.authToken = null;
          } catch (refreshError) {
            console.error('❌ Token refresh exception:', refreshError);
            this.authToken = null;
          }
        }

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
  async getDashboardStats(
    userId?: string,
  ): Promise<ApiResponse<DashboardStats>> {
    // For now, we'll fetch litters and dogs to calculate stats
    // In the future, this could be a dedicated endpoint
    const [littersResponse, dogsResponse] = await Promise.all([
      this.getLitters({ page: 1, limit: 100, breederId: userId }),
      this.getDogs({ page: 1, limit: 100, ownerId: userId }),
    ]);

    if (!littersResponse.success || !dogsResponse.success) {
      return {
        success: false,
        error: 'Failed to fetch dashboard data',
      };
    }

    const stats: DashboardStats = {
      totalLitters: littersResponse.data?.litters?.length || 0,
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
  async getKennels(
    params: {
      page?: number;
      limit?: number;
      search?: string;
    } = {},
  ): Promise<ApiResponse<KennelsResponse>> {
    const queryParams = new URLSearchParams();
    if (params.page) {
      // Convert page to offset (page 1 = offset 0, page 2 = offset limit, etc.)
      const offset = (params.page - 1) * (params.limit || 10);
      queryParams.append('offset', offset.toString());
    }
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    // Note: User filtering is automatic based on authentication token
    // The API returns only kennels where the authenticated user is owner or manager

    const endpoint = `/kennels?${queryParams.toString()}`;
    return this.makeRequest<KennelsResponse>(endpoint);
  }

  async getKennelById(id: string): Promise<ApiResponse<Kennel>> {
    return this.makeRequest<Kennel>(`/kennels/${id}`);
  }

  async createKennel(
    kennelData: Partial<Kennel>,
  ): Promise<ApiResponse<Kennel>> {
    return this.makeRequest<Kennel>('/kennels', {
      method: 'POST',
      body: JSON.stringify(kennelData),
    });
  }

  async updateKennel(
    id: string,
    kennelData: Partial<Kennel>,
  ): Promise<ApiResponse<Kennel>> {
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
  async getDogs(
    params: {
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
    } = {},
  ): Promise<ApiResponse<DogsResponse>> {
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
    if (params.breedingStatus)
      queryParams.append('breedingStatus', params.breedingStatus);

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

  async updateDog(
    id: string,
    dogData: Partial<Dog>,
  ): Promise<ApiResponse<Dog>> {
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

  // Available Puppies API (for dog parents)
  async getAvailablePuppies(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      breed?: string;
      gender?: string;
      minPrice?: number;
      maxPrice?: number;
      location?: string;
      state?: string;
    } = {},
  ): Promise<ApiResponse<DogsResponse>> {
    const queryParams = new URLSearchParams();
    
    // Core filters for available puppies
    queryParams.append('type', 'puppy'); // Only puppies
    queryParams.append('breedingStatus', 'available'); // Only available
    
    // Pagination
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    // Search and filters
    if (params.search) queryParams.append('search', params.search);
    if (params.breed) queryParams.append('breed', params.breed);
    if (params.gender) queryParams.append('gender', params.gender);
    if (params.location) queryParams.append('location', params.location);
    if (params.state) queryParams.append('state', params.state);
    
    // Price filters (if API supports them)
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());

    const endpoint = `/dogs?${queryParams.toString()}`;
    console.log('🔍 Fetching available puppies from endpoint:', endpoint);
    console.log('🔍 Full URL:', this.baseUrl + endpoint);
    return this.makeRequest<DogsResponse>(endpoint);
  }

  // Breeds API
  async getBreeds(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      size?: string;
      breedType?: string;
      sortBy?: string;
    } = {},
  ): Promise<ApiResponse<BreedsResponse>> {
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

  // Profiles API (renamed from Users API)
  // Note: Identity fields (firstName, lastName, username, picture, phone, address, bio)
  // are managed by Cognito and should be fetched from Cognito user attributes
  async getProfileById(id: string): Promise<ApiResponse<{ profile: User }>> {
    return this.makeRequest<{ profile: User }>(`/profiles/${id}`);
  }

  async updateProfile(
    id: string,
    profileData: Partial<User>,
  ): Promise<ApiResponse<{ profile: User }>> {
    console.log('🔄 ApiService.updateProfile called');
    console.log('  - User ID:', id);
    console.log('  - Base URL:', this.baseUrl);
    console.log('  - Has Auth Token:', !!this.authToken);
    console.log('  - Update Data:', JSON.stringify(profileData, null, 2));
    
    const response = await this.makeRequest<{ profile: User }>(`/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    
    console.log('🔄 ApiService.updateProfile response:', response);
    return response;
  }

  // Legacy methods - deprecated, use getProfileById and updateProfile instead
  // @deprecated
  async getUserById(id: string): Promise<ApiResponse<{ user: User }>> {
    const response = await this.getProfileById(id);
    return { ...response, data: response.data ? { user: response.data.profile } : undefined } as any;
  }

  // @deprecated
  async updateUser(
    id: string,
    userData: Partial<User>,
  ): Promise<ApiResponse<{ user: User }>> {
    const response = await this.updateProfile(id, userData);
    return { ...response, data: response.data ? { user: response.data.profile } : undefined } as any;
  }

  // Activities API (for recent activity)
  // Note: This endpoint may not be deployed yet. See API_ENDPOINTS.md
  async getActivities(
    params: {
      page?: number;
      limit?: number;
    } = {},
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/activities?${queryParams.toString()}`;
    return this.makeRequest<any>(endpoint);
  }

  // Litters API
  async getLitters(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      breederId?: string;
      kennelId?: string;
      breed?: string;
      status?: string;
    } = {},
  ): Promise<ApiResponse<LittersResponse>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.breederId) queryParams.append('breederId', params.breederId);
    if (params.kennelId) queryParams.append('kennelId', params.kennelId);
    if (params.breed) queryParams.append('breed', params.breed);
    if (params.status) queryParams.append('status', params.status);

    const endpoint = `/litters?${queryParams.toString()}`;
    return this.makeRequest<LittersResponse>(endpoint);
  }

  async getLitterById(id: string): Promise<ApiResponse<Litter>> {
    return this.makeRequest<Litter>(`/litters/${id}`);
  }

  async createLitter(
    litterData: Partial<Litter>,
  ): Promise<ApiResponse<Litter>> {
    return this.makeRequest<Litter>('/litters', {
      method: 'POST',
      body: JSON.stringify(litterData),
    });
  }

  async updateLitter(
    id: string,
    litterData: Partial<Litter>,
  ): Promise<ApiResponse<Litter>> {
    return this.makeRequest<Litter>(`/litters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(litterData),
    });
  }

  async deleteLitter(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/litters/${id}`, {
      method: 'DELETE',
    });
  }

  // Photos API
  async getUploadUrl(params: {
    fileName: string;
    contentType: string;
    uploadPath?: string;
  }): Promise<
    ApiResponse<{ uploadUrl: string; photoUrl: string; key: string }>
  > {
    return this.makeRequest('/photos/upload-url', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async uploadToS3(
    uploadUrl: string,
    file: Blob | ArrayBuffer,
    contentType: string,
  ): Promise<boolean> {
    try {
      console.log('uploadToS3 - Starting upload', {
        urlLength: uploadUrl.length,
        contentType,
        fileSize: file instanceof Blob ? file.size : file.byteLength,
      });

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: file,
      });

      console.log('uploadToS3 - Response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('uploadToS3 - Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
      }

      return response.ok;
    } catch (error) {
      console.error('S3 upload error:', error);
      return false;
    }
  }

  // Vet Visit API
  async createVetVisit(
    vetVisitData: any,
  ): Promise<ApiResponse<any>> {
    return this.makeRequest('/vet-visits', {
      method: 'POST',
      body: JSON.stringify(vetVisitData),
    });
  }

  async getVetVisits(params: {
    dogId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.dogId) queryParams.append('dogId', params.dogId);

    const endpoint = `/vet-visits?${queryParams.toString()}`;
    return this.makeRequest(endpoint);
  }

  async getVetVisitById(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/vet-visits/${id}`);
  }

  async updateVetVisit(
    id: string,
    vetVisitData: any,
  ): Promise<ApiResponse<any>> {
    return this.makeRequest(`/vet-visits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vetVisitData),
    });
  }

  async deleteVetVisit(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/vet-visits/${id}`, {
      method: 'DELETE',
    });
  }
}

// Create a singleton instance
export const apiService = new ApiService();
export default apiService;
