# publii-site — the live Publii project

This directory is a snapshot of the actual Publii site (`~/Publii/sites/cassie-b-therapy/`),
synced in and out of the repo with `../publii-sync.sh`. It contains everything
that makes the site editable in Publii:

- `input/db.sqlite` — **all page content** (Home, About, Therapy, Couples Therapy, Bookshelf)
- `input/config/` — site settings, page hierarchy, menus (API tokens are NOT here —
  they live in each computer's OS keychain and must be re-entered on a new machine)
- `input/themes/cassieb/` — the theme Publii renders with (the canonical source lives
  in `../publii/cassieb/`; the render driver syncs it into the site on each run)
- `input/media/posts/5/` — the book covers
- `input/root-files/`, `input/languages/` — supporting folders

Excluded from the repo copy: the unused stock `simple` theme (13MB) and the
regenerable `preview/`/`output/` folders.

## Two-computer workflow

Use the one-command wrapper — see **../PUBLII-SYNC.md**:

- `./publii.sh save` after editing in Publii (close Publii first)
- `./publii.sh load` before opening Publii on the other computer
- `./publii.sh status` any time you're unsure

(Advanced / fallback: `./publii-sync.sh pull|push` plus git, as before. The DB
is binary, so each sync commit is a full snapshot of your content — version-
controlled and recoverable.)
