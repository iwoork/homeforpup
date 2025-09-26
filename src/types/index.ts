// Consolidated Types - Single source of truth for all type definitions

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface User {
  userId: string; // Primary Key - UUID from Cognito
  email: string; // Unique email address
  name: string; // Full name or display name
  firstName?: string; // Optional: First name
  lastName?: string; // Optional: Last name
  displayName?: string; // Optional: Public display name
  userType: 'dog-professional' | 'puppy-parent' | 'both'; // User type
  phone?: string; // Optional: Phone number
  location?: string; // Location string (city, state)
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  profileImage?: string; // Optional: Profile picture URL
  coverPhoto?: string; // Optional: Cover photo URL
  galleryPhotos?: string[]; // Optional: Array of gallery photo URLs
  bio?: string; // Optional: Biography
  verified: boolean; // Email/phone verification status
  accountStatus: 'active' | 'suspended' | 'pending'; // Account status
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      showEmail: boolean;
      showPhone: boolean;
      showLocation: boolean;
    };
  };
  dogProfessionalInfo?: {
    kennelName?: string;
    license?: string;
    specialties?: string[];
    experience?: number;
    website?: string;
  };
  puppyParentInfo?: {
    housingType?: 'house' | 'apartment' | 'condo';
    yardSize?: 'none' | 'small' | 'medium' | 'large';
    hasOtherPets?: boolean;
    experienceLevel?: 'first-time' | 'some' | 'experienced';
    preferredBreeds?: string[];
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  lastActiveAt?: string; // Last login/activity
}

// Kennel interface for breeders
export interface Kennel {
  id: string;
  ownerId: string; // User ID of the breeder who owns this kennel
  name: string;
  description?: string;
  
