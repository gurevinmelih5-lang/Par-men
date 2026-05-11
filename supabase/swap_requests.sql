-- ============================================
-- PARSOMEN: Takas İstekleri Tablosu
-- Bu dosyayı Supabase SQL Editöründe çalıştır!
-- ============================================

-- Takas İstekleri Tablosu
CREATE TABLE IF NOT EXISTS public.swap_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Güvenlik
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi isteklerini veya kendi kitaplarına gelen istekleri görebilir
CREATE POLICY "Users can view relevant swap requests" ON public.swap_requests
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = owner_id);

-- Sadece requester insert edebilir
CREATE POLICY "Users can insert swap requests" ON public.swap_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Kitap sahibi durumu güncelleyebilir (kabul/red)
CREATE POLICY "Owners can update swap request status" ON public.swap_requests
  FOR UPDATE USING (auth.uid() = owner_id);
