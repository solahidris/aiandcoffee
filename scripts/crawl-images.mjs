/**
 * Google Maps image crawler for coffee shops.
 *
 * For each shop with a google_maps URL, opens the page in a headless browser,
 * intercepts Google CDN image responses, and downloads up to MAX_PHOTOS images.
 * Progress is saved after every shop so the script is safe to interrupt and resume.
 *
 * Run:
 *   node scripts/crawl-images.mjs
 *
 * Output:
 *   public/shops/[id]/1.jpg, 2.jpg, ...
 *   data/shop-images.json  (path manifest, used by the shop detail page)
 */

import { chromium } from "playwright";
import {
  createWriteStream,
  mkdirSync,
  existsSync,
  readdirSync,
  writeFileSync,
  readFileSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const IMAGES_DIR = join(ROOT, "public/shops");
const MANIFEST = join(ROOT, "data/shop-images.json");
const MAX_PHOTOS = 6;
const DELAY_MIN = 2500;
const DELAY_JITTER = 1500;

const shops = JSON.parse(readFileSync(join(ROOT, "data/coffee-shops.json"), "utf-8"));

// Load existing progress so we can resume
const manifest = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf-8"))
  : {};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0", Referer: "https://www.google.com/" } },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const file = createWriteStream(dest);
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
        file.on("error", reject);
      }
    );
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

function normaliseGoogleUrl(url) {
  // Swap size suffix for a consistent high-res version
  return url.replace(/=(?:w\d+)?(?:-h\d+)?(?:-[a-z0-9-]+)*$/i, "=w1200-h900-k-no");
}

function isPlaceImage(url) {
  return (
    (url.includes("lh3.googleusercontent.com") ||
      url.includes("lh4.googleusercontent.com") ||
      url.includes("lh5.googleusercontent.com") ||
      url.includes("lh6.googleusercontent.com")) &&
    // Exclude avatars and icons — real photos tend to have =w or /places/ in the path
    (url.includes("=w") || url.includes("/places/") || url.includes("/p/"))
  );
}

async function crawlShop(context, shop) {
  const shopDir = join(IMAGES_DIR, shop.id);
  mkdirSync(shopDir, { recursive: true });

  const collected = new Set();
  const page = await context.newPage();

  // Intercept actual image file responses from Google CDN
  page.on("response", async (res) => {
    const url = res.url();
    const ct = res.headers()["content-type"] ?? "";
    if ((ct.startsWith("image/jpeg") || ct.startsWith("image/webp")) && isPlaceImage(url)) {
      collected.add(normaliseGoogleUrl(url));
    }
  });

  try {
    await page.goto(shop.google_maps, { waitUntil: "domcontentloaded", timeout: 30000 });
    await sleep(3000);

    // Try to open the Photos panel to trigger more image loads
    try {
      const photoBtn = page.getByRole("button", { name: /photos/i }).first();
      if (await photoBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await photoBtn.click();
        await sleep(2500);
      }
    } catch {
      // no photos button — that's fine
    }

    // Also scrape <img> src attributes that Playwright responses may have missed
    const domUrls = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img[src]"))
        .map((el) => el.src)
        .filter(
          (s) =>
            (s.includes("lh3.googleusercontent.com") ||
              s.includes("lh4.googleusercontent.com") ||
              s.includes("lh5.googleusercontent.com") ||
              s.includes("lh6.googleusercontent.com")) &&
            (s.includes("=w") || s.includes("/places/") || s.includes("/p/"))
        )
    );
    domUrls.forEach((u) => collected.add(normaliseGoogleUrl(u)));
  } catch (err) {
    console.error(`  navigation error: ${err.message}`);
  }

  await page.close();

  // Download up to MAX_PHOTOS
  const urls = [...collected].slice(0, MAX_PHOTOS);
  const saved = [];

  for (let i = 0; i < urls.length; i++) {
    const dest = join(shopDir, `${i + 1}.jpg`);
    try {
      await downloadFile(urls[i], dest);
      saved.push(`/shops/${shop.id}/${i + 1}.jpg`);
    } catch (e) {
      console.error(`  download ${i + 1} failed: ${e.message}`);
    }
  }

  return saved;
}

async function main() {
  const shopsWithMaps = shops.filter((s) => s.google_maps);
  console.log(`${shops.length} shops total, ${shopsWithMaps.length} have Maps URLs\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
    locale: "en-US",
    timezoneId: "Asia/Kuala_Lumpur",
  });

  let done = 0, skipped = 0, failed = 0;

  for (let i = 0; i < shops.length; i++) {
    const shop = shops[i];
    const tag = `[${i + 1}/${shops.length}]`;

    if (!shop.google_maps) {
      console.log(`${tag} ${shop.name.trim()} — no Maps URL, skipping`);
      skipped++;
      continue;
    }

    // Resume: skip if already downloaded
    if (manifest[shop.id]?.length > 0) {
      console.log(`${tag} ${shop.name.trim()} — already done (${manifest[shop.id].length} images)`);
      skipped++;
      continue;
    }

    console.log(`${tag} ${shop.name.trim()}`);

    const images = await crawlShop(context, shop);

    if (images.length > 0) {
      manifest[shop.id] = images;
      done++;
      console.log(`  ✓ ${images.length} image(s) saved`);
    } else {
      failed++;
      console.log(`  ✗ no images found`);
    }

    // Persist after every shop so progress survives interruption
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

    await sleep(DELAY_MIN + Math.random() * DELAY_JITTER);
  }

  await browser.close();

  console.log(`\n─────────────────────────────────`);
  console.log(`Done:    ${done}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed:  ${failed}`);
  console.log(`Manifest written to data/shop-images.json`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
