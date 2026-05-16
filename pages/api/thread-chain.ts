export const runtime = 'edge';

import { incrementSlopCount } from '../../lib/slop-counter';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: { topic?: string; count?: number };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const topic = (body.topic || '').trim().slice(0, 300);
  if (!topic) {
    return new Response(JSON.stringify({ error: 'Topic required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const count = Math.min(Math.max(Number(body.count) || 5, 3), 10);
  const apiKey = process.env.ILMU_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'AI not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const system = `You are a viral Threads post ghost-writer for the Malaysian internet. Generate a ${count}-post thread chain about the topic given. Rules:
- Each post must be under 400 characters
- Write in casual Malaysian-English (Manglish) — naturally mix in words like "lah", "leh", "weh", "confirm", "memang", "bodoh", "gila", "syok"
- Make it dramatic, relatable, and shareable
- Each post should end with a hook that pulls readers to the next one (except the last)
- The last post should end with a reflection, call-to-action, or quotable line
- Number each post like "1/" at the start
- Do NOT use hashtags

Return ONLY a valid JSON array of ${count} strings. No markdown, no code fences, no explanation. Example: ["post 1", "post 2"]`;

  const res = await fetch('https://api.ilmu.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'nemo-super',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: topic },
      ],
    }),
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'AI request failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  const raw = (data.choices?.[0]?.message?.content || '').trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');

  let posts: string[];
  try {
    const parsed = JSON.parse(raw);
    posts = Array.isArray(parsed) ? parsed.map(String) : [raw];
  } catch {
    posts = raw.split('\n').filter(Boolean);
  }

  const attribution = '\n\n- generated via https://coffeeandai.pages.dev/slop?thread-chain';
  if (posts.length > 0) {
    posts[posts.length - 1] = posts[posts.length - 1] + attribution;
  }

  await incrementSlopCount();

  return new Response(JSON.stringify({ posts }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
