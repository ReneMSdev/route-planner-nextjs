# TODO

## Now (v1.1.0)
- [ ] Desktop trackpad swipe back/forward is disabled by `overscroll-behavior: none` on `html`/`body` (939c82f). Switch to `overscroll-behavior-y: none` to keep swipe navigation and still block pull-to-refresh, then recheck on the iPhone
- [ ] On the iPhone, check the two fixes now in production (a66b73e): a dragged stop stops at the top and bottom of the stop list, and after rotating to landscape and back with a route on the Stops view, the Map view shows the route
- [ ] On a phone, check whether the desktop layout flashes on first load (phones get the desktop layout from the server until JavaScript loads)
- [ ] Add timeouts (AbortController; ORS optimize took 15.2 s on 2026-10-01 and about 40 s on production on 2026-10-02) to the outgoing ORS calls in `/api/optimize` and `/api/route` and the Nominatim call in `/api/geocode`, returning a clear error instead of hanging

## Abuse protection (ORS free quota: optimization ~500/day, directions ~2,000/day, 40/min each; a loop could burn the daily optimization quota in minutes)
- [ ] The per-IP limit trusts `x-forwarded-for` (Vercel overwrites it; on other hosts it can be spoofed to rotate keys), an IPv6 /64 lets one client rotate keys, and users behind shared NAT share one 100/day budget
- [ ] `/api/geocode` limits requests, not addresses: one IP can queue ~250 lookups (10 × 25) on the shared 1.1 s queue and push other users past the 60 s `maxDuration`. Consider counting addresses or capping concurrent lookups per IP
- [ ] Confirm the ORS plan quotas and whether keys expire in the HeiGIT dashboard (daily figures came from search results; the plans page couldn't be read, and no expiry policy was found in the docs, 2026-10-01)

## Bugs (found in the 2026-10-01 bug hunt and checked by the verifier subagent against 89fc4ee, unless dated otherwise)
Medium
- [ ] Unreachable stop: when ORS can't route (e.g. an island, or a point more than 1 km from a road), the page shows markers but no route line and no message (console.warn only); `/api/route` now snaps up to 1 km, which fixed the Muir Woods demo stop
- [ ] Export text says "optimized" even when optimization fell back to input order (the PDF, QR, and map now all come from the same submitted route; the form can still differ after later edits, which is expected)
Low
- [ ] The form allows unlimited stops but geocode rejects more than 25 only at submit; stops 27+ are labelled `[`, `\` in the form and PDF. Cap stops at 25 in the form and import
- [ ] PDF: no line wrapping or pagination (lines from about stop 34 fall off the page); the `mapElementId` parameter is unused
- [ ] `handleAddStop` and `handleAddressChange` build state from the closure instead of a functional updater; same-render updates are lost
- [ ] `handleDragEnd` reads `over.id` without optional chaining; throws if a drag ends with no target
- [ ] `AddressField.jsx` imports `@dnd-kit/utilities`, which isn't in `package.json`; it only resolves because `@dnd-kit/sortable` installs it. Add it as a direct dependency (found by the verifier, 2026-10-02)
Suspected (not reproduced)
- [ ] Drag-to-reorder: stops are kept inside the stop list (`restrictToParentElement`), but dnd-kit adds auto-scroll movement after that limit, so on a long list that scrolls during a drag a stop may briefly show outside the list (where it lands is still limited). Found by reading dnd-kit source (verifier, 2026-10-02); turning `autoScroll` off would block dragging to off-screen stops
- [ ] `/api/optimize` ignores ORS `unassigned` jobs, which would silently drop stops; not triggered by an unreachable point (ORS errored instead)
- [ ] Long routes in Google Maps: the documented `api=1` link allows about 9 stops between start and end (Google's docs, per the verifier from memory; possibly fewer in a phone browser without the app), so a long imported route may open incomplete, and a 25-stop URL makes a dense QR at 200 px. Accepted for a demo (user, 2026-10-02); not handled in code

## Next
- [ ] Mobile layout follow-ups from the verifier (00ac5dc, none blocking): `max-h-none` overriding the form's `max-h-[70vh]` only works by CSS order (tailwind-merge 3.2.0 keeps both); the partial-success "couldn't find" alert shows while staying on the Map view; `useMediaQuery` re-subscribes on every render (inline `subscribe`); the Stops/Map triggers have no `TabsContent`, so `aria-controls` points nowhere; tablet/laptop widths remount the panel group right after hydration
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
- [x] Released v1.1.0: `package.json` 1.0.0 → 1.1.0 and annotated tag `v1.1.0`, following the v1.0.0 pattern (2026-10-02)
- [x] Deleted `/api/autocomplete`: unused, still targeted OpenCage (whose key was rejected), had no origin check or rate limit, and Nominatim's policy forbids autocomplete. References removed from CLAUDE.md, README, ARCHITECTURE, STATUS (2026-10-02)
- [x] Dragged stops stay inside the stop list: the stops sit in their own wrapper and `DndContext` uses `restrictToVerticalAxis` and `restrictToParentElement`. Simulated touch drags at phone width on localhost stopped at the top and bottom slots and still reordered; verifier confirmed against the dnd-kit source; lint and build pass. In production (d5d40a8, merged as a66b73e); not yet checked on a phone (2026-10-02)
- [x] Touch drag-to-reorder works on the user's iPhone (2026-10-02)
- [x] Blank map after switching from the desktop to the phone layout on the Stops view (map mounted hidden fitted the route at max zoom): `FitBounds` now defers the fit until the map has a size. Verifier confirmed against Leaflet 1.9.4 source; on localhost the Map view showed all 5 markers after the switch, user zoom kept across view switches, desktop still fits; lint and build pass. In production (ef2e853, merged as a66b73e); not yet checked on a phone (2026-10-02)
- [x] Open in Google Maps checked on a phone: on the user's iPhone the button opens the Google Maps app with the route, and the desktop QR code scans (production, 2026-10-02)
- [x] Mobile scroll fix: the phone layout is pinned to the screen, the stops list contains its overscroll, `html`/`body` have `overscroll-behavior: none` and a violet background, `theme-color` set. Verifier confirmed the code; the user confirmed on an iPhone in production (939c82f, 864dc59, 2026-10-02)
- [x] New favicon: violet circle with a white map pin (`favicon.svg`), with a 32×32 PNG and a 180×180 Apple touch icon rendered from it; in production (98087b0, 2026-10-02)
- [x] Deleted merged branches `mobile-design` and `vercel/react-server-components-cve-vu-01hq2g` (Vercel's 2026-01-06 RCE patch, PR #2, merged and superseded by Next 15.5.27) locally and on GitHub (2026-10-02)
- [x] Open in Google Maps button in the Export dialog (first and solid on phones, with the QR code hidden; after PDF on desktop, above the QR). The Maps link moved to Google's documented `api=1` format with `travelmode=driving`. Verifier confirmed the code; lint and build pass; on desktop Chrome the link opened Google Maps with the 5 stops in order. In production (4a0915b); real phone untested (2026-10-02, 5335e52)
- [x] Mobile layout merged to `main` (649f92d) and pushed; the user checked production on a phone: "looks great on mobile" (2026-10-02)
