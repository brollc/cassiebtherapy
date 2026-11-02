# TODO — Cassie B Therapy site

## SimplePractice booking widget (replaces the old contact form)

The contact form has been removed. Once SimplePractice is set up, grab its
widget embed code and:
- Paste it in the contact section of `index.html` where the comment marks
  the spot; restore the two-column `.contact-grid` layout around it.

## Footer charitable-giving note (removed, decide if you want one)

The footer previously carried a giving note ("a portion of all session fees is
donated to The Loveland Foundation…") that was borrowed from another therapist's
site. It's been removed — both for originality and because it's a factual claim
that must only be on the site if it's true. If you genuinely donate a portion
of fees, pick your organization and your own wording, and it can be re-added
(add a sentence to the footer tagline of each page if so).

## Footer legal links (hidden for now)

The footer's legal links — Privacy Policy, Good Faith Estimate, and
Notice of Privacy Practices — are hidden until the pages exist. Re-add
them in the `<p class="footer-legal">` spot of each page's footer once
the pages are live (git history has the old markup).

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

