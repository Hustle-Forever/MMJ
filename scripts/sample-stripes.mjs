// Samples each front cover's light/dark stripe colors + overall average.
// Run: bun scripts/sample-stripes.mjs
import sharp from "sharp";
import path from "node:path";

const dir = path.join(import.meta.dirname, "..", "src", "assets", "covers");
const hex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

for (const color of ["pink", "blue", "green"]) {
  const file = path.join(dir, `cover_${color}_front.webp`);
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const y = Math.round(info.height * 0.62); // below the script text
  const px = [];
  for (let x = Math.round(info.width * 0.1); x < info.width * 0.9; x++) {
    const i = (y * info.width + x) * info.channels;
    px.push([data[i], data[i + 1], data[i + 2]]);
  }
  const lum = (p) => 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
  const sorted = [...px].sort((a, b) => lum(a) - lum(b));
  const avg = (arr) => [0, 1, 2].map((c) => arr.reduce((s, p) => s + p[c], 0) / arr.length);
  const dark = avg(sorted.slice(0, Math.floor(sorted.length * 0.35)));
  const light = avg(sorted.slice(-Math.floor(sorted.length * 0.35)));
  const mid = avg(px);
  console.log(`${color}: dark ${hex(dark)}  light ${hex(light)}  mid ${hex(mid)}`);
}
