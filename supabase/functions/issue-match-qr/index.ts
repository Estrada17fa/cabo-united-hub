import { createClient } from 'npm:@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function b64url(bytes: Uint8Array): string {
  let str = '';
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmacSign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return b64url(new Uint8Array(sig));
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const QR_SIGNING_SECRET = Deno.env.get('QR_SIGNING_SECRET')!;

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsRes, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsRes?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claimsRes.claims.sub as string;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Pass
    const { data: pass } = await admin
      .from('fan_passes')
      .select('id, status, tier, pass_code')
      .eq('user_id', userId)
      .maybeSingle();

    if (!pass) {
      return new Response(JSON.stringify({ error: 'No fan pass for user' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (pass.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Pass not active', status: pass.status }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Next match
    const today = new Date().toISOString().slice(0, 10);
    const { data: match } = await admin
      .from('matches')
      .select('id, home_team, away_team, match_date, match_time, venue, is_home_game')
      .gte('match_date', today)
      .eq('status', 'scheduled')
      .order('match_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    // Token validity: until end of match day, or 24h ahead if no match
    const expIso = match
      ? new Date(`${match.match_date}T23:59:59Z`).toISOString()
      : new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const exp = Math.floor(new Date(expIso).getTime() / 1000);

    const nonce = b64url(crypto.getRandomValues(new Uint8Array(12)));
    const payload = {
      pid: pass.id,
      mid: match?.id ?? null,
      exp,
      nonce,
    };
    const payloadStr = b64url(new TextEncoder().encode(JSON.stringify(payload)));
    const sig = await hmacSign(QR_SIGNING_SECRET, payloadStr);
    const tokenStr = `${payloadStr}.${sig}`;
    const tokenHash = await sha256Hex(tokenStr);

    await admin.from('qr_tokens').insert({
      pass_id: pass.id,
      kind: 'match',
      ref_id: match?.id ?? null,
      token_hash: tokenHash,
      expires_at: expIso,
    });

    return new Response(
      JSON.stringify({
        token: tokenStr,
        expires_at: expIso,
        match,
        pass: { code: pass.pass_code, tier: pass.tier },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('issue-match-qr error', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});