# TODO

## Now (v1.1.0)
- [ ] Make the app mobile responsive
- [ ] Tag v1.1.0 after the mobile layout ships (`npm version minor`, then push the commit and the `v1.1.0` tag). Production has run untagged changes since v1.0.0: Nominatim/OSM switch, purple theme, bug fixes, input validation
- [ ] Fix the README: replace OpenCage with Nominatim, drop `NEXT_PUBLIC_*` env var names (only `ORS_API_KEY` remains), fix the Next.js version, and remove html2canvas; also fix typos ("impor", "Real-timme", "form", "Goolgle Mpaps")
- [ ] Add timeouts (AbortController; ORS optimize once took 15.2 s on 2026-10-01) to the outgoing ORS calls in `/api/optimize` and `/api/route` and the Nominatim call in `/api/geocode`, returning a clear error instead of hanging
- [ ] Delete `/api/autocomplete` (still OpenCage, nothing calls it, and Nominatim's policy forbids autocomplete) or replace it with an allowed service

## Abuse protection (ORS free quota: optimization ~500/day, directions ~2,000/day, 40/min each; a loop could burn the daily optimization quota in minutes)
- [ ] Per-IP rate limit on all three API routes (e.g. 10/min and 100/day per IP), in memory. Per serverless instance only, so it stops casual looping, not a determined attacker
- [ ] Same-origin check: reject API requests whose `Origin` isn't the app's domain or localhost (spoofable, but stops other sites using the proxy from browsers)
- [ ] Pass ORS 403 (daily quota) and 429 (per-minute) through as a friendly message ("Demo quota reached, try again tomorrow") instead of the generic error
- [ ] Confirm the ORS plan quotas and whether keys expire in the HeiGIT dashboard (daily figures came from search results; the plans page couldn't be read, and no expiry policy was found in the docs, 2026-10-01)

## Bugs (found in the 2026-10-01 bug hunt; checked by the verifier subagent against 89fc4ee)
Medium
- [ ] Unreachable stop: when ORS can't route (e.g. an island, or a point more than 1 km from a road), the page shows markers but no route line and no message (console.warn only); `/api/optimize` forwards upstream 500 as its own status. `/api/route` now snaps up to 1 km, which fixed the Muir Woods demo stop
- [ ] Export text says "optimized" even when optimization fell back to input order (the PDF, QR, and map now all come from the same submitted route; the form can still differ after later edits, which is expected)
Low
- [ ] The form allows unlimited stops but geocode rejects more than 25 only at submit; stops 27+ are labelled `[`, `\` in the form and PDF. Cap stops at 25 in the form and import
- [ ] PDF: no line wrapping or pagination (lines from about stop 34 fall off the page); the `mapElementId` parameter is unused
- [ ] `handleAddStop` and `handleAddressChange` build state from the closure instead of a functional updater (`AddressForm.jsx:35-47`); same-render updates are lost
- [ ] `handleDragEnd` reads `over.id` without optional chaining (`AddressForm.jsx:53`); throws if a drag ends with no target
- [ ] Class typos: `min-width-[300px]` → `min-w-[300px]` (`page.js:119`), `text-muted-forground` → `text-muted-foreground` (`ExportModal.jsx:63`)
Suspected (not reproduced)
- [ ] `/api/optimize` ignores ORS `unassigned` jobs, which would silently drop stops; not triggered by an unreachable point (ORS errored instead)
- [ ] Google Maps `/dir/` links may be cut to about 10 stops on mobile, and a 25-stop URL makes a dense QR at 200 px

## Next
- [ ] Find out why the first route submit on 2026-10-01 hadn't rendered after ~9s while the second worked (possibly a slow upstream; see the timeout item)
- [ ] Geocode cache: add a size limit or TTL, normalize inner whitespace in the key, and don't cache unparseable responses as "not found"
- [ ] Stop sending Nominatim's raw status/detail to the client in the `/api/geocode` 502 body; log them on the server instead
- [ ] Add a test runner and unit tests for pure helpers (`parseFile.js`, `generateGoogleMapsUrl.js`, input validation in the API routes), with API calls mocked
- [ ] Add a CI workflow that runs lint and build on PRs
- [ ] Decide on `xlsx`: install SheetJS 0.20.3 from their CDN (`npm i https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`; npm's 0.18.5 is the last on the registry and is flagged) or replace it
- [ ] Check XLS/XLSX/CSV import, PDF/QR export, and routes with 3+ stops in the browser after the dependency upgrades
- [ ] Move from `next lint` to the ESLint CLI (`next lint` is removed in Next 16)

## Later
- [ ] Upgrade to Next 16 (clears the `postcss` advisory bundled in Next)
- [ ] Smoke-test the live Vercel deployment after deploys
- [ ] Look at the size of the `/` page bundle (First Load JS 444 kB at aa5a0b5)
- [ ] If traffic grows: rate limiting (Nominatim spacing and the per-IP limits) is per serverless instance, so a shared store (e.g. Upstash/Vercel KV) or Vercel Firewall rules would be needed for real guarantees

## Done recently
- [x] Loading state: spinner with "Finding your route…" over the map, the clicked button reads "Loading...", Submit/Generate/Export, the address fields, and the Line/Import tabs are disabled, and a second submit is ignored while one runs. Fixes the submit race, lost mid-request edits, and double-click Nominatim calls from the UI; two tabs or clients can still send overlapping requests, and `/api/geocode` doesn't de-duplicate in-flight lookups. Alerts wait until the spinner clears (2026-10-01, uncommitted)
- [x] Security: `/api/route` and `/api/optimize` accept only the `driving-car` profile (closes the ORS path injection), cap stops at 25, validate lat/lng, and return 400 instead of 500 for malformed input (shared `src/lib/routeInput.js`); `/api/route` returns 502 instead of 500 if ORS sends a non-JSON 200 (2026-10-01, uncommitted)
- [x] Deployed to production via `main` (1877e57, then ccc80d3) and smoke-tested the live site: geocode, optimize, route all 200 with a route line (2026-10-01)
- [x] Muir Woods demo stop left routes without a line in production (geocoded >350 m from a road); `/api/route` now passes `radiuses` of 1 km to ORS. All 43 demo stops route in one call (2026-10-01, aa5a0b5)
- [x] Google Maps link / QR fixed (was appending the stop index to every coordinate); no QR without a route. QR decoded and opened in Google Maps as the right 5-stop route (2026-10-01, 90d43ae)
- [x] Addresses that fail to geocode are kept at the end of the list and named in an alert (shown after the route loads) instead of silently removed (2026-10-01, 90d43ae)
- [x] Export shows only while a route is on the map; a failed submit clears the old route; the PDF lists only routed stops, matching the map and QR (2026-10-01, 90d43ae)
- [x] Map no longer jumps back to the route on unrelated re-renders such as typing; new routes still fit. Also fixed the swapped scroll timer arguments in Generate (2026-10-01, 90d43ae)
- [x] Import: case/space-insensitive headers with aliases, a single Address column or Street + City (State/Zip optional), full addresses in an Address column not duplicated, numeric XLSX ZIPs zero-padded, empty/corrupt files handled, a message when nothing is found or a file is rejected, and a column hint in the UI (2026-10-01, 90d43ae)
- [x] Get the app working again on a free API: geocoding moved from OpenCage to Nominatim, map tiles from CARTO to OSM; ORS kept (8c09f57; live in production 2026-10-01)
