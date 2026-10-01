# Status

_Last verified: 2026-09-30 at 3c3803c_

Portfolio/demo app, live on Vercel, released as v1.0.0. All the main features are in place, but the app currently doesn't work because its API is down (see Known issues). Next up is v1.1.0: a free replacement API and mobile layout. The
latest work (Aug 2025) moved the external API calls into server routes and added
a random demo route; in Jan 2026 Next was bumped to 15.3.8 for the RSC CVE fix. On 2026-09-30, Next was upgraded to 15.5.27 and jsPDF to 4.2.1 to fix security advisories.
There are no automated tests, so lint and build are the only checks.

## App

**State:** single page with manual and file-import (CSV/XLS/XLSX) address
entry, address autocomplete, geocoding (OpenCage), route optimization and road
polyline (ORS), a Leaflet map with A–Z markers, and PDF/QR export. Four API
routes proxy the external services using the server-side keys `OPENCAGE_API_KEY`
and `ORS_API_KEY`.

| Check | Result | Evidence |
|---|---|---|
| Lint | passing | `npm run lint`: "No ESLint warnings or errors" (Next 15.5.27 deps, 2026-09-30) |
| Build | passing | `npm run build`: compiled, 8/8 static pages generated (Next 15.5.27 deps, 2026-09-30) |
| npm audit | 4 remaining (3 high, 1 moderate) | `npm audit`, 2026-09-30, down from 22. Remaining: `xlsx` (no npm fix), `postcss` bundled in `next` (fixed only in Next 16), and `brace-expansion` (eslint dev tooling only) |
| PDF export library | partly verified | jsPDF 4.2.1 in Node produced a valid PDF using the app's calls (2026-09-30). In-browser download **unverified** |
| Tests | none | No test suite exists |
| Runtime behavior (geocode, optimize, map, export) | **unverified** | Not run this session: there's no `.env.local` here, and the APIs are paid/quota-limited |
| Production deploy | **unverified** | The Vercel URL wasn't checked this session |

**Known issues:**
- Geocoding and autocomplete are broken: OpenCage rejects the production key with
  401 "unknown API key", so `/api/autocomplete` returns 502. `/api/geocode` hides
  the error and returns `{"results":[null]}` with HTTP 200. ORS works: `/api/route`
  and `/api/optimize` both returned valid results. (Checked with one live request
  to each route, 2026-09-30.)
- Not mobile responsive (per the user).
- README is stale: it gives `NEXT_PUBLIC_*` env var names (the code uses
  `OPENCAGE_API_KEY` and `ORS_API_KEY`), says "Next.js 13", and lists
  html2canvas, which isn't a dependency.
- `next lint` is deprecated and will be removed in Next 16.
- Local builds warn about a stray `~/package-lock.json` that Next picks up as the workspace root. This doesn't affect Vercel.

<!--
Rules for this file:
- Rewrite it to describe the current state. It isn't a log; history lives in git.
- Every "passing" or "works" claim needs evidence from a run, or it's marked unverified.
- Future work goes in TODO.md, and reasons in decisions.md.
-->
