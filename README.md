# BC Accountability Tracker

A dashboard that tracks what BC's Conservative government (Premier Lorne Doerkson, elected Oct 24, 2026) promised and what it actually does. Each item is rated through a progressive lens: what's regressive, what's progressive, what they cut, and what they did that they never campaigned on.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # validates data, typechecks, builds to dist/
```

`dist/` is a static site; host it anywhere (GitHub Pages, Netlify, Cloudflare Pages). The build uses relative paths, so it works from a subfolder.

### Docker

Follows the same conventions as the other projects in `/HDD/development` and what murphy-deploy expects:

```bash
docker compose up -d --build
```

- Project and container are both `bc-accountability-dashboard-dev`. The service is `bc-accountability-dashboard-app` so its DNS alias doesn't collide with the proxy hostnames.
- It joins the external `private` network only: no published ports, no auto-restart. Point nginx-proxy-manager at `http://bc-accountability-dashboard-dev:8080`.
- nginx serves the build, with pre-compressed assets.
- The data is bundled at build time, so **rebuild after updating `data/*.json`**. The image build runs the validator, so a malformed entry fails the build instead of shipping.

## What's on the page

- **Headline numbers:** promises tracked, acted on, broken, regressive vs. progressive, actions logged.
- **Where the platform leans:** regressive vs. progressive promise counts per policy area. Click a row to see those promises.
- **Red flags / The good stuff:** the most serious regressive moves and the promises worth holding them to.
- **Activity log:** everything the government does, flagged when it's off-platform.
- **What's missing:** things progressives would look for that the platform leaves out.
- **Every promise:** all 177 platform commitments with search, filters, status, "why it matters" notes, updates and sources. Link to one with `#c-<id>`, e.g. `#c-dripa-repeal`.

## Data

Everything is in `data/`. The app has no backend.

| File | Holds |
|---|---|
| `meta.json` | Government status, last-updated date, rating lens, platform sources, platform gaps |
| `promises.json` | Platform commitments: `category`, `impact`, `weight`, `status`, `note`, `updates`, `sources` |
| `actions.json` | Things the government has done: dated, rated, linked to promises via `promiseIds` (empty = off-platform) |

The schema is in [src/model.ts](src/model.ts). `npm run validate` checks enums, ids, cross-references, dates and sources. It also requires a "why it matters" note on every major item and every concerning one.

**Ratings:** `impact` is regressive / mixed / neutral / progressive. `weight` is 1 (minor), 2 (notable) or 3 (major). These are judgment calls; change any of them in the JSON.

**Statuses:** not started → in progress → partly kept / kept, or broken.

## Keeping it current

In Claude Code, run **`/update-tracker`**. It researches news since `lastUpdated`, logs new actions, updates promise statuses with sources, validates, and summarizes what changed. To run it on a schedule, use Claude Code's `/loop` (while a session is open) or `/schedule` (cloud, needs the repo on GitHub).

You can also edit the JSON by hand and run `npm run validate`.

## Sources

Promises come from the party's platform, [Lorne Doerkson's Plan for a Stronger BC](https://conservativebc.ca/wp-content/uploads/2026/10/20261016_BCC_Platform2026_8-5x11-Draft-18_compressed.pdf), plus campaign releases collected by [BC Ballot](https://bcballot.ca/platforms/conservative-party/). Every action and update cites its own reporting.
