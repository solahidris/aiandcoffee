const NAMESPACE_ID = 'c6f5cfa59f2a4549a726ab6d22ef0707';
const KV_KEY = 'slop:total';

function kvUrl(key: string) {
  const accountId = process.env.CF_ACCOUNT_ID;
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${NAMESPACE_ID}/values/${key}`;
}

function headers() {
  return { Authorization: `Bearer ${process.env.CF_AI_TOKEN}` };
}

export async function incrementSlopCount(): Promise<void> {
  try {
    const res = await fetch(kvUrl(KV_KEY), { headers: headers() });
    const current = res.ok ? parseInt(await res.text(), 10) || 0 : 0;
    await fetch(kvUrl(KV_KEY), {
      method: 'PUT',
      headers: { ...headers(), 'Content-Type': 'text/plain' },
      body: String(current + 1),
    });
  } catch {
    // fail silently — counter is non-critical
  }
}

export async function getSlopCount(): Promise<number> {
  try {
    const res = await fetch(kvUrl(KV_KEY), { headers: headers() });
    if (!res.ok) return 0;
    return parseInt(await res.text(), 10) || 0;
  } catch {
    return 0;
  }
}
