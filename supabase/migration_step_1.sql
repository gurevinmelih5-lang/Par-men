-- ============================================
-- PARŞÖMEN: Aşama 1 Güvenlik Göç (Migration) Betiği
-- Hata almamak için tüm schema'yı değil, sadece bu değişiklikleri çalıştırın.
-- ============================================

-- 1. Eksik Sütunları Ekle (Eğer veritabanında yoksa)
-- Hata almamak için PostgreSQL 14+ IF NOT EXISTS kullanıyoruz.
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS total_pages INTEGER;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS current_page INTEGER;

-- 2. Zaman Kapsülü (Time Capsule) - Gizli Veri Tablosu
CREATE TABLE IF NOT EXISTS public.book_capsules (
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE PRIMARY KEY,
  message TEXT NOT NULL,
  from_name TEXT NOT NULL
);

-- 3. Güvenlik Kurallarını (RLS) Aktifleştir
ALTER TABLE public.book_capsules ENABLE ROW LEVEL SECURITY;

-- Book Capsules: Sadece kitap sahibi %100 okuma ilerlemesine ulaştığında okuyabilir
DROP POLICY IF EXISTS "Capsules viewable by owner at 100 progress" ON public.book_capsules;
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
DROP POLICY IF EXISTS "Users can insert own capsules" ON public.book_capsules;
CREATE POLICY "Users can insert own capsules" ON public.book_capsules 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.books b 
      WHERE b.id = book_id 
      AND b.owner_id = auth.uid()
    )
  );

-- 3. Swap Requests (Takas Talepleri) IDOR Açığını Kapatma
DROP POLICY IF EXISTS "Users can update requests" ON public.swap_requests;
CREATE POLICY "Users can update requests" ON public.swap_requests FOR UPDATE USING (auth.uid() = owner_id);

-- 4. Eski güvensiz sütunları books tablosundan kaldır
ALTER TABLE public.books DROP COLUMN IF EXISTS time_capsule_message;
ALTER TABLE public.books DROP COLUMN IF EXISTS time_capsule_from;
