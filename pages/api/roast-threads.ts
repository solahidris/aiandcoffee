export const runtime = 'edge';

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: { username?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const username = (body.username || '').trim().replace(/^@+/, '');
  if (!username) {
    return new Response(JSON.stringify({ error: 'Username required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const profileRes = await fetch(`https://www.threads.net/@${username}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!profileRes.ok) {
    return new Response(JSON.stringify({ error: `Profile @${username} not found` }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const html = await profileRes.text();

  const ogDescription = extractMeta(html, 'og:description');
  const ogTitle = extractMeta(html, 'og:title') || username;

  // og:description on Threads is typically "X Followers · bio"
  // strip the followers prefix if present
  const bio = ogDescription
    ? ogDescription.replace(/^\d[\d.,KkMm]* Followers?\s*[·•]\s*/i, '').trim()
    : null;

  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_AI_TOKEN;

  if (!accountId || !apiToken) {
    return new Response(JSON.stringify({ error: 'AI not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const context = bio
    ? `Threads username: @${username}\nDisplay name: ${ogTitle}\nBio: ${bio}`
    : `Threads username: @${username}\nDisplay name: ${ogTitle}\nBio: (no bio — they left it blank)`;

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
            content: `You are a witty, dry, slightly unhinged roast bot for AI and Coffee — a no-BS tech community in Malaysia. Roast this Threads user based on their profile. Keep it to 2-3 sentences. Be brilliant, not cruel. No slurs or hate speech. Reply only with the roast.`,
          },
          {
            role: 'user',
            content: context,
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

  return new Response(JSON.stringify({ roast, bio, name: ogTitle }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
