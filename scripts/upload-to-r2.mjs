/**
 * Uploads all downloaded shop images to Cloudflare R2 and updates
 * data/shop-images.json with R2 public URLs.
 *
 * Prerequisites:
 *   1. Create an R2 bucket in the Cloudflare dashboard (e.g. "aiandcoffee-shops")
 *   2. Enable public access on the bucket → copy the public URL base
 *   3. Create an R2 API token (Cloudflare dashboard → R2 → Manage API tokens)
 *   4. Set env vars (add to .env.local):
 *        R2_ACCOUNT_ID=...         (same as CF_ACCOUNT_ID)
 *        R2_ACCESS_KEY_ID=...
 *        R2_SECRET_ACCESS_KEY=...
 *        R2_BUCKET=aiandcoffee-shops
 *        R2_PUBLIC_URL=https://pub-xxxx.r2.dev   (from bucket public URL setting)
 *
 * Run:
 *   node scripts/upload-to-r2.mjs
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Load env from .env.local manually (no dotenv dependency)
const envPath = join(ROOT, ".env.local");
if (existsSync(envPath)) {
  readFileSync(envPath, "utf-8").split("\n").forEach((line) => {
    const [k, ...v] = line.split("=");
    if (k && v.length && !process.env[k.trim()]) {
      process.env[k.trim()] = v.join("=").trim();
    }
  });
}

const ACCOUNT_ID  = process.env.R2_ACCOUNT_ID  || process.env.CF_ACCOUNT_ID;
const ACCESS_KEY  = process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY  = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET      = process.env.R2_BUCKET      || "aiandcoffee-shops";
const PUBLIC_URL  = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY || !PUBLIC_URL) {
  console.error(`
Missing env vars. Add to .env.local:
  R2_ACCOUNT_ID=...
  R2_ACCESS_KEY_ID=...
  R2_SECRET_ACCESS_KEY=...
  R2_BUCKET=aiandcoffee-shops
  R2_PUBLIC_URL=https://pub-xxxx.r2.dev
`);
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

const IMAGES_DIR = join(ROOT, "public/shops");
const MANIFEST   = join(ROOT, "data/shop-images.json");
const manifest   = JSON.parse(readFileSync(MANIFEST, "utf-8"));

async function objectExists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadFile(localPath, key) {
  const body = readFileSync(localPath);
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: "image/jpeg",
    CacheControl: "public, max-age=31536000, immutable",
  }));
}

async function main() {
  const shopDirs = readdirSync(IMAGES_DIR).filter((d) =>
    statSync(join(IMAGES_DIR, d)).isDirectory()
  );

  console.log(`Uploading images for ${shopDirs.length} shops to R2 bucket "${BUCKET}"...\n`);

  let uploaded = 0, skipped = 0, failed = 0;
  const updatedManifest = { ...manifest };

  for (let i = 0; i < shopDirs.length; i++) {
    const shopId = shopDirs[i];
    const shopDir = join(IMAGES_DIR, shopId);
    const files = readdirSync(shopDir).filter((f) => f.endsWith(".jpg")).sort();

    if (files.length === 0) continue;

    process.stdout.write(`[${i + 1}/${shopDirs.length}] ${shopId} `);

    const r2Urls = [];
    let shopUploaded = 0;

    for (const file of files) {
      const key = `shops/${shopId}/${file}`;
      const localPath = join(shopDir, file);

      try {
        const exists = await objectExists(key);
        if (exists) {
          r2Urls.push(`${PUBLIC_URL}/${key}`);
          skipped++;
        } else {
          await uploadFile(localPath, key);
          r2Urls.push(`${PUBLIC_URL}/${key}`);
          uploaded++;
          shopUploaded++;
        }
      } catch (e) {
        console.error(`\n  Failed ${key}: ${e.message}`);
        failed++;
      }
    }

    updatedManifest[shopId] = r2Urls;
    console.log(`→ ${shopUploaded} uploaded, ${files.length - shopUploaded} already on R2`);

    // Save manifest progress after each shop
    writeFileSync(MANIFEST, JSON.stringify(updatedManifest, null, 2));
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Already on R2: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Manifest updated: data/shop-images.json`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
