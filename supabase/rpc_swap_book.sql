-- Parşömen: Takas İşlemini Güvenli Hale Getiren RPC Fonksiyonu
-- Bu fonksiyon SECURITY DEFINER ile çalışır, böylece RLS kısıtlamalarını aşarak
-- bir kitabın sahibini değiştirebilir ve şeceresini (lineage) güvenle güncelleyebilir.

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
