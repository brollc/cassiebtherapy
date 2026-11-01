# Cassie B Therapy — "Serene" Theme

An alternative, quieter design for Cassie's site, inspired by calm therapist
templates (Wix "Therapist (Organic)"): off-white base, muted blue-gray text, one
soft blue accent, generous whitespace, and a circular portrait in the hero.
Display font: **Cormorant Garamond** · Body: **Inter**.

This is a sibling to the existing green/botanical `cassieb` theme — same
Publii conventions, completely different look. Install one or the other
(or keep both installed and switch between them under
**Site Settings → Basic settings → Theme**).

> ⚠️ **Scope:** Cassie specializes in **individual and couples therapy**.
> This theme intentionally contains no somatic/trauma/EMDR specialty claims.

## Install

1. Install [Publii](https://getpublii.com/download/) (free, Windows/macOS/Linux).
2. In Publii: three-dot menu (top-right) → **Themes** → **Install theme** →
   pick `cassieb-serene.zip`.
3. Open your site → **Site Settings → Basic settings → Theme** → select
   *Cassie B Therapy Serene* → Save → Preview.

## Where to edit everything (Theme → Theme settings)

| What you want to change | Tab |
|---|---|
| Hero headline, second line, subtitle, buttons, **your portrait photo** | **Hero** |
| Header button label, crisis note, favicon | **Basics** |
| Short homepage bio + "Read my full story" link; the four full-bio paragraphs below it are kept for pasting onto your About page | **About** |
| "The Work" paragraphs + the dive-deeper link on the homepage; the approach cards, questions & 5 beliefs below are kept for pasting onto your The Work page | **The Work** |
| License number, degree, training lists (ARC, EMDR, Brainspotting, EFT, Gottman…) | **Nuts & Bolts** |
| Specialty cards (Individual / Couples) | **Specialties** |
| "Do any of these resonate?" checklist (8 items) | **Resonate** |
| Bookshelf intro + "Browse the full bookshelf" link; the three book lists below (each with a cover-art URL) are kept for pasting onto your Bookshelf page | **Bookshelf** |
| Getting-started steps | **Getting started** |
| Blog section title/intro (section appears only once you write posts) | **Blog section** |
| FAQ questions & answers | **FAQ** |
| Closing CTA | **Closing** |
| Email, phone, serving area, hours, form endpoint | **Contact** |
| Tagline, giving note, legal links | **Footer** |

Practice name/logo text lives in **Site Settings → Basic settings** (site name).
Blog posts: **Posts → Add new post**. Legal pages: **Pages → Add new page**,
then paste each page's URL into the **Footer** tab's legal links.

## Concise homepage + dedicated pages (important)

The homepage shows short versions of each topic with a "dive deeper →" link.
The full content lives in Publii **Pages**, which you create once in the GUI:

1. Go to **Pages → Add new page** and create three pages with these slugs:
   - **about** — paste your full bio (the four paragraphs in the **About** tab)
   - **the-work** — paste the approaches intro, the four approach cards
     (Narrative / Psychodynamic / Somatic / Attachment), the exploration questions,
     and your 5 beliefs (all in the **The Work** tab)
   - **bookshelf** — paste your currently-reading list and both book lists
     (all in the **Bookshelf** tab). Each book also has a **cover image URL**
     pointing at a local cover bundled with the theme (e.g.
     `/assets/images/books/hold-me-tight.jpg`) — insert an image block per
     book in the page editor and paste that URL, or just list the titles if
     you prefer a text-only bookshelf.
2. The homepage's dive-deeper links (in the About / The Work / Bookshelf tabs)
   already point at `/about/`, `/the-work/`, and `/bookshelf/` — as long as you
   use those slugs, the links just work.
3. Until you create the pages, the links will 404 — either create the pages
   before your first sync, or clear the link-label fields in those tabs to hide
   the links.

## Contact form (Formspree)

Static sites can't process forms by themselves, so:

- **Recommended:** create a free form at [formspree.io](https://formspree.io) and
  paste the endpoint URL (looks like `https://formspree.io/f/xxxxxxx`) into
  **Theme settings → Contact → Contact form endpoint**. Submissions arrive in
  your email inbox.
- **Fallback (do nothing):** if the endpoint is empty, the form opens the
  visitor's email app with their message pre-filled (using the email address
  set in the **Contact** tab).

## Things you must verify before publishing

- [x] **License** — now uses your real license (MN License #cc04877, M.S. in Clinical Mental
      Health Counseling) in the About tab and the *Nuts & Bolts* tab. Double-check the
      trainings list there too (ARC, EMDR Level 1, Brainspotting Level 1, EFT Externship,
      Gottman Level 1, Difficult Couples Training) and add any new ones.
- [ ] **Rates** — FAQ tab says $175 for both individual and couples sessions; confirm.
- [ ] **Footer legal links** — Privacy Policy / Good Faith Estimate / Notice of
      Privacy Practices still point to `#`. Create those pages and paste their
      URLs into the **Footer** tab's legal links (see TODO.md in the site root).
- [ ] **Email & phone** — Contact tab has `cassie@cassiebtherapy.com`
      and `(952) 555-0100`; confirm the phone number.
- [ ] **Your portrait** — the Hero tab's photo URL points at a placeholder
      Unsplash portrait. Upload your own photo under **Files** and paste its
      URL (the Hero / About / Locations photo URLs are all editable text
      fields). A real face builds trust — please use yours!
- [ ] **Legal pages** — the footer's Privacy Policy / Good Faith Estimate /
      Notice of Privacy Practices links currently point to `#`; create those
      pages and paste their URLs in the **Footer** tab.

## Publishing

In Publii: **Server** tab → pick GitHub Pages, Netlify, SFTP/FTP, or manual
export → enter credentials → **Sync your website**. Your site is static HTML —
host it anywhere, free, and it stays online even when Publii is closed.
