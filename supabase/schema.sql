-- Parşömen Supabase Schema

-- ==========================================
-- 1. Tablo Oluşturma (Tables)
-- ==========================================

-- Kullanıcılar tablosu (Supabase Auth 'users' tablosu ile senkronize olacak)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  karma_physical INTEGER DEFAULT 50,
  karma_intellectual INTEGER DEFAULT 50,
  karma_social INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Kitaplar tablosu
CREATE TABLE public.books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  condition TEXT CHECK (condition IN ('Mint', 'Good', 'Fair', 'Poor')) DEFAULT 'Good',
  pace TEXT CHECK (pace IN ('Slow', 'Medium', 'Fast')) DEFAULT 'Medium',
  depth TEXT CHECK (depth IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
  progress INTEGER DEFAULT 0,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  distance_km NUMERIC DEFAULT 0, -- Şimdilik statik tutuyoruz, gerçekte PostGIS ile hesaplanacak
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Kitap Yolculuğu (Lineage)
CREATE TABLE public.book_lineage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  city TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Marjinal Notlar (Scriptums)
CREATE TABLE public.scriptums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  highlighted_text TEXT,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Yorumlar (Scriptum Replies)
CREATE TABLE public.scriptum_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scriptum_id UUID REFERENCES public.scriptums(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Gönderi Beğenileri (Scriptum Likes)
CREATE TABLE public.scriptum_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scriptum_id UUID REFERENCES public.scriptums(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(scriptum_id, user_id)
);

-- Fikir Düellosu (Scriptum Duels)
CREATE TABLE public.scriptum_duels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scriptum_id UUID REFERENCES public.scriptums(id) ON DELETE CASCADE UNIQUE NOT NULL,
  opponent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  argument TEXT NOT NULL,
  support_count INTEGER DEFAULT 0,
  oppose_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Takas Talepleri (Swap Requests)
CREATE TABLE public.swap_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  offered_book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Zaman Kapsülü (Time Capsule) - Gizli Veri
CREATE TABLE public.book_capsules (
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE PRIMARY KEY,
  message TEXT NOT NULL,
  from_name TEXT NOT NULL
);

-- ==========================================
-- 2. Row Level Security (RLS) - Güvenlik Kuralları
-- ==========================================

-- RLS'yi Aktif Et
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_lineage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scriptums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scriptum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scriptum_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scriptum_duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_capsules ENABLE ROW LEVEL SECURITY;

-- Profiller: Herkes herkesin profilini okuyabilir (Read)
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
-- Sadece kişi kendi profilini güncelleyebilir
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Kitaplar: Herkes tüm kitapları görebilir
CREATE POLICY "Books are viewable by everyone" ON public.books FOR SELECT USING (true);
-- Sadece kitap sahibi yeni kitap ekleyebilir, güncelleyebilir veya silebilir
CREATE POLICY "Users can insert own books" ON public.books FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own books" ON public.books FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own books" ON public.books FOR DELETE USING (auth.uid() = owner_id);

-- Book Capsules: Sadece kitap sahibi %100 okuma ilerlemesine ulaştığında okuyabilir
CREATE POLICY "Capsules viewable by owner at 100 progress" ON public.book_capsules 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.books b 
      WHERE b.id = book_id 
      AND b.owner_id = auth.uid() 
      AND b.progress >= 100
    )
  );
-- Sadece kitabın anlık sahibi kapsül ekleyebilir
CREATE POLICY "Users can insert own capsules" ON public.book_capsules 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.books b 
      WHERE b.id = book_id 
      AND b.owner_id = auth.uid()
    )
  );

-- Lineage: Herkes okuyabilir
CREATE POLICY "Lineage is viewable by everyone" ON public.book_lineage FOR SELECT USING (true);

-- Scriptums: Herkes okuyabilir
CREATE POLICY "Scriptums are viewable by everyone" ON public.scriptums FOR SELECT USING (true);
-- Kullanıcı sadece kendi scriptum'unu yazabilir
CREATE POLICY "Users can insert own scriptums" ON public.scriptums FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scriptums" ON public.scriptums FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scriptums" ON public.scriptums FOR DELETE USING (auth.uid() = user_id);

-- Yorumlar (Replies): Herkes okuyabilir
CREATE POLICY "Replies are viewable by everyone" ON public.scriptum_replies FOR SELECT USING (true);
CREATE POLICY "Users can insert own replies" ON public.scriptum_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own replies" ON public.scriptum_replies FOR DELETE USING (auth.uid() = user_id);

-- Beğeniler (Likes): Herkes görebilir, sadece kullanıcı kendi beğenisini ekleyip silebilir
CREATE POLICY "Likes are viewable by everyone" ON public.scriptum_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON public.scriptum_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.scriptum_likes FOR DELETE USING (auth.uid() = user_id);

-- Düellolar: Herkes okuyabilir
CREATE POLICY "Duels are viewable by everyone" ON public.scriptum_duels FOR SELECT USING (true);
-- Düello oluşturan kişi kendi düellosunu yönetebilir
CREATE POLICY "Users can manage own duels" ON public.scriptum_duels FOR ALL USING (auth.uid() = opponent_id);

-- Swap Requests (Takas Talepleri)
CREATE POLICY "Swap requests viewable by parties" ON public.swap_requests FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = owner_id);
CREATE POLICY "Users can create swap requests" ON public.swap_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update requests" ON public.swap_requests FOR UPDATE USING (auth.uid() = owner_id);

-- ==========================================
-- 3. Otomatik Kullanıcı Profili Oluşturma (Trigger)
-- ==========================================
-- Supabase Auth sistemine yeni biri kayıt olduğunda otomatik olarak 'profiles' tablosuna eklenir.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Yeni Okur'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://i.pravatar.cc/150')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Beğeni Tetikleyicisi (Trigger)
CREATE OR REPLACE FUNCTION public.handle_scriptum_like()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.scriptums
    SET likes = likes + 1
    WHERE id = NEW.scriptum_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.scriptums
    SET likes = GREATEST(0, likes - 1)
    WHERE id = OLD.scriptum_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_scriptum_like_added_or_removed
  AFTER INSERT OR DELETE ON public.scriptum_likes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_scriptum_like();
