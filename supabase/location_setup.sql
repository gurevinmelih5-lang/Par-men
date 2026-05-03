-- Parşömen Konum (Geolocation) Güncellemesi

-- 1. Profiles tablosuna koordinat sütunları ekleme
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS lat NUMERIC,
ADD COLUMN IF NOT EXISTS lng NUMERIC;

-- 2. Books tablosuna koordinat sütunları ekleme
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS lat NUMERIC,
ADD COLUMN IF NOT EXISTS lng NUMERIC;

-- (İsteğe bağlı) Konum verilerini temizlemek istersen:
-- UPDATE public.profiles SET lat = NULL, lng = NULL;
-- UPDATE public.books SET lat = NULL, lng = NULL;
