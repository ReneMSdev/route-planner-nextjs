# Status

_Last verified: 2026-10-02 at 939c82f (`working`). Production is `main` at 864dc59, the same tree, deployed with Vercel status `success`; the user confirmed the mobile scroll fix there on an iPhone._

Portfolio/demo app, live on Vercel. Geocoding uses Nominatim and map tiles use
OpenStreetMap, neither with a key; OpenRouteService (ORS) handles optimization
and road routes with a server-side key. Since v1.0.0 the app has gained a light
purple theme, rebalanced demo addresses, fixes from a bug hunt, input
validation on the ORS routes, a loading state, basic abuse protection, and a
mobile layout. v1.1.0 isn't tagged yet (see TODO).
Production deploys from `main` (Vercel Production); pushes to other branches get
Preview deploys. There are no automated tests, so lint, build, offline scripts,
and manual browser checks are the checks. `README.md` describes the app for
visitors, and `ARCHITECTURE.md` describes how it fits together.

## App

**State:** single page with manual and file-import (CSV/XLS/XLSX) address
entry, geocoding (Nominatim, US only), route optimization and a road polyline
(ORS, `ORS_API_KEY` on the server), a Leaflet map on OSM tiles with A–Z markers,
and export as a PDF or to Google Maps (a button, plus a QR code on desktop). API routes in `src/app/api/` proxy the external services.

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
  - Layout by width (`src/hooks/useMediaQuery.js`): below
    768px a Stops / Map switch shows one view full-screen; Submit and Generate
    jump to the map, stay there on success, and go back to Stops on failure; the
    map gets a floating Export button. From 768px it's the resizable two-column
    layout, starting the address column at 50% (768–1023px), 40% (1024–1279px),
    or 30% (1280px+). The map redraws when its container resizes.
  - While a route is being built, a spinner covers the map, the clicked button
    reads "Loading...", and the form, tabs, and Export are locked. A second
    submit is ignored, so the UI can't race itself.
  - Addresses that can't be found stay at the end of the list and are named in
    an alert. Quota and rate-limit problems are reported in the same alert.
  - Export appears only while stops are on the map (it's gated on the markers,
    not the route line). A failed submit clears the old route. The PDF, the
    Google Maps link, and the QR code use the routed stops.
  - Export dialog: "Open in Google Maps" opens Google's documented `api=1`
    directions URL (driving) in a new tab, which opens the Google Maps app on
    phones that have it (checked on an iPhone). On phones it's the first
    option and the QR code is hidden; on desktop it sits between the PDF and the
    QR code, which encodes the same URL.
  - Phones: the layout is pinned to the screen (`fixed inset-0`), so only the
    stops list scrolls; `html`/`body` have `overscroll-behavior: none` (no page
    bounce or pull-to-refresh) and a violet background; `theme-color` matches
    the header.
- **Favicon:** `public/favicon.svg` (violet circle, white map pin) with PNGs
  rendered from it: `favicon.png` 32×32 and `apple-icon.png` 180×180.
- **Import:** accepts an `Address` column or `Street` + `City` (`State`/`Zip`
  optional), matching headers ignoring case, spaces, dashes, and underscores.
- **Demo addresses:** 43 (20 SF, 19 East Bay, 4 Marin); see the table for the
  2026-10-01 check. OSM data can change, so that's a point-in-time result.

