/**
 * Merges data/shop-gear.json into data/coffee-shops.json.
 * Only overwrites null fields — never replaces existing data.
 *
 * Run after analyze-gear.mjs:
 *   node scripts/merge-gear.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SHOPS_FILE = join(ROOT, "data/coffee-shops.json");
const GEAR_FILE  = join(ROOT, "data/shop-gear.json");

if (!existsSync(GEAR_FILE)) {
  console.error("data/shop-gear.json not found — run analyze-gear.mjs first");
  process.exit(1);
}

const shops = JSON.parse(readFileSync(SHOPS_FILE, "utf-8"));
const gear  = JSON.parse(readFileSync(GEAR_FILE, "utf-8"));

let machinesFilled = 0, grindersFilled = 0, capacityFilled = 0;

const updated = shops.map((shop) => {
  const g = gear[shop.id];
  if (!g) return shop;

  const out = { ...shop };

  if (!out.machine && g.machine) { out.machine = g.machine; machinesFilled++; }
  if (!out.grinder && g.grinder) { out.grinder = g.grinder; grindersFilled++; }
  if (out.capacity_pax == null && g.capacity_pax) { out.capacity_pax = g.capacity_pax; capacityFilled++; }

  return out;
});

writeFileSync(SHOPS_FILE, JSON.stringify(updated, null, 2));

console.log(`Merged into coffee-shops.json:`);
console.log(`  Machines filled:  ${machinesFilled}`);
console.log(`  Grinders filled:  ${grindersFilled}`);
console.log(`  Capacity filled:  ${capacityFilled}`);
