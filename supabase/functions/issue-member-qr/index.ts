import { createClient } from 'npm:@supabase/supabase-js@2.45.0';
import { b64url, corsHeaders, hmacSign, json, sha256Hex } from '../_shared/qr.ts';

const TTL_SECONDS = 180; // 3 minutos

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const QR_SIGNING_SECRET = Deno.env.get('QR_SIGNING_SECRET')!;

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) return json({ error: 'Unauthorized' }, 401);
    const userId = userRes.user.id;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: pass } = await admin
      .from('fan_passes')
      .select('id, status, tier, pass_code')
      .eq('user_id', userId)
      .maybeSingle();

    if (!pass) return json({ error: 'No fan pass for user' }, 404);
    if (pass.status !== 'active') return json({ error: 'Pass not active', status: pass.status }, 403);

    const expIso = new Date(Date.now() + TTL_SECONDS * 1000).toISOString();
    const exp = Math.floor(new Date(expIso).getTime() / 1000);
    const nonce = b64url(crypto.getRandomValues(new Uint8Array(12)));

    const payload = { pid: pass.id, kind: 'member', exp, nonce };
    const payloadStr = b64url(new TextEncoder().encode(JSON.stringify(payload)));
    const sig = await hmacSign(QR_SIGNING_SECRET, payloadStr);
    const tokenStr = `${payloadStr}.${sig}`;
    const tokenHash = await sha256Hex(tokenStr);

    await admin.from('qr_tokens').insert({
      pass_id: pass.id,
      kind: 'member',
      ref_id: null,
      token_hash: tokenHash,
      expires_at: expIso,
    });

    return json({
      token: tokenStr,
      expires_at: expIso,
      ttl_seconds: TTL_SECONDS,
      pass: { code: pass.pass_code, tier: pass.tier },
    });
  } catch (err) {
    console.error('issue-member-qr error', err);
    return json({ error: String(err) }, 500);
  }
});
