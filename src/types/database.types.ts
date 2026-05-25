export interface DBProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  karma_physical: number;
  karma_intellectual: number;
  karma_social: number;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface DBLineage {
  id: string;
  book_id: string;
  city: string;
  owner_name: string;
  date: string;
  created_at: string;
}

export interface DBBookCapsule {
  book_id: string;
  message: string;
  from_name: string;
}

export interface DBBook {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  genre: string;
  condition: string;
  pace: string;
  depth: string;
  progress: number;
  total_pages: number | null;
  current_page: number | null;
  owner_id: string;
  distance_km: number;
  lat: number | null;
  lng: number | null;
  created_at: string;
  book_lineage?: DBLineage[];
  book_capsules?: DBBookCapsule[];
  profiles?: Partial<DBProfile>;
}

export interface DBDuel {
  id: string;
  scriptum_id: string;
  opponent_id: string;
  argument: string;
  support_count: number;
  oppose_count: number;
  created_at: string;
  profiles?: Partial<DBProfile>;
}

export interface DBReply {
  id: string;
  scriptum_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Partial<DBProfile>;
}

export interface DBScriptum {
  id: string;
  book_id: string | null;
  custom_book_title: string | null;
  custom_book_author: string | null;
  user_id: string;
  content: string;
  highlighted_text: string | null;
  likes: number;
  created_at: string;
  profiles?: Partial<DBProfile>;
  scriptum_duels?: DBDuel[];
  scriptum_replies?: DBReply[];
  scriptum_likes?: { user_id: string }[];
}
