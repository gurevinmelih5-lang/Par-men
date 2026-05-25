export interface User {
  id: string;
  name: string;
  avatar: string;
  karma: {
    physical: number;
    intellectual: number;
    social: number;
    total: number;
  };
  lat?: number;
  lng?: number;
  blockedUsers?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface SwapNegotiation {
  id: string;
  bookId: string; // The book being requested
  offeredBookId?: string; // Optional book offered in return
  requesterId: string;
  ownerId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  messages: Message[];
}

export interface LineageEntry {
  city: string;
  date: string;
  ownerName: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  genre: string;
  condition: 'Mint' | 'Good' | 'Fair' | 'Poor';
  pace: 'Slow' | 'Medium' | 'Fast';
  depth: 'Low' | 'Medium' | 'High';
  ownerId: string;
  distance: number; // in km
  lineage: LineageEntry[];
  progress?: number;
  totalPages?: number;
  currentPage?: number;
  lat?: number;
  lng?: number;
  timeCapsule?: {
    message: string;
    from: string;
  };
  dna?: {
    readingHours: string;
    emotion: string;
    emotionPercentage: number;
    theme: string;
    retentionDays: number;
    demographics: string;
  };
  isLegendary?: boolean;
  storyLocations?: {
    lat: number;
    lng: number;
    name: string;
    description: string;
    sceneLabel?: string;
  }[];
}

export interface ScriptumReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface Scriptum {
  id: string;
  bookId?: string;
  customBookTitle?: string;
  customBookAuthor?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  highlightedText?: string;
  likes: number;
  likedByMe?: boolean;
  timestamp?: string;
  replies?: ScriptumReply[];
}

export interface RoomMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

export interface RoomParticipant {
  id: string;
  name: string;
  avatar: string;
}

export interface Room {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  participants: number;
  maxParticipants: number;
  time: string;
  isLive: boolean;
  type: 'Sessiz Okuma' | 'Felsefe Tartışması' | 'Gece Okuması';
  participantsList: RoomParticipant[];
  messages: RoomMessage[];
}
