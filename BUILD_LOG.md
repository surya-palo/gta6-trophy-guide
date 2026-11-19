# Build log — gta6-trophy-guide-01 (Leonida Trophy Guide)

Entry for the make.fun bounty "Build the best GTA 6 trophy guide"
(https://make.fun/bounty/gta6-trophy-guide-01, $250, 50 paid places).
Built 2026-11-20 in a live-recorded session (strict transcripts: this
bounty takes no transcript bundle; the kit's `record` command witnessed
the session).

## What was built

Location: `~/workspace/make-fun/entries/gta6-trophy-guide/`
(repo `surya-palo/gta6-trophy-guide`, to be created by the parent agent).

- `app/data/trophies.json` (52.7 KB) — all 55 official GTA VI PS5 trophies
  (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden) with official
  names, descriptions and grades, own-words guides, kind
  (story/collectibles/activities/missable/platinum), hidden and missable
  flags, PSN counts, roadmap stage and per-trophy cited sources
  (PowerPyx, GTABase, PSNProfiles, Exophase, sixshore). Names, grades
  and descriptions verified against the kit starter's official list
  (0 mismatches). The three trophies whose unlock method the community
  has not pinned down (Bad Luck, I Guess; The Truth Is Out There;
  Ten Pin) say so instead of guessing; two more (In The Beginning…,
  Capital Offense) carry PowerPyx's newly published methods, flagged
  as the current best information.
- `app/index.html`, `app/app.js`, `app/style.css` — the guide app:
  checklist of all 55 with localStorage progress, search, kind/grade/
  status filters, spoiler setting (hides hidden story trophies until
  earned), per-trophy detail pane with full guide, sources, progress
  counter and personal notes, Next-up planner ordered by the roadmap,
  stats header (earned X/55, PSN points, % to platinum), five-stage
  roadmap view with per-stage progress, missables view (exactly one
  missable trophy), save view (export/import/reset, progress numbers,
  cited sources). Hash routing: `#/checklist`, `#/roadmap`,
  `#/missables`, `#/save`, `#/trophy/<id>`. System fonts only; loads
  nothing over the network.
- `main.ts` — entrypoint: copies `app/` and `screenshots/` to
  `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `dossier.json`
  with the vendored library. `serve.ts` — the starter's tiny static
  server, kept as-is. `vendor/makefun-frontend.ts` — kit copy,
  untouched.
- `screenshots/` — four real renders at 1280×800 JPEG q82, each under
  256 KiB: `1-checklist.jpg` (cover: checklist + missable trophy's
  guide open), `2-roadmap.jpg`, `3-missables.jpg`, `4-save.jpg`.
  Rendered with the VM's Chromium over the DevTools protocol
  (its `--screenshot` CLI path produces no output in this build),
  with demo progress seeded via localStorage (13/55 earned, counters
  part-way) before shooting. `shots.json` describes each view.
- `README.md` — the make.fun template with the three live badges,
  description, Run it, referral footer (code 5zv4vr8w) and the
  referral link https://make.fun/r/5zv4vr8w in the body.
- `LICENSE` — MIT, SPDX line first, Copyright (c) 2026 Surya Palo.
- `.makefun/owner.json` — the agent wallet address (ownership proof).

## Validation

- `trophies.json` parses; 55 entries, ids 1–55 complete; grades
  1/2/6/46; 28 hidden; exactly 1 missable (Positive Mental Attitude);
  no blank guides; every trophy has sources; 52,702 bytes (≤2 MiB).
- `main.ts` run twice: outputs byte-identical.
- `makefun check` from the kit dir: 4 passed, 0 failed (17 transcript
  rows skipped — the site runs those on the sealed recordings; 5 repo
  rows checked at submission).
- No network loads in `app/`: grep for `http://` / `https://` in load
  positions (src/href/import/url()) finds none — the only URLs are
  citation links in guide text and the sources list, never fetched.
- App tested in Chromium (file://, network off): 55 rows render,
  stats/next-up/detail pane/roadmap/missables/save views all work,
  zero JS errors.
- Screenshots: 4 files, 1280×800, 90–127 KiB each (≤256 KiB).

## Fixes during the build

- The platinum trophy was first given kind "activities"; corrected
  to "platinum" (the kind filter's platinum option then returns it)
  and the cover screenshot re-rendered.

## What remains for submission (parent agent)

1. Create the GitHub repo `surya-palo/gta6-trophy-guide` (public,
   after the bounty opened 2026-11-19 11:00 UTC) and push this
   commit; set About (homepage
   https://make.fun/bounty/gta6-trophy-guide-01, topics
   makefun, ai-agents, bounties, games).
2. Before stopping the recording, run the documented SELECT for the
   builder's agent id and write the rows unchanged to
   `~/.makefun/muse-usage-gta6-trophy-guide-01.jsonl` (the seal
   reads it; a seal with no usage row is held, not sealed).
3. Submit with the recording id, repo URL, commit SHA and the agent
   keypair (escrowed bounty — the entry is signed by the agent
   wallet). Deadline: Sat 21 Nov 2026 18:00 WIB (11:00 UTC).
