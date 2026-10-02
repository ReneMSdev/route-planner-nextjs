# TODO

## Now (v1.1.0)
- [ ] Open in Google Maps (on `working`, uncommitted): push for a Preview, then on a phone check that the button opens the Google Maps app with the route, and scan the desktop QR code (now the `api=1` format). Then merge to `main`
- [ ] On a phone, check touch drag-to-reorder (the handle has `touch-none`) and whether the desktop layout flashes on first load; the user's phone check on 2026-10-02 ("looks great on mobile") didn't single these out
- [ ] Tag v1.1.0 now that the mobile layout is in production (`npm version minor`, then push the commit and the `v1.1.0` tag). Production has run untagged changes since v1.0.0: Nominatim/OSM switch, purple theme, bug fixes, input validation, loading state, abuse protection, mobile layout
- [ ] Add timeouts (AbortController; ORS optimize once took 15.2 s on 2026-10-01) to the outgoing ORS calls in `/api/optimize` and `/api/route` and the Nominatim call in `/api/geocode`, returning a clear error instead of hanging
- [ ] Delete `/api/autocomplete` (still OpenCage, nothing calls it, and Nominatim's policy forbids autocomplete) or replace it with an allowed service; it also has no origin check or rate limit

## Abuse protection (ORS free quota: optimization ~500/day, directions ~2,000/day, 40/min each; a loop could burn the daily optimization quota in minutes)
- [ ] The per-IP limit trusts `x-forwarded-for` (Vercel overwrites it; on other hosts it can be spoofed to rotate keys), an IPv6 /64 lets one client rotate keys, and users behind shared NAT share one 100/day budget
- [ ] `/api/geocode` limits requests, not addresses: one IP can queue ~250 lookups (10 × 25) on the shared 1.1 s queue and push other users past the 60 s `maxDuration`. Consider counting addresses or capping concurrent lookups per IP
- [ ] Confirm the ORS plan quotas and whether keys expire in the HeiGIT dashboard (daily figures came from search results; the plans page couldn't be read, and no expiry policy was found in the docs, 2026-10-01)

## Bugs (found in the 2026-10-01 bug hunt; checked by the verifier subagent against 89fc4ee)
Medium
- [ ] Unreachable stop: when ORS can't route (e.g. an island, or a point more than 1 km from a road), the page shows markers but no route line and no message (console.warn only); `/api/route` now snaps up to 1 km, which fixed the Muir Woods demo stop
- [ ] Export text says "optimized" even when optimization fell back to input order (the PDF, QR, and map now all come from the same submitted route; the form can still differ after later edits, which is expected)
Low
- [ ] The form allows unlimited stops but geocode rejects more than 25 only at submit; stops 27+ are labelled `[`, `\` in the form and PDF. Cap stops at 25 in the form and import
- [ ] PDF: no line wrapping or pagination (lines from about stop 34 fall off the page); the `mapElementId` parameter is unused
- [ ] `handleAddStop` and `handleAddressChange` build state from the closure instead of a functional updater; same-render updates are lost
- [ ] `handleDragEnd` reads `over.id` without optional chaining; throws if a drag ends with no target
Suspected (not reproduced)
- [ ] `/api/optimize` ignores ORS `unassigned` jobs, which would silently drop stops; not triggered by an unreachable point (ORS errored instead)
- [ ] Long routes in Google Maps: the documented `api=1` link allows about 9 stops between start and end (Google's docs, per the verifier from memory; possibly fewer in a phone browser without the app), so a long imported route may open incomplete, and a 25-stop URL makes a dense QR at 200 px. Accepted for a demo (user, 2026-10-02); not handled in code

## Next
- [ ] Mobile layout follow-ups from the verifier (00ac5dc, none blocking): `max-h-none` overriding the form's `max-h-[70vh]` only works by CSS order (tailwind-merge 3.2.0 keeps both); a map that mounts hidden with a route (desktop → mobile resize on the Stops view) may fit at the wrong zoom; the partial-success "couldn't find" alert shows while staying on the Map view; `useMediaQuery` re-subscribes on every render (inline `subscribe`); the Stops/Map triggers have no `TabsContent`, so `aria-controls` points nowhere; tablet/laptop widths remount the panel group right after hydration
- [ ] `CLAUDE.md`: add `src/hooks/` to the Layout section, and change "a Google Maps QR code" in the intro to mention the Open in Google Maps button
- [ ] Find out why the first route submit on 2026-10-01 hadn't rendered after ~9s while the second worked (possibly a slow upstream; see the timeout item)
- [ ] Geocode cache: add a size limit or TTL, normalize inner whitespace in the key, and don't cache unparseable responses as "not found"
- [ ] Stop sending Nominatim's raw status/detail to the client in the `/api/geocode` 502 body; log them on the server instead
- [ ] Add a test runner and unit tests for pure helpers (`parseFile.js`, `generateGoogleMapsUrl.js`, input validation in the API routes), with API calls mocked
- [ ] Add a CI workflow that runs lint and build on PRs
- [ ] Decide on `xlsx`: install SheetJS 0.20.3 from their CDN (`npm i https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`; npm's 0.18.5 is the last on the registry and is flagged) or replace it
- [ ] Check XLS/XLSX/CSV import, PDF/QR export, and routes with 3+ stops in the browser after the dependency upgrades
- [ ] Move from `next lint` to the ESLint CLI (`next lint` is removed in Next 16)

## Later
- [ ] Add a `LICENSE` file if MIT is intended (the README says MIT; there's no LICENSE file)
- [ ] Upgrade to Next 16 (clears the `postcss` advisory bundled in Next)
- [ ] Smoke-test the live Vercel deployment after deploys
- [ ] Look at the size of the `/` page bundle (First Load JS 444 kB at aa5a0b5)
- [ ] If traffic grows: rate limiting (Nominatim spacing and the per-IP limits) is per serverless instance, so a shared store (e.g. Upstash/Vercel KV) or Vercel Firewall rules would be needed for real guarantees

## Done recently
- [x] Open in Google Maps button in the Export dialog (first and solid on phones, with the QR code hidden; after PDF on desktop, above the QR). The Maps link moved to Google's documented `api=1` format with `travelmode=driving`. Verifier confirmed the code; lint and build pass; on desktop Chrome the link opened Google Maps with the 5 stops in order. Real phone untested (2026-10-02, uncommitted)
- [x] Mobile layout merged to `main` (649f92d) and pushed; the user checked production on a phone: "looks great on mobile" (2026-10-02)
- [x] Mobile layout on `mobile-design`: Stops / Map switch below 768px (map on submit, back to Stops on failure, floating Export), two columns from 768px starting at 50% / 40% / 30% by width, map redraws on container resize, touch-none drag handle, `min-w-[300px]` typo fixed. Lint and build pass, desktop Chrome checks done (2026-10-02, d1bd170, 00ac5dc)
- [x] Production smoke test of the 2026-10-01 merge (493e2a6): Vercel Production deploy `success`, foreign Origin → 403 on `/api/route` and `/api/optimize`, and one Generate Random Route in Chrome passed the origin check, showed the spinner and "Loading...", and drew a 5-stop route line (2026-10-02)
- [x] README rewritten for the current app (Nominatim/ORS, `ORS_API_KEY` only, Next.js 15, features and limits, folder structure) and ARCHITECTURE.md added with three Mermaid diagrams, all checked to render (2026-10-01, c597c2d)
- [x] Abuse protection (`src/lib/apiGuard.js`) on `/api/geocode`, `/api/optimize`, `/api/route`: same-origin check (403 otherwise) and a per-IP limit of 10/min and 100/day per route (429 with Retry-After and a friendly message), in memory per server instance. ORS 403/429 become a "demo quota used up" 503, and the page now tells the user when optimize or the road route fails for those reasons instead of failing silently. `/api/optimize` returns 502 for other ORS errors instead of forwarding ORS's status (2026-10-01, 1ae54d7)
- [x] Loading state: spinner with "Finding your route…" over the map, the clicked button reads "Loading...", Submit/Generate/Export, the address fields, and the Line/Import tabs are disabled, and a second submit is ignored while one runs. Fixes the submit race, lost mid-request edits, and double-click Nominatim calls from the UI; two tabs or clients can still send overlapping requests, and `/api/geocode` doesn't de-duplicate in-flight lookups. Alerts wait until the spinner clears (2026-10-01, e683523)
- [x] Security: `/api/route` and `/api/optimize` accept only the `driving-car` profile (closes the ORS path injection), cap stops at 25, validate lat/lng, and return 400 instead of 500 for malformed input (shared `src/lib/routeInput.js`); `/api/route` returns 502 instead of 500 if ORS sends a non-JSON 200 (2026-10-01, 7c78bbe)
- [x] Deployed to production via `main` (1877e57, then ccc80d3) and smoke-tested the live site: geocode, optimize, route all 200 with a route line (2026-10-01)
- [x] Muir Woods demo stop left routes without a line in production (geocoded >350 m from a road); `/api/route` now passes `radiuses` of 1 km to ORS. All 43 demo stops route in one call (2026-10-01, aa5a0b5)
- [x] Google Maps link / QR fixed (was appending the stop index to every coordinate); no QR without a route. QR decoded and opened in Google Maps as the right 5-stop route (2026-10-01, 90d43ae)
