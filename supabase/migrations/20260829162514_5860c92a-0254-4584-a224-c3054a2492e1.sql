ALTER TABLE public.players
  ADD COLUMN goals integer,
  ADD COLUMN matches_played integer,
  ADD COLUMN birth_date date,
  ADD COLUMN nationality text,
  ADD COLUMN birth_place text;