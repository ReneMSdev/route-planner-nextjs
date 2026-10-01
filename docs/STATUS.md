# Status

_Last verified: 2026-09-30 at 3c3803c_

Portfolio/demo app, live on Vercel. All the main features are in place. The
latest work (Aug 2025) moved the external API calls into server routes and added
a random demo route; in Jan 2026 Next was bumped to 15.3.8 for the RSC CVE fix.
There are no automated tests, so lint and build are the only checks.

## App

**State:** single page with manual and file-import (CSV/XLS/XLSX) address
entry, address autocomplete, geocoding (OpenCage), route optimization and road
polyline (ORS), a Leaflet map with A–Z markers, and PDF/QR export. Four API
routes proxy the external services using the server-side keys `OPENCAGE_API_KEY`
and `ORS_API_KEY`.

| Check | Result | Evidence |
|---|---|---|
| Lint | passing | `npm run lint`: "No ESLint warnings or errors" (3c3803c, 2026-09-30) |
| Build | passing | `npm run build`: compiled, 8/8 static pages generated (3c3803c, 2026-09-30) |
| Tests | none | No test suite exists |
| Runtime behavior (geocode, optimize, map, export) | **unverified** | Not run this session: there's no `.env.local` here, and the APIs are paid/quota-limited |
| Production deploy | **unverified** | The Vercel URL wasn't checked this session |

**Known issues:**
- README is stale: it gives `NEXT_PUBLIC_*` env var names (the code uses
  `OPENCAGE_API_KEY` and `ORS_API_KEY`), says "Next.js 13", and lists
  html2canvas, which isn't a dependency.
- `eslint-config-next` is 15.3.2 while `next` is 15.3.8 (minor version skew).

<!--
Rules for this file:
- Rewrite it to describe the current state. It isn't a log; history lives in git.
- Every "passing" or "works" claim needs evidence from a run, or it's marked unverified.
- Future work goes in TODO.md, and reasons in decisions.md.
-->
