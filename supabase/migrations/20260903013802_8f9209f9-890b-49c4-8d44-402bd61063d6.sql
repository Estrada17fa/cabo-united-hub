-- Trigger-only functions: not callable from the API at all
REVOKE ALL ON FUNCTION public.sync_subscription_tier() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_subscription_to_fan_pass() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.update_level_on_xp() FROM anon, authenticated;

-- Point-granting / mutation helpers: server-side only (service_role / definer callers)
REVOKE ALL ON FUNCTION public.award_points(uuid, integer, integer, tx_type, text, text) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.award_points_v2(uuid, integer, integer, text, text, text, boolean) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_mission(uuid, text) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.spend_cabo_coins(uuid, integer, text, text, text) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.recalculate_standings(text) FROM anon, authenticated;

-- Admin-guarded functions: no anon access
REVOKE ALL ON FUNCTION public.admin_list_fan_passes() FROM anon;
REVOKE ALL ON FUNCTION public.run_level_at_risk_warning() FROM anon;
REVOKE ALL ON FUNCTION public.run_level_demotion_check() FROM anon;
REVOKE ALL ON FUNCTION public.run_subscription_expiry_check() FROM anon;

-- Role/identity helpers: signed-in only
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.is_super_admin(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.is_minor_user(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.business_location_id(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.check_level_maintenance(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.record_game_play(text, integer, jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.redeem_reward(uuid) FROM anon;

-- Keep intentionally public (needed before sign-in / public leaderboard)
GRANT EXECUTE ON FUNCTION public.check_username_available(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(integer) TO anon, authenticated;