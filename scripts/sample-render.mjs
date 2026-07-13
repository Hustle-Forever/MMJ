// Samples the rendered canvas screenshot vs the source photo to measure the
// effective light multiplier (in linear space).
// Usage: bun scripts/sample-render.mjs <screenshot.png>
import sharp from "sharp";

const file = process.argv[2];
const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });

const srgb2lin = (v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

// Sample a horizontal band across the middle of the image; report the darkest
// and lightest stripe clusters (like sample-stripes.mjs).
const y = Math.round(info.height * 0.55);
const px = [];
for (let x = Math.round(info.width * 0.35); x < info.width * 0.65; x++) {
  const i = (y * info.width + x) * info.channels;
  if (info.channels === 4 && data[i + 3] < 200) continue;
  px.push([data[i], data[i + 1], data[i + 2]]);
}
const lum = (p) => 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
const sorted = [...px].sort((a, b) => lum(a) - lum(b));
const avg = (arr) => [0, 1, 2].map((c) => arr.reduce((s, p) => s + p[c], 0) / arr.length);
const dark = avg(sorted.slice(0, Math.floor(sorted.length * 0.3)));
const light = avg(sorted.slice(-Math.floor(sorted.length * 0.3)));
const hex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

// Photo reference (from sample-stripes.mjs): blue dark #5181C0, light #B2C5DF
const refDark = [0x51, 0x81, 0xc0];
const refLight = [0xb2, 0xc5, 0xdf];
const factor = (r, s) =>
  [0, 1, 2].map((c) => (srgb2lin(s[c]) / srgb2lin(r[c])).toFixed(3)).join(", ");

console.log(`rendered dark  ${hex(dark)}   linear factor vs photo: ${factor(refDark, dark)}`);
console.log(`rendered light ${hex(light)}   linear factor vs photo: ${factor(refLight, light)}`);
