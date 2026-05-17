export const runtime = 'edge';

import { incrementSlopCount } from '../../lib/slop-counter';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const prompt = (body.prompt || '').trim().slice(0, 500);
  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Prompt required' }), { status: 400 });
  }

  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken  = process.env.CF_AI_TOKEN;

  if (!accountId || !apiToken) {
    return new Response(JSON.stringify({ error: 'AI not configured' }), { status: 500 });
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, num_steps: 4 }),
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return new Response(JSON.stringify({ error: 'Image generation failed', detail }), { status: 502 });
  }

  const imageBuffer = await res.arrayBuffer();
  await incrementSlopCount();

  return new Response(imageBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store',
    },
  });
}
