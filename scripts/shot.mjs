import { chromium } from "playwright-core";
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
for (const scheme of ["light", "dark"]) {
  const page = await browser.newPage({ colorScheme: scheme, viewport: { width: 900, height: 780 } });
  await page.goto(process.env.URL || "http://localhost:4173/", { waitUntil: "networkidle" });
  await page.fill("#input", "Paste any chat here and press speed-read. One word at a time, at the pace you pick.");
  await page.click("#start"); await page.waitForTimeout(250);
  await page.evaluate(() => window.__flashread.stop());
  await page.screenshot({ path: `scripts/flashread-${scheme}.png` });
  await page.close();
}
await browser.close();
console.log("shots saved");
