# Cassie B Therapy — Publii Theme

Cassie's therapy-practice website as a custom [Publii](https://getpublii.com/) theme —
an exact reproduction of the original static site (`../../index.html`, `about.html`,
`therapy.html`, `bookshelf.html`): botanical green/cream palette, Fraunces + Nunito Sans
fonts, blob-framed hero portrait, ellipse-framed sunrise photo, dark-green "Therapy" band,
bookshelf covers, and the email-only contact section (the contact form was removed;
a SimplePractice booking widget can be added later — see below).

Install one or the other sibling theme (this one, or `cassieb-serene`) under
**Site Settings → Basic settings → Theme**.

## Install

1. Install [Publii](https://getpublii.com/download/) (free, Windows/macOS/Linux).
2. In Publii: three-dot menu (top-right) → **Themes** → **Install theme** → pick `cassieb.zip`.
3. Open your site → **Site Settings → Basic settings → Theme** → select **Cassieb**
   → Save → Preview.

## Where to edit everything (Theme → Theme settings)

| What you want to change | Tab |
|---|---|
| Nav labels, header button, back-home label, crisis note, favicon, blog-section title/intro | **Basics** |
| Hero eyebrow, headline, subtitle, buttons, badge text/emoji | **Hero** |
| Homepage bio (greeting + 2 paragraphs), "Read my full story" link, stamp, credential cards; full About-page story (title, lead, 4 paragraphs, link to Therapy) | **About** |
| Homepage "Therapy" intro + dive link + 5 beliefs; Therapy page (title, 2 paragraphs, approach cards, Attachment card + questions, beliefs band) | **Therapy** |
| License number, degree, both training lists, learner note | **Nuts & Bolts** |
| The 3 numbered getting-started steps | **Getting started** |
| Specialty cards (Individual / Couples) | **Specialties** |
| Homepage bookshelf intro + button; Bookshelf page intro + all three book lists (each book: title, author, cover image URL) | **Bookshelf** |
| FAQ intro + questions & answers | **FAQ** |
| Closing CTA (eyebrow, title, text, button) | **Closing** |
| Contact info (email / serving / hours) + booking widget embed | **Contact** |
| Tagline, column titles, link labels, legal links (empty for now) | **Footer** |

A few fields allow simple HTML (the section titles with italics such as
`The <em>Work</em>`, the About-page story, and the attachment questions list).
They are marked "(HTML allowed)" — the current values are pre-filled, so you
rarely need to touch the markup.

Your headshot and sunrise photo are bundled at `/assets/images/` and referenced
from `assets/css/main.css`. To swap them, upload replacements under **Files**
with the same names.

## The three pages (create once in the GUI)

The depth pages are **page templates**, so you don't paste any content — the page
renders its design straight from the theme settings:

1. **Pages → Add new page** → title **About** → slug **about** → in the page editor's
   template dropdown pick **About** → Save.
2. Same for **Therapy** (slug **therapy**, template **Therapy**).
3. Same for **Bookshelf** (slug **bookshelf**, template **Bookshelf**).

The homepage links ("Meet Cassie", "Read my full story →", the Therapy dive link and
the bookshelf button) already point at `/about/`, `/therapy/`, and `/bookshelf/` —
use those exact slugs and everything just works. Until the pages exist the links 404,
so create them before your first sync (or empty the link-label fields in the
About / Therapy / Bookshelf tabs to hide them).

## Booking widget (SimplePractice) — coming later

Contact is by **email** until the SimplePractice widget is ready. When it is:

- Copy the widget embed code from SimplePractice (their "Widget" feature gives you an
  `<iframe>`/script snippet).
- Paste it into **Theme settings → Contact → Booking widget embed**.
- It renders beside your contact info (the section switches to its two-column
  layout automatically). Leave the field empty and nothing shows.

## Verify before publishing

- [ ] **Email** — the Contact and Footer tabs use `cassie@cassiebtherapy.com`; confirm
      it works and update it if needed.
- [ ] **Legal links** — the Footer tab's legal-links list is intentionally **empty**
      (the old static site had none). Create Privacy Policy / Good Faith Estimate /
      Notice of Privacy Practices pages, then paste their URLs into the **Footer** tab.
- [ ] **Blog section** — "From the blog" appears on the homepage only once you've
      written a post (**Posts → Add new post**); with zero posts the homepage is
      pixel-identical to the original site.
- [ ] **License & rates** — double-check `MN License #cc04877`, the trainings lists
      (Nuts & Bolts tab) and the $175 rates answer (FAQ tab).
- [ ] **Slugs** — the three pages must use the slugs `about`, `therapy`, `bookshelf`.

## Publishing

In Publii: **Server** tab → pick GitHub Pages, Netlify, SFTP/FTP, or manual export →
enter credentials → **Sync your website**. Your site is static HTML — host it anywhere,
free, and it stays online even when Publii is closed.

## IMPORTANT: theme name vs folder name

Publii resolves the theme directory by lowercasing the `name` field in
config.json (`Themes.currentTheme()`). The name is therefore **Cassieb**
(lowercases to the `cassieb` folder). Do not rename it to something with
spaces unless you also rename the theme folder to match.
