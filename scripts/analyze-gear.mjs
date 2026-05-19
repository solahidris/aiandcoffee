/**
 * Analyzes coffee shop images to extract espresso machine, grinder,
 * and capacity info using Claude Haiku vision.
 *
 * Prerequisites:
 *   ANTHROPIC_API_KEY=sk-ant-... in .env.local
 *
 * Run:
 *   node scripts/analyze-gear.mjs
 *
 * Cost estimate: ~$7-10 for all 998 shops (Claude Haiku rates)
 * Resumes automatically if interrupted.
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Load .env.local
const envPath = join(ROOT, ".env.local");
if (existsSync(envPath)) {
  readFileSync(envPath, "utf-8").split("\n").forEach((line) => {
    const [k, ...v] = line.split("=");
    if (k?.trim() && !process.env[k.trim()]) {
      process.env[k.trim()] = v.join("=").trim();
    }
  });
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY in .env.local");
  process.exit(1);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SHOPS_FILE  = join(ROOT, "data/coffee-shops.json");
const IMAGES_FILE = join(ROOT, "data/shop-images.json");
const GEAR_FILE   = join(ROOT, "data/shop-gear.json");
const IMAGES_DIR  = join(ROOT, "public/shops");

const shops    = JSON.parse(readFileSync(SHOPS_FILE, "utf-8"));
const imageMap = JSON.parse(readFileSync(IMAGES_FILE, "utf-8"));

// Load existing gear results so we can resume
const gear = existsSync(GEAR_FILE)
  ? JSON.parse(readFileSync(GEAR_FILE, "utf-8"))
  : {};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadImageAsBase64(shopId, filename) {
  const p = join(IMAGES_DIR, shopId, filename);
  if (!existsSync(p)) return null;
  return readFileSync(p).toString("base64");
}

async function analyzeShop(shop) {
  const localFiles = existsSync(join(IMAGES_DIR, shop.id))
    ? readdirSync(join(IMAGES_DIR, shop.id)).filter((f) => f.endsWith(".jpg")).sort()
    : [];

  if (localFiles.length === 0) return null;

  // Build image content blocks (max 6)
  const imageBlocks = localFiles.slice(0, 6).map((f) => {
    const data = loadImageAsBase64(shop.id, f);
    if (!data) return null;
    return { type: "image", source: { type: "base64", media_type: "image/jpeg", data } };
  }).filter(Boolean);

  if (imageBlocks.length === 0) return null;

  const prompt = `You are analyzing photos of a coffee shop called "${shop.name.trim()}" in ${shop.area}.

Look carefully at all images for:
1. Espresso machine brand and model (e.g. "La Marzocco Linea Mini", "Slayer Single Group", "Victoria Arduino Black Eagle", "Synesso MVP Hydra", "Nuova Simonelli Aurelia")
2. Coffee grinder brand and model (e.g. "Mahlkönig EK43", "Mythos 2", "Niche Zero", "Fellow Ode", "Mazzer Major")
3. Approximate seating capacity (count visible seats/tables and estimate total)

Reply with ONLY a JSON object, no explanation:
{
  "machine": "Brand Model" or null,
  "grinder": "Brand Model" or null,
  "capacity_pax": number or null
}

Rules:
- Only include machine/grinder if you can clearly identify the brand. Do not guess.
- If multiple grinders visible, list the primary one.
- capacity_pax: estimate total seats in the whole cafe based on what you see. null if no interior shots.
- If photos are only food/drinks/exterior with no equipment visible, return all nulls.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [
      {
        role: "user",
        content: [
          ...imageBlocks,
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const text = response.content[0].text.trim();

  // Extract JSON from response
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function main() {
  const toProcess = shops.filter(
    (s) => imageMap[s.id]?.length > 0 && !gear[s.id]
  );

  console.log(`Shops to analyze: ${toProcess.length} (${Object.keys(gear).length} already done)\n`);

  let done = 0, found = 0, failed = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const shop = toProcess[i];
    const tag = `[${i + 1}/${toProcess.length}]`;

    process.stdout.write(`${tag} ${shop.name.trim()} ... `);

    try {
      const result = await analyzeShop(shop);

      if (result) {
        gear[shop.id] = result;
        const hasData = result.machine || result.grinder || result.capacity_pax;
        if (hasData) {
          found++;
          const parts = [
            result.machine && `machine: ${result.machine}`,
            result.grinder && `grinder: ${result.grinder}`,
            result.capacity_pax && `~${result.capacity_pax} pax`,
          ].filter(Boolean);
          console.log(`✓ ${parts.join(" · ")}`);
        } else {
          console.log("— no gear visible");
        }
      } else {
        gear[shop.id] = { machine: null, grinder: null, capacity_pax: null };
        console.log("— no images");
      }

      done++;
    } catch (e) {
      console.log(`✗ ${e.message}`);
      failed++;
    }

    // Save progress every 10 shops
    if (done % 10 === 0) {
      writeFileSync(GEAR_FILE, JSON.stringify(gear, null, 2));
    }

    // Rate limit: ~3 req/s is safe for Haiku
    await sleep(400);
  }

  // Final save
  writeFileSync(GEAR_FILE, JSON.stringify(gear, null, 2));

  console.log(`\n─────────────────────────────────`);
  console.log(`Analyzed: ${done}`);
  console.log(`Found gear/capacity: ${found}`);
  console.log(`Failed: ${failed}`);
  console.log(`\nNow run: node scripts/merge-gear.mjs`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  // Save whatever we have
  writeFileSync(GEAR_FILE, JSON.stringify(gear, null, 2));
  process.exit(1);
});
