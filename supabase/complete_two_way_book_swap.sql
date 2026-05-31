-- ============================================
-- PARŞÖMEN: İki Yönlü Kitap Takasını Tamamlama (Doğrulama Sonrası)
-- Bu fonksiyon 6 haneli kod doğrulandığında ve mesafe kontrolü geçildiğinde çağrılır.
-- Kitapların sahipliğini, konumlarını değiştirir, şecereleri ekler ve karmaları günceller.
-- ============================================

CREATE OR REPLACE FUNCTION public.complete_two_way_book_swap(
  p_swap_request_id UUID,
  p_owner_city TEXT,
  p_requester_city TEXT,
  p_date TEXT
)
RETURNS void AS $$
DECLARE
  v_book_id UUID;
  v_offered_book_id UUID;
  v_requester_id UUID;
  v_owner_id UUID;
  
  v_requester_name TEXT;
  v_owner_name TEXT;
  v_requester_lat NUMERIC;
  v_requester_lng NUMERIC;
  v_owner_lat NUMERIC;
  v_owner_lng NUMERIC;
  
  v_status TEXT;
BEGIN
  -- 1. Takas talebi bilgilerini al
  SELECT book_id, offered_book_id, requester_id, owner_id, status
  INTO v_book_id, v_offered_book_id, v_requester_id, v_owner_id, v_status
  FROM public.swap_requests
  WHERE id = p_swap_request_id;
  
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Takas talebi bulunamadı.';
  END IF;

  IF v_status != 'accepted' THEN
    RAISE EXCEPTION 'Takas talebi kabul edilmiş durumda değil. Mevcut durum: %', v_status;
  END IF;

  -- Yetki Kontrolü: Sadece takas tarafları işlemi tamamlayabilir
  IF auth.uid() != v_owner_id AND auth.uid() != v_requester_id THEN
    RAISE EXCEPTION 'Unauthorized: Sadece takasın tarafları işlemi tamamlayabilir.';
  END IF;

  IF v_offered_book_id IS NULL THEN
    RAISE EXCEPTION 'Takas için önerilen karşı kitap bulunamadı.';
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
  WHERE id = v_offered_book_id;

  -- 6. Kitap A için yeni şecere (lineage) kaydı ekle
  INSERT INTO public.book_lineage (book_id, city, owner_name, date)
  VALUES (v_book_id, p_requester_city, v_requester_name, p_date);

  -- 7. Kitap B için yeni şecere (lineage) kaydı ekle
  INSERT INTO public.book_lineage (book_id, city, owner_name, date)
  VALUES (v_offered_book_id, p_owner_city, v_owner_name, p_date);

  -- 8. Takas talebinin durumunu 'completed' olarak güncelle (Tetikleyici completed_at doldurur)
  UPDATE public.swap_requests
  SET status = 'completed'
  WHERE id = p_swap_request_id;

  -- 9. Karma puanlarını güncelle (Fiziksel karma +5, Sosyal karma +10)
  -- Sahip için günceleme
  UPDATE public.profiles
  SET karma_physical = COALESCE(karma_physical, 50) + 5,
      karma_social = COALESCE(karma_social, 50) + 10
  WHERE id = v_owner_id;

  -- Alıcı için güncelleme
  UPDATE public.profiles
  SET karma_physical = COALESCE(karma_physical, 50) + 5,
      karma_social = COALESCE(karma_social, 50) + 10
  WHERE id = v_requester_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonksiyon yetkilendirmesi
REVOKE ALL ON FUNCTION public.complete_two_way_book_swap(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_two_way_book_swap(UUID, TEXT, TEXT, TEXT) TO authenticated;
