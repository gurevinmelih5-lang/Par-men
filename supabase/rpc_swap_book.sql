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
BEGIN
  -- 1. Kitabın sahibini güncelle
  UPDATE public.books 
  SET owner_id = p_new_owner_id 
  WHERE id = p_book_id;

  -- 2. Şecere tablosuna yeni bir yolculuk ekle
  INSERT INTO public.book_lineage (book_id, city, owner_name, date)
  VALUES (p_book_id, p_city, p_owner_name, p_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
