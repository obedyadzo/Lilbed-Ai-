export interface Source {
  id: number;
  title: string;
  url: string;
  summary?: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  queries?: string[];
  sources?: Source[];
  timestamp: string;
}

export interface ResearchProject {
  id: string;
  userId: string;
  topic: string;
  depth: 'quick' | 'deep';
  messages: Message[];
  createdAt: string;
}

// Published research paper inside Lilbed world database 
export interface PublishedPaper {
  id: string;
  userId: string;
  authorName: string;
  authorPicture?: string;
  title: string;
  abstract: string;
  publishingTarget: 'account' | 'channel' | 'community' | 'group';
  targetName: string;
  attachmentUrl?: string; // objectURL or dataURL b64
  attachmentType?: 'pdf' | 'image' | 'video' | 'audio';
  attachmentName?: string;
  likes: string[]; // array of userIds
  dislikes: string[]; // array of userIds
  isPrivate?: boolean;
  createdAt: string;
}

// Live direct chat message between researchers
export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'video' | 'file';
  attachmentName?: string;
  isEncrypted?: boolean;
}

// Community or academic collaborative group definition
export interface CommunityGroup {
  id: string;
  type: 'community' | 'group' | 'channel';
  name: string;
  description: string;
  creatorId: string;
  memberIds: string[];
  createdAt: string;
}

export interface SocialProfile {
  uid: string;
  name: string;
  phoneNumber: string;
  bio: string;
  role: string;
  whatsappLink?: string;
  isPremium?: boolean;
  createdAt: string;
  
  // Custom enhanced attributes for worldwide scholar networks
  profilePicture?: string; // base64 or custom graphic url
  backgroundPicture?: string; // base64 or custom banner url
  followers: string[]; // array of uids
  following: string[]; // array of uids
  friends: string[]; // array of uids who added this user as companion
  joinedPlatforms: string[]; // e.g., ["Google Scholar", "ResearchGate"]
  communitiesCreated: string[]; // custom community titles
  groupsJoined: string[]; // custom group titles
  accountType?: 'individual' | 'institution' | 'business';
}
