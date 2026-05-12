import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { verifyToken, hashToken } from "../_shared/qr.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return new Response(JSON.stringify({ ok: false, reason: "Unauthorized" }), { status: 401, headers: corsHeaders });
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: claims } = await userClient.auth.getClaims(auth.replace("Bearer ", ""));
    const staffId = claims?.claims?.sub;
    if (!staffId) return new Response(JSON.stringify({ ok: false, reason: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Check role
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", staffId);
    const isStaff = roles?.some((r) => r.role === "staff" || r.role === "admin");
    if (!isStaff) {
      return new Response(JSON.stringify({ ok: false, reason: "No tienes permisos de staff" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { token, context_kind, context_ref } = await req.json();
    if (!token) return new Response(JSON.stringify({ ok: false, reason: "Token vacío" }), { status: 400, headers: corsHeaders });

    const secret = Deno.env.get("QR_SIGNING_SECRET")!;
    const verified = await verifyToken(token, secret);
    if (!verified) return new Response(JSON.stringify({ ok: false, reason: "Firma inválida" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    if (verified.exp && verified.exp < Date.now()) {
      return new Response(JSON.stringify({ ok: false, reason: "Token expirado" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const token_hash = await hashToken(token);
    const { data: row } = await admin.from("qr_tokens").select("*").eq("token_hash", token_hash).maybeSingle();
    if (!row) return new Response(JSON.stringify({ ok: false, reason: "Token desconocido" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    if (row.kind !== "master" && row.redeemed_at) {
      return new Response(JSON.stringify({ ok: false, reason: `Ya canjeado: ${new Date(row.redeemed_at).toLocaleString()}` }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Optional context check
    if (context_kind && context_kind !== row.kind) {
      return new Response(JSON.stringify({ ok: false, reason: `Este QR no es para ${context_kind}` }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (context_ref && row.ref_id && context_ref !== row.ref_id) {
      return new Response(JSON.stringify({ ok: false, reason: "QR no corresponde a este evento" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: pass } = await admin.from("fan_passes").select("id, full_name, tier, pass_code, favorite_player_id").eq("id", row.pass_id).single();
    const { data: player } = pass?.favorite_player_id
      ? await admin.from("players").select("name, jersey_number").eq("id", pass.favorite_player_id).single()
      : { data: null };

    // Mark redeemed for non-master and write history
    if (row.kind !== "master") {
      await admin.from("qr_tokens").update({ redeemed_at: new Date().toISOString(), redeemed_by_staff: staffId }).eq("id", row.id);
    }
    await admin.from("pass_redemptions").insert({
      pass_id: row.pass_id,
      qr_token_id: row.id,
      kind: row.kind,
      ref_id: row.ref_id,
      label: context_ref || row.kind,
    });

    return new Response(JSON.stringify({ ok: true, pass, player, kind: row.kind, ref_id: row.ref_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, reason: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});