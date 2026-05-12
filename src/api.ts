import { tg, getTgUser } from './telegram';
import { CONFIG } from './config';
import type { Lead } from './types/lead';

export interface SubmitInput {
  name: string;
  contact: string;
  task: string;
}

export type SubmitResult = { ok: true } | { ok: false; error: string };

function buildLead(input: SubmitInput): Lead {
  return {
    name: input.name.trim(),
    contact: input.contact.trim(),
    task: input.task.trim().slice(0, 3000),
    tgUser: getTgUser(),
    initData: tg.initData,
    source: 'lp-miniapp',
  };
}

export async function submitLead(input: SubmitInput): Promise<SubmitResult> {
  const lead = buildLead(input);

  if (!CONFIG.WORKER_URL) {
    console.warn('[submitLead] No VITE_WORKER_URL — mock mode. Payload:', lead);
    await new Promise((r) => setTimeout(r, 500));
    return { ok: true };
  }

  try {
    const res = await fetch(`${CONFIG.WORKER_URL}/lead`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(lead),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}
