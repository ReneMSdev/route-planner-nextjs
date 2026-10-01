# Status

_Last verified: 2026-10-01 at aa5a0b5 (`working`; `main` is ccc80d3 with the same tree)_

Portfolio/demo app, live on Vercel. It works again in production: geocoding
moved from OpenCage (key rejected) to Nominatim, and map tiles from CARTO (now
requires a key) to OpenStreetMap; neither needs a key. ORS still handles
optimization and road routes. This session also added a light purple theme,
rebalanced the demo addresses, and fixed the bugs a bug hunt found that a visitor
would most likely hit. v1.1.0 isn't tagged yet; mobile layout is the main item left.
Production deploys from `main` (Vercel Production); pushes to `working` get
Preview deploys. There are no automated tests, so lint, build, offline scripts,
and manual browser checks are the checks.

## App

**State:** single page with manual and file-import (CSV/XLS/XLSX) address
entry, geocoding (Nominatim, no key), route optimization and road polyline (ORS,
server-side `ORS_API_KEY`), a Leaflet map on OSM tiles with A–Z markers, and
PDF/QR export. API routes in `src/app/api/` proxy the external services.
`/api/autocomplete` still targets OpenCage, but nothing calls it.

- `/api/geocode` follows Nominatim's usage policy per server instance: lookups
  at least 1.1 s apart (slots reserved so concurrent requests queue), an
  identifying User-Agent, an in-memory cache, and at most 25 addresses per
  request. Failures return a 502 with a message the page shows.
- `/api/route` asks ORS to snap each stop to a road up to 1 km away (ORS's
  default is 350 m), so stops in parks such as Muir Woods still get a route line.
- Addresses that can't be found stay at the end of the list and are named in an
  alert. Export appears only while stops are on the map (it's gated on the markers, not the route line), a failed submit clears
  the old route, and the PDF and the Google Maps QR both use the routed stops.
- Import accepts an Address column or Street + City (State and Zip optional),
  matches headers ignoring case, spaces, dashes, and underscores, and tells the user when a file
  yields nothing or is rejected.
- The 43 demo addresses (20 SF, 19 East Bay, 4 Marin) all geocoded to the
  expected place and all routed in one ORS call when checked on 2026-10-01 (see the table).
  OSM data can change, so this is a point-in-time result.

| Check | Result | Evidence |
|---|---|---|
| Lint | passing | `npm run lint`: "No ESLint warnings or errors" (aa5a0b5, 2026-10-01) |
| Build | passing | `next build` in a scratch copy of the tree (the dev server was using `.next`): compiled, 8/8 static pages, `/` First Load JS 444 kB (aa5a0b5, 2026-10-01) |
| Production smoke test | passing | Claude in Chrome on route-planner-nextjs.vercel.app (ccc80d3, 2026-10-01): Twin Peaks → Muir Woods → Sausalito; geocode, optimize, route all 200; 3 markers and a road route line; Export appeared after the route. An earlier run on 1877e57 found the Muir Woods 502 that ccc80d3 fixed |
| Bug fixes (QR link, unfound addresses, stale Export, map snap-back, import) | verified | Each original repro rerun in Chrome against localhost with faked API responses; QR decoded with BarcodeDetector and opened in Google Maps as the right 5-stop route; the generated PDF captured in the page listed only routed stops; two verifier passes confirmed the fixes (90d43ae, 2026-10-01) |
| Import parser and Maps URL helper | passing | Offline Node scripts against the real modules: 36/36 cases (CSV variants, XLSX via the real `parseFile`, empty/corrupt files, URL helper) (90d43ae, 2026-10-01). Scripts live in the session scratchpad, not the repo |
| Demo addresses | verified | All 43 geocoded to the expected place (the 6 entries corrected during the check landed ≤0.1 km from the real spot), and one ORS directions call through all 43 returned 200 (aa5a0b5, 2026-10-01) |
| Geocode rate limiter | logic checked | Offline Node test with a mocked fetch: 3 concurrent requests → 6 calls 1098–1101 ms apart (2026-10-01). Not tested against Nominatim under real concurrency |
| npm audit | 4 remaining (3 high, 1 moderate) | `npm audit`, 2026-09-30. Dependencies unchanged since (0262200). Remaining: `xlsx` (no npm fix), `postcss` bundled in `next` (fixed only in Next 16), `brace-expansion` (eslint dev tooling) |
| PDF download | partly verified | The generated PDF's contents were checked in the browser (download intercepted). Opening a downloaded file wasn't checked |
| Tests | none | No test suite in the repo |

**Known issues** (details and the full list in `docs/TODO.md` under "Bugs" and "Abuse protection"):
- Security: `/api/route` puts the request's `profile` straight into the ORS URL path, so a caller can reach other ORS endpoints with the server key. Coordinates aren't capped or validated in `/api/route` and `/api/optimize`.
- No abuse protection: no rate limiting or origin check on the API routes, and the ORS free quota is small (about 500 optimizations/day per search results; not confirmed in the dashboard).
- Submits can race: there's no loading state, and a slower earlier submit can overwrite or clear a newer route. Edits made during a submit are lost.
- If any stop is more than 1 km from a road (e.g. an island), ORS fails the whole route: all markers show but there's no route line at all, and no message.
- No timeouts on outgoing ORS or Nominatim calls.
- Not mobile responsive (per the user).
- README is stale (OpenCage, `NEXT_PUBLIC_*` names, "Next.js 13", html2canvas).
- `next lint` is deprecated and will be removed in Next 16.
- Local builds warn about a stray `~/package-lock.json` that Next picks up as the workspace root. Doesn't affect Vercel.

<!--
Rules for this file:
- Rewrite it to describe the current state. It isn't a log; history lives in git.
- Every "passing" or "works" claim needs evidence from a run, or it's marked unverified.
- Future work goes in TODO.md, and reasons in decisions.md.
-->
