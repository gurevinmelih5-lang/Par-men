-- ============================================
-- PARŞÖMEN: İki Yönlü Kitap Takası Talebi Kabul Etme
-- Bu fonksiyon takas talebini kabul eder ve offered_book_id'yi kaydeder.
-- Gerçek sahiplik değişimi ve şecere ekleme işlemleri, buluşma sırasında
-- 6 haneli kod doğrulandığında complete_two_way_book_swap fonksiyonu ile yapılacaktır.
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
    RAISE EXCEPTION 'Unauthorized: Sadece kitap sahibi takası kabul edebilir.';
  END IF;

  -- IDOR Koruması: Karşıdan alınacak kitap gerçekten requester'a mı ait?
  IF NOT EXISTS (
    SELECT 1 FROM public.books 
    WHERE id = p_offered_book_id AND owner_id = v_requester_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Önerilen kitap istek sahibine ait değil.';
  END IF;

  -- 2. Takas talebini 'accepted' olarak güncelle ve offered_book_id'yi kaydet
  UPDATE public.swap_requests
  SET status = 'accepted',
      offered_book_id = p_offered_book_id
  WHERE id = p_swap_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
