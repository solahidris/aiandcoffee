export const runtime = 'edge';

import { getSlopCount } from '../../lib/slop-counter';

export default async function handler() {
  const count = await getSlopCount();
  return new Response(JSON.stringify({ count }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
