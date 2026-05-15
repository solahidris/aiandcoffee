export const runtime = 'edge';

export const MOODS = ['did nothing', 'burned out', 'actually productive', 'pretending to work', 'in meetings all day'] as const;
export type Mood = typeof MOODS[number];

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: { mood?: string; context?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const mood = (body.mood || '').trim();
  const context = (body.context || '').trim().slice(0, 300);

  if (!mood) {
    return new Response(JSON.stringify({ error: 'Mood required' }), {
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

  const userMessage = context
    ? `My actual situation: ${mood}. Extra context: ${context}`
    : `My actual situation: ${mood}`;

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
            content: `You are a corporate standup update generator. Given someone's actual situation (which might be embarrassing or unproductive), spin it into a professional-sounding standup update that makes them sound busy and competent. Use the Yesterday / Today / Blockers format. Keep each point to one sentence. Use mild corporate jargon — words like "synergising", "unblocking", "aligning", "iterating", "scoping". Be creative but not obviously absurd. Reply only with the three bullet points, no intro.`,
          },
          {
            role: 'user',
            content: userMessage,
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
  const update = data.result?.response?.trim() || 'The AI is also in a meeting.';

  return new Response(JSON.stringify({ update }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
