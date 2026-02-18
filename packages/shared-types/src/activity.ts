export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  metadata: ActivityMetadata;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  category: ActivityCategory;
}

export type ActivityType =
  // Dog Parent Activities
  | 'puppy_favorited'
  | 'puppy_unfavorited'
  | 'breeder_contacted'
  | 'message_received'
  | 'message_sent'
  | 'preferences_updated'
  | 'profile_updated'
  | 'account_created'
  | 'login'
  | 'logout'

  // Breeder Activities
  | 'kennel_created'
  | 'kennel_updated'
  | 'dog_added'
  | 'dog_updated'
  | 'puppy_listed'
  | 'puppy_updated'
  | 'puppy_removed'
  | 'announcement_created'
  | 'announcement_updated'
  | 'inquiry_received'
  | 'inquiry_responded'
  | 'favorite_received'
  | 'message_received_from_dog_parent'
  | 'message_sent_to_dog_parent'
  | 'health_record_updated'
  | 'litter_created'
  | 'litter_updated'
  | 'certification_added'
  | 'photo_uploaded'
  | 'video_uploaded'
  | 'account_verified'
  | 'payment_processed'
  | 'subscription_updated';

export type ActivityCategory = 
  | 'engagement'
  | 'communication'
  | 'profile'
  | 'content'
  | 'business'
  | 'system'
  | 'security'
  | 'marketing';

export interface ActivityMetadata {
  // Common fields
  actorId?: string;
  actorName?: string;
  actorType?: 'dog-parent' | 'breeder';
  targetId?: string;
  targetName?: string;
  targetType?: 'puppy' | 'breeder' | 'kennel' | 'message' | 'user' | 'announcement';
  
  // Puppy-related
  puppyId?: string;
  puppyName?: string;
  puppyBreed?: string;
  puppyAge?: number;
  puppyGender?: string;
  puppyPrice?: number;
  puppyPhotos?: string[];
  
  // Breeder-related
  breederId?: string;
  breederName?: string;
  kennelId?: string;
  kennelName?: string;
  
  // Message-related
  messageId?: string;
  messageContent?: string;
  messageType?: 'general' | 'inquiry' | 'business' | 'urgent';
  threadId?: string;
  
  // Profile-related
  profileField?: string;
  profileValue?: any;
  
  // Business-related
  revenue?: number;
  subscriptionType?: string;
  paymentMethod?: string;
  
  // System-related
  ipAddress?: string;
  userAgent?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  location?: {
    country?: string;
    state?: string;
    city?: string;
  };
  
  // Additional data
  [key: string]: any;
}

export interface ActivityFilter {
  types?: ActivityType[];
  categories?: ActivityCategory[];
  priority?: ('low' | 'medium' | 'high')[];
  read?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  userId?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityStats {
  total: number;
  unread: number;
  byType: Record<ActivityType, number>;
  byCategory: Record<ActivityCategory, number>;
  byPriority: Record<'low' | 'medium' | 'high', number>;
  recent: Activity[];
}

export interface CreateActivityRequest {
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  metadata: ActivityMetadata;
  priority?: 'low' | 'medium' | 'high';
  category: ActivityCategory;
}

export interface ActivityResponse {
  activities: Activity[];
  total: number;
  hasMore: boolean;
  stats: ActivityStats;
}
