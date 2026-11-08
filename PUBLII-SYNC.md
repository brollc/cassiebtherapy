# publii.sh — sync your Publii site between computers (no git knowledge needed)

Three commands, run from the project folder:

| Command | When to run it | What it does |
|---|---|---|
| `./publii.sh save` | **After** editing in Publii | Copies your edits into the project folder, saves them, and uploads them so the other computer can get them |
| `./publii.sh load` | **Before** opening Publii | Downloads the latest work from the other computer and copies it into Publii |
| `./publii.sh status` | Any time (even with Publii open) | Tells you whether you have work you haven't saved yet, or new work waiting to be downloaded |

## The golden rule

**Always close Publii before running `save` or `load`.** The script will refuse to run
while Publii is open (nothing is lost — your edits stay safe inside Publii until you
close it and run the script).

## Daily workflow

**On the computer where you just edited:**
1. Close Publii
2. `./publii.sh save`
3. Done — your work is uploaded

**On the other computer, before you start working:**
1. `./publii.sh load`
2. Open Publii — you have the latest content

Run `./publii.sh status` if you're ever unsure which computer has the newest work.

## If something goes wrong

- **"There's a conflict"** — this computer has unsaved work *and* new work arrived from
  the other computer. Run `./publii.sh save` first, then `./publii.sh load` again.
- **"Can't reach the online folder"** — check your internet connection, then retry.
- **Anything else** — stop and ask for help rather than forcing anything. Your content
  is committed to the project folder on each `save`, so it can almost always be recovered.

## One-time setup on a new computer

```sh
git clone https://github.com/brollc/cassiebtherapy.git
cd cassiebtherapy
./publii-sync.sh push    # copies the site into Publii's folder
```
Then open Publii. The first time you publish from that machine, re-enter the GitHub
deploy token under the Server tab (tokens are stored per-computer for security).
