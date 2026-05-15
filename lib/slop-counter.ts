import { getRequestContext } from '@cloudflare/next-on-pages';

const KV_KEY = 'slop:total';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getKV(): any | null {
  try {
    const { env } = getRequestContext();
    return (env as Record<string, unknown>).SLOP_KV ?? null;
  } catch {
    return null;
  }
}

export async function incrementSlopCount(): Promise<void> {
  try {
    const kv = getKV();
    if (!kv) return;
    const current = await kv.get(KV_KEY);
    const next = parseInt(current ?? '0', 10) + 1;
    await kv.put(KV_KEY, String(next));
  } catch {
    // fail silently — counter is non-critical
  }
}

export async function getSlopCount(): Promise<number> {
  try {
    const kv = getKV();
    if (!kv) return 0;
    const value = await kv.get(KV_KEY);
    return parseInt(value ?? '0', 10);
  } catch {
    return 0;
  }
}
