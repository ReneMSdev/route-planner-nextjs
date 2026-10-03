# Route Boss (route-planner-nextjs)

Route planning web app: enter or import addresses, geocode them, optimize the
stop order, show the route on a map, and export it as a PDF or open it in Google
Maps (a button, plus a QR code on desktop). It's a portfolio/demo project, live
at https://route-planner-nextjs.vercel.app.

## Stack

Next.js 15 (App Router, Turbopack in dev), React 19, plain JavaScript (`.js`/`.jsx`,
`@/` alias → `src/`), Tailwind v4 + shadcn/ui, Leaflet via react-leaflet.
External APIs: Nominatim/OpenStreetMap (geocoding, no key) and OpenRouteService
(directions, optimization). Deployed on Vercel. No test suite and no CI.

## Layout

- `src/app/page.js`: the main (and only) page.
- `src/app/api/{geocode,optimize,route}/route.js`: server-side proxies. `geocode` uses Nominatim; `optimize` and `route` use ORS.
- `src/components/`: AddressForm, ImportForm (CSV/XLS parsing), MapDisplay, ExportModal; `ui/` holds the shadcn components.
- `src/hooks/`: client React hooks. `useMediaQuery.js` picks the phone, tablet, or desktop layout.
- `src/utils/`: client helpers that call the API routes, plus PDF and Google Maps URL helpers.
- `src/lib/`: server-side helpers for the API routes: `apiGuard.js` (same-origin check, per-IP rate limits) and `routeInput.js` (ORS input validation). `utils.js` is shadcn's `cn()`.
- `ARCHITECTURE.md` (repo root): how the pieces fit together, with Mermaid diagrams. Update it when the data flow or API routes change.

## Commands

| Purpose | Command |
|---|---|
| Install | `npm install` |
| Run locally | `npm run dev` (http://localhost:3000) |
| Lint | `npm run lint` |
| Build (also the compile check) | `npm run build` |
| Release | `npm version <patch\|minor\|major>`, then push the commit and the `vX.Y.Z` tag |

`/wrapup` checks: `npm run lint` and `npm run build`.

Local env (`.env.local`, gitignored): `ORS_API_KEY`. Builds succeed without it,
but `optimize` and `route` return 500 at runtime when it's missing.

## Project rules

- Keep API keys server-side. Never use `NEXT_PUBLIC_` for them or read them in
  client code. Every external API call goes through `src/app/api/`.
- Stay in JavaScript. No TypeScript conversion unless asked.
- Nominatim's usage policy: at most 1 request/second, an identifying User-Agent,
  results cached, and no autocomplete use. `api/geocode` enforces the rate limit and
  cache per server instance (parallel Vercel instances aren't coordinated); keep it that way.
- Limit API calls. Don't hit Nominatim or ORS in loops, scripts, or repeated
  manual tests (free-tier quotas). Ask before anything that makes many calls.
- For `src/components/ui/`, prefer the shadcn CLI (`npx shadcn@latest add <component>`)
  over hand-writing components. Small edits to existing ones are fine.

## State

Current state: `docs/STATUS.md`. Backlog: `docs/TODO.md`. Decisions: `docs/decisions.md`.
