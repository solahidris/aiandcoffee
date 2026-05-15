export const runtime = 'edge';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: { idea?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const idea = (body.idea || '').trim().slice(0, 500);
  if (!idea) {
    return new Response(JSON.stringify({ error: 'Idea required' }), {
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
            content: `You are a startup pitch bullshitter. Take a plain English startup idea and rewrite it as an insufferable Silicon Valley VC pitch. Pack it with buzzwords (disrupt, ecosystem, flywheel, moat, AI-native, asymmetric, 10x, paradigm shift), reference a massive TAM, mention "network effects", and sound irrationally confident. Keep it to 4-5 sentences. Do not break character. Reply only with the pitch, no intro or labels.`,
          },
          {
            role: 'user',
            content: idea,
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
  const pitch = data.result?.response?.trim() || 'The AI could not bullshit this one. Impressive.';

  return new Response(JSON.stringify({ pitch }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
