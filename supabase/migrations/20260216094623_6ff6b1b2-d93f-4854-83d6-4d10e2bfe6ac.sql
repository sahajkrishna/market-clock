
CREATE TABLE public.signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  device_user_id TEXT NOT NULL,
  timezone TEXT,
  selected_sessions TEXT[],
  alert_minutes_before INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (no auth required, device-based)
CREATE POLICY "Anyone can sign up" ON public.signups FOR INSERT WITH CHECK (true);

-- Allow reading own row by device_user_id (for checking if already signed up)
CREATE POLICY "Anyone can read signups" ON public.signups FOR SELECT USING (true);
