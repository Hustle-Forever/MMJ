// Converts the processed cover PNGs (from process-covers.ps1) to WebP with
// alpha. Run: bun scripts/covers-to-webp.mjs
import sharp from "sharp";
import { readdirSync, statSync, unlinkSync } from "node:fs";
import path from "node:path";

const dir = path.join(import.meta.dirname, "..", "src", "assets", "covers");

for (const file of readdirSync(dir)) {
  if (!file.endsWith(".png")) continue;
  const src = path.join(dir, file);
  const out = src.replace(/\.png$/, ".webp");
  await sharp(src).webp({ quality: 88, alphaQuality: 90, effort: 6 }).toFile(out);
  const kb = (n) => `${Math.round(statSync(n).size / 1024)} KB`;
  console.log(`${file}: ${kb(src)} -> ${path.basename(out)}: ${kb(out)}`);
  unlinkSync(src);
}
