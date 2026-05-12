// Shared HMAC helpers for QR tokens.
// Token format: <pass_id>|<kind>|<ref_id>|<exp_ms>|<nonce>.<sig>
// sig = base64url(HMAC-SHA256(secret, payload))

const enc = new TextEncoder();

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let str = btoa(String.fromCharCode(...bytes));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signToken(payload: string, secret: string): Promise<string> {
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return `${payload}.${b64url(sig)}`;
}

export async function verifyToken(token: string, secret: string): Promise<{
  pass_id: string; kind: string; ref_id: string; exp: number; nonce: string;
} | null> {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const key = await getKey(secret);
  // Recompute and compare base64url
  const expected = b64url(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  if (expected !== sig) return null;
  const parts = payload.split("|");
  if (parts.length !== 5) return null;
  const [pass_id, kind, ref_id, expStr, nonce] = parts;
  return { pass_id, kind, ref_id, exp: Number(expStr), nonce };
}

export async function hashToken(token: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(token));
  return b64url(buf);
}

export function buildPayload(pass_id: string, kind: string, ref_id = "", exp = 0): string {
  const nonce = b64url(crypto.getRandomValues(new Uint8Array(8)));
  return `${pass_id}|${kind}|${ref_id}|${exp}|${nonce}`;
}