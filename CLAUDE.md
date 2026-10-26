# BC Accountability Tracker

React + Vite dashboard tracking the BC Conservative (Doerkson) government. All content lives in `data/*.json`; the app only renders it.

- To update with recent news, use the `/update-tracker` skill (`.claude/skills/update-tracker/SKILL.md`). It defines the rating, sourcing and status rules.
- Data shape: `src/model.ts`. Run `npm run validate` after any data edit; `npm run build` runs it too.
- Docker: `docker compose up -d --build` runs container `bc-accountability-dashboard-dev` on the external `private` network (no ports; NPM proxies to `:8080`). Data is baked in at build time, so rebuild after data edits. Keep the compose conventions (naming, `restart: "no"`, `private` network, healthcheck) in line with the sibling projects and murphy-deploy.
- Every entry needs real sources. Never invent quotes, numbers or events.
- Ratings use the progressive lens described in `data/meta.json` (`lens`); notes should be fair about trade-offs.
