-- ============================================
-- PARŞÖMEN: Konum (PostGIS) Senkronizasyon Güncellemesi
-- ============================================
-- Bu dosyayı Supabase SQL Editöründe çalıştırarak takas sırasındaki
-- kitap konum güncellemelerini aktif edebilirsiniz.

-- 1. İki Yönlü Takas Fonksiyonunun Güncellenmesi
CREATE OR REPLACE FUNCTION public.execute_two_way_book_swap(
  p_swap_request_id UUID,
  p_offered_book_id UUID,
  p_owner_city TEXT,
  p_requester_city TEXT,
  p_date TEXT
)
RETURNS void AS $$
DECLARE
  v_book_id UUID;
  v_requester_id UUID;
  v_owner_id UUID;
  v_requester_name TEXT;
  v_owner_name TEXT;
  v_requester_lat NUMERIC;
  v_requester_lng NUMERIC;
  v_owner_lat NUMERIC;
  v_owner_lng NUMERIC;
BEGIN
  -- 1. Takas talebi bilgilerini al
  SELECT book_id, requester_id, owner_id 
  INTO v_book_id, v_requester_id, v_owner_id
  FROM public.swap_requests
  WHERE id = p_swap_request_id;
  
  IF v_book_id IS NULL THEN
    RAISE EXCEPTION 'Takas talebi bulunamadı.';
  END IF;

  IF auth.uid() != v_owner_id THEN
    RAISE EXCEPTION 'Unauthorized: Only the book owner can accept and execute a swap.';
  END IF;

  -- IDOR Koruması: Karşıdan alınacak kitap gerçekten requester'a mı ait?
  IF NOT EXISTS (
    SELECT 1 FROM public.books 
    WHERE id = p_offered_book_id AND owner_id = v_requester_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: The offered book does not belong to the requester.';
  END IF;

  -- 2. Alıcı (requester) profil bilgilerini al
  SELECT name, lat, lng 
  INTO v_requester_name, v_requester_lat, v_requester_lng
  FROM public.profiles
  WHERE id = v_requester_id;

  -- 3. Sahip (owner) profil bilgilerini al
  SELECT name, lat, lng 
  INTO v_owner_name, v_owner_lat, v_owner_lng
  FROM public.profiles
  WHERE id = v_owner_id;

  -- 4. Kitap A'yı (talep edilen kitap) alıcıya (requester) devret ve konumunu güncelle
  UPDATE public.books
  SET owner_id = v_requester_id,
      lat = v_requester_lat,
      lng = v_requester_lng,
      location = CASE 
        WHEN v_requester_lat IS NOT NULL AND v_requester_lng IS NOT NULL 
        THEN ST_SetSRID(ST_MakePoint(v_requester_lng, v_requester_lat), 4326)::geography 
        ELSE NULL 
      END
  WHERE id = v_book_id;

  -- 5. Kitap B'yi (sunulan kitap) sahibe (owner) devret ve konumunu güncelle
  UPDATE public.books
  SET owner_id = v_owner_id,
      lat = v_owner_lat,
      lng = v_owner_lng,
      location = CASE 
        WHEN v_owner_lat IS NOT NULL AND v_owner_lng IS NOT NULL 
        THEN ST_SetSRID(ST_MakePoint(v_owner_lng, v_owner_lat), 4326)::geography 
        ELSE NULL 
      END
  WHERE id = p_offered_book_id;

  -- 6. Kitap A için yeni şecere (lineage) kaydı ekle
  INSERT INTO public.book_lineage (book_id, city, owner_name, date)
  VALUES (v_book_id, p_requester_city, v_requester_name, p_date);

  -- 7. Kitap B için yeni şecere (lineage) kaydı ekle
  INSERT INTO public.book_lineage (book_id, city, owner_name, date)
  VALUES (p_offered_book_id, p_owner_city, v_owner_name, p_date);

  -- 8. Takas talebini 'accepted' olarak güncelle ve offered_book_id'yi kaydet
  UPDATE public.swap_requests
  SET status = 'accepted',
      offered_book_id = p_offered_book_id
  WHERE id = p_swap_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Tek Yönlü Takas (swap_book) Fonksiyonunun Güncellenmesi
CREATE OR REPLACE FUNCTION public.swap_book(
  p_book_id UUID, 
  p_new_owner_id UUID, 
  p_owner_name TEXT, 
  p_city TEXT, 
  p_date TEXT
)
RETURNS void AS $$
  DECLARE
    v_current_owner UUID;
    v_new_lat NUMERIC;
    v_new_lng NUMERIC;
BEGIN
  -- 0. Authorization Check
  SELECT owner_id INTO v_current_owner FROM public.books WHERE id = p_book_id;
  IF v_current_owner IS NULL THEN
    RAISE EXCEPTION 'Book not found';
  END IF;
  
  IF v_current_owner != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Only the current owner can swap this book.';
  END IF;

  -- New owner's coordinates
  SELECT lat, lng INTO v_new_lat, v_new_lng FROM public.profiles WHERE id = p_new_owner_id;

  -- 1. Kitabın sahibini ve konumunu güncelle
  UPDATE public.books 
  SET owner_id = p_new_owner_id,
      lat = v_new_lat,
      lng = v_new_lng,
      location = CASE 
        WHEN v_new_lat IS NOT NULL AND v_new_lng IS NOT NULL 
        THEN ST_SetSRID(ST_MakePoint(v_new_lng, v_new_lat), 4326)::geography 
        ELSE NULL 
      END
  WHERE id = p_book_id;

  -- 2. Şecere tablosuna yeni bir yolculuk ekle
  INSERT INTO public.book_lineage (book_id, city, owner_name, date)
  VALUES (p_book_id, p_city, p_owner_name, p_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
