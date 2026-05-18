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
  storyLocations?: {
    lat: number;
    lng: number;
    name: string;
    /** Mekânın kısa tanımı; haritada alıntı kartında gösterilir */
    description: string;
    /** Örn. "Ankara sahneleri" — «…» kitabında geçen … cümlesini tamamlar */
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
  bookId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  highlightedText?: string;
  likes: number;
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
  },
  lat: 41.0315,
  lng: 28.9810
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
    title: 'Masumiyet Müzesi',
    author: 'Orhan Pamuk',
    cover: 'https://images.unsplash.com/photo-1544252890-7d7e3dd74404?w=400',
    condition: 'Mint',
    pace: 'Slow',
    depth: 'High',
    ownerId: 'u3',
    distance: 0.8,
    lat: 41.0330,
    lng: 28.9800,
    lineage: [
      { city: 'İstanbul (Nişantaşı)', date: 'Ocak 2024', ownerName: 'Kemal B.' }
    ],
    dna: {
      readingHours: "20:00 - 00:00",
      emotion: "Tutkulu",
      emotionPercentage: 88,
      theme: "Aşk ve Takıntı",
      retentionDays: 30,
      demographics: "25-45 Yaş"
    },
    isLegendary: true,
    storyLocations: [
      { lat: 41.0312, lng: 28.9808, name: "Merhamet Apartmanı", sceneLabel: "Nişantaşı ve Teşvikiye sahneleri", description: "Kemal ile Füsun’un ilk kez baş başa kaldığı, her katı çocukluk hatıraları ve sırlar taşıyan meşhur apartman dairesi." },
      { lat: 41.0314, lng: 28.9796, name: "Masumiyet Müzesi (Çukurcuma)", sceneLabel: "Nişantaşı ve Teşvikiye sahneleri", description: "Kemal’in Füsun’a ait her türlü eşyayı 30 yıl boyunca saplantılı bir biçimde toplayarak ölümsüz bir aşk anıtına dönüştürdüğü çatı katı." },
      { lat: 41.0500, lng: 28.9950, name: "Şanzelize Butik", sceneLabel: "Nişantaşı ve Teşvikiye sahneleri", description: "Kemal’in vitrinde Füsun’u ilk gördüğü ve o ölümsüz saplantılı aşkın ilk kıvılcımının çaktığı butik." }
    ]
  },
  {
    id: 'b2',
    title: 'Cehennem (Inferno)',
    author: 'Dan Brown',
    cover: 'https://images.unsplash.com/photo-1533035353720-f1c6a75cd8ab?w=400',
    condition: 'Good',
    pace: 'Fast',
    depth: 'Medium',
    ownerId: 'u2',
    distance: 2.1,
    lat: 41.0082,
    lng: 28.9784,
    lineage: [
      { city: 'Floransa', date: 'Eylül 2024', ownerName: 'Robert L.' },
      { city: 'Venedik', date: 'Aralık 2024', ownerName: 'Sienna B.' },
      { city: 'İstanbul', date: 'Mart 2025', ownerName: 'Caner Öz' }
    ],
    timeCapsule: {
      message: "Şifreleri çözerken Yerebatan'da hissettiğim o gerilimi senin de yaşamanı umuyorum.",
      from: "Robert L."
    },
    dna: {
      readingHours: "18:00 - 23:00",
      emotion: "Gerilim",
      emotionPercentage: 92,
      theme: "Sır ve Kovalamaca",
      retentionDays: 8,
      demographics: "18-40 Yaş"
    },
    storyLocations: [
      { lat: 41.0084, lng: 28.9779, name: "Yerebatan Sarnıcı", sceneLabel: "Sultanahmet ve tarihi yarımada sahneleri", description: "Robert Langdon’ın, insanlığın yarısını yok edecek virüsün saklandığı çantayı bulmak için Medusa başının yanındaki sulara daldığı nefes kesici tarihi sarnıç." },
      { lat: 41.0086, lng: 28.9802, name: "Ayasofya", sceneLabel: "Sultanahmet ve tarihi yarımada sahneleri", description: "Robert Langdon’ın sarnıca giden yolu bulmak ve şifreleri çözmek için antik taşları incelediği o görkemli kubbe altı." },
      { lat: 41.0165, lng: 28.9705, name: "Mısır Çarşısı", sceneLabel: "Eminönü sahneleri", description: "Kovalamacanın nefes nefese devam ettiği, baharat kokuları arasında ajanların izini kaybettirdiği tarihi Eminönü çarşısı." }
    ]
  },
  {
    id: 'b3',
    title: 'İstanbul Hatırası',
    author: 'Ahmet Ümit',
    cover: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400',
    condition: 'Fair',
    pace: 'Medium',
    depth: 'High',
    ownerId: 'u2',
    distance: 3.5,
    lat: 41.0100,
    lng: 28.9700,
    lineage: [
      { city: 'İstanbul (Samatya)', date: 'Eylül 2025', ownerName: 'Ahmet T.' }
    ],
    dna: {
      readingHours: "21:00 - 02:00",
      emotion: "Gizemli",
      emotionPercentage: 78,
      theme: "Tarih ve Cinayet",
      retentionDays: 14,
      demographics: "20-55 Yaş"
    },
    storyLocations: [
      { lat: 41.0150, lng: 28.9850, name: "Sarayburnu (Atatürk Anıtı)", sceneLabel: "Sarayburnu ve deniz kenarı sahneleri", description: "Başkomiser Nevzat’ın, elinde antik Bizans sikkesiyle bulunan ilk kurbanın cesediyle karşılaşarak yedi tepeli gizemli cinayetler zincirine adım attığı sahil." },
      { lat: 41.0085, lng: 28.9715, name: "Çemberlitaş Sütunu", sceneLabel: "Fatih ve Çemberlitaş sahneleri", description: "Yedi tepeli şehrin gizemli katilinin, tarihe mesaj göndermek için ikinci Bizans sikkesini bıraktığı tarihi sütun gölgesi." },
      { lat: 40.9930, lng: 28.9220, name: "Yedikule Zindanları", sceneLabel: "Yedikule ve sur sahneleri", description: "Bizans imparatorluk döneminden bugüne uzanan intikam planlarının ve cinayetlerin düğüm noktalarından biri olan tarihî zindanlar." }
    ]
  },
  {
    id: 'b4',
    title: 'Bekle Beni',
    author: 'Livaneli',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    condition: 'Good',
    pace: 'Medium',
    depth: 'Medium',
    ownerId: 'u3',
    distance: 120,
    lat: 39.9208,
    lng: 32.8541,
    lineage: [{ city: 'Ankara', date: 'Haziran 2025', ownerName: 'Elif D.' }],
    storyLocations: [
      { lat: 39.9334, lng: 32.8597, name: "Kızılay", sceneLabel: "Ankara sahneleri", description: "Gri başkent kalabalığında devrimci gençlerin büyük umutları, buluşma heyecanları ve ayrılık acılarının kesiştiği o büyük meydan." },
      { lat: 39.9458, lng: 32.8361, name: "Anıtkabir", sceneLabel: "Ankara sahneleri", description: "Karakterlerin geçmişin sessiz tanıklığı ve değişen Türkiye’nin kaderiyle derin bir hüzünle yüzleştiği Aslanlı Yol." },
      { lat: 39.9147, lng: 32.8408, name: "Hamamönü", sceneLabel: "Ankara sahneleri", description: "Eski taş evler ve dar sokaklar arasında geçmişin anılarının, çocukluk özleminin canlandığı tarihi semt." }
    ]
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
