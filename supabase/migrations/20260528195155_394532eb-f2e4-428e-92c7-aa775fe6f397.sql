
-- ============ Extender app_role enum ============
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'business';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'user';

-- ============ Extender level_status_enum con 'at_risk' y 'demoted' ============
ALTER TYPE public.level_status_enum ADD VALUE IF NOT EXISTS 'at_risk';
ALTER TYPE public.level_status_enum ADD VALUE IF NOT EXISTS 'demoted';
