/**
 * Analyzes coffee shop images to extract espresso machine, grinder,
 * and capacity info — uses the `claude` CLI (your Claude Code subscription,
 * no separate API key needed).
 *
 * Run:
 *   node scripts/analyze-gear.mjs
 *
 * Saves progress to data/shop-gear.json after every shop.
 * Safe to interrupt and resume.
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SHOPS_FILE = join(ROOT, "data/coffee-shops.json");
const IMAGES_DIR = join(ROOT, "public/shops");
const GEAR_FILE  = join(ROOT, "data/shop-gear.json");

const shops    = JSON.parse(readFileSync(SHOPS_FILE, "utf-8"));
const imageMap = JSON.parse(readFileSync(join(ROOT, "data/shop-images.json"), "utf-8"));

const gear = existsSync(GEAR_FILE)
  ? JSON.parse(readFileSync(GEAR_FILE, "utf-8"))
  : {};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getLocalImages(shopId) {
  const dir = join(IMAGES_DIR, shopId);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".jpg"))
    .sort()
    .slice(0, 6)
    .map((f) => join(IMAGES_DIR, shopId, f));
}

function analyzeShop(shop, imagePaths) {
  const readInstructions = imagePaths
    .map((p) => `Read("${p}")`)
    .join(", ");

  const prompt = `Use the Read tool to read these image files: ${imagePaths.map(p => `"${p}"`).join(", ")}

You are analyzing photos of "${shop.name.trim()}" coffee shop in ${shop.area}.

Look at all images carefully for:
1. Espresso machine brand and model (e.g. "La Marzocco Linea", "Slayer", "Victoria Arduino Black Eagle", "Synesso MVP", "Nuova Simonelli Aurelia Wave")
2. Coffee grinder brand and model (e.g. "Mahlkönig EK43", "Mythos 2", "Niche Zero", "Mazzer Major", "Fellow Ode")
3. Approximate total seating capacity (count seats/tables visible, estimate whole cafe)

Reply with ONLY a JSON object — no explanation, no markdown:
{"machine":null,"grinder":null,"capacity_pax":null}

Rules:
- Only name machine/grinder if you can clearly see the brand. null if unsure.
- capacity_pax: your best estimate of total seats. null if no interior shots.`;

  try {
    const result = execSync(`claude -p ${JSON.stringify(prompt)}`, {
      timeout: 60000,
      encoding: "utf-8",
    });

    const match = result.match(/\{[\s\S]*?\}/);
    if (!match) return { machine: null, grinder: null, capacity_pax: null };

    const parsed = JSON.parse(match[0]);
    return {
      machine:      parsed.machine      || null,
      grinder:      parsed.grinder      || null,
      capacity_pax: parsed.capacity_pax || null,
    };
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

    const imagePaths = getLocalImages(shop.id);
    if (imagePaths.length === 0) {
      console.log(`${tag} ${shop.name.trim()} — no local images, skipping`);
      gear[shop.id] = { machine: null, grinder: null, capacity_pax: null };
      continue;
    }

    process.stdout.write(`${tag} ${shop.name.trim()} ... `);

    const result = analyzeShop(shop, imagePaths);

    if (result) {
      gear[shop.id] = result;
      const parts = [
        result.machine      && `machine: ${result.machine}`,
        result.grinder      && `grinder: ${result.grinder}`,
        result.capacity_pax && `~${result.capacity_pax} pax`,
      ].filter(Boolean);
      console.log(parts.length ? `✓ ${parts.join(" · ")}` : "— no gear visible");
      if (parts.length) found++;
      done++;
    } else {
      console.log("✗ failed");
      failed++;
    }

    // Save progress every 5 shops
    if ((done + failed) % 5 === 0) {
      writeFileSync(GEAR_FILE, JSON.stringify(gear, null, 2));
    }

    await sleep(500);
  }

  writeFileSync(GEAR_FILE, JSON.stringify(gear, null, 2));

  console.log(`\n─────────────────────────────────`);
  console.log(`Analyzed: ${done}`);
  console.log(`Found gear/capacity: ${found}`);
  console.log(`Failed: ${failed}`);
  console.log(`\nRun: npm run merge-gear`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  writeFileSync(GEAR_FILE, JSON.stringify(gear, null, 2));
  process.exit(1);
});
