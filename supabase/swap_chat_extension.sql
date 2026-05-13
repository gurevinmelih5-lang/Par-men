-- Parşömen: Onaylı takas sohbeti — mesajlar ve sonlandırma
-- Supabase SQL Editor'de mevcut projeye uygulayın.
--
-- Realtime (isteğe bağlı): Dashboard > Database > Publications > supabase_realtime
-- içinde şu tabloların eklendiğinden emin olun: swap_requests, swap_messages

ALTER TABLE public.swap_requests
  ADD COLUMN IF NOT EXISTS chat_ended_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS chat_ended_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.swap_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  swap_request_id UUID NOT NULL REFERENCES public.swap_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_swap_messages_swap_request_id ON public.swap_messages(swap_request_id);
CREATE INDEX IF NOT EXISTS idx_swap_messages_created_at ON public.swap_messages(created_at);

ALTER TABLE public.swap_messages ENABLE ROW LEVEL SECURITY;

-- Taraflar onaylı takas için mesajları okuyabilir
CREATE POLICY "swap_messages_select_parties"
  ON public.swap_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.swap_requests sr
      WHERE sr.id = swap_request_id
        AND sr.status = 'accepted'
        AND (sr.owner_id = auth.uid() OR sr.requester_id = auth.uid())
    )
  );

-- Sohbet sonlandırılmamışken taraflar mesaj gönderebilir
CREATE POLICY "swap_messages_insert_open_chat"
  ON public.swap_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.swap_requests sr
      WHERE sr.id = swap_request_id
        AND sr.status = 'accepted'
        AND sr.chat_ended_by IS NULL
        AND (sr.owner_id = auth.uid() OR sr.requester_id = auth.uid())
    )
  );

-- İstek sahibi veya kitap sahibi sohbeti sonlandırır (yalnızca bu alanlar)
CREATE OR REPLACE FUNCTION public.end_swap_chat(p_swap_request_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.swap_requests
  SET chat_ended_by = auth.uid(),
      chat_ended_at = NOW()
  WHERE id = p_swap_request_id
    AND status = 'accepted'
    AND chat_ended_by IS NULL
    AND (owner_id = auth.uid() OR requester_id = auth.uid());
END;
$$;

REVOKE ALL ON FUNCTION public.end_swap_chat(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.end_swap_chat(UUID) TO authenticated;
