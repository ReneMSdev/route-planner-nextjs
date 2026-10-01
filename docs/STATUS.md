# Status

_Last verified: 2026-10-01 at 1ae54d7 (`working`). `working` was then merged into `main` (loading state, abuse protection, docs, screenshot) and deployed **without a production smoke test**; the last production check was on 8d1e8f6. See TODO._

Portfolio/demo app, live on Vercel. Geocoding uses Nominatim and map tiles use
OpenStreetMap, neither with a key; OpenRouteService (ORS) handles optimization
and road routes with a server-side key. Since v1.0.0 the app has gained a light
purple theme, rebalanced demo addresses, fixes from a bug hunt, input
validation on the ORS routes, a loading state, and basic abuse protection.
v1.1.0 isn't tagged yet; the mobile layout is the main item left (see TODO).
Production deploys from `main` (Vercel Production); pushes to `working` get
Preview deploys. There are no automated tests, so lint, build, offline scripts,
and manual browser checks are the checks. `README.md` describes the app for
visitors, and `ARCHITECTURE.md` describes how it fits together.

## App

**State:** single page with manual and file-import (CSV/XLS/XLSX) address
entry, geocoding (Nominatim, US only), route optimization and a road polyline
(ORS, `ORS_API_KEY` on the server), a Leaflet map on OSM tiles with A–Z markers,
and PDF/QR export. API routes in `src/app/api/` proxy the external services.
`/api/autocomplete` still targets OpenCage, but nothing calls it.

- **API guard (`src/lib/apiGuard.js`):** all three API routes first check that
  the `Origin` matches the request's host (403 otherwise) and apply a per-IP limit
  of 10 requests a minute and 100 a day per route (429 with `Retry-After`).
  Counters are in memory per server instance, with least-recently-used eviction
  past 5,000 keys.
- **Input validation (`src/lib/routeInput.js`):** `/api/optimize` and `/api/route`
  accept only the `driving-car` profile, 2–25 stops, and finite in-range
  `[lat, lng]`; anything else is a 400 before reaching ORS. This closed a path
  injection through `profile`.
- **`/api/geocode`:** follows Nominatim's usage policy per server instance
  (lookups at least 1.1 s apart, identifying User-Agent, in-memory cache, at
  most 25 addresses). Failures return a 502 with a message the page shows.
- **`/api/route`:** asks ORS to snap stops to a road up to 1 km away (ORS's
  default is 350 m). ORS quota or key refusals (403/429) become a 503 with a
  user-facing message on both ORS routes, and the server logs the ORS response.
- **Page:**
  - While a route is being built, a spinner covers the map, the clicked button
    reads "Loading...", and the form, tabs, and Export are locked. A second
    submit is ignored, so the UI can't race itself.
  - Addresses that can't be found stay at the end of the list and are named in
    an alert. Quota and rate-limit problems are reported in the same alert.
  - Export appears only while stops are on the map (it's gated on the markers,
    not the route line). A failed submit clears the old route. The PDF and QR
    code use the routed stops.
- **Import:** accepts an `Address` column or `Street` + `City` (`State`/`Zip`
  optional), matching headers ignoring case, spaces, dashes, and underscores.
- **Demo addresses:** 43 (20 SF, 19 East Bay, 4 Marin); see the table for the
  2026-10-01 check. OSM data can change, so that's a point-in-time result.

| Check | Result | Evidence |
|---|---|---|
| Lint | passing | `npm run lint`: "No ESLint warnings or errors" (1ae54d7, 2026-10-01) |
| Build | passing | `next build` in a scratch copy of the tree (the dev server was using `.next`): compiled, 8/8 static pages (1ae54d7, 2026-10-01) |
| Production smoke test | passing (for 8d1e8f6) | Live site, 2026-10-01: a Twin Peaks → Muir Woods → Sausalito route drew a line (ccc80d3). On 8d1e8f6, `profile` injection, `?`/`#` suffix, invalid JSON, and 26 stops all returned 400, and a valid route returned data. Loading state and abuse protection are not in production yet |
| Abuse protection | verified locally | 19 offline guard tests (origin cases, minute/day limits and resets, per-IP/per-route isolation, key rotation); curl against the dev server (403 without a matching Origin, 10×200 then 429 with `Retry-After: 57`); browser: rate-limit alert, faked ORS 503s gave one alert with both warnings, live Generate all 200 (1ae54d7, 2026-10-01). Not yet checked against Vercel's real headers |
| Loading state | verified locally | Browser with held fake responses: one request per double-click, correct button label, form/tabs/Export locked, alert only after the spinner cleared; one live run where ORS optimize took 15.2 s with the spinner up throughout (e683523, 2026-10-01) |
| Input validation | verified | 14 bad requests → 400 locally (incl. 4 injection attempts), valid requests 200, live Generate; repeated against production on 8d1e8f6 (7c78bbe, 2026-10-01) |
| Bug fixes (QR link, unfound addresses, stale Export, map snap-back, import) | verified | Each original repro rerun in Chrome with faked API responses; QR decoded and opened in Google Maps as the right 5-stop route; generated PDF listed only routed stops (90d43ae, 2026-10-01) |
| Import parser and Maps URL helper | passing | Offline Node scripts against the real modules: 36/36 cases (90d43ae, 2026-10-01). Scripts live in the session scratchpad, not the repo |
| Demo addresses | verified | All 43 geocoded to the expected place (the 6 entries corrected during the check landed ≤0.1 km from the real spot), and one ORS directions call through all 43 returned 200 (aa5a0b5, 2026-10-01) |
| Geocode spacing (`/api/geocode`) | logic checked | Offline Node test with a mocked fetch: 3 concurrent requests → 6 calls 1098–1101 ms apart (2026-10-01). Not tested against Nominatim under real concurrency |
| ARCHITECTURE.md diagrams | render | All 3 Mermaid blocks parsed and rendered with Mermaid 11 in Chrome (2026-10-01) |
| npm audit | 4 remaining (3 high, 1 moderate) | `npm audit`, 2026-09-30. Dependencies unchanged since (0262200). Remaining: `xlsx` (no npm fix), `postcss` bundled in `next` (fixed only in Next 16), `brace-expansion` (eslint dev tooling) |
| PDF download | partly verified | The generated PDF's contents were checked in the browser (download intercepted). Opening a downloaded file wasn't checked |
| Tests | none | No test suite in the repo |

**Known issues** (details and the full list in `docs/TODO.md`):
- Abuse protection is per server instance and trusts `x-forwarded-for` (fine on
  Vercel, spoofable elsewhere). The geocode limit counts requests, not
  addresses, so one visitor can still fill the shared Nominatim queue.
- If any stop is more than 1 km from a road (e.g. an island), ORS fails the whole
  route: markers show but there's no route line and no message.
- No timeouts on outgoing ORS or Nominatim calls (ORS optimize once took 15.2 s).
- Not mobile responsive (per the user).
- Production hasn't been smoke-tested since the loading state and abuse
  protection were merged (next session, per TODO).
- `/api/autocomplete` (unused, OpenCage) has no origin check or rate limit.
- The README says MIT, but there's no `LICENSE` file.
- `next lint` is deprecated and will be removed in Next 16.
- Local builds warn about a stray `~/package-lock.json` that Next picks up as the
  workspace root. Doesn't affect Vercel.

<!--
Rules for this file:
- Rewrite it to describe the current state. It isn't a log; history lives in git.
- Every "passing" or "works" claim needs evidence from a run, or it's marked unverified.
- Future work goes in TODO.md, and reasons in decisions.md.
-->
