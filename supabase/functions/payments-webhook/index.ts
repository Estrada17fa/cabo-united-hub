import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, verifyWebhook } from "../_shared/stripe.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

// Map human-readable price_id (lookup_key) -> subscription_tier_enum
async function tierForPriceId(priceId: string | null): Promise<string | null> {
  if (!priceId) return null;
  const { data } = await getSupabase()
    .from("stripe_products")
    .select("tier")
    .eq("stripe_price_id", priceId)
    .maybeSingle();
  return (data?.tier as string | undefined) ?? null;
}

function extractPriceLookup(item: any): string | null {
  return (
    item?.price?.lookup_key
      ?? item?.price?.metadata?.lovable_external_id
      ?? item?.price?.id
      ?? null
  );
}

async function upsertSubscriptionRow(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("subscription missing metadata.userId", subscription.id);
    return { userId: null, priceId: null, tier: null };
  }
  const item = subscription.items?.data?.[0];
  const priceId = extractPriceLookup(item);
  const productId = typeof item?.price?.product === "string"
    ? item.price.product
    : item?.price?.product?.id ?? "";
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  await getSupabase().from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: productId,
      price_id: priceId ?? "",
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  const tier = await tierForPriceId(priceId);
  return { userId, priceId, tier, periodEnd };
}

async function syncProfileTier(opts: {
  userId: string;
  tier: string;
  customerId: string | null;
  periodEnd: number | null;
  isInitial: boolean;
}) {
  const sb = getSupabase();
  const { data: profileBefore } = await sb
    .from("profiles")
    .select("subscription_tier, stripe_customer_id, subscription_started_at")
    .eq("id", opts.userId)
    .maybeSingle();

  const startedAt = opts.isInitial || !profileBefore?.subscription_started_at
    ? new Date().toISOString()
    : profileBefore.subscription_started_at;

  const update: Record<string, unknown> = {
    subscription_tier: opts.tier,
    subscription_started_at: startedAt,
    subscription_expires_at: opts.periodEnd
      ? new Date(opts.periodEnd * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };
  if (opts.customerId && !profileBefore?.stripe_customer_id) {
    update.stripe_customer_id = opts.customerId;
  }

  await sb.from("profiles").update(update).eq("id", opts.userId);
  return { previousTier: profileBefore?.subscription_tier as string | undefined };
}

async function notify(userId: string, kind: string, title: string, body: string, metadata: any = {}) {
  await getSupabase().from("notifications").insert({ user_id: userId, kind, title, body, metadata });
}

async function audit(userId: string | null, action: string, details: any = {}) {
  await getSupabase().from("audit_log").insert({
    user_id: userId,
    action,
    entity_type: "subscription",
    details,
  });
}

async function awardBonus(userId: string, xp: number, cc: number, source: string, description: string) {
  // award_points_v2 reads multipliers from profiles
  await getSupabase().rpc("award_points_v2", {
    p_user_id: userId,
    p_xp: xp,
    p_cc: cc,
    p_source: source,
    p_description: description,
    p_source_type: "signup_bonus",
    p_apply_multiplier: true,
  });
}

// ===== Handlers =====

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  if (session.mode !== "subscription") return;
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("checkout.session.completed missing metadata.userId");
    return;
  }
  const stripe = createStripeClient(env);
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
    expand: ["items.data.price"],
  });

  const { tier, periodEnd } = await upsertSubscriptionRow(subscription, env);
  if (!tier) return;

  const { previousTier } = await syncProfileTier({
    userId,
    tier,
    customerId: session.customer as string,
    periodEnd: periodEnd ?? null,
    isInitial: true,
  });

  // Welcome bonus (200 XP / 50 CC) — only if this is a real first activation
  if (!previousTier || previousTier === "FAN") {
    await awardBonus(userId, 200, 50, `subscription_start_${tier.toLowerCase()}`, `Bienvenido al programa ${tier}`);
  }

  await notify(
    userId,
    "subscription_activated",
    `¡Bienvenido al programa ${tier}!`,
    "Tu abono está activo. Disfruta todos los beneficios de Fan Zone.",
    { tier, subscription_id: subscription.id },
  );
  await audit(userId, "subscription_purchased", { tier, subscription_id: subscription.id });
}

async function handleSubscriptionCreated(subscription: any, env: StripeEnv) {
  // Most state lands via checkout.session.completed first; this is a safety net.
  const { userId, tier, periodEnd } = await upsertSubscriptionRow(subscription, env);
  if (!userId || !tier) return;
  await syncProfileTier({
    userId,
    tier,
    customerId: subscription.customer as string,
    periodEnd: periodEnd ?? null,
    isInitial: true,
  });
}

