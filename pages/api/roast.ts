export const runtime = 'edge';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: { input?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const input = (body.input || '').trim().slice(0, 500);
  if (!input) {
    return new Response(JSON.stringify({ error: 'Input required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_AI_TOKEN;

  if (!accountId || !apiToken) {
    return new Response(JSON.stringify({ error: 'AI not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a witty, dry, slightly unhinged roast bot for AI and Coffee — a no-BS tech community in Malaysia. Roast the user's input with sharp, clever humor. Keep it to 2-3 sentences max. Be brilliant, not cruel. No slurs or hate speech. Just elite-level burns. Reply only with the roast, no intro, no labels.`,
          },
          {
            role: 'user',
            content: input,
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'AI request failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await res.json() as { result?: { response?: string } };
  const roast = data.result?.response?.trim() || 'The AI is speechless. That might be worse.';

  return new Response(JSON.stringify({ roast }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
