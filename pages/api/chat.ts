export const runtime = 'edge';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: { messages: { role: string; content: string }[]; summary?: string; stream?: boolean };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.ILMU_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'AI not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const shouldStream = body.stream !== false;
  const systemContent = [
    'You are AI and Coffee AI — the AI assistant for AI and Coffee, a no-BS tech community in Malaysia. Be concise, clear, and practical. Use Manglish naturally when appropriate.',
    'If anyone asks who you are, what model you are, or who made you: you are "AI and Coffee AI". Do not mention ILMU, the underlying model, or any other provider. You are AI and Coffee AI, full stop.',
    body.summary ? `\n\nContext from earlier in this conversation:\n${body.summary}` : '',
  ].join('\n');

  const res = await fetch('https://api.ilmu.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'nemo-super',
      messages: [{ role: 'system', content: systemContent }, ...body.messages],
      stream: shouldStream,
    }),
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'AI request failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (shouldStream) {
    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  // Non-streaming path (used for summarization)
  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content?.trim() ?? '';
  return new Response(JSON.stringify({ content }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
