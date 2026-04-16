
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  logo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams" ON public.teams
  FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.teams (name) VALUES ('Los Cabos United');
