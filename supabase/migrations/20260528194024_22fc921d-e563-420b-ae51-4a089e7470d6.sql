
-- Set immutable search_path on new helpers
CREATE OR REPLACE FUNCTION public.transactions_block_update()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'Las transacciones son inmutables. Para revertir un movimiento, crear una nueva transaccion tipo refund o adjustment.';
END; $$;

CREATE OR REPLACE FUNCTION public.transactions_block_delete()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'Las transacciones no se pueden eliminar. Son un ledger inmutable.';
END; $$;

CREATE OR REPLACE FUNCTION public.calculate_fan_zone_level(total_xp integer)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN total_xp >= 25000 THEN 6
    WHEN total_xp >= 12000 THEN 5
    WHEN total_xp >= 5000  THEN 4
    WHEN total_xp >= 2000  THEN 3
    WHEN total_xp >= 500   THEN 2
    ELSE 1
  END;
$$;

CREATE OR REPLACE FUNCTION public.get_level_name(level smallint)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE level
    WHEN 1 THEN 'Visitante'
    WHEN 2 THEN 'Local'
    WHEN 3 THEN 'Cabeño'
    WHEN 4 THEN 'Amo'
    WHEN 5 THEN 'Amo del Paraíso'
    WHEN 6 THEN 'Leyenda del Paraíso'
    ELSE 'Visitante'
  END;
$$;

-- Restrict economic SECURITY DEFINER functions to authenticated callers
REVOKE EXECUTE ON FUNCTION public.award_points_v2(uuid, integer, integer, text, text, text, boolean) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.award_points_v2(uuid, integer, integer, text, text, text, boolean) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.spend_cabo_coins(uuid, integer, text, text, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.spend_cabo_coins(uuid, integer, text, text, text) TO authenticated, service_role;
