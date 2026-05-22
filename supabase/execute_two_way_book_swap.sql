-- ============================================
-- PARŞÖMEN: İki Yönlü Kitap Takası (Sahiplik, Konum ve Şecere Değişimi)
-- Bu dosyayı Supabase SQL Editöründe çalıştırın!
-- ============================================

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
      lng = v_requester_lng
  WHERE id = v_book_id;

  -- 5. Kitap B'yi (sunulan kitap) sahibe (owner) devret ve konumunu güncelle
  UPDATE public.books
  SET owner_id = v_owner_id,
      lat = v_owner_lat,
      lng = v_owner_lng
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
