import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { signToken, hashToken, buildPayload } from "../_shared/qr.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function genCode(): string {
  const r = crypto.getRandomValues(new Uint8Array(3));
  const hex = Array.from(r).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `MARLIN-${new Date().getFullYear()}-${hex}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: claims, error: cErr } = await userClient.auth.getClaims(auth.replace("Bearer ", ""));
    if (cErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.claims.sub as string;

    const body = await req.json();
    const { full_name, birth_date, phone, favorite_player_id, tier } = body ?? {};
    if (!full_name || !birth_date || !phone || !tier) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!["fan", "gold", "premium", "platino"].includes(tier)) {
      return new Response(JSON.stringify({ error: "Invalid tier" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Check if pass already exists
    const { data: existing } = await admin.from("fan_passes").select("id").eq("user_id", userId).maybeSingle();

    const passData = {
      user_id: userId,
      full_name,
      birth_date,
      phone,
      favorite_player_id: favorite_player_id || null,
      tier,
      payment_status: tier === "fan" ? "free" : "mock_paid",
      pass_code: existing ? undefined : genCode(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    let passId: string;
    if (existing) {
      const { data, error } = await admin.from("fan_passes").update(passData).eq("id", existing.id).select("id").single();
      if (error) throw error;
      passId = data.id;
    } else {
      const { data, error } = await admin.from("fan_passes").insert(passData).select("id").single();
      if (error) throw error;
      passId = data.id;

      // Issue master token
      const secret = Deno.env.get("QR_SIGNING_SECRET")!;
      const payload = buildPayload(passId, "master", "", 0);
      const token = await signToken(payload, secret);
      const token_hash = await hashToken(token);
      await admin.from("qr_tokens").insert({ pass_id: passId, token_hash, kind: "master" });
    }

    const { data: pass } = await admin.from("fan_passes").select("*").eq("id", passId).single();
    return new Response(JSON.stringify({ pass }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});