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

## 2026-09-30: Semantic versioning with git tags, starting at 1.0.0

**Decision:** The version in `package.json` follows semver and each release is
tagged `vX.Y.Z` (made with `npm version`). The current feature set, already live
on Vercel, is `v1.0.0`.
**Alternatives:** Leaving it unversioned (deploys identified only by commit
hash); starting at 0.x.
**Why:** Gives deploys and changes a name to refer to. It's 1.0.0 rather than
0.x because the app is complete and public as a portfolio piece.