async function handleSubscriptionUpdated(subscription: any, env: StripeEnv) {
  const { userId, tier, periodEnd } = await upsertSubscriptionRow(subscription, env);
  if (!userId || !tier) return;

  const { previousTier } = await syncProfileTier({
    userId,
    tier,
    customerId: subscription.customer as string,
    periodEnd: periodEnd ?? null,
    isInitial: false,
  });

  if (subscription.cancel_at_period_end && periodEnd) {
    await notify(
      userId,
      "subscription_cancel_scheduled",
      "Tu suscripción se cancelará pronto",
      `Mantendrás los beneficios de ${tier} hasta el ${new Date(periodEnd * 1000).toLocaleDateString("es-MX")}.`,
      { tier, ends_at: new Date(periodEnd * 1000).toISOString() },
    );
  } else if (previousTier && previousTier !== tier) {
    const isUpgrade =
      ["FAN", "GOLD", "PREMIUM", "PLATINO"].indexOf(tier) >
      ["FAN", "GOLD", "PREMIUM", "PLATINO"].indexOf(previousTier);
    await notify(
      userId,
      isUpgrade ? "subscription_upgraded" : "subscription_downgraded",
      isUpgrade ? `Has actualizado tu abono a ${tier}` : `Has cambiado tu abono a ${tier}`,
      isUpgrade
        ? "Ya tienes activos los nuevos beneficios."
        : "Tus nuevos beneficios están activos.",
      { from: previousTier, to: tier },
    );
  }
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  const sb = getSupabase();
  await sb
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);

  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await sb
    .from("profiles")
    .update({
      subscription_tier: "FAN",
      subscription_expires_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  await notify(
    userId,
    "subscription_ended",
    "Tu abono ha terminado",
    "Sigues siendo parte de Fan Zone como nivel FAN. Renueva cuando quieras.",
    { subscription_id: subscription.id },
  );
  await audit(userId, "subscription_ended", { subscription_id: subscription.id });
}

async function handleInvoicePaymentSucceeded(invoice: any, env: StripeEnv) {
  // Only renewals — initial purchase is handled by checkout.session.completed
  if (invoice.billing_reason !== "subscription_cycle") return;
  const subscriptionId = invoice.subscription as string | null;
  if (!subscriptionId) return;

  const stripe = createStripeClient(env);
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const { tier, periodEnd } = await upsertSubscriptionRow(subscription, env);
  if (!tier) return;

  await getSupabase()
    .from("profiles")
    .update({
      subscription_expires_at: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  await awardBonus(userId, 100, 25, `subscription_renewal_${tier.toLowerCase()}`, `Renovación ${tier}`);
  await notify(
    userId,
    "subscription_renewed",
    `Renovamos tu abono ${tier}`,
    "Un año más de beneficios. ¡Gracias por seguir con nosotros!",
    { tier },
  );
}

async function handleInvoicePaymentFailed(invoice: any, _env: StripeEnv) {
  const subscriptionId = invoice.subscription as string | null;
  if (!subscriptionId) return;
  const { data: sub } = await getSupabase()
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();
  if (!sub?.user_id) return;

  await notify(
    sub.user_id as string,
    "payment_failed",
    "No pudimos cobrar tu abono",
    "Actualiza tu método de pago desde tu perfil para no perder los beneficios.",
    { subscription_id: subscriptionId, attempt_count: invoice.attempt_count },
  );
}

// ===== Dispatcher with idempotency =====

async function processEvent(event: { id: string; type: string; data: { object: any } }, env: StripeEnv) {
  switch (event.type) {
    case "checkout.session.completed":
      return handleCheckoutCompleted(event.data.object, env);
    case "customer.subscription.created":
      return handleSubscriptionCreated(event.data.object, env);
    case "customer.subscription.updated":
      return handleSubscriptionUpdated(event.data.object, env);
    case "customer.subscription.deleted":
      return handleSubscriptionDeleted(event.data.object, env);
    case "invoice.payment_succeeded":
      return handleInvoicePaymentSucceeded(event.data.object, env);
    case "invoice.payment_failed":
      return handleInvoicePaymentFailed(event.data.object, env);
    default:
      console.log("Unhandled event:", event.type);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;

  let event: { id: string; type: string; data: { object: any } };
  try {
    event = await verifyWebhook(req, env);
  } catch (e) {
    console.error("Signature verify failed:", e);
    return new Response("Invalid signature", { status: 401 });
  }

  // Idempotency: if event.id already exists, skip.
  const sb = getSupabase();
  const { data: existing } = await sb
    .from("stripe_webhook_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle();
  if (existing) {
    return new Response(JSON.stringify({ received: true, duplicate: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await processEvent(event, env);
    await sb.from("stripe_webhook_events").insert({
      id: event.id,
      type: event.type,
      payload: event as any,
      success: true,
    });
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Webhook handler error:", msg);
    await sb.from("stripe_webhook_events").insert({
      id: event.id,
      type: event.type,
      payload: event as any,
      success: false,
      error_message: msg,
    }).then(
      () => {},
      () => {}, // ignore secondary failure
    );
    // Return 500 so Stripe retries
    return new Response("Webhook handler error", { status: 500 });
  }
});