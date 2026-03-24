
-- Add bio column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text DEFAULT '' NOT NULL;

-- Fix bidirectional contact visibility: allow users to see contacts where they are either user_id or contact_user_id
CREATE POLICY "Users can view contacts where they are involved"
ON public.contacts FOR SELECT TO authenticated
USING (auth.uid() = user_id OR auth.uid() = contact_user_id);

-- Drop old select policy
DROP POLICY IF EXISTS "Users can view own contacts" ON public.contacts;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars');
