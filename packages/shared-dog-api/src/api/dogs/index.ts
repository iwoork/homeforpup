import { Dog, VeterinaryVisit, TrainingRecord, DogPhoto } from '@homeforpup/shared-types';

// API Configuration
let apiBaseUrl = '';

export const setApiBaseUrl = (url: string) => {
  apiBaseUrl = url;
};

export const getApiBaseUrl = () => {
  if (!apiBaseUrl) {
    throw new Error('API base URL not configured. Call setApiBaseUrl() first.');
  }
  return apiBaseUrl;
};

// Dog API Functions
export const dogApi = {
  // Get dog details
  async getDog(dogId: string): Promise<{ dog: Dog }> {
    const response = await fetch(`${getApiBaseUrl()}/api/dogs/${dogId}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dog details');
    }
    
    return response.json();
  },

  // Update dog
  async updateDog(dogId: string, data: Partial<Dog>): Promise<{ dog: Dog }> {
    const response = await fetch(`${getApiBaseUrl()}/api/dogs/${dogId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update dog');
    }
    
    return response.json();
  },

  // Add veterinary visit
  async addVetVisit(dogId: string, visit: Omit<VeterinaryVisit, 'id' | 'dogId' | 'createdAt' | 'updatedAt'>): Promise<{ visit: VeterinaryVisit }> {
    const response = await fetch(`${getApiBaseUrl()}/api/dogs/${dogId}/vet-visits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(visit),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add vet visit');
    }
    
    return response.json();
  },

  // Get veterinary visits
  async getVetVisits(dogId: string): Promise<{ visits: VeterinaryVisit[] }> {
    const response = await fetch(`${getApiBaseUrl()}/api/dogs/${dogId}/vet-visits`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch vet visits');
    }
    
    return response.json();
  },

  // Add training record
  async addTrainingRecord(dogId: string, record: Omit<TrainingRecord, 'id' | 'dogId' | 'createdAt' | 'updatedAt'>): Promise<{ record: TrainingRecord }> {
    const response = await fetch(`${getApiBaseUrl()}/api/dogs/${dogId}/training`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(record),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add training record');
    }
    
    return response.json();
  },

  // Get training records
  async getTrainingRecords(dogId: string): Promise<{ records: TrainingRecord[] }> {
    const response = await fetch(`${getApiBaseUrl()}/api/dogs/${dogId}/training`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch training records');
    }
    
    return response.json();
  },

  // Add photo
  async addPhoto(dogId: string, photo: Omit<DogPhoto, 'id' | 'dogId' | 'createdAt' | 'updatedAt'>): Promise<{ photo: DogPhoto }> {
    const response = await fetch(`${getApiBaseUrl()}/api/dogs/${dogId}/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(photo),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add photo');
    }
    
    return response.json();
  },

  // Get photos
  async getPhotos(dogId: string): Promise<{ photos: DogPhoto[] }> {
    const response = await fetch(`${getApiBaseUrl()}/api/dogs/${dogId}/photos`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch photos');
    }
    
    return response.json();
  },
};
