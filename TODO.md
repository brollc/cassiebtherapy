# TODO — Cassie B Therapy site

## Footer legal links need real targets

The footer's legal links — **Privacy Policy**, **Good Faith Estimate**, and
**Notice of Privacy Practices** — currently point to `#` placeholders on every
page. To finish them:

1. **Draft the three pages.** Sources for content:
   - *Notice of Privacy Practices* — your HIPAA notice; the HHS provides
     standard templates, and most EHR/telehealth platforms (SimplePractice,
     Jane, TherapyPortal…) can generate one for you.
   - *Good Faith Estimate* — required under the No Surprises Act; typically a
     short page explaining that clients without insurance can request a written
     estimate.
   - *Privacy Policy* — your website-specific policy (distinct from the HIPAA
     notice; covers things like the contact form and analytics).
2. **Static site:** save the pages as `privacy.html`, `good-faith-estimate.html`,
   and `notice-of-privacy-practices.html`, copy the header/footer from
   `about.html`, and replace the three `href="#"` links in the footer of
   `index.html`, `about.html`, `the-work.html`, and `bookshelf.html`.
3. **Publii (serene theme):** create the pages under **Pages → Add new page**,
   then paste each page's URL into **Theme settings → Footer → Legal links**.
