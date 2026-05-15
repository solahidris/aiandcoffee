export const runtime = 'edge';

function wrapText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines.slice(0, 3);
}

function defaultSVG(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#E8E4D9"/>
  <rect width="16" height="630" fill="#D94830"/>
  <text x="88" y="220" font-family="monospace" font-size="140" font-weight="900" fill="#D94830" letter-spacing="-4">AI</text>
  <text x="88" y="370" font-family="monospace" font-size="140" font-weight="900" fill="#171717" letter-spacing="-4">AND</text>
  <text x="88" y="520" font-family="monospace" font-size="140" font-weight="900" fill="#D94830" letter-spacing="-4">COFFEE</text>
  <text x="88" y="590" font-family="monospace" font-size="22" fill="#52525B" letter-spacing="4">ONLY RULE: BE NICE</text>
  <text x="1136" y="600" font-family="monospace" font-size="18" fill="#A1A1AA" text-anchor="end" letter-spacing="1">aiandcoffee.com</text>
</svg>`;
}

function customSVG(title: string, subtitle: string | null): string {
  const lines = wrapText(title.toUpperCase(), 28);
  const lineHeight = 88;
  const startY = subtitle ? 180 : 220 + (3 - lines.length) * 40;
  const titleElements = lines.map((line, i) =>
    `<text x="88" y="${startY + i * lineHeight}" font-family="monospace" font-size="80" font-weight="900" fill="#171717" letter-spacing="-2">${line}</text>`
  ).join('\n  ');
  const afterTitle = startY + lines.length * lineHeight;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#E8E4D9"/>
  <rect width="16" height="630" fill="#D94830"/>
  <text x="1136" y="56" font-family="monospace" font-size="18" fill="#D94830" text-anchor="end" letter-spacing="2" font-weight="700">AI AND COFFEE</text>
  ${titleElements}
  ${subtitle ? `<text x="88" y="${afterTitle + 32}" font-family="monospace" font-size="30" fill="#52525B" letter-spacing="1">${subtitle}</text>` : ''}
  <text x="1136" y="600" font-family="monospace" font-size="18" fill="#A1A1AA" text-anchor="end" letter-spacing="1">aiandcoffee.com</text>
</svg>`;
}

export default function handler(req: Request) {
  const url = new URL(req.url);
  const title = url.searchParams.get('title')?.trim() || '';
  const subtitle = url.searchParams.get('subtitle')?.trim() || null;

  const svg = title ? customSVG(title, subtitle) : defaultSVG();

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
