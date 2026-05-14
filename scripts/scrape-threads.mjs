import { ThreadsAPI } from 'threads-api';
import fs from 'fs';
import path from 'path';

const USERNAME = 'codewithchuba';
const OUTPUT_PATH = path.resolve('data/events.json');

const EVENT_KEYWORDS = [
  'hackathon', 'meetup', 'workshop', 'webinar', 'conference',
  'summit', 'bootcamp', 'event', 'register', 'daftar',
  'join us', 'free ticket', 'tiket percuma',
  '📅', '🗓️', '🎟️', '🚀',
  'this saturday', 'this sunday', 'this week',
  'upcoming', 'akan datang'
];

function isEventPost(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return EVENT_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
}

function parseEventFromPost(post) {
  const item = post.thread_items?.[0]?.post;
  if (!item) return null;

  return {
    id: item.pk || item.id,
    text: item.caption?.text || '',
    timestamp: item.taken_at
      ? new Date(item.taken_at * 1000).toISOString()
      : null,
    url: `https://www.threads.net/@${USERNAME}/post/${item.code}`,
    source: `@${USERNAME}`,
    scrapedAt: new Date().toISOString(),
  };
}

async function run() {
  console.log(`Scraping @${USERNAME}...`);

  const client = new ThreadsAPI();

  const userId = await client.getUserIDfromUsername(USERNAME);
  console.log(`User ID: ${userId}`);

  const threads = await client.getUserThreads(userId);
  console.log(`Fetched ${threads.length} posts`);

  const eventPosts = threads
    .map(parseEventFromPost)
    .filter(Boolean)
    .filter(post => isEventPost(post.text));

  console.log(`Found ${eventPosts.length} event posts`);

  let existing = [];
  if (fs.existsSync(OUTPUT_PATH)) {
    existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
  }

  const existingIds = new Set(existing.map(e => e.id));
  const newEvents = eventPosts.filter(e => !existingIds.has(e.id));

  console.log(`${newEvents.length} new events to add`);

  if (newEvents.length === 0) {
    console.log('No new events. Skipping write.');
    process.exit(0);
  }

  const merged = [...newEvents, ...existing]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 100);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(merged, null, 2));
  console.log(`Wrote ${merged.length} events to ${OUTPUT_PATH}`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
