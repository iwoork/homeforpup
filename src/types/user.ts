// types/user.ts
export interface User {
  userId: string; // Primary Key - UUID from Cognito
  email: string; // Unique email address
  name: string; // Full name or display name
  firstName?: string; // Optional: First name
  lastName?: string; // Optional: Last name
  displayName?: string; // Optional: Public display name
  userType: 'breeder' | 'adopter' | 'both'; // User type
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
  breederInfo?: {
    kennelName?: string;
    license?: string;
    specialties?: string[];
    experience?: number;
    website?: string;
  };
  adopterInfo?: {
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

// Updated messaging types to work with new User structure
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

export interface Message {
  id: string;
  threadId: string;
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
  replyTo?: string; // ID of message being replied to
}

export interface MessageAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
}

// Legacy Breeder interface for backwards compatibility
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