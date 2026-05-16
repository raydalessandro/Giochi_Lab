import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <text x="256" y="288" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
        font-size="220" font-weight="800" fill="#ffffff" text-anchor="middle">GL</text>
  <circle cx="380" cy="160" r="36" fill="#facc15"/>
</svg>`;

const targets = [
  { out: "public/icon-192.png", size: 192 },
  { out: "public/icon-512.png", size: 512 },
];

for (const { out, size } of targets) {
  mkdirSync(dirname(out), { recursive: true });
  const buf = await sharp(Buffer.from(SVG)).resize(size, size).png().toBuffer();
  writeFileSync(out, buf);
  console.log("wrote", out, buf.length, "bytes");
}
