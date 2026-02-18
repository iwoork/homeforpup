import { Activity, ActivityType, ActivityCategory, ActivityMetadata, CreateActivityRequest } from '@homeforpup/shared-types';

export class ActivityTracker {
  private static instance: ActivityTracker;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  public static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker();
    }
    return ActivityTracker.instance;
  }

  /**
   * Track a user activity
   */
  public async trackActivity(
    userId: string,
    type: ActivityType,
    title: string,
    description: string,
    metadata: ActivityMetadata,
    category: ActivityCategory,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<Activity | null> {
    try {
      const activityRequest: CreateActivityRequest = {
        userId,
        type,
        title,
        description,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          deviceType: this.getDeviceType(),
        },
        priority,
        category,
      };

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(activityRequest),
      });

      if (!response.ok) {
        console.error('Failed to track activity:', response.statusText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error tracking activity:', error);
      return null;
    }
  }

  /**
   * Track puppy-related activities
   */
  public async trackPuppyActivity(
    userId: string,
    type: 'puppy_favorited' | 'puppy_unfavorited',
    puppyId: string,
    puppyName: string,
    puppyBreed: string,
    breederId: string,
    breederName: string,
    additionalMetadata: Partial<ActivityMetadata> = {}
  ): Promise<Activity | null> {
    const titles = {
      puppy_favorited: `Added ${puppyName} to favorites`,
      puppy_unfavorited: `Removed ${puppyName} from favorites`,
    };

    const descriptions = {
      puppy_favorited: `Added ${puppyBreed} puppy to your favorites`,
      puppy_unfavorited: `Removed ${puppyBreed} puppy from your favorites`,
    };

    return this.trackActivity(
      userId,
      type,
      titles[type],
      descriptions[type],
      {
        puppyId,
        puppyName,
        puppyBreed,
        breederId,
        breederName,
        targetId: puppyId,
        targetType: 'puppy',
        ...additionalMetadata,
      },
      'engagement'
    );
  }

  /**
   * Track breeder-related activities
   */
  public async trackBreederActivity(
    userId: string,
    type: 'breeder_contacted',
    breederId: string,
    breederName: string,
    kennelId?: string,
    kennelName?: string,
    additionalMetadata: Partial<ActivityMetadata> = {}
  ): Promise<Activity | null> {
    const titles = {
      breeder_contacted: `Contacted ${breederName}`,
    };

    const descriptions = {
      breeder_contacted: `Sent a message to ${breederName}`,
    };

    return this.trackActivity(
      userId,
      type,
      titles[type],
      descriptions[type],
      {
        breederId,
        breederName,
        kennelId,
        kennelName,
        targetId: breederId,
        targetType: 'breeder',
        ...additionalMetadata,
      },
      'engagement'
    );
  }

  /**
   * Track message-related activities
   */
  public async trackMessageActivity(
    userId: string,
    type: 'message_sent' | 'message_received',
    messageId: string,
    threadId: string,
    recipientId: string,
    recipientName: string,
    messageType: 'general' | 'inquiry' | 'business' | 'urgent' = 'general',
    additionalMetadata: Partial<ActivityMetadata> = {}
  ): Promise<Activity | null> {
    const titles = {
      message_sent: `Message sent to ${recipientName}`,
      message_received: `New message from ${recipientName}`,
    };

    const descriptions = {
      message_sent: `Sent a ${messageType} message to ${recipientName}`,
      message_received: `Received a ${messageType} message from ${recipientName}`,
    };

    return this.trackActivity(
      userId,
      type,
      titles[type],
      descriptions[type],
      {
        messageId,
        threadId,
        recipientId,
        recipientName,
        messageType,
        targetId: messageId,
        targetType: 'message',
        ...additionalMetadata,
      },
      'communication'
    );
  }

  /**
   * Track profile activities
   */
  public async trackProfileActivity(
    userId: string,
    type: 'profile_updated' | 'preferences_updated',
    field?: string,
    value?: any,
    additionalMetadata: Partial<ActivityMetadata> = {}
  ): Promise<Activity | null> {
    const titles = {
      profile_updated: 'Profile updated',
      preferences_updated: 'Preferences updated',
    };

    const descriptions = {
      profile_updated: field ? `Updated ${field}` : 'Updated profile information',
      preferences_updated: 'Updated your preferences',
    };

    return this.trackActivity(
      userId,
      type,
      titles[type],
      descriptions[type],
      {
        profileField: field,
        profileValue: value,
        targetId: userId,
        targetType: 'user',
        ...additionalMetadata,
      },
      'profile'
    );
  }

  /**
   * Track system activities
   */
  public async trackSystemActivity(
    userId: string,
    type: 'login' | 'logout' | 'account_created',
    additionalMetadata: Partial<ActivityMetadata> = {}
  ): Promise<Activity | null> {
    const titles = {
      login: 'Logged in',
      logout: 'Logged out',
      account_created: 'Account created',
    };

    const descriptions = {
      login: 'Successfully logged into your account',
      logout: 'Logged out of your account',
      account_created: 'Welcome! Your account has been created',
    };

    return this.trackActivity(
      userId,
      type,
      titles[type],
      descriptions[type],
      {
        targetId: userId,
        targetType: 'user',
        ...additionalMetadata,
      },
      'system'
    );
  }

  /**
   * Get device type based on screen size
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

}

// Export singleton instance
export const activityTracker = ActivityTracker.getInstance();
