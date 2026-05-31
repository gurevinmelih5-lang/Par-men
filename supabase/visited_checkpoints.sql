-- ============================================
-- PARŞÖMEN: Gezgin Modu Ziyaret Takip Sistemi ve Puanlama
-- Bu dosyayı Supabase SQL Editöründe çalıştırın.
-- ============================================

-- 1. Ziyaret edilen edebi durakları kaydeden tablo
CREATE TABLE IF NOT EXISTS public.visited_checkpoints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  checkpoint_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, checkpoint_key)
);

-- 2. Row Level Security (RLS) Ayarları
ALTER TABLE public.visited_checkpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select their own visited checkpoints" 
ON public.visited_checkpoints 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visited checkpoints" 
ON public.visited_checkpoints 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Ziyareti güvenli bir şekilde işleyen ve karma artıran RPC fonksiyonu
CREATE OR REPLACE FUNCTION public.check_in_at_checkpoint(p_checkpoint_key TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_intellectual INTEGER;
BEGIN
  -- Giriş yapan kullanıcının ID'sini al
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Lütfen giriş yapın.';
  END IF;

  -- Ziyaretin daha önce yapılıp yapılmadığını doğrula
  IF EXISTS (
    SELECT 1 FROM public.visited_checkpoints 
    WHERE user_id = v_user_id AND checkpoint_key = p_checkpoint_key
  ) THEN
    RAISE EXCEPTION 'Bu mekânı zaten ziyaret ettiniz.';
  END IF;

  -- Ziyaret kaydını ekle
  INSERT INTO public.visited_checkpoints (user_id, checkpoint_key)
  VALUES (v_user_id, p_checkpoint_key);

  -- Mevcut entelektüel karmayı alıp 15 puan ekle
  SELECT COALESCE(karma_intellectual, 50) INTO v_current_intellectual
  FROM public.profiles
  WHERE id = v_user_id;

  v_current_intellectual := v_current_intellectual + 15;

  -- Profiles tablosunu güncelle
  UPDATE public.profiles
  SET karma_intellectual = v_current_intellectual
  WHERE id = v_user_id;

  RETURN v_current_intellectual;
END;
$$;

-- 4. Fonksiyon yetkilendirmesi
REVOKE ALL ON FUNCTION public.check_in_at_checkpoint(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_in_at_checkpoint(TEXT) TO authenticated;
