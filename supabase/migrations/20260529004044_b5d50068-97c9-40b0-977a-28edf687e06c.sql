-- =========================================================
-- stripe_products: mapping tier -> price_id (source of truth for UI/checkout)
-- =========================================================
CREATE TABLE public.stripe_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier subscription_tier_enum NOT NULL UNIQUE,
  stripe_product_id text NOT NULL,
  stripe_price_id text NOT NULL,
  amount_mxn integer NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.stripe_products TO authenticated;
GRANT SELECT ON public.stripe_products TO anon;
GRANT ALL ON public.stripe_products TO service_role;

ALTER TABLE public.stripe_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON public.stripe_products FOR SELECT
  USING (active = true);

CREATE POLICY "Super admins manage products"
  ON public.stripe_products FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- Seed: human-readable lookup_keys created via batch_create_product
INSERT INTO public.stripe_products (tier, stripe_product_id, stripe_price_id, amount_mxn) VALUES
  ('GOLD'::subscription_tier_enum,    'abono_gold',    'abono_gold_anual',    1499),
  ('PREMIUM'::subscription_tier_enum, 'abono_premium', 'abono_premium_anual', 2499),
  ('PLATINO'::subscription_tier_enum, 'abono_platino', 'abono_platino_anual', 4999);

-- =========================================================
-- stripe_webhook_events: idempotency ledger
-- =========================================================
CREATE TABLE public.stripe_webhook_events (
  id text PRIMARY KEY,            -- Stripe event.id (e.g. evt_xxx)
  type text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT true,
  error_message text
);

GRANT SELECT ON public.stripe_webhook_events TO authenticated;
GRANT ALL ON public.stripe_webhook_events TO service_role;

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read webhook events"
  ON public.stripe_webhook_events FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- =========================================================
-- subscriptions: live state per knowledge file
-- =========================================================
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  product_id text NOT NULL,
  price_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- =========================================================
-- Helper: safety-net cron to downgrade expired subscriptions
-- =========================================================
CREATE OR REPLACE FUNCTION public.run_subscription_expiry_check()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  v_count integer := 0;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden: requires admin role';
  END IF;

  FOR r IN
    SELECT id, subscription_tier
      FROM public.profiles
     WHERE subscription_tier <> 'FAN'::subscription_tier_enum
       AND subscription_expires_at IS NOT NULL
       AND subscription_expires_at < now()
  LOOP
    UPDATE public.profiles
       SET subscription_tier = 'FAN'::subscription_tier_enum,
           updated_at = now()
     WHERE id = r.id;

    INSERT INTO public.notifications (user_id, kind, title, body, metadata)
    VALUES (r.id, 'subscription_expired', 'Tu abono ha vencido',
            'Sigues siendo parte de Fan Zone como nivel FAN. Renueva cuando quieras.',
            jsonb_build_object('previous_tier', r.subscription_tier));

    INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, details)
    VALUES (r.id, 'subscription_expired_safety_net', 'profile', r.id,
            jsonb_build_object('previous_tier', r.subscription_tier));

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END $$;