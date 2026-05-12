/**
 * prorab-leads — Cloudflare Worker for lead intake from lp-miniapp.
 *
 * Flow:
 *   POST /lead  { name, contact, task, tgUser, initData, source }
 *     -> validate HMAC-SHA-256(initData, key=HMAC-SHA-256("WebAppData", BOT_TOKEN))
 *     -> reject if auth_date older than MIN_AUTH_DATE_SECONDS (replay protection)
 *     -> sendMessage to ADMIN_CHAT_ID via Telegram Bot API
 *     -> respond 200 { ok: true }
 *
 * Test endpoints:
 *   GET /         -> 200 "prorab-leads ok"
 *   GET /healthz  -> 200 { ok: true, version: <date> }
 */

export interface Env {
  BOT_TOKEN: string;
  ADMIN_CHAT_ID: string;
  ALLOWED_ORIGINS: string;
  MIN_AUTH_DATE_SECONDS: string;
  RATE_LIMIT?: KVNamespace;
}

interface LeadPayload {
  name?: unknown;
  contact?: unknown;
  task?: unknown;
  tgUser?: { id?: number; username?: string; first_name?: string; last_name?: string } | null;
  initData?: unknown;
  source?: unknown;
}

const VERSION = '2026-05-12';

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') ?? '';
    const cors = corsHeaders(origin, env);

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (req.method === 'GET' && url.pathname === '/') {
      return new Response('prorab-leads ok', { status: 200, headers: cors });
    }
    if (req.method === 'GET' && url.pathname === '/healthz') {
      return json({ ok: true, version: VERSION }, 200, cors);
    }

    if (req.method !== 'POST' || url.pathname !== '/lead') {
      return json({ ok: false, error: 'Not Found' }, 404, cors);
    }

    let payload: LeadPayload;
    try {
      payload = (await req.json()) as LeadPayload;
    } catch {
      return json({ ok: false, error: 'Invalid JSON' }, 400, cors);
    }

    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    const contact = typeof payload.contact === 'string' ? payload.contact.trim() : '';
    const task = typeof payload.task === 'string' ? payload.task.trim().slice(0, 3000) : '';
    const initData = typeof payload.initData === 'string' ? payload.initData : '';

    if (name.length < 2 || contact.length < 3) {
      return json({ ok: false, error: 'name/contact required' }, 400, cors);
    }

    // Validate initData if present (skip for browser-mock / non-TG submissions)
    let validatedUser: LeadPayload['tgUser'] = null;
    if (initData) {
      const verdict = await verifyInitData(initData, env);
      if (!verdict.ok) {
        return json({ ok: false, error: `initData: ${verdict.reason}` }, 401, cors);
      }
      validatedUser = verdict.user;
    } else {
      // No initData = web submission via tunnel/dev. Allow but mark.
      validatedUser = payload.tgUser ?? null;
    }

    // Optional rate-limit by user.id (5 leads / 10 minutes)
    if (env.RATE_LIMIT && validatedUser?.id) {
      const key = `rl:${validatedUser.id}`;
      const count = Number((await env.RATE_LIMIT.get(key)) ?? '0');
      if (count >= 5) {
        return json({ ok: false, error: 'rate-limited' }, 429, cors);
      }
      await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: 600 });
    }

    const text = formatLead({ name, contact, task, user: validatedUser, hasInitData: Boolean(initData) });
    const tgRes = await sendTelegramMessage(env, text);

    if (!tgRes.ok) {
      console.error('telegram send failed:', tgRes.error);
      return json({ ok: false, error: 'telegram failed' }, 502, cors);
    }

    return json({ ok: true }, 200, cors);
  },
} satisfies ExportedHandler<Env>;

// ---------------------------------------------------------------------------

function corsHeaders(origin: string, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  const allow = allowed.includes(origin) ? origin : (allowed[0] ?? '*');
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

// ---------------------------------------------------------------------------
// Telegram WebApp initData validation
// Reference: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

interface VerifyOk {
  ok: true;
  user: { id?: number; username?: string; first_name?: string; last_name?: string };
  authDate: number;
}

interface VerifyFail {
  ok: false;
  reason: string;
}

async function verifyInitData(initData: string, env: Env): Promise<VerifyOk | VerifyFail> {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false, reason: 'no hash' };
  params.delete('hash');

  const sortedPairs = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secret = await hmacSha256(strToBytes('WebAppData'), strToBytes(env.BOT_TOKEN));
  const sig = await hmacSha256(secret, strToBytes(sortedPairs));
  const computedHex = bytesToHex(sig);

  if (computedHex !== hash) return { ok: false, reason: 'bad hash' };

  const authDate = Number(params.get('auth_date') ?? '0');
  const maxAge = Number(env.MIN_AUTH_DATE_SECONDS);
  const now = Math.floor(Date.now() / 1000);
  if (!authDate || now - authDate > maxAge) {
    return { ok: false, reason: 'expired auth_date' };
  }

  let user: VerifyOk['user'] = {};
  const userJson = params.get('user');
  if (userJson) {
    try {
      user = JSON.parse(userJson) as VerifyOk['user'];
    } catch {
      /* ignore */
    }
  }

  return { ok: true, user, authDate };
}

async function hmacSha256(keyBytes: ArrayBuffer | Uint8Array, msg: Uint8Array): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes instanceof Uint8Array ? keyBytes : new Uint8Array(keyBytes),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', key, msg);
}

function strToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function bytesToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// Telegram outbound

interface SendResult {
  ok: boolean;
  error?: string;
}

async function sendTelegramMessage(env: Env, text: string): Promise<SendResult> {
  const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.ADMIN_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'fetch failed' };
  }
}

function formatLead(input: {
  name: string;
  contact: string;
  task: string;
  user: LeadPayload['tgUser'];
  hasInitData: boolean;
}): string {
  const lines = [
    '<b>Новая заявка через миниапку</b>',
    '',
    `<b>Имя:</b> ${escapeHtml(input.name)}`,
    `<b>Контакт:</b> ${escapeHtml(input.contact)}`,
  ];
  if (input.task) {
    lines.push('', '<b>Задача:</b>', escapeHtml(input.task));
  }
  if (input.user?.id) {
    const handle = input.user.username ? `@${input.user.username}` : `id ${input.user.id}`;
    lines.push('', `<b>TG:</b> ${escapeHtml(handle)}`);
  }
  if (!input.hasInitData) {
    lines.push('', '<i>(submitted via web, no initData)</i>');
  }
  return lines.join('\n');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
