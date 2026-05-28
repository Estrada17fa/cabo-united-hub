import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "unauthorized" }, 401);
    }
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims, error: authErr } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    if (authErr || !claims?.claims?.sub) return json({ error: "unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const body = await req.json();
    const tutorName = String(body.tutorName ?? "").trim();
    const tutorEmail = String(body.tutorEmail ?? "").trim().toLowerCase();
    const tutorPhone = body.tutorPhone ? String(body.tutorPhone).trim() : null;
    const tutorRelationship = String(body.tutorRelationship ?? "").trim();

    if (tutorName.length < 3 || !/^\S+@\S+\.\S+$/.test(tutorEmail) || tutorRelationship.length < 3) {
      return json({ error: "invalid_input" }, 400);
    }

    // Generate token (returned to caller as raw; only hash stored)
    const rawToken = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
    const tokenHash = await sha256(rawToken);

    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error: insErr } = await service.from("parental_consent_requests").insert({
      user_id: userId,
      tutor_name: tutorName,
      tutor_email: tutorEmail,
      tutor_phone: tutorPhone,
      tutor_relationship: tutorRelationship,
      token_hash: tokenHash,
      ip_address: req.headers.get("x-forwarded-for") ?? null,
    });
    if (insErr) return json({ error: insErr.message }, 500);

    const origin = req.headers.get("origin") ?? "";
    const confirmUrl = `${origin}/consentimiento-tutor/${rawToken}`;

    // Best-effort email enqueue (works once email infra + DNS is ready)
    let emailSent = false;
    try {
      const html = renderEmail({ tutorName, confirmUrl });
      const { error: qErr } = await service.rpc("enqueue_email", {
        p_to: tutorEmail,
        p_subject: "Autoriza el acceso de tu hijo/a a Fan Zone Los Cabos United",
        p_html: html,
        p_text: `Hola ${tutorName}, confirma autorización: ${confirmUrl}`,
        p_template_name: "parental_consent",
        p_priority: "transactional",
      } as any);
      if (!qErr) emailSent = true;
    } catch (_) {
      // queue not configured yet - return link as fallback
    }

    return json({ ok: true, emailSent, confirmUrl: emailSent ? undefined : confirmUrl });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function renderEmail({ tutorName, confirmUrl }: { tutorName: string; confirmUrl: string }) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#ffffff;color:#0a0a0a;padding:24px">
  <h2 style="margin:0 0 12px">Hola ${escapeHtml(tutorName)},</h2>
  <p>Un menor a tu cargo se registró en <strong>Fan Zone Los Cabos United</strong>, el programa de fans del equipo. Como el participante es menor de 18 años, necesitamos tu autorización expresa para que pueda usar la app.</p>
  <p>Al autorizar, confirmas que:</p>
  <ul>
    <li>Eres su padre, madre o tutor legal.</li>
    <li>Eres mayor de edad.</li>
    <li>Permites que el menor participe en el programa Fan Zone bajo tu supervisión.</li>
  </ul>
  <p style="margin:24px 0">
    <a href="${confirmUrl}" style="background:#00FFFF;color:#0a0a0a;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:700">Autorizar acceso</a>
  </p>
  <p style="font-size:12px;color:#666">Este enlace caduca en 7 días. Si no reconoces esta solicitud, ignora este correo.</p>
  </body></html>`;
}
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}