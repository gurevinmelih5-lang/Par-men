-- Supabase Storage Setup for Parşömen

-- 1. 'book-covers' adında public bir bucket (kova) oluştur
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Herkesin okuyabilmesi için politika (Policy)
CREATE POLICY "Kapak görsellerini herkes görebilir"
ON storage.objects FOR SELECT
USING (bucket_id = 'book-covers');

-- 3. Sadece giriş yapmış kullanıcıların görsel yükleyebilmesi için politika
CREATE POLICY "Giriş yapmış kullanıcılar görsel yükleyebilir"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'book-covers' AND
  auth.role() = 'authenticated'
);

-- 4. Kullanıcıların kendi yükledikleri görselleri silebilmesi veya güncelleyebilmesi için
CREATE POLICY "Kullanıcılar kendi görsellerini güncelleyebilir"
ON storage.objects FOR UPDATE
USING (bucket_id = 'book-covers' AND auth.uid() = owner);

CREATE POLICY "Kullanıcılar kendi görsellerini silebilir"
ON storage.objects FOR DELETE
USING (bucket_id = 'book-covers' AND auth.uid() = owner);
