import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") return json({ error: "invalid_token" }, 400);

    const tokenHash = await sha256(token);
    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: row, error } = await service
      .from("parental_consent_requests")
      .select("id, user_id, expires_at, confirmed_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (error || !row) return json({ error: "not_found" }, 404);
    if (row.confirmed_at) return json({ ok: true, alreadyConfirmed: true });
    if (new Date(row.expires_at) < new Date()) return json({ error: "expired" }, 410);

    const now = new Date().toISOString();
    await service.from("parental_consent_requests").update({ confirmed_at: now }).eq("id", row.id);
    await service
      .from("profiles")
      .update({ parental_consent: true, parental_consent_at: now })
      .eq("id", row.user_id);

    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}