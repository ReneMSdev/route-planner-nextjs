# TODO

## Now (v1.1.0)
- [ ] Commit and deploy the Nominatim + OSM tiles changes, then smoke-test the live Vercel site (geocode, map, route) with 2–3 addresses
- [ ] Make the app mobile responsive
- [ ] Fix the README: replace OpenCage with Nominatim, drop `NEXT_PUBLIC_*` env var names (only `ORS_API_KEY` remains), fix the Next.js version, and remove html2canvas; also fix typos ("impor", "Real-timme", "form", "Goolgle Mpaps")
- [ ] Add timeouts (AbortController) to the outgoing ORS calls in `/api/optimize` and `/api/route` and the Nominatim call in `/api/geocode`, returning a clear error instead of hanging
- [ ] Delete `/api/autocomplete` (still OpenCage, nothing calls it, and Nominatim's policy forbids autocomplete) or replace it with an allowed service

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
- [ ] If traffic grows: geocode rate limiting is per serverless instance, so a shared limiter (e.g. a KV store) would be needed to guarantee 1 request/second to Nominatim

## Done recently
- [x] Get the app working again on a free API: geocoding moved from OpenCage to Nominatim, map tiles from CARTO to OSM; ORS kept (working locally 2026-10-01, uncommitted)
