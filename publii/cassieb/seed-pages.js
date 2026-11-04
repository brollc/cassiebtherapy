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
  { slug: "home", title: "Home", template: "", frontpage: true },
  { slug: "about", title: "About", template: "about" },
  { slug: "therapy", title: "Therapy", template: "therapy", oldSlug: "the-work" },
  { slug: "couples-therapy", title: "Couples Therapy", template: "couples-therapy" },
  { slug: "bookshelf", title: "Bookshelf", template: "bookshelf" },
];

async function main() {
  // guard: Publii must be closed — the real main process is Electron
  // (the /usr/bin/publii wrapper execs it), so match by app path; the
  // character-class trick avoids pgrep matching this script's own wrapper
  try {
    const { execSync } = require("child_process");
    const out = execSync("pgrep -f 'publii/app[.]asar' || true").toString().trim();
    if (out) { console.log("Publii is currently running (pid " + out + ") — close it first, then re-run."); process.exit(1); }
  } catch (e) {}

  // always test the CURRENT repo theme: sync it into the site before rendering
  const siteTheme = path.join(process.env.HOME, "Publii", "sites", SITE, "input", "themes", "cassieb");
  fs.rmSync(siteTheme, { recursive: true, force: true });
  fs.cpSync(THEME_DIR, siteTheme, { recursive: true });
  ok("repo theme synced into site");

  fs.rmSync(PREVIEW_DIR, { recursive: true, force: true });
  const logFd = fs.openSync("/tmp/cassie-extract/publii-main.log", "w");
  const child = spawn("/usr/bin/publii", [`--remote-debugging-port=${DEBUG_PORT}`], { detached: true, stdio: ["ignore", logFd, logFd] });
  child.unref();
  const targets = await waitForTargets();
  const conn = await cdp(targets[0].webSocketDebuggerUrl);
  for (let i = 0; i < 60; i++) {
    const r = await conn.send("Runtime.evaluate", { expression: "typeof mainProcessAPI", returnByValue: true });
    if (r.result?.result?.value === "object") break;
    await sleep(1000);
  }
  ok("Publii up, mainProcessAPI ready");

  // open the site in the app session — setDbForSite is only called by the
  // site-open flow, and page saves need it (this was the cause of the
  // "this.db.prepare is not a function" error window)
  await conn.send("Runtime.evaluate", { expression:
    `mainProcessAPI.receiveOnce('app-site-switched', (...a) => { window.__siteOpened = JSON.stringify(a); });` });
  await conn.send("Runtime.evaluate", { expression:
    `mainProcessAPI.send('app-site-switch', { site: '${SITE}' })`, returnByValue: true });
  let siteOpened = null;
  for (let i = 0; i < 30 && siteOpened === null; i++) {
    await sleep(1000);
    const r = await conn.send("Runtime.evaluate", { expression: "window.__siteOpened || null", returnByValue: true });
    if (r.result?.result?.value) siteOpened = r.result.result.value;
  }
  if (siteOpened && !siteOpened.includes('"error"')) ok("site opened in app session (DB handle ready)");
  else fail("app-site-switch failed: " + (siteOpened || "no response").slice(0, 200));

  // existing pages by slug (read-only DB query — Publii is closed at this point)
  const { execSync } = require("child_process");
  const existing = {};
  try {
    const dbPath = path.join(process.env.HOME, "Publii", "sites", SITE, "input", "db.sqlite");
    const out = execSync(`python3 -c "import sqlite3, json; con=sqlite3.connect('${dbPath}'); print(json.dumps([{'slug': r[0], 'id': r[1]} for r in con.execute('SELECT slug, id FROM posts WHERE status LIKE \\'%is-page%\\'')]))"`).toString();
    for (const r of JSON.parse(out.trim())) existing[r.slug] = r.id;
    for (const p of PAGES) if (!existing[p.slug] && p.oldSlug && existing[p.oldSlug]) existing[p.slug] = existing[p.oldSlug];
    console.log("existing pages:", JSON.stringify(existing));
  } catch (e) { console.log("no existing pages readable:", e.message.split("\n")[0]); }

  // copy the book covers into the bookshelf page's media library so the
  // WYSIWYG editor can display them (#DOMAIN_NAME# resolves to this dir)
  if (existing["bookshelf"]) {
    const mediaDir = path.join(process.env.HOME, "Publii", "sites", SITE, "input", "media", "posts", String(existing["bookshelf"]));
    fs.mkdirSync(mediaDir, { recursive: true });
    const bookSrc = path.join(THEME_DIR, "assets", "images", "books");
    for (const f of fs.readdirSync(bookSrc)) fs.copyFileSync(path.join(bookSrc, f), path.join(mediaDir, f));
    ok(`covers copied to media/posts/${existing["bookshelf"]} (${fs.readdirSync(mediaDir).length} files)`);
  }

  // seed the three pages via the app's own save path (insert or update by id)
  const checkEval = (r, label) => {
    if (r.result && r.result.exceptionDetails) {
      fail(`${label} evaluate threw: ` + JSON.stringify(r.result.exceptionDetails).slice(0, 400));
      return false;
    }
    return true;
  };
  for (const p of PAGES) {
    const text = fs.readFileSync(path.join(THEME_DIR, "seed", p.slug + ".html"), "utf8");
    const payload = {
      site: SITE, id: existing[p.slug] || 0, title: p.title, slug: p.slug, text,
      author: 1, status: "published,is-page",
      creationDate: Date.now(), modificationDate: Date.now(),
      template: p.template,
      editor: "blockeditor", viewOptions: {},
      additionalData: { metaTitle: "", metaDescription: "", metaRobots: "", canonicalUrl: "", ogImage: "", ogTitle: "", ogDescription: "" },
      pageViewSettings: p.frontpage ? { useAsFrontpage: { type: "select", value: "on" } } : {},
      featuredImage: "", featuredImageFilename: "", featuredImageData: { alt: "", caption: "", credits: "" },
    };
    // bulletproof two-step transport: stash the JSON on window, verify it parses, then send
    let r = await conn.send("Runtime.evaluate", { expression:
      `window.__payload = ${JSON.stringify(JSON.stringify(payload))};`, returnByValue: true });
    if (!checkEval(r, `${p.slug} stash`)) break;
    r = await conn.send("Runtime.evaluate", { expression:
      `(() => { const p = JSON.parse(window.__payload); mainProcessAPI.receiveOnce('app-page-saved', (...a) => { window["__saved_${p.slug}"] = JSON.stringify(a); }); mainProcessAPI.send('app-page-save', p); })()`,
      returnByValue: true });
    if (!checkEval(r, `${p.slug} send`)) break;
    let saved = null;
    for (let i = 0; i < 30 && saved === null; i++) {
      await sleep(1000);
      const r = await conn.send("Runtime.evaluate", { expression: `window["__saved_${p.slug}"] || null`, returnByValue: true });
      if (r.result?.result?.value) saved = r.result.result.value;
    }
    if (saved && saved.includes("pages")) ok(`page saved via app: ${p.slug}`);
    else {
      fail(`page save failed for ${p.slug}: ${(saved || "no response").slice(0, 200)}`);
      break;
    }
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
  if (result && result[0] && result[0].status === true) ok("site rendered with seeded pages");
  else fail("render failed: " + JSON.stringify(result).slice(0, 300));
  conn.close();

  // verify each rendered page against the static site
  const norm = (src) => {
    let s = src.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    s = s.replace(/<!--[\s\S]*?-->/g, "");
    s = s.replace(/file:\/\/\/home\/cassie\/Publii\/sites\/cassie-b-therapy\/preview\//g, "");
    s = s.replace(/\/assets\/images\/books\//g, "images/books/");
    for (const pg of ["about", "therapy", "couples-therapy", "bookshelf"]) s = s.split(`href="${pg}/"`).join(`href="${pg}.html"`);
    s = s.split('href="/"').join('href="index.html"');
    // theme footer links the logo to baseUrl#home; static depth pages link to index.html directly
    s = s.replace('href="#home"', 'href="index.html"');
    // Publii templates prefix anchors with baseUrl (empty in file:// preview);
    // map bare anchors back to the static site's index.html#anchor form
    s = s.replace(/href="#([a-z-]+)"/g, 'href="index.html#$1"');
    s = s.replace('href=""', 'href="index.html"');
    // Publii's blockeditor renderer annotates non-media-library imgs; harmless metadata
    s = s.replace(/ data-is-external-image="true"/g, "");
    s = s.replace(/ data-responsive="false"/g, "");
    s = s.replace(/media\/posts\/\d+\//g, "images/books/");
    // Publii auto-processes media-library images into responsive srcset variants
    // (xs/sm/md/xl thumbnails) — strip the renderer-added sizes/srcset for the
    // diff; the visual result is identical (browser picks the best variant)
    s = s.replace(/ sizes="[^"]*" srcset="[^"]*"/g, "");
    s = s.replace(/>\s+</g, "><").replace(/>\s+/g, ">").replace(/\s+</g, "<").replace(/\s+/g, " ");
    return s.trim();
  };
  const strip = (src, from, to) => {
    const i = src.indexOf(from); const j = src.lastIndexOf(to);
    return (i >= 0 && j > i) ? src.slice(i, j) : src;
  };
  for (const p of PAGES) {
    if (p.slug === "home") continue; // homepage diff is handled by render-driver vs index.html
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
  if (failures > 0 && fs.existsSync("/tmp/cassie-extract/publii-main.log")) {
    console.log("\n--- main process log (last 40 lines) ---");
    console.log(fs.readFileSync("/tmp/cassie-extract/publii-main.log", "utf8").trim().split("\n").slice(-40).join("\n"));
  }
  console.log(failures === 0 ? "\nSEED + RENDER + VERIFY: ALL PASSED" : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error("DRIVER ERROR:", e.message); process.exit(1); });
