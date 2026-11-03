#!/usr/bin/env node
/* Seed + render + verify driver.
 * Creates the three depth pages (about / the-work / bookshelf) in Publii via
 * the app's own app-page-save IPC, renders the site, and diffs each rendered
 * page against the static site. Requires Publii to be CLOSED first (single
 * instance lock) — this driver launches it with the debug port.
 *
 * Usage: node seed-pages.js
 */
const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");

const SITE = "cassie-b-therapy";
const DEBUG_PORT = 9222;
const THEME_DIR = "/home/cassie/cassie-website/publii/cassieb";
const PREVIEW_DIR = path.join(process.env.HOME, "Publii", "sites", SITE, "preview");
let failures = 0;
const ok = (m) => console.log("OK  :", m);
const fail = (m) => { failures++; console.log("FAIL:", m); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let b = ""; res.on("data", d => b += d); res.on("end", () => {
        try { resolve(JSON.parse(b)); } catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}
async function waitForTargets() {
  for (let i = 0; i < 60; i++) {
    try {
      const pages = (await getJSON(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).filter(t => t.type === "page");
      if (pages.length) return pages;
    } catch (e) {}
    await sleep(1000);
  }
  throw new Error("debugger never appeared");
}
function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0; const pending = new Map();
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  return new Promise((res, rej) => {
    ws.onopen = () => res({
      send(method, params) { return new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); }); },
      close: () => ws.close(),
    });
    ws.onerror = rej;
  });
}

const PAGES = [
  { slug: "about", title: "About", template: "about" },
  { slug: "the-work", title: "The Work", template: "the-work" },
  { slug: "bookshelf", title: "Bookshelf", template: "bookshelf" },
];

async function main() {
  // guard: Publii must be closed
  try {
    const { execSync } = require("child_process");
    const out = execSync("pgrep -f /usr/lib/publii || true").toString().trim();
    if (out) { console.log("Publii is currently running — close it first, then re-run."); process.exit(1); }
  } catch (e) {}

  fs.rmSync(PREVIEW_DIR, { recursive: true, force: true });
  const child = spawn("/usr/bin/publii", [`--remote-debugging-port=${DEBUG_PORT}`], { detached: true, stdio: "ignore" });
  child.unref();
  const targets = await waitForTargets();
  const conn = await cdp(targets[0].webSocketDebuggerUrl);
  for (let i = 0; i < 60; i++) {
    const r = await conn.send("Runtime.evaluate", { expression: "typeof mainProcessAPI", returnByValue: true });
    if (r.result?.result?.value === "object") break;
    await sleep(1000);
  }
  ok("Publii up, mainProcessAPI ready");

  // seed the three pages via the app's own save path
  for (const p of PAGES) {
    const text = fs.readFileSync(path.join(THEME_DIR, "seed", p.slug + ".html"), "utf8");
    const payload = {
      site: SITE, id: 0, title: p.title, slug: p.slug, text,
      author: 1, status: "published,is-page",
      creationDate: Date.now(), modificationDate: Date.now(),
      template: p.template,
      editor: "blockeditor", viewOptions: {},
      additionalData: { metaTitle: "", metaDescription: "", metaRobots: "", canonicalUrl: "", ogImage: "", ogTitle: "", ogDescription: "" },
      pageViewSettings: {},
      featuredImage: "", featuredImageFilename: "", featuredImageData: { alt: "", caption: "", credits: "" },
    };
    await conn.send("Runtime.evaluate", { expression:
      `mainProcessAPI.receiveOnce('app-page-saved', (...a) => { window.__saved_${p.slug} = JSON.stringify(a); });` });
    await conn.send("Runtime.evaluate", { expression:
      `mainProcessAPI.send('app-page-save', ${JSON.stringify(payload).replace(/'/g, "\\'")})`, returnByValue: true });
    let saved = null;
    for (let i = 0; i < 30 && saved === null; i++) {
      await sleep(1000);
      const r = await conn.send("Runtime.evaluate", { expression: `window.__saved_${p.slug} || null`, returnByValue: true });
      if (r.result?.result?.value) saved = r.result.result.value;
    }
    if (saved && saved.includes("pages")) ok(`page saved via app: ${p.slug}`);
    else fail(`page save failed for ${p.slug}: ${(saved || "no response").slice(0, 200)}`);
  }

  // render and verify
  const hook = `mainProcessAPI.receiveOnce('app-preview-rendered', (...a) => { window.__renderResult = JSON.stringify(a); });
mainProcessAPI.receiveOnce('app-preview-render-error', (...a) => { window.__renderResult = JSON.stringify(a); });`;
  await conn.send("Runtime.evaluate", { expression: hook });
  await conn.send("Runtime.evaluate", { expression:
    `mainProcessAPI.send('app-preview-render', { site: '${SITE}', theme: 'cassieb', itemID: false, mode: false, postData: false, showPreview: false })` });
  let result = null;
  for (let i = 0; i < 150 && result === null; i++) {
    await sleep(1000);
    const r = await conn.send("Runtime.evaluate", { expression: "window.__renderResult || null", returnByValue: true });
    if (r.result?.result?.value) result = JSON.parse(r.result.result.value);
  }
  if (result && result[0] === true) ok("site rendered with seeded pages");
  else fail("render failed: " + JSON.stringify(result).slice(0, 300));
  conn.close();

  // verify each rendered page against the static site
  const norm = (src) => {
    let s = src.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    s = s.replace(/<!--[\s\S]*?-->/g, "");
    s = s.replace(/file:\/\/\/home\/cassie\/Publii\/sites\/cassie-b-therapy\/preview\//g, "");
    s = s.replace(/\/assets\/images\/books\//g, "images/books/");
    for (const pg of ["about", "the-work", "bookshelf"]) s = s.split(`href="${pg}/"`).join(`href="${pg}.html"`);
    s = s.replace(/>\s+</g, "><").replace(/>\s+/g, ">").replace(/\s+</g, "<").replace(/\s+/g, " ");
    return s.trim();
  };
  const strip = (src, from, to) => {
    const i = src.indexOf(from); const j = src.lastIndexOf(to);
    return (i >= 0 && j > i) ? src.slice(i, j) : src;
  };
  for (const p of PAGES) {
    let rendered = "";
    for (const cand of [path.join(PREVIEW_DIR, p.slug, "index.html"), path.join(PREVIEW_DIR, p.slug + ".html")]) {
      if (fs.existsSync(cand)) { rendered = fs.readFileSync(cand, "utf8"); break; }
    }
    if (!rendered) { fail(`rendered page not found for ${p.slug}`); continue; }
    const staticSrc = fs.readFileSync(`/home/cassie/cassie-website/${p.slug}.html`, "utf8");
    const a = norm(strip(rendered, "<main", "</footer>")), b = norm(strip(staticSrc, "<main", "</footer>"));
    if (a === b) ok(`${p.slug}: rendered page IDENTICAL to static site (${a.length} chars)`);
    else fail(`${p.slug}: diff vs static site (${a.length} vs ${b.length} chars) — inspect preview output`);
  }
  try { process.kill(-child.pid, "SIGTERM"); } catch (e) {}
  console.log(failures === 0 ? "\nSEED + RENDER + VERIFY: ALL PASSED" : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error("DRIVER ERROR:", e.message); process.exit(1); });
