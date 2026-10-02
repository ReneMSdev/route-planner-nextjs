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

## 2026-10-01: Map tiles from OpenStreetMap instead of CARTO

**Decision:** The Leaflet map uses OSM's standard tiles
(`https://tile.openstreetmap.org/{z}/{x}/{y}.png`, maxZoom 19) with OSM attribution.
**Alternatives:** Getting a CARTO API key (the key would show up in client-side
tile URLs, against the server-side-keys rule, unless every tile went through a
proxy route); another keyed provider such as MapTiler or Stadia (same key issue).
**Why:** CARTO's basemaps started requiring an API key: every tile request
returned an "API KEY REQUIRED" placeholder image with HTTP 200, so the map was
blank (checked 2026-10-01). OSM tiles are free, need no key, and were the app's
original tile source (86aeb50) before it switched to CARTO Voyager in 2a46be8.
The trade-off is a busier map style. Uses the subdomain-free URL because OSM
has deprecated `{a,b,c}.tile.openstreetmap.org`.

## 2026-10-01: Geocoding with Nominatim instead of OpenCage

**Decision:** `/api/geocode` uses Nominatim (OpenStreetMap's public geocoder)
with no API key. It follows Nominatim's usage policy in the route itself:
sequential lookups at least 1.1s apart, an identifying User-Agent, an in-memory
cache, and at most 25 addresses per request (`maxDuration` 60s). The route
returns a 502 with a user-facing message when the lookup fails.
**Alternatives:** Getting a new OpenCage key (the
existing key had been rejected); other keyed geocoders.
**Why:** OpenCage rejected the production key with 401 "unknown API key"
(checked 2026-09-30), and the v1.1.0 goal was a free replacement. Nominatim is
free and keyless, and a portfolio demo's volume fits its 1 request/second limit.
Trade-offs: the limit is per server instance (not coordinated across Vercel
instances), a 25-address route takes about 30s to geocode, and the policy forbids
autocomplete, so `/api/autocomplete` can't move to it.

## 2026-10-01: Snap route stops to roads up to 1 km away

**Decision:** `/api/route` sends `radiuses` of 1,000 m per stop to ORS
directions (ORS's default search radius is 350 m).
**Alternatives:** Replacing only the Muir Woods demo address with one next to
its parking lot (two candidates weren't found by Nominatim); an unlimited radius
(`-1`).
**Why:** A production smoke test found routes with no line whenever the random
route picked Muir Woods: it geocodes about 800 m into the forest, and ORS
returned "Could not find routable point within a radius of 350.0 meters". The
radius also covers user-entered addresses in parks and campuses. 1 km rather
than unlimited so a point far from any road (e.g. an island) still fails instead
of snapping to a distant, misleading road. With 1 km, all 43 demo stops route in
one call.

## 2026-10-01: Keep standard OSM tiles rather than a cleaner style for now

**Decision:** Stay on `tile.openstreetmap.org` tiles (see the CARTO → OSM entry above).
**Alternatives:** Stadia Maps "Alidade Smooth" (cleaner; free account, domain
registration instead of a key in the URL; served 200 on localhost and 401 on the
Vercel domain until registered); OpenFreeMap "Positron" (free and keyless, but
vector tiles needing MapLibre and a Leaflet plugin).
**Why:** The user chose to keep it as is for now. Stadia is the smallest change
if a cleaner look is wanted later.

## 2026-10-02: Mobile layout is a Stops / Map switch, with width-based column splits above it

**Decision:** Below 768px, show one view at a time behind a Stops / Map switch,
jumping to the map on submit. From 768px keep the resizable two columns, starting
the address column at 50% (768–1023px), 40% (1024–1279px), and 30% (1280px+).
**Alternatives:** map stacked above the form; a draggable bottom sheet over a
full-screen map (Google Maps style); a vertical resizable split; a single 30%
split for all non-phone widths.
**Why:** The user picked the switch: both views get the full screen, and it
avoids the bottom sheet's gesture conflicts with Leaflet panning and drag-to-reorder.
A bottom sheet is still possible later. The 50% / 40% splits keep the address
column at least 384px wide on tablets and small laptops, where 30% made
addresses wrap to three lines (user's choice, 2026-10-02).

## 2026-10-02: Open in Google Maps uses Google's documented `api=1` URL; stop limit accepted

**Decision:** Add an "Open in Google Maps" button to the Export dialog (first on
phones, where the QR code is hidden because a phone can't scan its own screen),
and build the link, and the QR code, with Google's documented Maps URLs format
(`/maps/dir/?api=1&origin=…&waypoints=…&destination=…&travelmode=driving`).
**Alternatives:** keep the undocumented `/maps/dir/lat,lng/lat,lng/…` path
format; warn or split routes with more stops than Google documents (about 9
between start and end).
**Why:** The documented format is the one Google supports across web, Android,
and iOS, and `travelmode=driving` matches the ORS driving route. The user chose
not to handle the stop limit since this is a demo (2026-10-02).
