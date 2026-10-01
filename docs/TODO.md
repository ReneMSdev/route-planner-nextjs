# TODO

## Now (v1.1.0)
- [ ] Get the app working again on a free API. The current API isn't working (reported by the user 2026-09-30). First find out which service is failing (OpenCage, ORS, or both) and why, then choose a free replacement and switch the server routes in `src/app/api/` to it
- [ ] Make the app mobile responsive
- [ ] Fix the README: env var names (`OPENCAGE_API_KEY`, `ORS_API_KEY`), Next.js version, and remove html2canvas; also fix typos ("impor", "Real-timme", "form", "Goolgle Mpaps")

## Next
- [ ] Add a test runner and unit tests for pure helpers (`parseFile.js`, `generateGoogleMapsUrl.js`, input validation in the API routes), with API calls mocked
- [ ] Add a CI workflow that runs lint and build on PRs
- [ ] Align `eslint-config-next` with the `next` version

## Later
- [ ] Smoke-test the live Vercel deployment after deploys
- [ ] Look at the size of the `/` page bundle (First Load JS 439 kB)

## Done recently
