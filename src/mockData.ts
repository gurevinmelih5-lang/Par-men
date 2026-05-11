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
  condition: 'Mint' | 'Good' | 'Fair' | 'Poor';
  pace: 'Slow' | 'Medium' | 'Fast';
  depth: 'Low' | 'Medium' | 'High';
  ownerId: string;
  distance: number; // in km
  lineage: LineageEntry[];
  progress?: number;
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

export interface DuelArgument {
  opponentName: string;
  opponentAvatar: string;
  argument: string;
  support: number;
  oppose: number;
}

export interface Scriptum {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  highlightedText?: string;
  likes: number;
  duel?: DuelArgument;
  replies?: ScriptumReply[];
}

export interface Room {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: string;
  participants: number;
  maxParticipants: number;
  time: string;
  isLive: boolean;
  type: 'Sessiz Okuma' | 'Felsefe Tartışması' | 'Gece Okuması';
}

export const currentUser: User = {
  id: 'u1',
  name: 'Aylin Yılmaz',
  avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  karma: {
    physical: 85,
    intellectual: 92,
    social: 88,
    total: 88
  }
};

export const mockUsers: User[] = [
  currentUser,
  {
    id: 'u2',
    name: 'Caner Öz',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    karma: { physical: 70, intellectual: 65, social: 90, total: 75 }
  },
  {
    id: 'u3',
    name: 'Elif Demir',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b',
    karma: { physical: 95, intellectual: 80, social: 85, total: 86 }
  }
];

export const mockBooks: Book[] = [
  {
    id: 'b1',
    title: 'Körlük',
    author: 'José Saramago',
    cover: 'https://images.unsplash.com/photo-1476275466078-4007374efac4?w=400',
    condition: 'Good',
    pace: 'Medium',
    depth: 'High',
    ownerId: 'u2',
    distance: 2.4,
    lat: 41.0082,
    lng: 28.9784,
    lineage: [
      { city: 'İzmir', date: 'Eylül 2024', ownerName: 'Ahmet Y.' },
      { city: 'İstanbul (Beşiktaş)', date: 'Aralık 2024', ownerName: 'Zeynep T.' },
      { city: 'İstanbul (Kadıköy)', date: 'Mart 2025', ownerName: 'Caner Öz' }
    ],
    progress: 45,
    timeCapsule: {
      message: "Kitabın sonlarına doğru kendi körlüğümü sorguladığım o anı asla unutmayacağım. Umarım bu kitap sana da ışık olur.",
      from: "Ahmet Y."
    },
    dna: {
      readingHours: "01:00 - 03:00",
      emotion: "Melankolik",
      emotionPercentage: 62,
      theme: "Vicdan",
      retentionDays: 18,
      demographics: "24-35 Yaş"
    },
    isLegendary: true
  },
  {
    id: 'b2',
    title: 'Otostopçunun Galaksi Rehberi',
    author: 'Douglas Adams',
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
    condition: 'Mint',
    pace: 'Fast',
    depth: 'Medium',
    ownerId: 'u3',
    distance: 5.1,
    lat: 41.0136,
    lng: 28.9550,
    lineage: [
      { city: 'Ankara', date: 'Ocak 2025', ownerName: 'Elif Demir' }
    ],
    dna: {
      readingHours: "18:00 - 21:00",
      emotion: "Maceraperest",
      emotionPercentage: 85,
      theme: "Varoluş",
      retentionDays: 12,
      demographics: "18-28 Yaş"
    }
  },
  {
    id: 'b3',
    title: 'Yüzyıllık Yalnızlık',
    author: 'Gabriel García Márquez',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    condition: 'Fair',
    pace: 'Slow',
    depth: 'High',
    ownerId: 'u2',
    distance: 1.2,
    lat: 41.0030,
    lng: 29.0210,
    lineage: [
      { city: 'Eskişehir', date: 'Haziran 2023', ownerName: 'Kaan B.' },
      { city: 'Bursa', date: 'Kasım 2023', ownerName: 'Ayşe S.' },
      { city: 'İstanbul (Moda)', date: 'Şubat 2025', ownerName: 'Caner Öz' }
    ],
    timeCapsule: {
      message: "Macondo'nun o yağmurlu günlerinde kaybolmak ne güzeldi. Bu satırlar arasında sen de kendi yalnızlığını bulacaksın.",
      from: "Kaan B."
    },
    dna: {
      readingHours: "22:00 - 01:00",
      emotion: "Nostaljik",
      emotionPercentage: 74,
      theme: "Yalnızlık",
      retentionDays: 25,
      demographics: "30-45 Yaş"
    }
  }
];

export const mockScriptums: Scriptum[] = [
  {
    id: 's1',
    bookId: 'b1',
    userId: 'u2',
    userName: 'Caner Öz',
    userAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    highlightedText: "Gözleri kapattığınızda",
    content: "İnsanlığın ne kadar kırılgan olduğunu anlatan sarsıcı bir deneyim. Gözleri kapattığınızda asıl körlüğün ne olduğunu anlıyorsunuz.",
    likes: 14,
    replies: [
      {
        id: 'r1',
        userId: 'u3',
        userName: 'Elif Demir',
        userAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b',
        content: 'Buna kesinlikle katılıyorum. Roman boyunca asıl körlüğün fiziksel değil, ruhsal bir çürüme olduğu vurgulanmış.',
        timestamp: '2025',
        likes: 8
      },
      {
        id: 'r2',
        userId: 'u1',
        userName: 'Aylin Yılmaz',
        userAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
        content: 'Ben bunu daha çok sistemin ve toplumsal normların çöküşü olarak okudum. Çok etkileyici bir eserdi.',
        timestamp: '2026',
        likes: 12
      }
    ],
    duel: {
      opponentName: 'Elif Demir',
      opponentAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b',
      argument: "Bence asıl körlük gözleri kapattığında değil, gözleri açıkken gerçeği görememektir. Yazar aslında toplumun duyarsızlığını eleştiriyor, fiziksel kırılganlığı değil.",
      support: 24,
      oppose: 8
    }
  },
  {
    id: 's2',
    bookId: 'b3',
    userId: 'u3',
    userName: 'Elif Demir',
    userAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b',
    content: "Zamanın döngüselliği içinde kaybolmak... Bu kitabı her okuduğumda farklı bir detayı fark ediyorum.",
    likes: 28
  }
];

export const mockSwapNegotiations: SwapNegotiation[] = [
  {
    id: 'swap1',
    bookId: 'b1',
    requesterId: 'u1',
    ownerId: 'u2',
    status: 'pending',
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Merhaba, Körlük kitabını takaslamak ister misin?', timestamp: '10:00' }
    ]
  }
];

export const mockRooms: Room[] = [
  {
    id: 'room1',
    title: 'Pazar Sabahı Sessizliği',
    hostName: 'Elif Demir',
    hostAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b',
    participants: 12,
    maxParticipants: 20,
    time: 'Canlı (Şu an)',
    isLive: true,
    type: 'Sessiz Okuma'
  },
  {
    id: 'room2',
    title: 'Gece Vardiyası: Kara Roman',
    hostName: 'Caner Öz',
    hostAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    participants: 8,
    maxParticipants: 15,
    time: 'Bugün 23:30',
    isLive: false,
    type: 'Gece Okuması'
  },
  {
    id: 'room3',
    title: 'Saramago Üzerine',
    hostName: 'Aylin Yılmaz',
    hostAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    participants: 45,
    maxParticipants: 50,
    time: 'Yarın 20:00',
    isLive: false,
    type: 'Felsefe Tartışması'
  }
];
