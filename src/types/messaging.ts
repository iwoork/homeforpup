// types/messaging.ts
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
  participants: string[];
  lastMessage: Message;
  messageCount: number;
  unreadCount: number;
  updatedAt: string;
}

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

// API Response types
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

// Request types
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