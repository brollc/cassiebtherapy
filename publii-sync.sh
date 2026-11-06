#!/usr/bin/env bash
# publii-sync.sh — sync the Publii site between the live app folder and this repo.
#
# Workflow (two computers):
#   Machine A (after editing in Publii):
#     1. Close Publii
#     2. ./publii-sync.sh pull      (live site -> repo)
#     3. git add, commit, push
#
#   Machine B (to pick up the latest content):
#     1. git pull
#     2. Close Publii if open
#     3. ./publii-sync.sh push      (repo -> live site)
#     4. Open Publii — the site appears with the latest content
#
# Notes:
#   - Always close Publii before syncing (the script checks and refuses otherwise;
#     the SQLite DB must not be copied mid-write)
#   - The stock "simple" theme (13MB, never used) and regenerable preview/output
#     folders are excluded from the repo copy

set -euo pipefail

SITE_NAME="cassie-b-therapy"
LIVE_DIR="$HOME/Publii/sites/$SITE_NAME"
REPO_DIR="$(cd "$(dirname "$0")" && pwd)/publii-site"

RSYNC_EXCLUDES=(
  --exclude "themes/simple"     # 13MB stock theme, never used by this site
  --exclude "preview"           # regenerable by Publii
  --exclude "output"            # regenerable by Publii
  --exclude "*.sqlite-wal"     # transient SQLite files (absent after clean close)
  --exclude "*.sqlite-shm"
  --exclude ".DS_Store"
)

check_publii_closed() {
  if pgrep -f 'publii/app[.]asar' >/dev/null 2>&1; then
    echo "Publii is running — close it first, then re-run." >&2
    exit 1
  fi
}

case "${1:-}" in
  pull)
    check_publii_closed
    [ -d "$LIVE_DIR/input" ] || { echo "Live site not found at $LIVE_DIR" >&2; exit 1; }
    mkdir -p "$REPO_DIR"
    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$LIVE_DIR/input/" "$REPO_DIR/input/"
    echo "Pulled live site -> publii-site/input/"
    echo "Now: git add publii-site && git commit && git push"
    ;;
  push)
    check_publii_closed
    [ -d "$REPO_DIR/input" ] || { echo "Repo copy not found at $REPO_DIR" >&2; exit 1; }
    mkdir -p "$LIVE_DIR"
    rsync -a --delete "${RSYNC_EXCLUDES[@]}" "$REPO_DIR/input/" "$LIVE_DIR/input/"
    echo "Pushed publii-site/input/ -> live site"
    echo "Open Publii — your site is ready with the latest content."
    ;;
  *)
    echo "Usage: ./publii-sync.sh pull|push"
    echo "  pull  live Publii site -> repo (before committing)"
    echo "  push  repo -> live Publii site (after pulling on another machine)"
    exit 1
    ;;
esac
