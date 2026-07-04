import { chromium } from "playwright-core";

const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const URL = process.env.URL || "http://localhost:4173/";
const errors = [];
let failed = false;
const assert = (ok, msg) => { console.log((ok ? "  ok " : "FAIL ") + msg); if (!ok) failed = true; };

const browser = await chromium.launch({ executablePath: EXE, args: ["--no-sandbox"] });
const page = await browser.newPage();
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e)));

await page.goto(URL, { waitUntil: "networkidle" });

// 1. renders
assert((await page.title()).includes("Flashread"), "page title loads");
assert(await page.locator("#cards .card").count() >= 6, "info cards rendered");

// 2. paste + speed-read advances words
await page.fill("#input", "The quick brown fox jumps over the lazy dog and keeps on running.");
await page.click("#start");
await page.waitForTimeout(600);
let s1 = await page.evaluate(() => window.__flashread.state());
assert(s1.count === 13, "tokenized 13 words (got " + s1.count + ")");
assert(s1.idx > 0, "reader advanced past first word (idx=" + s1.idx + ")");

// 3. play/pause toggle via Space (focus a non-input element first)
await page.locator("h1").click();
await page.keyboard.press("Space"); // pause
let paused = await page.evaluate(() => window.__flashread.state());
assert(paused.playing === false, "Space stops playback (playing=" + paused.playing + ")");
await page.waitForTimeout(250);
let stillPaused = await page.evaluate(() => window.__flashread.state());
assert(paused.idx === stillPaused.idx, "playback stays frozen while paused (idx=" + paused.idx + ")");

// 4. speed control persists
await page.evaluate(() => { const s = document.getElementById("wpm"); s.value = 500; s.dispatchEvent(new Event("input")); });
let wpmShown = await page.textContent("#wpm-v");
let wpm2 = await page.inputValue("#wpm2");
assert(wpmShown === "500" && wpm2 === "500", "speed change syncs both sliders + label (" + wpmShown + "/" + wpm2 + ")");
let stored = await page.evaluate(() => localStorage.getItem("flashread-wpm"));
assert(stored === "500", "speed persisted to localStorage (" + stored + ")");

// 5. flash-a-card button loads that text
await page.evaluate(() => window.__flashread.stop());
await page.locator("#cards .card .flash").first().click();
await page.waitForTimeout(200);
let s2 = await page.evaluate(() => window.__flashread.state());
assert(s2.count > 5, "clicking a card's Flash button loads its text (" + s2.count + " words)");

// 6. flash arbitrary selection on the page
await page.evaluate(() => {
  const el = document.querySelector("#cards .card .desc");
  const r = document.createRange(); r.selectNodeContents(el);
  const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
  document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
});
await page.waitForTimeout(100);
let selVisible = await page.locator("#sel-flash").isVisible();
assert(selVisible, "selecting any text reveals the Flash-it button");
await page.click("#sel-flash");
await page.waitForTimeout(150);
let s3 = await page.evaluate(() => window.__flashread.state());
assert(s3.count > 3, "flashing a selection loads it into the reader (" + s3.count + " words)");

// 7. no console errors
assert(errors.length === 0, "no console/page errors" + (errors.length ? ": " + errors.join(" | ") : ""));

await browser.close();
console.log(failed ? "\nSMOKE: FAILED" : "\nSMOKE: PASSED");
process.exit(failed ? 1 : 0);
