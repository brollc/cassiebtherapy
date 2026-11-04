/* Cassie B Therapy theme — consolidated test harness
 * 1. Renderer-contract checks (every themeConfig read from Publii's extracted source)
 * 2. Template render tests (all 9 templates, mocked Publii helpers, posts present + empty)
 * 3. Content assertions (current site copy, no stale content)
 */
const Handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const themeDir = "/home/cassie/cassie-website/publii/cassieb";
let failures = 0;
const fail = (msg) => { failures++; console.log("FAIL:", msg); };
const ok = (msg) => console.log("OK  :", msg);

// ---------- 1. renderer contract ----------
const cfg = JSON.parse(fs.readFileSync(path.join(themeDir, "config.json"), "utf8"));
const types = {
  name: "string", version: "string", author: "string", renderer: "object",
  supportedFeatures: "object", menus: "object", files: "object", config: "object",
  customConfig: "object", postConfig: "object", pageConfig: "object",
  postTemplates: "object", pageTemplates: "object", tagTemplates: "object",
  authorTemplates: "object", defaultTemplates: "object",
};
for (const [k, t] of Object.entries(types)) {
  if (typeof cfg[k] !== t) fail(`contract: ${k} must be ${t} (got ${typeof cfg[k]})`);
}
if (!cfg.config.some(c => c.name === "logo" && typeof c.value === "string")) fail("contract: config.logo missing");
if (typeof cfg.files.assetsPath !== "string") fail("contract: files.assetsPath must be a string");
if (typeof cfg.defaultTemplates.post !== "string" || typeof cfg.defaultTemplates.page !== "string") fail("contract: defaultTemplates.post/page must be strings");
const names = cfg.customConfig.map(c => c.name);
if (new Set(names).size !== names.length) fail("config: duplicate customConfig names");
for (const c of cfg.customConfig) {
  if (c.type === "repeater") {
    const skeys = new Set(c.structure.map(s => s.name));
    for (const item of (c.value || [])) {
      const diff = [...Object.keys(item).filter(k => !skeys.has(k)), ...[...skeys].filter(k => !(k in item))];
      if (diff.length) fail(`repeater ${c.name}: item key mismatch ${diff.join(", ")}`);
    }
  }
}
ok(`contract checks passed (${names.length} customConfig fields)`);

// ---------- 2. render tests ----------
for (const p of ["head", "header", "footer"]) {
  Handlebars.registerPartial(p, fs.readFileSync(path.join(themeDir, "partials", p + ".hbs"), "utf8"));
}
const noop = () => "";
for (const h of ["css","metaDescription","metaRobots","canonicalLink","feedLink","socialMetaTags","publiiHead","jsonLD","lazyload","checkIfAny"]) Handlebars.registerHelper(h, noop);
Handlebars.registerHelper("date", () => "Nov 2, 2026");
Handlebars.registerHelper("getPagesByCustomFields", function(query, options) {
  // mock: return the real home seed as the frontpage page context
  const seed = fs.readFileSync(path.join(themeDir, "seed", "home.html"), "utf8");
  return options.fn({ text: seed, title: "Home" });
});
Handlebars.registerHelper("translate", (k) => k);

const custom = {};
for (const c of cfg.customConfig) custom[c.name] = c.value !== undefined ? c.value : "";
const data = {
  website: { name: "Cassie B Therapy", baseUrl: "https://x.test/", language: "en", assetsUrl: "/assets", description: "d", lastUpdate: 1700000000, contentStructure: { posts: [], pages: [], tags: [], authors: [] } },
  config: { custom, site: { responsiveImages: true } },
  pagination: {},
};

const pages = [{ title: "About", text: "<p>holiday dinner</p><p>take a look at</p>", slug: "about", template: "about" }];
const posts = [{ url: "/p1/", title: "P", excerpt: "e", createdAt: 1700000000, text: "t", mainTag: false, author: { name: "Cassie", url: "#", avatarImage: { url: "" } } }];
const ctx = {
  title: "T",
  posts, pages,
  tag: { name: "x", description: "", postsNumber: 1 },
  author: { name: "Cassie", description: "", postsNumber: 1 },
  page: pages[0], post: posts[0],
};

for (const f of ["index.hbs","post.hbs","page.hbs","page-about.hbs","page-therapy.hbs","page-bookshelf.hbs","tag.hbs","author.hbs","404.hbs"]) {
  try {
    const out = Handlebars.compile(fs.readFileSync(path.join(themeDir, f), "utf8"))(ctx, { data });
    if (/\{\{|\}\}/.test(out)) fail(`${f}: unresolved tokens in output`);
    ok(`${f} renders (${out.length} chars)`);
  } catch (e) { fail(`${f}: ${e.message}`); }
}

// ---------- 3. content assertions on the homepage render ----------
const decode = (s) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x60;/g, "`");
const home = decode(Handlebars.compile(fs.readFileSync(path.join(themeDir, "index.hbs"), "utf8"))(ctx, { data }));
const must = [
  "Integrative, holistic psychotherapy", "Hello there!", "I'm glad you're here.",
  "MN License #cc04877", "feels like crap too", "Session Cost", "$175 for a 50-minute session",
  "private-pay practice", "sliding scale", "Browse the full bookshelf",
  "cassie@cassiebtherapy.com", "FAQ", "How does online therapy work?",
  "From the blog",
];
for (const m of must) if (!home.includes(m)) fail(`homepage missing: ${m}`);
const gone = ["Sacred work", "How long is each session", "Do you accept insurance", "What are your rates",
  "Common questions", "contact-form", "Loveland", "resonate", "slower, softer", "(952)"];
for (const g of gone) if (home.includes(g)) fail(`homepage should not contain: ${g}`);
if ((home.match(/faq-item/g) || []).length !== 3) fail("homepage should have exactly 3 FAQ items");
ok("content assertions passed");

// pages render their WYSIWYG body content
const about = Handlebars.compile(fs.readFileSync(path.join(themeDir, "page-about.hbs"), "utf8"))(ctx, { data });
for (const m of ["holiday dinner", "take a look at"]) if (!about.includes(m)) fail(`about page template missing body content: ${m}`);
const work = Handlebars.compile(fs.readFileSync(path.join(themeDir, "page-therapy.hbs"), "utf8"))(ctx, { data });
if (!work.includes("holiday dinner")) fail("work page template missing body content");
const shelf = Handlebars.compile(fs.readFileSync(path.join(themeDir, "page-bookshelf.hbs"), "utf8"))(ctx, { data });
if (!shelf.includes("holiday dinner")) fail("bookshelf page template missing body content");
// seed files carry the real page content
for (const pg of ["about", "therapy", "bookshelf"]) {
  const marks = {
    "about": ["holiday dinner", "MN License #cc04877"],
    "therapy": ["Questions we might sit with together", "Narrative", "Attachment"],
    "bookshelf": ["Dungeon Crawler Carl", "The Body Keeps the Score", "#DOMAIN_NAME#", 'data-responsive="false"'],
  }[pg];
  const seed = fs.readFileSync(path.join(themeDir, "seed", pg + ".html"), "utf8");
  for (const m of marks) if (!seed.includes(m)) fail(`seed/${pg}.html missing: ${m}`);
}
ok("body-driven page templates + seed files verified");

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
