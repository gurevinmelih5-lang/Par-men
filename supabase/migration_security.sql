-- ============================================
-- PARŞÖMEN: Güvenlik ve RLS Güncelleme (Migration)
-- ============================================
-- NOT: Bu dosya mevcut veritabanınızı bozmadan sadece gerekli GÜVENLİK eklemelerini yapar.
-- Tümünü kopyalayıp Supabase SQL Editöründe çalıştırın.

-- 1. Swap Requests tablosuna yeni sütunu ekle (Eğer yoksa)
ALTER TABLE public.swap_requests 
ADD COLUMN IF NOT EXISTS offered_book_id UUID REFERENCES public.books(id) ON DELETE CASCADE;

-- 2. Status CHECK kısıtlamasını güncelle ('completed' durumunu ekle)
-- Önce eski kısıtlamayı kaldırıyoruz (Eğer standart isimle oluşturulduysa)
ALTER TABLE public.swap_requests DROP CONSTRAINT IF EXISTS swap_requests_status_check;
-- Sonra yeni kısıtlamayı ekliyoruz
ALTER TABLE public.swap_requests ADD CONSTRAINT swap_requests_status_check CHECK (status IN ('pending', 'accepted', 'rejected', 'completed'));

-- 3. Takas İptali (DELETE) RLS Politikalarını Ekle
DROP POLICY IF EXISTS "Users can delete own requests" ON public.swap_requests;
DROP POLICY IF EXISTS "Users can delete own swap requests" ON public.swap_requests;
CREATE POLICY "Users can delete own swap requests" ON public.swap_requests FOR DELETE USING (auth.uid() = requester_id);

-- 4. Kolon Bazlı Güvenlik (Hile Engelleme - Revoke)
REVOKE UPDATE (karma_physical, karma_intellectual, karma_social) ON public.profiles FROM authenticated, anon;
REVOKE UPDATE (likes) ON public.scriptums FROM authenticated, anon;
REVOKE UPDATE (support_count, oppose_count) ON public.scriptum_duels FROM authenticated, anon;
REVOKE UPDATE (progress) ON public.books FROM authenticated, anon;
REVOKE UPDATE (book_id, requester_id, owner_id) ON public.swap_requests FROM authenticated, anon;
