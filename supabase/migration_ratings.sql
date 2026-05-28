-- ============================================
-- PARŞÖMEN: Derecelendirme Sistemi Veritabanı Güncellemesi
-- ============================================
-- Bu dosyayı Supabase SQL Editöründe çalıştırın.

-- 1. Sütunların swap_requests tablosuna eklenmesi
ALTER TABLE public.swap_requests 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rating_owner_social INTEGER CHECK (rating_owner_social BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS rating_owner_physical INTEGER CHECK (rating_owner_physical BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS rating_requester_social INTEGER CHECK (rating_requester_social BETWEEN 1 AND 5);

-- 2. UPDATE politikalarının hem alıcı hem sahip için güncellenmesi
DROP POLICY IF EXISTS "Owners can update swap request status" ON public.swap_requests;
DROP POLICY IF EXISTS "Users can update requests" ON public.swap_requests;

CREATE POLICY "Parties can update swap requests" 
ON public.swap_requests 
FOR UPDATE 
USING (auth.uid() = owner_id OR auth.uid() = requester_id);

-- 3. Takas tamamlandığında completed_at alanını otomatik dolduran tetikleyici (trigger)
CREATE OR REPLACE FUNCTION public.handle_swap_request_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_swap_request_completed ON public.swap_requests;

CREATE TRIGGER on_swap_request_completed
  BEFORE UPDATE ON public.swap_requests
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_swap_request_completion();

-- 4. Puanlamayı güvenle işleyen ve karma puanlarını güncelleyen SECURITY DEFINER fonksiyonu (RPC)
CREATE OR REPLACE FUNCTION public.submit_swap_rating(
  p_swap_request_id UUID,
  p_rating_owner_social INTEGER DEFAULT NULL,
  p_rating_owner_physical INTEGER DEFAULT NULL,
  p_rating_requester_social INTEGER DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_requester_id UUID;
  v_owner_id UUID;
  v_status TEXT;
  v_social_points INTEGER;
  v_physical_points INTEGER;
BEGIN
  -- Takas talebi bilgilerini al
  SELECT requester_id, owner_id, status
  INTO v_requester_id, v_owner_id, v_status
  FROM public.swap_requests
  WHERE id = p_swap_request_id;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Takas talebi bulunamadı.';
  END IF;

  IF v_status != 'completed' THEN
    RAISE EXCEPTION 'Takas henüz tamamlanmadı.';
  END IF;

  -- Yetkilendirme kontrolü (Sadece takas tarafları derecelendirebilir)
  IF auth.uid() != v_requester_id AND auth.uid() != v_owner_id THEN
    RAISE EXCEPTION 'Unauthorized: Sadece takasın tarafları derecelendirme yapabilir.';
  END IF;

  -- 1. Alıcı (requester) kitabı teslim alan kişidir, sahibi (owner) puanlar
  IF auth.uid() = v_requester_id THEN
    -- Sahibin sosyal puanı
    IF p_rating_owner_social IS NOT NULL THEN
      IF EXISTS (SELECT 1 FROM public.swap_requests WHERE id = p_swap_request_id AND rating_owner_social IS NOT NULL) THEN
        RAISE EXCEPTION 'Daha önce bu takas için sahibi puanladınız.';
      END IF;

      UPDATE public.swap_requests
      SET rating_owner_social = p_rating_owner_social
      WHERE id = p_swap_request_id;

      v_social_points := CASE p_rating_owner_social
        WHEN 1 THEN -5
        WHEN 2 THEN -3
        WHEN 3 THEN 0
        WHEN 4 THEN 3
        WHEN 5 THEN 5
        ELSE 0
      END;

      UPDATE public.profiles
      SET karma_social = COALESCE(karma_social, 50) + v_social_points
      WHERE id = v_owner_id;
    END IF;

    -- Kitabın fiziksel kondisyon puanı
    IF p_rating_owner_physical IS NOT NULL THEN
      IF EXISTS (SELECT 1 FROM public.swap_requests WHERE id = p_swap_request_id AND rating_owner_physical IS NOT NULL) THEN
        RAISE EXCEPTION 'Daha önce bu takas için kitap fiziksel durumunu puanladınız.';
      END IF;

      UPDATE public.swap_requests
      SET rating_owner_physical = p_rating_owner_physical
      WHERE id = p_swap_request_id;

      v_physical_points := CASE p_rating_owner_physical
        WHEN 1 THEN -5
        WHEN 2 THEN -3
        WHEN 3 THEN 0
        WHEN 4 THEN 3
        WHEN 5 THEN 5
        ELSE 0
      END;

      UPDATE public.profiles
      SET karma_physical = COALESCE(karma_physical, 50) + v_physical_points
      WHERE id = v_owner_id;
    END IF;
  END IF;

  -- 2. Sahip (owner) kitabı teslim eden kişidir, alıcıyı (requester) puanlar
  IF auth.uid() = v_owner_id THEN
    IF p_rating_requester_social IS NOT NULL THEN
      IF EXISTS (SELECT 1 FROM public.swap_requests WHERE id = p_swap_request_id AND rating_requester_social IS NOT NULL) THEN
        RAISE EXCEPTION 'Daha önce bu takas için alıcıyı puanladınız.';
      END IF;

      UPDATE public.swap_requests
      SET rating_requester_social = p_rating_requester_social
      WHERE id = p_swap_request_id;

      v_social_points := CASE p_rating_requester_social
        WHEN 1 THEN -5
        WHEN 2 THEN -3
        WHEN 3 THEN 0
        WHEN 4 THEN 3
        WHEN 5 THEN 5
        ELSE 0
      END;

      UPDATE public.profiles
      SET karma_social = COALESCE(karma_social, 50) + v_social_points
      WHERE id = v_requester_id;
    END IF;
  END IF;

END;
$$;

REVOKE ALL ON FUNCTION public.submit_swap_rating(UUID, INTEGER, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_swap_rating(UUID, INTEGER, INTEGER, INTEGER) TO authenticated;
