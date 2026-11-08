#!/usr/bin/env bash
# publii.sh — one-command sync for the Cassie B Therapy Publii site.
# No git knowledge needed. Plain-language output for any user.
#
#   ./publii.sh save     — run this AFTER editing in Publii (saves + uploads your work)
#   ./publii.sh load     — run this BEFORE opening Publii (downloads the latest work)
#   ./publii.sh status   — shows whether you have unsaved changes / new downloads waiting
#
# Both commands refuse to run while Publii is open (close Publii first).

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

BOLD=$'\033[1m'; DIM=$'\033[2m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; RED=$'\033[31m'; RESET=$'\033[0m'

say()  { printf '%s\n' "${BOLD}$1${RESET}"; }
step() { printf '  %s\n' "$1"; }
ok()   { printf '  %s\n' "${GREEN}$1${RESET}"; }
warn() { printf '  %s\n' "${YELLOW}$1${RESET}"; }
fail() { printf '  %s\n' "${RED}$1${RESET}"; exit 1; }

check_publii_closed() {
  if pgrep -f 'publii/app[.]asar' >/dev/null 2>&1; then
    fail "Publii is open. Close Publii first (your latest edits are safe inside it), then run this again."
  fi
}

check_remote_configured() {
  git remote get-url origin >/dev/null 2>&1 || fail "This copy isn't connected to the shared online folder yet. Ask whoever set it up for help."
}

say "Cassie B Therapy — Publii sync"

case "${1:-}" in
  save)
    check_publii_closed
    check_remote_configured

    step "Copying your Publii edits into the project folder..."
    ./publii-sync.sh pull >/dev/null

    step "Checking what changed..."
    if git diff --quiet -- publii-site 2>/dev/null && [ -z "$(git status --porcelain -- publii-site)" ]; then
      warn "Nothing new to save — your content here already matches the latest upload."
      exit 0
    fi
    git add publii-site

    step "Uploading your work..."
    MSG="Publii content update $(date '+%b %d, %Y %H:%M')"
    if git diff --cached --quiet; then
      warn "Nothing new to save."
      exit 0
    fi
    git commit -q -m "$MSG"
    git push -q

    ok "Saved and uploaded. The other computer can now run ./publii.sh load to get your changes."
    ;;

  load)
    check_publii_closed
    check_remote_configured

    step "Downloading the latest work..."
    if git pull -q --ff-only; then
      if [ -n "$(git status --porcelain -- publii-site)" ]; then
        step "New content arrived — copying it into Publii..."
        ./publii-sync.sh push >/dev/null
        ok "Done. Open Publii — you have the latest content."
      else
        ok "You're already up to date — this computer has the latest content."
      fi
    else
      fail "There's a conflict: this computer has unsaved work that would be overwritten. Run ./publii.sh save first, then try again. If it still fails, ask for help rather than forcing anything."
    fi
    ;;

  status)
    check_remote_configured
    git fetch -q || fail "Can't reach the online folder — check your internet connection."

    LOCAL_CHANGES=$(git status --porcelain -- publii-site | wc -l | tr -d ' ')
    BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
    AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)

    if [ "$LOCAL_CHANGES" -gt 0 ]; then
      warn "You have $LOCAL_CHANGES unsaved file(s). Run: ./publii.sh save"
    elif [ "$AHEAD" -gt 0 ]; then
      warn "You have saved work that hasn't been uploaded. Run: ./publii.sh save"
    else
      ok "Your saved work here matches the latest upload."
    fi

    if [ "$BEHIND" -gt 0 ]; then
      warn "There's newer work waiting from the other computer. Run: ./publii.sh load"
    else
      ok "No new work waiting from the other computer."
    fi
    ;;

  *)
    say "How to use this:"
    echo "  ${BOLD}./publii.sh save${RESET}   — after editing in Publii: saves & uploads your work"
    echo "  ${BOLD}./publii.sh load${RESET}   — before opening Publii: downloads the latest work"
    echo "  ${BOLD}./publii.sh status${RESET} — shows what's saved and what's waiting"
    echo
    echo "Always close Publii before running save or load."
    exit 1
    ;;
esac
