# TODO

## Now (v1.1.0)
- [ ] Commit and deploy the Nominatim + OSM tiles changes, then smoke-test the live Vercel site (geocode, map, route) with 2–3 addresses
- [ ] Make the app mobile responsive
- [ ] Fix the README: replace OpenCage with Nominatim, drop `NEXT_PUBLIC_*` env var names (only `ORS_API_KEY` remains), fix the Next.js version, and remove html2canvas; also fix typos ("impor", "Real-timme", "form", "Goolgle Mpaps")
- [ ] Add timeouts (AbortController) to the outgoing ORS calls in `/api/optimize` and `/api/route` and the Nominatim call in `/api/geocode`, returning a clear error instead of hanging
- [ ] Delete `/api/autocomplete` (still OpenCage, nothing calls it, and Nominatim's policy forbids autocomplete) or replace it with an allowed service
- [ ] Security: allowlist `profile` in `/api/route` and `/api/optimize` (only `driving-car`). It's currently put straight into the ORS URL (`src/app/api/route/route.js:15`), so a caller could reach other ORS endpoints with our key via `../`
- [ ] Cap coordinates at 25 in `/api/route` and `/api/optimize` (matching geocode) and validate them as finite lat/lng; `/api/route` doesn't check them at all

## Abuse protection (ORS free quota: optimization ~500/day, directions ~2,000/day, 40/min each; a loop could burn the daily optimization quota in minutes)
- [ ] Per-IP rate limit on all three API routes (e.g. 10/min and 100/day per IP), in memory. Per serverless instance only, so it stops casual looping, not a determined attacker
- [ ] Same-origin check: reject API requests whose `Origin` isn't the app's domain or localhost (spoofable, but stops other sites using the proxy from browsers)
- [ ] Pass ORS 403 (daily quota) and 429 (per-minute) through as a friendly message ("Demo quota reached, try again tomorrow") instead of the generic error
- [ ] Confirm the ORS plan quotas and whether keys expire in the HeiGIT dashboard (daily figures came from search results; the plans page couldn't be read, and no expiry policy was found in the docs, 2026-10-01)

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
- [ ] Look at the size of the `/` page bundle (First Load JS 443 kB)
- [ ] If traffic grows: rate limiting (Nominatim spacing and the per-IP limits) is per serverless instance, so a shared store (e.g. Upstash/Vercel KV) or Vercel Firewall rules would be needed for real guarantees

## Done recently
- [x] Get the app working again on a free API: geocoding moved from OpenCage to Nominatim, map tiles from CARTO to OSM; ORS kept (working locally 2026-10-01, uncommitted)
