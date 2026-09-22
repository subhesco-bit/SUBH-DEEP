import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const svg = readFileSync("/workspace/public/favicon.svg", "utf8");

async function shot(size, out) {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<!doctype html><html><head><style>
      html,body{margin:0;padding:0;width:${size}px;height:${size}px;overflow:hidden;background:#0c0c0b}
      svg{display:block;width:${size}px;height:${size}px}
    </style></head><body>${svg}</body></html>`,
    { waitUntil: "load" },
  );
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: size, height: size } });
  await browser.close();
}

await shot(16, "/workspace/.grok/favicon-16.png");
await shot(32, "/workspace/.grok/favicon-32.png");
await shot(64, "/workspace/.grok/favicon-64.png");
console.log("rasterized inline svg");
