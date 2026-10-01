import { NextResponse } from 'next/server'

// Nominatim (OpenStreetMap) usage policy: max 1 request/second, an identifying
// User-Agent, and cache results. https://operations.osmfoundation.org/policies/nominatim/
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'RouteBoss/1.0 (+https://github.com/ReneMSdev/route-planner-nextjs)'
const MIN_INTERVAL_MS = 1100
const MAX_ADDRESSES = 25

// Allow time for MAX_ADDRESSES requests at ~1/sec
export const maxDuration = 60

// Per-instance cache: "country|query" -> [lat, lng] or null (not found)
const cache = new Map()
let lastRequestAt = 0

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function geocodeOne(q, country) {
  const cacheKey = `${country}|${q.toLowerCase()}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  // Reserve the next slot before waiting so concurrent requests queue up
  // instead of all firing when the same wait ends.
  const slot = Math.max(Date.now(), lastRequestAt + MIN_INTERVAL_MS)
  lastRequestAt = slot
  const wait = slot - Date.now()
  if (wait > 0) await sleep(wait)

  const params = new URLSearchParams({
    q,
    format: 'jsonv2',
    limit: '1',
    countrycodes: country,
    'accept-language': 'en',
  })
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
    cache: 'no-store',
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    const err = new Error(`Nominatim responded ${res.status}`)
    err.status = res.status
    err.detail = detail.slice(0, 500)
    throw err
  }

  const data = await res.json().catch(() => null)
  const lat = Number(data?.[0]?.lat)
  const lng = Number(data?.[0]?.lon)
  const point = Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null
  cache.set(cacheKey, point)
  return point
}

export async function POST(req) {
  let payload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { addresses = [], country = 'us' } = payload || {}

  if (!Array.isArray(addresses))
    return NextResponse.json({ error: 'addresses must be an array of strings' }, { status: 400 })
  if (addresses.length > MAX_ADDRESSES)
    return NextResponse.json(
      { error: `Too many addresses (max ${MAX_ADDRESSES})` },
      { status: 400 }
    )

  // Sequential on purpose: Nominatim allows at most 1 request/second.
  // Results keep the input order; null means the address wasn't found.
  const results = []
  try {
    for (const address of addresses) {
      const q = (address ?? '').toString().trim()
      results.push(q ? await geocodeOne(q, String(country).toLowerCase()) : null)
    }
  } catch (err) {
    return NextResponse.json(
      {
        error: 'Address lookup is temporarily unavailable. Please try again in a minute.',
        status: err.status,
        detail: err.detail,
      },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  // no-store so results aren’t cached between users
  return NextResponse.json({ results }, { headers: { 'Cache-Control': 'no-store' } })
}
