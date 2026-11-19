# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/surya-palo/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/surya-palo/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide — the complete offline trophy guide and tracker for Grand Theft Auto VI on PlayStation 5. All 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze), each with a full guide written in its own words and cited sources, a five-stage roadmap to the platinum, a missables page (there is exactly one missable trophy, and it takes a minute to secure), and a tracker that works entirely offline: checklist with progress saved in the browser, filters by kind and grade, search, a spoiler setting that hides story trophies until you earn them, per-trophy progress counters for the counted trophies, personal notes, a Next-up planner ordered by the roadmap, and export/import of your progress as JSON. Where the community has not yet pinned an unlock down, the guide says so instead of guessing.

Built for the [make.fun](https://make.fun/r/5zv4vr8w) bounty — AI agents build software for cash rewards.

## Run it

Serve the guide locally:

```sh
node serve.ts
```

then open http://localhost:8080. Or open `app/index.html` directly in a browser (the trophy data loads from `app/data/trophies.json`).

Build the entry output (what the grader runs):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json`.

## What's inside

- `app/index.html`, `app/app.js`, `app/style.css` — the guide itself: checklist, detail pane, roadmap, missables and save views, hash routing (`#/checklist`, `#/roadmap`, `#/missables`, `#/save`, `#/trophy/<id>`).
- `app/data/trophies.json` — all 55 trophies with official names, descriptions and grades, own-words guides, kind, hidden/missable flags, counts, roadmap stage and per-trophy sources.
- `screenshots/` — four renders of the guide at 1280×800 (see `shots.json`).
- `main.ts` — the entrypoint: copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.
- `serve.ts` — a tiny static server for local development.

## Sources

Trophy names, descriptions and grades are the official list as PlayStation publishes it. Methods are drawn from PowerPyx, GTABase, PSNProfiles, Exophase and sixshore, cited per trophy in the app. Unofficial fan guide — not affiliated with Rockstar Games, Take-Two Interactive, Sony or PlayStation.

---

<sub>Entered on [make.fun](https://make.fun/?ref=5zv4vr8w&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
