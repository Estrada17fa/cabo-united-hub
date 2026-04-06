
-- Create match status enum
CREATE TYPE public.match_status AS ENUM ('scheduled', 'live', 'finished');

-- Create match source enum
CREATE TYPE public.match_source AS ENUM ('manual', 'scraped');

-- Create event type enum
CREATE TYPE public.match_event_type AS ENUM ('goal', 'yellow_card', 'red_card', 'substitution', 'penalty', 'own_goal');

-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season TEXT NOT NULL DEFAULT '2024-2025',
  jornada INTEGER,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  match_date DATE NOT NULL,
  match_time TIME,
  venue TEXT,
  status public.match_status NOT NULL DEFAULT 'scheduled',
  is_home_game BOOLEAN NOT NULL DEFAULT true,
  source public.match_source NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create match_events table
CREATE TABLE public.match_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  minute INTEGER NOT NULL,
  event_type public.match_event_type NOT NULL,
  player_name TEXT,
  team TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

-- Public read access for matches
CREATE POLICY "Anyone can view matches" ON public.matches
  FOR SELECT TO anon, authenticated USING (true);

-- Public read access for match_events
CREATE POLICY "Anyone can view match events" ON public.match_events
  FOR SELECT TO anon, authenticated USING (true);

-- Admin write via service role (edge functions use service role key)
-- No insert/update/delete policies for regular users - only edge functions with service role can write
