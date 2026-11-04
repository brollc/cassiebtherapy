#!/usr/bin/env node
/* Socket-driven Publii render test (Option A).
 * Launches Publii with remote debugging, triggers the real preview render
 * via the app's own IPC bridge, then verifies the generated output.
 *
 * Usage: node render-driver.js [--keep]   (NODE_PATH not needed; no deps)
 */
const { execFile, spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");

const SITE = "cassie-b-therapy";
const THEME = "cassieb";
const DEBUG_PORT = 9222;
const PREVIEW_DIR = path.join(process.env.HOME, "Publii", "sites", SITE, "preview");
const KEEP = process.argv.includes("--keep");
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
      const targets = await getJSON(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const pages = targets.filter(t => t.type === "page");
      if (pages.length) return pages;
    } catch (e) { /* not up yet */ }
    await sleep(1000);
  }
  throw new Error("debugger targets never appeared");
}

function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  return new Promise((resolve, reject) => {
    ws.onopen = () => resolve({
      send(method, params) {
        return new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
      },
      close: () => ws.close(),
    });
    ws.onerror = reject;
  });
}

function countFiles(dir) {
  let n = 0;
  if (!fs.existsSync(dir)) return 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) n += countFiles(path.join(dir, ent.name)); else n++;
  }
  return n;
}