  // Enhanced address information
  address?: {
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
  
  // Contact information
  website?: string;
  phone?: string;
  email?: string;
  
  // Business details
  specialties: string[]; // Breeds this kennel specializes in
  establishedDate?: string;
  licenseNumber?: string;
  businessType?: 'hobby' | 'commercial' | 'show' | 'working';
  
  // Visual content
  photoUrl?: string;
  coverPhoto?: string;
  galleryPhotos?: string[];
  
  // Status and metadata
  isActive: boolean;
  isPublic: boolean; // Whether kennel profile is visible to public
  
  // Social and marketing
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  
  // Statistics
  totalLitters?: number;
  totalDogs?: number;
  averageLitterSize?: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface Dog {
  id: string;
  ownerId: string; // User ID of the breeder (for backward compatibility)
  kennelId?: string; // Kennel ID - optional for backward compatibility
  name: string;
  breed: string;
  gender: 'male' | 'female';
  birthDate: string;
  weight: number;
  color: string;
  photoUrl?: string;  
  healthTests: string[]; // URLs to health test documents
  pedigree?: string; // URL to pedigree document
  description: string;
  
  // Parent information
  sireId?: string; // Father's ID (reference to another dog)
  damId?: string;  // Mother's ID (reference to another dog)
  
  // Breeding status
  breedingStatus: 'available' | 'retired' | 'not_ready';
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Litter information (if this dog is a puppy)
  litterId?: string;
  litterPosition?: number; // Position in litter (1st born, 2nd born, etc.)
  
  // Dog type - parent or puppy
  dogType: 'parent' | 'puppy';
  
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

// Kennel Announcement interface
export interface KennelAnnouncement {
  id: string;
  kennelId: string;
  authorId: string; // User ID of the person who created the announcement
  title: string;
  content: string;
  type: 'litter_available' | 'update' | 'blog' | 'event' | 'general';
  
  // Media content
  photos?: string[];
  videos?: string[];
  
  // Litter-specific fields (when type is 'litter_available')
  litterId?: string;
  breed?: string;
  availablePuppies?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  
  // Event-specific fields (when type is 'event')
  eventDate?: string;
  eventLocation?: string;
  
  // Publishing and visibility
  isPublished: boolean;
  isPinned: boolean; // Whether this announcement is pinned to the top
  publishedAt?: string;
  
  // Engagement metrics
  views?: number;
  likes?: number;
  shares?: number;
  
  // Tags for categorization
  tags?: string[];
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// BREEDER SPECIFIC TYPES
// ============================================================================

export interface Breeder extends User {
  // Extended dog professional-specific properties
  dogProfessionalInfo?: {
    kennelName?: string;
    license?: string;
    specialties?: string[];
    experience?: number;
    website?: string;
  };
  businessName: string;
  state: string;
  city: string;
  zipCode: string;
  experience: number;
  breeds: string[];
  breedIds: number[];
  rating: number;
  reviewCount: number;
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

// ============================================================================
// MESSAGING TYPES
// ============================================================================

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  receiverName: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  messageType: 'inquiry' | 'general' | 'business' | 'urgent';
  attachments?: MessageAttachment[];
  threadId?: string; // For message threading
  replyTo?: string; // ID of message being replied to
}

export interface MessageAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
}

export interface MessageThread {
  id: string;
  subject: string;
  participants: string[]; // Array of user IDs
  participantNames?: Record<string, string>; // userId -> name mapping
  participantInfo?: Record<string, Pick<User, 'name' | 'displayName' | 'profileImage' | 'userType'>>; // Enhanced participant info
  lastMessage: Message;
  messageCount: number;
  unreadCount: Record<string, number>; // userId -> unread count
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ANNOUNCEMENTS & SOCIAL FEATURES
// ============================================================================

export interface Announcement {
  id: string;
  breederId: string;
  breederName: string;
  breederAvatar?: string;
  kennel?: string;
  title: string;
  content: string;
  type: 'litter' | 'general' | 'health' | 'achievement' | 'event' | 'available';
  status: 'published' | 'draft' | 'archived';
  timestamp: string;
  updatedAt?: string;
  images?: string[];
  tags?: string[];
  location?: {
    city: string;
    state: string;
    country: string;
  };
  litterInfo?: LitterAnnouncement;
  healthInfo?: HealthAnnouncement;
  eventInfo?: EventAnnouncement;
  visibility: 'public' | 'followers' | 'private';
  interactions: {
    likes: number;
    shares: number;
    saves: number;
    comments: number;
  };
  likedBy?: string[]; // User IDs who liked
  comments?: AnnouncementComment[];
}

export interface LitterAnnouncement {
  sireId: string;
  sireName: string;
  sireRegistration?: string;
  damId: string;
  damName: string;
  damRegistration?: string;
  expectedDate: string;
  actualDate?: string;
  breed: string;
  expectedPuppies?: number;
  actualPuppies?: number;
  availablePuppies?: number;
  puppyPrice?: {
    min: number;
    max: number;
    currency: string;
  };
  depositeRequired?: number;
  breedingRights?: 'included' | 'additional' | 'not_available';
  healthTesting: {
    sire: HealthTest[];
    dam: HealthTest[];
  };
  pupyApplicationRequired?: boolean;
  waitingListOpen?: boolean;
  estimatedReadyDate?: string; // When puppies will be ready to go home
}

export interface HealthAnnouncement {
  dogIds: string[];
  testType: string;
  testDate: string;
  results: string;
  certifyingOrganization: string;
  certificateUrl?: string;
}

export interface EventAnnouncement {
  eventName: string;
  eventType: 'show' | 'match' | 'training' | 'social' | 'educational';
  eventDate: string;
  eventLocation: string;
  registrationRequired?: boolean;
  registrationDeadline?: string;
  cost?: number;
  maxParticipants?: number;
}

export interface HealthTest {
  testName: string;
  result: string;
  date: string;
  certifyingBody: string;
  certificateNumber?: string;
}

export interface AnnouncementComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: AnnouncementComment[];
  replyTo?: string;
}

// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

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

// ============================================================================
// NOTIFICATION & PREFERENCES
// ============================================================================

export interface NotificationPreferences {
  emailNotifications: {
    newMessages: boolean;
    puppyInquiries: boolean;
    announcementLikes: boolean;
    announcementComments: boolean;
    systemUpdates: boolean;
  };
  pushNotifications: {
    newMessages: boolean;
    puppyInquiries: boolean;
    urgentMessages: boolean;
  };
  frequencySettings: {
    digestEmails: 'never' | 'daily' | 'weekly' | 'monthly';
    reminderEmails: boolean;
  };
}

export interface UserInteraction {
  userId: string;
  targetType: 'announcement' | 'comment' | 'user';
  targetId: string;
  action: 'like' | 'share' | 'save' | 'follow' | 'block' | 'report';
  timestamp: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface MessagesResponse {
  messages: Message[];
  threads: MessageThread[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface AnnouncementsResponse {
  announcements: Announcement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  filters?: {
    types: string[];
    locations: string[];
    breeds: string[];
  };
}

export interface UsersResponse {
  users: User[];
  total: number;
  hasMore: boolean;
  nextKey?: string | null;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface SendMessageRequest {
  receiverId: string;
  subject: string;
  content: string;
  messageType: Message['messageType'];
  attachments?: File[];
  replyTo?: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  type: Announcement['type'];
  visibility: Announcement['visibility'];
  images?: File[];
  tags?: string[];
  litterInfo?: Partial<LitterAnnouncement>;
  healthInfo?: Partial<HealthAnnouncement>;
  eventInfo?: Partial<EventAnnouncement>;
  scheduledPublishDate?: string;
}

export interface MessageFilters {
  type?: Message['messageType'];
  read?: boolean;
  dateFrom?: string;
  dateTo?: string;
  senderId?: string;
  search?: string;
}

export interface AnnouncementFilters {
  type?: Announcement['type'];
  breed?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  breederId?: string;
  search?: string;
  tags?: string[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type UserType = 'dog-professional' | 'puppy-parent' | 'both';
export type MessageType = 'inquiry' | 'general' | 'business' | 'urgent';
export type AnnouncementType = 'litter' | 'general' | 'health' | 'achievement' | 'event' | 'available';
export type LitterStatus = 'planned' | 'expecting' | 'born' | 'weaning' | 'ready' | 'sold_out';
export type BreedingStatus = 'available' | 'retired' | 'not_ready';
export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor';
export type AccountStatus = 'active' | 'suspended' | 'pending';
export type AnnouncementStatus = 'published' | 'draft' | 'archived';
export type AnnouncementVisibility = 'public' | 'followers' | 'private';