| Check | Result | Evidence |
|---|---|---|
| Lint | passing | `npm run lint`: "No ESLint warnings or errors" (939c82f, 2026-10-02; re-run by the verifier) |
| Build | passing | `next build` in a scratch copy of the tree (the dev server was using `.next`): compiled, 8/8 static pages (939c82f tree, 2026-10-02) |
| Mobile scroll fix | verified on an iPhone | User: the production build fixes the iPhone (Chrome) bug where swiping past the stops list scrolled the page, hid the header, triggered a reload, and showed a white background (864dc59, 2026-10-02). Verifier confirmed the code (939c82f). Scratch production build served locally at 500px: page height = viewport, `scrollTo(0, 500)` left `scrollY` 0, overscroll `none` on html/body and `contain` on the list, violet background; desktop unchanged (main agent). iOS keyboard behaviour with the pinned layout not specifically tested |
| Favicon | verified (files) | Verifier: SVG colours, `favicon.png` 32×32 and `apple-icon.png` 180×180 with matching pixels, metadata links (98087b0). Dev server served all three with HTTP 200 and the expected `<link>` tags (main agent). Not looked at in a real browser tab |
| Open in Google Maps | verified, including on an iPhone | Verifier confirmed the code claims. Offline Node check of `generateGoogleMapsUrl`: '' below 2 points, origin/destination/`travelmode=driving`, waypoints only for 3+ points, in order. Chrome on localhost: the link had 5 stops and driving mode, and opening it showed Google Maps with the 5 stops in order and a drawn route; at 500px the dialog put Google Maps first with no QR code (main agent's observations, 2026-10-02). The user confirmed on an iPhone in production that the button opens the Google Maps app and the desktop QR code scans (2026-10-02) |
| Mobile / responsive layout | verified; in production | Verifier reviewed the diff against all code claims (00ac5dc). Chrome on localhost at 614×666: Map view filled without grey tiles, Generate showed the spinner on the Map view then a 5-stop route, Stops scrolled with header and switch pinned, no horizontal scroll; left column 410px at 820px, 440px at 1100px, 420px at 1400px (main agent, 2026-10-02). The user checked production (649f92d) on a phone: "looks great on mobile" (2026-10-02). Not singled out: touch drag-to-reorder, first-load flash |
| Production smoke test | passing (for 493e2a6); later deploys checked by the user on a phone | 864dc59: Vercel status `success` and a Production deployment (verifier, 2026-10-02); the user checked the mobile layout (649f92d) and the scroll fix (864dc59) on a phone. Live site at 493e2a6, 2026-10-02: Vercel status `success` and a Production deployment for the merge commit (verifier); one Generate Random Route in Chrome drew a 5-stop A–E route with a road line (seen by the main agent only, not re-run by the verifier, to save quota). Earlier, on 8d1e8f6: `profile` injection, `?`/`#` suffix, invalid JSON, and 26 stops all returned 400 |
| Abuse protection | verified (origin check in production) | Production, 2026-10-02 (493e2a6): `Origin: https://evil.example.com` → 403 on `/api/route` and `/api/optimize` (repeated by the verifier), and the browser's own requests weren't blocked behind Vercel's headers (the route loaded). Locally (1ae54d7, 2026-10-01): 19 offline guard tests; curl 10×200 then 429 with `Retry-After: 57`; rate-limit and ORS 503 alerts in the browser. The 429 limits haven't been exercised in production |
| Loading state | verified | Production, 2026-10-02 (493e2a6): the spinner with "Finding your route..." and the "Loading..." button appeared during Generate (main agent's observation). Locally with held fake responses: one request per double-click, form/tabs/Export locked, alert only after the spinner cleared (e683523, 2026-10-01) |
| Input validation | verified | 14 bad requests → 400 locally (incl. 4 injection attempts), valid requests 200, live Generate; repeated against production on 8d1e8f6 (7c78bbe, 2026-10-01) |
| Bug fixes (QR link, unfound addresses, stale Export, map snap-back, import) | verified | Each original repro rerun in Chrome with faked API responses; QR decoded and opened in Google Maps as the right 5-stop route; generated PDF listed only routed stops (90d43ae, 2026-10-01). The QR evidence was for the old `/dir/` link format; the current `api=1` link is covered by the Open in Google Maps row |
| Import parser | passing | Offline Node scripts against the real modules: 36/36 cases including the then Maps URL helper (90d43ae, 2026-10-01). Scripts live in the session scratchpad, not the repo |
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
- Phones get the desktop layout from the server until JavaScript loads, and
  crossing a width breakpoint (e.g. rotating a tablet) remounts the layout,
  resetting the divider and map view.
- `overscroll-behavior: none` on `html`/`body` also disables two-finger trackpad
  swipe back/forward on desktop (found by the verifier; see TODO).
- Google Maps links carry every stop, but Google documents about 9 stops between
  start and end, so long routes may open incomplete (accepted for a demo).
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