async function main() {
  // 1. clear old preview + launch Publii with the debug port
  // always test the CURRENT repo theme: sync it into the site before rendering
  const siteTheme = path.join(process.env.HOME, "Publii", "sites", SITE, "input", "themes", "cassieb");
  fs.rmSync(siteTheme, { recursive: true, force: true });
  fs.cpSync("/home/cassie/cassie-website/publii/cassieb", siteTheme, { recursive: true });

  fs.rmSync(PREVIEW_DIR, { recursive: true, force: true });
  console.log("launching Publii with --remote-debugging-port=" + DEBUG_PORT);
  const child = spawn("/usr/bin/publii", [`--remote-debugging-port=${DEBUG_PORT}`], {
    detached: true, stdio: "ignore",
  });
  child.unref();
  const startTime = Date.now();

  // 2. wait for the window target
  const targets = await waitForTargets();
  ok(`debugger up, ${targets.length} page target(s) in ${((Date.now()-startTime)/1000).toFixed(0)}s`);
  const win = targets[0];

  // 3. wait for the app UI to be ready (mainProcessAPI exposed by preload)
  const conn = await cdp(win.webSocketDebuggerUrl);
  let ready = false;
  for (let i = 0; i < 60 && !ready; i++) {
    const r = await conn.send("Runtime.evaluate", { expression: "typeof mainProcessAPI", returnByValue: true });
    if (r.result && r.result.result && r.result.result.value === "object") ready = true;
    else await sleep(1000);
  }
  if (!ready) { fail("mainProcessAPI never appeared (preload not ready)"); conn.close(); return finish(child); }
  ok("mainProcessAPI bridge is available");

  // 4. register result listeners, then fire the render — exactly what the Preview button sends
  const hook = `mainProcessAPI.receiveOnce('app-preview-rendered', (...a) => { window.__renderResult = JSON.stringify({ ok: true, args: a }); });
mainProcessAPI.receiveOnce('app-preview-render-error', (...a) => { window.__renderResult = JSON.stringify({ ok: false, args: a }); });`;
  await conn.send("Runtime.evaluate", { expression: hook, returnByValue: true });
  const expr = `mainProcessAPI.send('app-preview-render', { site: '${SITE}', theme: '${THEME}', itemID: false, mode: false, postData: false, showPreview: false })`;
  const r = await conn.send("Runtime.evaluate", { expression: expr, returnByValue: true });
  if (r.result && r.result.exceptionDetails) fail("evaluate threw: " + JSON.stringify(r.result.exceptionDetails));
  else ok("app-preview-render sent (showPreview: false — silent render)");

  // 5. wait for the result event, then for output to stabilize
  let result = null;
  for (let i = 0; i < 150 && result === null; i++) {
    await sleep(1000);
    const res = await conn.send("Runtime.evaluate", { expression: "window.__renderResult || null", returnByValue: true });
    if (res.result && res.result.result && res.result.result.value) result = JSON.parse(res.result.result.value);
  }
  if (result) {
    if (result.ok) ok("app-preview-rendered received: render completed");
    else fail("app-preview-render-error: " + JSON.stringify(result.args).slice(0, 800));
  } else {
    fail("no render result event within 150s (checking files anyway)");
  }
  let lastCount = -1, stable = 0;
  for (let i = 0; i < 30; i++) {
    const n = countFiles(PREVIEW_DIR);
    if (n === lastCount && n > 0) { stable++; if (stable >= 3) break; } else stable = 0;
    lastCount = n;
    await sleep(1000);
  }
  conn.close();
  if (lastCount === 0) { fail("no preview files were generated"); return finish(child); }
  ok(`preview generated: ${lastCount} files`);

  // 6. verify the output
  const home = fs.readFileSync(path.join(PREVIEW_DIR, "index.html"), "utf8");
  const decode = s => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  const page = decode(home);
  const must = ["Integrative, holistic psychotherapy", "Hello there!", "I'm glad you're here.",
    "MN License #cc04877", "feels like crap too", "Session Cost", "$175 for a 50-minute session",
    "private-pay practice", "Browse the full bookshelf", "cassie@cassiebtherapy.com",
    "How does online therapy work?", "main.css"];
  for (const m of must) if (!page.includes(m)) fail(`rendered homepage missing: ${m}`);
  const gone = ["Sacred work", "Common questions", "How long is each session", "Do you accept insurance",
    "What are your rates", "Loveland", "resonate", "slower, softer", "(952)"];
  for (const g of gone) if (page.includes(g)) fail(`rendered homepage must not contain: ${g}`);
  if ((page.match(/faq-item/g) || []).length !== 3) fail("rendered homepage should have exactly 3 FAQ items");
  if (fs.existsSync(path.join(PREVIEW_DIR, "assets", "css", "main.css"))) ok("theme CSS deployed to output");
  else fail("output missing assets/css/main.css");
  const imgs = countFiles(path.join(PREVIEW_DIR, "assets", "images"));
  ok(`bundled images deployed: ${imgs}`);

  // 7. definitive check: normalized body diff vs the live static site
  const staticSite = fs.readFileSync("/home/cassie/cassie-website/index.html", "utf8");
  const norm = (src) => {
    let s = src.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
    s = s.replace(/<!--[\s\S]*?-->/g, "");
    s = s.replace(/file:\/\/\/home\/cassie\/Publii\/sites\/cassie-b-therapy\/preview\//g, "");
    for (const pg of ["about", "therapy", "bookshelf"]) s = s.split(`href="${pg}/"`).join(`href="${pg}.html"`);
    s = s.replace(/assets\/css\/main\.css[^"]*/g, "STYLESHEET");
    s = s.replace(/>\s+</g, "><").replace(/>\s+/g, ">").replace(/\s+</g, "<").replace(/\s+/g, " ");
    return s.trim();
  };
  const strip = (src) => (src.match(/<main[\s\S]*?<\/footer>/) || [""])[0];
  const pBody = norm(strip(home)), sBody = norm(strip(staticSite));
  if (pBody === sBody) ok(`body diff vs live static site: IDENTICAL (${pBody.length} chars)`);
  else fail(`body diff vs static site: ${pBody.length} vs ${sBody.length} chars — inspect manually`);

  console.log(failures === 0 ? "\nRENDER TEST PASSED — real Publii renderer, real site DB" : `\n${failures} FAILURES`);
  finish(child);
}

function finish(child) {
  if (!KEEP) { try { process.kill(-child.pid, "SIGTERM"); } catch (e) { try { child.kill("SIGTERM"); } catch (e2) {} } }
  else console.log("(--keep: Publii left running)");
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error("DRIVER ERROR:", e.message); process.exit(1); });
