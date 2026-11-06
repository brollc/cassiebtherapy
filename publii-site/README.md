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

**After editing in Publii (machine A):**
```sh
./publii-sync.sh pull        # close Publii first
git add publii-site && git commit -m "..." && git push
```

**To pick up edits (machine B):**
```sh
git pull
./publii-sync.sh push        # close Publii first
# open Publii — the site appears with the latest content
```

The DB is a binary file, so each sync commit includes a full snapshot of your
content — that's the point: your words are version-controlled and recoverable.
