// types/breeder.ts

export interface Breeder {
  id: number;
  name: string;
  businessName: string;
  location: string;
  state: string;
  city: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  email: string;
  website: string;
  experience: number;
  breeds: string[];
  breedIds: number[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  profileImage: string;
  coverImage: string;
  about: string;
  certifications: string[];
  healthTesting: string[];
  specialties: string[];
  currentLitters: number;
  availablePuppies: number;
  pricing: string;
  shipping: boolean;
  pickupAvailable: boolean;
  establishedYear?: number;
  businessHours: string;
  appointmentRequired: boolean;
  socialMedia: Record<string, string>;
  tags: string[];
  responseRate: number;
  avgResponseTime: string;
  lastUpdated: string;
}

export interface BreederStats {
  totalLitters: number;
  totalPuppies: number;
  currentFamilies: number;
  yearsActive: number;
  satisfactionRate: number;
}

export interface BreederReview {
  id: number;
  familyName: string;
  rating: number;
  date: string;
  review: string;
  avatar: string;
  puppyName: string;
  breed: string;
}

export interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isOwner: boolean;
  multiline?: boolean;
  placeholder?: string;
}

export interface EditableTagsProps {
  tags: string[];
  onUpdate: (tags: string[]) => void;
  isOwner: boolean;
  title: string;
  color?: string;
}