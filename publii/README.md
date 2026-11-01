# Cassie B Therapy — Publii Theme

Your therapy practice website, converted into a custom [Publii](https://getpublii.com/) theme.
Publii is a free, open-source desktop app (Windows/macOS/Linux) that lets you edit your site's
content in a friendly GUI and publish it anywhere as a fast, secure static site.

## What's in here

```
cassieb/
├── config.json        ← every editable text field & list (shown in Publii's Theme settings)
├── index.hbs          ← the homepage template (all 12 sections)
├── post.hbs           ← single blog post
├── page.hbs           ← static pages (Privacy Policy, Good Faith Estimate, etc.)
├── tag.hbs            ← post archive by tag
├── author.hbs         ← post archive by author
├── 404.hbs            ← not-found page
├── partials/          ← shared header / footer / <head>
├── assets/css/main.css
├── assets/js/main.js
└── thumbnail.png      ← theme preview image in Publii's UI
```

All content from your original site is preloaded as **defaults** — the moment you install the
theme, the site looks exactly like the one in `../..` (index.html).

## Setup (one-time, ~10 minutes)

1. **Install Publii** — download from <https://getpublii.com/download/> and open it.
2. **Install the theme** — zip this `cassieb` folder (or use the provided `cassieb.zip`),
   then in Publii: three-dot menu (top-right) → **Themes** → **Install theme** → pick the ZIP.
3. **Create your site** — "Create a new site", give it a name (e.g. *Cassie B Therapy*),
   then go to **Site Settings → Basic settings → Theme** and select *Cassie B Therapy* → Save.
4. **Preview** — click the eyeball/preview button. You should see your site.

## How to edit your content (the part you'll do daily)

| What you want to change | Where in Publii |
|---|---|
| Hero headline, tagline, buttons, photo | **Theme → Theme settings → Hero** tab |
| About bio paragraphs & credential cards | **Theme settings → About** tab |
| Checklist items ("Do any of these resonate?") | **Theme settings → Resonate** tab (add/remove/reorder items) |
| "What we'll work through" list | **Theme settings → Glimpse** tab |
| Getting-started steps | **Theme settings → Getting started** tab (numbered automatically) |
| Location cards | **Theme settings → Locations** tab |
| "What makes us different" cards | **Theme settings → Approach** tab |
| Specialty cards | **Theme settings → Specialties** tab |
| FAQ questions | **Theme settings → FAQ** tab |
| Contact info, footer, crisis note | **Theme settings → Contact / Footer** tabs |
| Practice name & logo text | **Site Settings → Basic settings** (site name) |
| Write blog posts | **Posts → Add new post** (WYSIWYG block editor) — newest posts appear on the homepage |
| Privacy Policy / legal pages | **Pages → Add new page**, then paste its URL into the Footer tab's legal links |

## Contact form (important)

Static sites can't process forms by themselves. Two options:

- **Recommended:** create a free form at [formspree.io](https://formspree.io), then paste the
  endpoint URL (looks like `https://formspree.io/f/xxxxxxx`) into **Theme settings → Contact →
  Contact form endpoint**. Submissions arrive in your email inbox.
- **Fallback (do nothing):** with no endpoint set, the form opens the visitor's email app
  with their message pre-filled.

## Publishing

In Publii: **Server** tab → pick GitHub Pages, Netlify, SFTP/FTP, or manual export →
enter credentials → **Sync your website**. Your site is static HTML — it can be hosted
anywhere for free and stays online even when Publii is closed.

## Notes & caveats

- **Layout vs. content:** Publii gives you a GUI for *content* (text, lists, posts, pages).
  The *design/layout* lives in the theme files — that's the trade-off vs. Squarespace-style
  drag-and-drop. If you ever want to change the design itself, edit the files here
  (or ask a developer); day-to-day content editing never touches them.
- **To edit theme files for this site directly**, they're copied to:
  `Documents/Publii/sites/YOUR-SITE/input/themes/cassieb/` — but prefer Publii's
  "theme overrides" feature so updates don't clobber your changes.
- The preloaded credential says *LPCC, Minnesota* — please verify this matches your actual
  license before publishing, along with rates in the FAQ tab.
- Photos currently point at Unsplash placeholders — replace the URLs in the
  Hero/About/Locations tabs with your own images when ready.
