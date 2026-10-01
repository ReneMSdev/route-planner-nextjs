# Decisions

Append-only log of choices made and why. Newest at the bottom. Don't edit old
entries: if a decision is reversed, add a new entry that references the old one.

<!-- Entry format:

## YYYY-MM-DD: {{Short title}}

**Decision:** {{what was chosen}}
**Alternatives:** {{what else was considered}}
**Why:** {{the reason, including constraints at the time}}

-->

## 2025-08-19: Proxy external APIs through server routes (imported from git history)

**Decision:** OpenCage and ORS calls go through Next.js API routes in
`src/app/api/`, using non-public env vars.
**Alternatives:** Calling the APIs from the client with `NEXT_PUBLIC_` keys (the earlier approach).
**Why:** Keeps API keys out of the browser bundle. The reason is inferred from
the change (commits b3add70 to c31f696), not recorded at the time.

## 2026-09-30: Lint + build as the check commands

**Decision:** `/wrapup` verifies with `npm run lint` and `npm run build`.
**Alternatives:** Lint only; adding a test runner during setup.
**Why:** There's no test suite yet. Build catches compile and import errors.
Adding tests is tracked in TODO.
