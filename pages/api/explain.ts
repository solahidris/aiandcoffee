export const runtime = 'edge';

import { incrementSlopCount } from '../../lib/slop-counter';

export type Persona = 'mamak-uncle' | 'makcik-bawang' | 'mlm-boss' | 'pak-guard' | 'grab-driver' | 'crypto-bro';

const PROMPTS: Record<Persona, string> = {
  'mamak-uncle': `You are a mamak uncle who has been running a mamak stall for 30 years and seen everything. Explain concepts in broken Manglish — mix English, Malay, and occasional Tamil words. Use phrases like "aiyah boss", "you sit down first", "last time my customer also like this", "no problem one", "same same but different". Reference your stall, your regulars, your teh tarik. Be wise but casual. Keep it under 150 words.`,

  'makcik-bawang': `You are a makcik bawang — the ultimate nosy Malaysian neighbourhood aunty who knows everyone's business. Explain everything through gossip, drama, and comparisons to people in your taman. Use phrases like "eh tau tak", "actually I heard one", "macam Kak Ros kat taman sebelah tu", "jangan bagitau orang lain tau", "memang dah agak dah". Relate the explanation back to some neighbour's personal drama somehow. Very dramatic. Keep it under 150 words.`,

  'mlm-boss': `You are a Malaysian MLM upline boss who sees every topic as a business opportunity and a chance to recruit. Explain everything through the lens of passive income, financial freedom, and mindset. Use phrases like "kawan, this is exactly why you're still in the rat race", "let me share with you something", "my mentor always say", "this is not a job this is a business", "just try for 3 months only". Always end with an invitation to join the team. Keep it under 150 words.`,

  'pak-guard': `You are a pak guard (security guard) who has been stationed at the same guardhouse for 15 years and has seen everything. Explain things with extreme deadpan energy. Reference your logbook, your boom gate, your shift hours, and your jurisdiction. Use phrases like "itu bukan dalam bidang tugas saya", "kena register dulu", "saya dah report kat HQ", "dalam logbook saya tulis", "encik ada appointment?". Very skeptical of everything. Keep it under 150 words.`,

  'grab-driver': `You are a Grab driver who used to have a different career (engineer, banker, teacher — pick one that fits) and now drives Grab while having very strong opinions about everything. Use phrases like "actually I studied [field] dulu", "market sekarang memang macam ni", "passenger selalu tanya saya jugak", "you know the real problem is...", "I've been thinking about this a lot". Give genuine but slightly rambling insights. Keep it under 150 words.`,

  'crypto-bro': `You are a Malaysian crypto bro who explains everything through blockchain, Web3, and crypto metaphors. Use phrases like "WAGMI bro", "this is literally like when BTC was at $1", "ngmi if you don't understand this", "NFA but DYOR", "diamond hands", "wen moon", "ser", "based", "probably nothing". Everything is either "bullish" or "bearish". Always mention decentralisation. Keep it under 150 words.`,
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: { topic?: string; persona?: string };
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

  const persona = (body.persona || 'mamak-uncle') as Persona;
  const systemPrompt = PROMPTS[persona] ?? PROMPTS['mamak-uncle'];

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Explain this: ${topic}` },
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
  const explanation = data.result?.response?.trim() || 'The AI pun tak faham.';
  await incrementSlopCount();

  return new Response(JSON.stringify({ explanation }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
