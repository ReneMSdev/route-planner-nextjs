# Route Boss (route-planner-nextjs)

Route planning web app: enter or import addresses, geocode them, optimize the
stop order, show the route on a map, and export it as a PDF or a Google Maps QR
code. It's a portfolio/demo project, live at https://route-planner-nextjs.vercel.app.

## Stack

Next.js 15 (App Router, Turbopack in dev), React 19, plain JavaScript (`.js`/`.jsx`,
`@/` alias → `src/`), Tailwind v4 + shadcn/ui, Leaflet via react-leaflet.
External APIs: OpenCage (geocoding, autocomplete) and OpenRouteService
(directions, optimization). Deployed on Vercel. No test suite and no CI.

## Layout

- `src/app/page.js`: the main (and only) page.
- `src/app/api/{autocomplete,geocode,optimize,route}/route.js`: server-side proxies to OpenCage and ORS.
- `src/components/`: AddressForm, ImportForm (CSV/XLS parsing), MapDisplay, ExportModal; `ui/` holds the shadcn components.
- `src/utils/`: client helpers that call the API routes, plus PDF and Google Maps URL helpers.

## Commands

| Purpose | Command |
|---|---|
| Install | `npm install` |
| Run locally | `npm run dev` (http://localhost:3000) |
| Lint | `npm run lint` |
| Build (also the compile check) | `npm run build` |

`/wrapup` checks: `npm run lint` and `npm run build`.

Local env (`.env.local`, gitignored): `OPENCAGE_API_KEY`, `ORS_API_KEY`. Builds
succeed without them, but the API routes return 500 at runtime when they're missing.

## Project rules

- Keep API keys server-side. Never use `NEXT_PUBLIC_` for them or read them in
  client code. Every OpenCage/ORS call goes through `src/app/api/`.
- Stay in JavaScript. No TypeScript conversion unless asked.
- Limit paid API calls. Don't hit OpenCage or ORS in loops, scripts, or repeated
  manual tests (free-tier quotas). Ask before anything that makes many calls.
- For `src/components/ui/`, prefer the shadcn CLI (`npx shadcn@latest add <component>`)
  over hand-writing components. Small edits to existing ones are fine.

## State

Current state: `docs/STATUS.md`. Backlog: `docs/TODO.md`. Decisions: `docs/decisions.md`.
