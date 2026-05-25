-- ============================================
-- PARŞÖMEN: Aşama 4 Altyapı - PostGIS Kurulumu
-- ============================================

-- 1. PostGIS Eklentisini Aktif Et
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Profiller Tablosuna Konum Sütunu Ekle (Geography tipi)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location geography(POINT, 4326);

-- 3. Kitaplar Tablosuna Konum Sütunu Ekle (Geography tipi)
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS location geography(POINT, 4326);

-- 4. Kitap Uzaklık Hesaplama Fonksiyonu
-- Verilen enlem ve boylama göre kitapları uzaklıklarıyla (km) birlikte döndürür
CREATE OR REPLACE FUNCTION get_books_within_distance(
  lat float,
  lon float,
  max_distance_km float DEFAULT 50000 -- Varsayılan sınır
)
RETURNS TABLE (
  id uuid,
  title text,
  author text,
  cover_url text,
  condition text,
  distance_km float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.author,
    b.cover_url,
    b.condition,
    (ST_Distance(
      b.location,
      ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
    ) / 1000.0) as distance_km
  FROM public.books b
  WHERE b.location IS NOT NULL
  AND ST_Distance(
    b.location,
    ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
  ) <= (max_distance_km * 1000);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
