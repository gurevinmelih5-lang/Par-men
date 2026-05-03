-- Parşömen Örnek İçerik Yükleyici (Seed Data)

-- 1. İki adet sahte kullanıcı (Auth + Profile) ekleyelim.
-- NOT: auth.users tablosuna kayıt atıldığında yazdığımız trigger (tetikleyici) otomatik olarak profiles tablosunu dolduracak.
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'caner@parsomen.com', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Caner Öz", "avatar_url": "https://i.pravatar.cc/150?u=caner"}', now(), now(), '', '', '', ''),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'elif@parsomen.com', 'dummy_hash', now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Elif Demir", "avatar_url": "https://i.pravatar.cc/150?u=elif"}', now(), now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Trigger'ın profiles'ı oluşturmasını ufak bir saniye bekleme şansımız yok ama genelde anında oluşur. 
-- Aşağıdaki kitaplarda owner_id olarak bu sahte ID'leri kullanacağız.

-- 2. Profillerin konumlarını Kadıköy ve Beşiktaş civarı yapalım ki sana yakın/uzak görünsünler.
UPDATE public.profiles SET lat = 40.990, lng = 29.020, karma_physical = 85, karma_intellectual = 90 WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET lat = 41.042, lng = 29.002, karma_physical = 75, karma_intellectual = 95 WHERE id = '22222222-2222-2222-2222-222222222222';

-- 3. Örnek Kitaplar
INSERT INTO public.books (id, title, author, cover_url, condition, pace, depth, owner_id, lat, lng, time_capsule_message, time_capsule_from)
VALUES
('33333333-3333-3333-3333-333333333333', '1984', 'George Orwell', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400', 'Good', 'Medium', 'High', '11111111-1111-1111-1111-111111111111', 40.990, 29.020, 'Büyük Birader her zaman seni izliyor. Bu kitabı okurken kameranı bantlamak isteyebilirsin.', 'Caner Öz'),
('44444444-4444-4444-4444-444444444444', 'Otostopçunun Galaksi Rehberi', 'Douglas Adams', 'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?auto=format&fit=crop&q=80&w=400', 'Mint', 'Fast', 'Medium', '22222222-2222-2222-2222-222222222222', 41.042, 29.002, 'Panik Yapma! Ve havlunu yanından asla ayırma.', 'Elif Demir'),
('55555555-5555-5555-5555-555555555555', 'Fahrenheit 451', 'Ray Bradbury', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400', 'Fair', 'Fast', 'High', '11111111-1111-1111-1111-111111111111', 40.990, 29.020, NULL, NULL),
('66666666-6666-6666-6666-666666666666', 'Yüzyıllık Yalnızlık', 'Gabriel García Márquez', 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400', 'Poor', 'Slow', 'High', '22222222-2222-2222-2222-222222222222', 41.042, 29.002, 'Macondo yağmurlarında kaybolmak harikaydı.', 'Elif Demir')
ON CONFLICT (id) DO NOTHING;

-- 4. Biraz Şecere (Yolculuk) Geçmişi Ekleyelim
INSERT INTO public.book_lineage (book_id, city, owner_name, date)
VALUES
('33333333-3333-3333-3333-333333333333', 'Ankara', 'Ahmet Y.', 'Ekim 2024'),
('33333333-3333-3333-3333-333333333333', 'İstanbul (Kadıköy)', 'Caner Öz', 'Nisan 2026'),
('44444444-4444-4444-4444-444444444444', 'İzmir', 'Ayşe K.', 'Ocak 2025'),
('44444444-4444-4444-4444-444444444444', 'İstanbul (Beşiktaş)', 'Elif Demir', 'Mart 2026');

-- 5. Ve birkaç Scriptum (Not/Katman)
INSERT INTO public.scriptums (book_id, user_id, content, highlighted_text, likes)
VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Distopya okumayı seviyorsanız bu tam bir başyapıt. Her sayfası ayrı bir sorgulama.', 'tam bir başyapıt', 42),
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Cevabın 42 olduğunu öğrendiğimde koca bir kahkaha attım. Bilimkurgu ve mizahın kusursuz birleşimi.', 'Bilimkurgu ve mizahın kusursuz birleşimi', 28),
('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Soy ağacını takip etmek zor olsa da, atmosferi insanı içine çekiyor.', NULL, 15);
