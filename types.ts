
export enum Gender {
  Male = 'Male',
  Female = 'Female',
}

export enum AccountStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Gold = 'Gold',
  Black = 'Black',
}

export enum SubscriptionPlan {
  Free = 'Free',
  Standard = 'Standard', // 1 month
  Premium = 'Premium',   // 6 months
  Platinum = 'Platinum', // 12 months
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  occupation: string;
  income: string;
  education: string;
  location: string;
  height: number;
  bodyType: string;
  bio: string;
  imageUrls: string[];
  tags: string[];
  isVerified: boolean;
  status: AccountStatus;
  subscription: SubscriptionPlan;
  subscriptionUntil?: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
}

export interface Match {
  id: string;
  profile: UserProfile;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
}

export interface Footprint {
  id: string;
  visitor: UserProfile;
  timestamp: number;
  isNew: boolean;
}

export interface LikeReceived {
  id: string;
  user: UserProfile;
  timestamp: number;
  isNew: boolean;
}
