import { createClient } from 'npm:@supabase/supabase-js@2.45.0';
import { corsHeaders, json, sha256Hex, verifyToken } from '../_shared/qr.ts';

const DISCOUNT_COL: Record<string, string> = {
  fan: 'discount_fan',
  gold: 'discount_gold',
  premium: 'discount_premium',
  platino: 'discount_platino',
};

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
    const staffId = userRes.user.id;

    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const action = body?.action === 'redeem' ? 'redeem' : 'validate';
    if (!token) return json({ error: 'Token requerido' }, 400);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // El usuario autenticado debe ser un negocio activo
    const { data: biz } = await admin
      .from('business_users')
      .select('id, name, location_id, active')
      .eq('user_id', staffId)
      .eq('active', true)
      .maybeSingle();

    if (!biz) return json({ error: 'Tu cuenta no está ligada a un comercio activo' }, 403);

    const { data: location } = await admin
      .from('locations')
      .select('id, name, business_name, active, consumption_xp, consumption_cc, discount_fan, discount_gold, discount_premium, discount_platino')
      .eq('id', biz.location_id)
      .maybeSingle();

    if (!location?.active) return json({ error: 'Comercio inactivo' }, 403);

    const payload = await verifyToken(QR_SIGNING_SECRET, token);
    if (!payload || payload.kind !== 'member' || typeof payload.pid !== 'string') {
      return json({ error: 'Código inválido' }, 400);
    }
    if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
      return json({ error: 'Código expirado, pide al aficionado que lo refresque' }, 410);
    }

    const tokenHash = await sha256Hex(token);
    const { data: qrToken } = await admin
      .from('qr_tokens')
      .select('id, pass_id, kind, redeemed_at, expires_at')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (!qrToken || qrToken.kind !== 'member') return json({ error: 'Código no reconocido' }, 404);
    if (qrToken.redeemed_at) return json({ error: 'Este código ya fue usado' }, 409);
    if (qrToken.expires_at && new Date(qrToken.expires_at).getTime() < Date.now()) {
      return json({ error: 'Código expirado, pide al aficionado que lo refresque' }, 410);
    }

    const { data: pass } = await admin
      .from('fan_passes')
      .select('id, user_id, full_name, tier, status, pass_code')
      .eq('id', qrToken.pass_id)
      .maybeSingle();

    if (!pass) return json({ error: 'Pase no encontrado' }, 404);
    if (pass.status !== 'active') return json({ error: 'El pase no está activo' }, 403);

    const { data: profile } = await admin
      .from('profiles')
      .select('avatar_url, display_name')
      .eq('id', pass.user_id)
      .maybeSingle();

    const discount = (location as Record<string, unknown>)[DISCOUNT_COL[pass.tier] ?? 'discount_fan'] as
      | number
      | null;

    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await admin
      .from('checkins')
      .select('id')
      .eq('user_id', pass.user_id)
      .eq('location_id', location.id)
      .eq('checkin_day', today)
      .maybeSingle();

    const member = {
      pass_code: pass.pass_code,
      full_name: pass.full_name,
      tier: pass.tier,
      avatar_url: profile?.avatar_url ?? null,
      discount,
    };

    if (existing) {
      return json({ ok: false, already_redeemed_today: true, member, business: location.business_name ?? location.name }, 200);
    }

    if (action === 'validate') {
      return json({ ok: true, validated: true, member, business: location.business_name ?? location.name });
    }

    const { error: redeemErr } = await admin
      .from('qr_tokens')
      .update({ redeemed_at: new Date().toISOString(), redeemed_by_staff: staffId })
      .eq('id', qrToken.id)
      .is('redeemed_at', null);

    if (redeemErr) return json({ error: 'No pudimos marcar el código como usado' }, 500);

    const { error: checkinErr } = await admin.from('checkins').insert({
      user_id: pass.user_id,
      location_id: location.id,
      type: 'consumption',
      qr_code_used: pass.pass_code,
      verified: true,
      checkin_day: today,
    });

    if (checkinErr) {
      console.error('checkin insert error', checkinErr);
      return json({ ok: false, already_redeemed_today: true, member, business: location.business_name ?? location.name }, 200);
    }

    await admin.from('pass_redemptions').insert({
      pass_id: pass.id,
      qr_token_id: qrToken.id,
      kind: 'member',
      ref_id: location.id,
      label: location.business_name ?? location.name,
    });

    return json({ ok: true, redeemed: true, member, business: location.business_name ?? location.name });
  } catch (err) {
    console.error('redeem-member-qr error', err);
    return json({ error: String(err) }, 500);
  }
});
