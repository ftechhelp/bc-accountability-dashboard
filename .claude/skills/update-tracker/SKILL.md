---
name: update-tracker
description: Research what the BC Conservative (Doerkson) government has done since the tracker was last updated, then add sourced actions and promise status changes to data/*.json. Use when asked to update, refresh or check the accountability tracker, or for news about the BC government.
---

# Update the BC accountability tracker

The tracker's value is that every entry is **accurate and sourced**. Ratings use a
progressive lens (see `lens` in `data/meta.json`), but facts must hold up to
someone who disagrees with that lens. Never invent quotes, numbers or events.
If you can't confirm something from a source you actually read, leave it out.

## 1. Get oriented

- Read `data/meta.json`: note `lastUpdated` and `government.swornIn`.
- Skim the `id`s and titles in `data/actions.json` so you don't log duplicates.
- Commitment ids live in `data/promises.json`. Search it for the topic before
  deciding something is off-platform.

## 2. Research everything since `lastUpdated`

Search broadly; run several searches in parallel. Cover:

- **Official:** BC Gov News (news.gov.bc.ca) releases, bills and Hansard at
  leg.bc.ca, Orders in Council, budget and fiscal updates, ministerial mandate
  letters, cabinet appointments.
- **Reporting:** The Canadian Press, CBC British Columbia, Vancouver Sun,
  Times Colonist, Global BC, CTV Vancouver, The Narwhal, The Tyee,
  Black Press papers, Business in Vancouver.
- **Topics to sweep every time:** cuts/layoffs/hiring freeze/core review, budget
  and the fiscal review panel, DRIPA and First Nations relations, CleanBC/climate/LNG/pipelines,
  old growth and forestry, SOGI and schools, safe supply/OPS sites/involuntary care,
  health care and private delivery, housing and zoning, child care, disability
  assistance, labour and WorkSafeBC, transit, parks and Crown land access.
- **Watch especially for things they did NOT campaign on.** Off-platform cuts and
  reversals are the most important thing this tracker exists to catch.

Fetch and read the actual articles; don't rely on search snippets for quotes.

## 3. Record what you found

### New actions → `data/actions.json`

One entry per distinct event. Fields:

- `id`: `YYYY-MM-DD-short-slug` (kebab-case, unique)
- `date`: when it happened (not when reported), `YYYY-MM-DD`
- `title`: short, plain, factual headline
- `summary`: 1–3 sentences of what happened. Quote only what a source says verbatim.
- `kind`: legislation | budget | cut | regulation | appointment | announcement | statement | other
- `category`: one of the keys in `CATEGORIES` in `src/model.ts`
- `impact`: regressive | mixed | neutral | progressive
- `weight`: 3 = major (affects many people, core rights, big money, or hard to reverse), 2 = notable, 1 = minor
- `note`: "why it matters" through the progressive lens; fair about trade-offs.
  Required for weight 3, and for regressive or mixed items at weight 2.
- `promiseIds`: platform commitments this directly advances or breaks. Leave it
  out (or empty) for off-platform actions. That is what marks them off-platform.
- `sources`: at least one `{title, url, publisher, date}`; prefer a primary source plus one news report.

### Promise progress → `data/promises.json`

When an action moves a commitment, append to that commitment's `updates`
(`{date, text, status?, sources}`) and set its `status` to match:

- `in_progress`: a concrete step (bill tabled, funding announced, review launched)
- `partial`: delivered in part, or watered down
- `kept`: fully delivered (law in force, program running, money flowing)
- `broken`: abandoned, reversed, or clearly contradicted
- `not_started`: nothing yet

Statements of intent get an update **without** a status change.

### New commitments

If the government makes a significant new promise (e.g. in a throne speech),
add it to `promises.json` with sources, following the existing entries' shape.

### Government status

When cabinet is sworn in, set `government.swornIn`, update `statusNote`, and
replace the unofficial seat count with the certified one.

## 4. Finish

1. Set `meta.lastUpdated` to today's date.
2. Run `npm run validate` and fix every error. Warnings flag status/update mismatches; resolve them.
3. Run `npm run build` to confirm the app still builds.
4. If the dev container is running (`docker ps --filter name=bc-accountability-dashboard-dev`),
   run `docker compose up -d --build --wait` so the site serves the new data.
5. Report back briefly: new actions (with impact), status changes, the most
   important red flags and wins, and anything you saw but couldn't confirm.
