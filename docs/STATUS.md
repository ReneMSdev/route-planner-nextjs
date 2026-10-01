# Status

_Last verified: 2026-10-01 at 0262200 + uncommitted changes_

Portfolio/demo app, live on Vercel, released as v1.0.0. v1.1.0 is in progress.
Its first part is working locally but not yet committed or deployed: geocoding
moved from OpenCage (key rejected) to Nominatim, and map tiles moved from CARTO
(now requires a key) to OpenStreetMap. Neither needs an API key. Mobile layout is
the remaining v1.1.0 item. The live Vercel deploy still runs the old code, so
geocoding and the map are broken there until this ships.
There are no automated tests, so lint, build, and manual browser checks are the
only checks.

## App

**State:** single page with manual and file-import (CSV/XLS/XLSX) address
entry, geocoding (Nominatim/OpenStreetMap, no key), route optimization and road
polyline (ORS), a Leaflet map on OSM tiles with A–Z markers, and PDF/QR export.
API routes in `src/app/api/` proxy the external services. The only key is the
server-side `ORS_API_KEY`. `/api/autocomplete` still targets OpenCage, but nothing
calls it.

`/api/geocode` follows Nominatim's usage policy per server instance: sequential
lookups at least 1.1s apart (the slot is reserved before waiting, so concurrent
requests queue), an identifying User-Agent, an in-memory cache, and at most 25
addresses per request. When the lookup fails it returns a 502 with a message the
page shows in its alert. It no longer returns `{"results":[null]}` with a 200.

| Check | Result | Evidence |
|---|---|---|
| Lint | passing | `npm run lint`: "No ESLint warnings or errors" (0262200 + uncommitted, 2026-10-01) |
| Build | passing | `next build` in a scratch copy of the working tree (the dev server was using `.next`): compiled, 8/8 static pages (0262200 + uncommitted, 2026-10-01) |
| Geocode → optimize → route → map (local) | working | Claude in Chrome on localhost:3000, 2026-10-01: two SF addresses geocoded correctly, `/api/geocode`, `/api/optimize`, `/api/route` all 200, A/B markers and route line drawn on OSM tiles. Ran before the rate-limiter fix, which only changes the timing of concurrent requests. The first submit hadn't rendered after ~9s (cause unknown); the second worked |
| Geocode rate limiter | logic checked | Offline Node test with mocked fetch: 3 concurrent requests × 2 addresses → 6 calls, gaps 1098–1101 ms (2026-10-01). Not tested against Nominatim under real concurrency |
| npm audit | 4 remaining (3 high, 1 moderate) | `npm audit`, 2026-09-30, down from 22. Remaining: `xlsx` (no npm fix), `postcss` bundled in `next` (fixed only in Next 16), and `brace-expansion` (eslint dev tooling only) |
| PDF export library | partly verified | jsPDF 4.2.1 in Node produced a valid PDF using the app's calls (2026-09-30). In-browser download **unverified** |
| Export, file import, 3+ stops | **unverified** | Not exercised in the browser test |
| Tests | none | No test suite exists |
| Production deploy | **broken / unverified** | Still runs the pre-fix code (OpenCage + CARTO). Not checked after these changes, which aren't deployed |

**Known issues:**
- No timeout on outgoing calls to ORS (`/api/optimize`, `/api/route`) or Nominatim
  (`/api/geocode`). A hung upstream leaves the page waiting with no error.
- The geocode rate limit and cache are per server instance. Parallel Vercel
  instances can together exceed 1 request/second. The cache has no size limit or
  TTL, and a 200 with unparseable JSON is cached as "not found".
- The `/api/geocode` 502 body includes the upstream status and up to 500 chars
  of Nominatim's response.
- Not mobile responsive (per the user).
- README is stale: it describes OpenCage and `NEXT_PUBLIC_*` env var names, says
  "Next.js 13", and lists html2canvas, which isn't a dependency.
- `next lint` is deprecated and will be removed in Next 16.
- Local builds warn about a stray `~/package-lock.json` that Next picks up as the workspace root. This doesn't affect Vercel.

<!--
Rules for this file:
- Rewrite it to describe the current state. It isn't a log; history lives in git.
- Every "passing" or "works" claim needs evidence from a run, or it's marked unverified.
- Future work goes in TODO.md, and reasons in decisions.md.
-->
