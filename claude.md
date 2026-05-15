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
- Cloudflare Workers AI (for Slop Centre LLM features)

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
| `/api/roast` | `pages/api/roast.ts` | Roasts any text input via Cloudflare Workers AI |
| `/api/roast-threads` | `pages/api/roast-threads.ts` | Fetches Threads profile bio and roasts it |
| `/api/startup-pitch` | `pages/api/startup-pitch.ts` | Converts plain idea to VC buzzword pitch |
| `/api/standup` | `pages/api/standup.ts` | Generates standup update from mood/context |
| `/api/sitemap` | `pages/api/sitemap.ts` | Serves sitemap.xml (rewritten from `/sitemap.xml`) |

## Environment Variables

Required for Slop Centre AI features:

| Variable | Description |
|----------|-------------|
| `CF_ACCOUNT_ID` | Cloudflare account ID |
| `CF_AI_TOKEN` | Cloudflare API token with Workers AI permission |

Set these in `.env.local` for local dev and in Cloudflare Pages dashboard for production.

## Rules

- **All API routes must use Edge Runtime.** Add `export const runtime = 'edge';` to every file in `pages/api/`. Cloudflare Pages does not support Node.js runtime.
- **Sitemap is served via `/api/sitemap`** with a rewrite in `next.config.ts` mapping `/sitemap.xml` → `/api/sitemap`. Do not add a `pages/sitemap.xml.tsx` page — `getServerSideProps` is incompatible with Edge Runtime.

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
