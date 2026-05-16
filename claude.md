# ai and coffee

An open source project for the community to keep building and evolving.

## Quick Start

```bash
git clone https://github.com/solahidris/aiandcoffee.git && cd aiandcoffee && npm install && npm run dev
```

## Philosophy

- No BS
- No hierarchy
- The most outrageous community with no laws
- **The only rule is to be nice**

Think of it like a DAO but open-ended and ever-evolving. The community decides everything.

## Who's Welcome

Everyone. All levels:
- Clueless about AI
- Beginners
- Seniors
- Whales
- Sharks

## Social Media

None. Just a WhatsApp group. No plans to expand anytime soon. We'll only think about it after we hit max capacity (1024 people) on WhatsApp first.

## Links

- **WhatsApp Group**: https://chat.whatsapp.com/EKzcQdbJIgSBRQ4JXos8Zi
- **Next Event**: https://luma.com/9f63qyq1

## Tech Stack

- Next.js (Pages Router)
- TypeScript
- Tailwind CSS
- Edge Runtime on Cloudflare Pages
- Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct`) for Slop Centre LLM features
- Cloudflare KV for slop counter persistence

## Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `pages/index.tsx` | Homepage |
| `/events` | `pages/events.tsx` | Events listing |
| `/tools` | `pages/tools/index.tsx` | AI tools directory |
| `/tools/og-image` | `pages/tools/og-image.tsx` | OG image generator tool |
| `/slop` | `pages/slop.tsx` | One Slop Centre — AI-powered slop tools |
| `/about` | `pages/about.tsx` | About page |

## API Routes

All routes use `export const runtime = 'edge'`.

| Route | File | Description |
|-------|------|-------------|
| `/api/og` | `pages/api/og.tsx` | Generates OG images as SVG |
| `/api/roast` | `pages/api/roast.ts` | Roasts any text input via Workers AI |
| `/api/roast-threads` | `pages/api/roast-threads.ts` | Fetches Threads profile bio and roasts it |
| `/api/startup-pitch` | `pages/api/startup-pitch.ts` | Converts plain idea to VC buzzword pitch |
| `/api/standup` | `pages/api/standup.ts` | Generates standup update from mood/context |
| `/api/explain` | `pages/api/explain.ts` | Explains topic via Malaysian persona (6 personas) |
| `/api/slop-count` | `pages/api/slop-count.ts` | Reads total slop count from Cloudflare KV |
| `/api/thread-chain` | `pages/api/thread-chain.ts` | Generates viral Threads post chain via ILMU API |
| `/api/sitemap` | `pages/api/sitemap.ts` | Serves sitemap.xml (rewritten from `/sitemap.xml`) |

## Shared Libraries

| File | Description |
|------|-------------|
| `lib/roast-tones.ts` | Tone definitions (English, Malay, Rempit, Pondan) and system prompts for roast routes |
| `lib/slop-counter.ts` | KV counter utilities — reads and increments `slop:total` via Cloudflare KV REST API |

## One Slop Centre (`/slop`)

6 tabs, each with its own URL query param:

| Tab | Query | What it does |
|-----|-------|-------------|
| Roast Anything | `?roast` | Paste text, get roasted |
| Roast by Threads | `?roast-by-threads` | Username → fetch bio → roast |
| Startup Pitch | `?startup-pitch` | Plain idea → VC buzzword pitch |
| Standup BS | `?standup` | Pick mood → standup update |
| Explain Like I'm | `?explain` | Topic → explained by a Malaysian persona |
| Viral Thread | `?thread-chain` | Topic + post count → Manglish thread chain via ILMU API |

Roast tabs support 4 tones: English, Malay, Rempit, Pondan (defined in `lib/roast-tones.ts`).

Explain personas: Mamak Uncle, Makcik Bawang, MLM Boss, Pak Guard, Grab Driver, Crypto Bro.

Share to Threads button on every result — text is capped at 500 chars (Threads limit) via `buildShareText()`.

Slop counter: fixed bottom-right widget. Reads from KV on mount, increments optimistically on each generation.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CF_ACCOUNT_ID` | Cloudflare account ID |
| `CF_AI_TOKEN` | Cloudflare API token — must have **Workers AI: Edit** and **Workers KV Storage: Edit** permissions |
| `ILMU_API_KEY` | ILMU API key (`sk-...`) — OpenAI-compatible endpoint at `https://api.ilmu.ai/v1`, model `nemo-super` |

Set in `.env.local` for local dev, Cloudflare Pages dashboard for production.

## Cloudflare KV

- Namespace: `aiandcoffee-slop`
- Namespace ID: `c6f5cfa59f2a4549a726ab6d22ef0707`
- Binding name: `SLOP_KV` (configured in `wrangler.toml` and Cloudflare Pages → Settings → Functions)
- Counter key: `slop:total`
- Accessed via KV REST API in `lib/slop-counter.ts` (not via bindings — avoids next-on-pages dependency conflict with Next.js 16)

## Rules

- **All API routes must use Edge Runtime.** Add `export const runtime = 'edge';` to every file in `pages/api/`. Cloudflare Pages does not support Node.js runtime.
- **Sitemap is served via `/api/sitemap`** with a rewrite in `next.config.ts` mapping `/sitemap.xml` → `/api/sitemap`. Do not add a `pages/sitemap.xml.tsx` page — `getServerSideProps` is incompatible with Edge Runtime.
- **Do not add `@cloudflare/next-on-pages` as a package dependency** — it conflicts with Next.js 16. KV is accessed via REST API instead.

## Design

- Light mode only
- Clean, minimal aesthetic

### Color System

| Color | Hex | Usage |
|-------|-----|-------|
| Beige | `#E8E4D9` | Background |
| Red | `#D94830` | Primary buttons, accents |
| Red Hover | `#C13D27` | Primary button hover |
| Dark Brown | `#171717` | Text, foreground |
| Zinc 700 | `#3F3F46` | Body text |
| Zinc 600 | `#52525B` | Secondary text |
| Zinc 400 | `#A1A1AA` | Borders |

### Logos

Located in `/public/logo/`:
- `logo.png` - Full logo with mascots and text
- `logo_word.png` - Text only
- `logo_mascot.png` - Mascots only

### Branding

- Always use **"AI and Coffee"** — never "AI & Coffee", "AI & COFFEE", or any ampersand variant.
- This applies everywhere: UI text, alt text, meta tags, JSON, comments, and copy.

## Contributing

This is a community project. Jump in, build something, propose changes. No gatekeepers.

**Always create a new branch for contributions.** Never commit directly to main.
