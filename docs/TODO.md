# TODO

## Now (v1.1.0)
- [ ] Get the app working again on a free API. The current API isn't working (reported by the user 2026-09-30). First find out which service is failing (OpenCage, ORS, or both) and why, then choose a free replacement and switch the server routes in `src/app/api/` to it
- [ ] Make the app mobile responsive
- [ ] Fix the README: env var names (`OPENCAGE_API_KEY`, `ORS_API_KEY`), Next.js version, and remove html2canvas; also fix typos ("impor", "Real-timme", "form", "Goolgle Mpaps")

## Next
- [ ] Add a test runner and unit tests for pure helpers (`parseFile.js`, `generateGoogleMapsUrl.js`, input validation in the API routes), with API calls mocked
- [ ] Add a CI workflow that runs lint and build on PRs
- [ ] Decide on `xlsx`: install SheetJS 0.20.3 from their CDN (`npm i https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`; npm's 0.18.5 is the last on the registry and is flagged) or replace it
- [ ] Check XLS/XLSX/CSV import and PDF download in the browser after the dependency upgrades
- [ ] Move from `next lint` to the ESLint CLI (`next lint` is removed in Next 16)

## Later
- [ ] Upgrade to Next 16 (clears the `postcss` advisory bundled in Next)
- [ ] Smoke-test the live Vercel deployment after deploys
- [ ] Look at the size of the `/` page bundle (First Load JS 439 kB)

## Done recently
