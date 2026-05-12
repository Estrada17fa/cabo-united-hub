import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { signToken, hashToken, buildPayload } from "../_shared/qr.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: claims } = await userClient.auth.getClaims(auth.replace("Bearer ", ""));
    const userId = claims?.claims?.sub;
    if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: pass } = await admin.from("fan_passes").select("id").eq("user_id", userId).maybeSingle();
    if (!pass) return new Response(JSON.stringify({ error: "No pass" }), { status: 404, headers: corsHeaders });

    const secret = Deno.env.get("QR_SIGNING_SECRET")!;
    const payload = buildPayload(pass.id, "master", "", 0);
    const token = await signToken(payload, secret);
    const token_hash = await hashToken(token);
    // Replace existing master token (rotate)
    await admin.from("qr_tokens").delete().eq("pass_id", pass.id).eq("kind", "master");
    await admin.from("qr_tokens").insert({ pass_id: pass.id, token_hash, kind: "master" });

    return new Response(JSON.stringify({ token, pass_id: pass.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});