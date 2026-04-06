
-- Create league_standings table
CREATE TABLE public.league_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team TEXT NOT NULL,
  pos INTEGER NOT NULL DEFAULT 0,
  jj INTEGER NOT NULL DEFAULT 0,
  jg INTEGER NOT NULL DEFAULT 0,
  je INTEGER NOT NULL DEFAULT 0,
  jp INTEGER NOT NULL DEFAULT 0,
  gf INTEGER NOT NULL DEFAULT 0,
  gc INTEGER NOT NULL DEFAULT 0,
  dg INTEGER NOT NULL DEFAULT 0,
  pts INTEGER NOT NULL DEFAULT 0,
  group_name TEXT,
  season TEXT NOT NULL DEFAULT '2024-2025',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create top_scorers table
CREATE TABLE public.top_scorers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  team TEXT NOT NULL,
  goals INTEGER NOT NULL DEFAULT 0,
  season TEXT NOT NULL DEFAULT '2024-2025',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.league_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_scorers ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view standings" ON public.league_standings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can view top scorers" ON public.top_scorers FOR SELECT TO anon, authenticated USING (true);
