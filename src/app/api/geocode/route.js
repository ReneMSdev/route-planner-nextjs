import { NextResponse } from 'next/server'

export async function POST(req) {
  const key = process.env.OPENCAGE_API_KEY
  if (!key) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  const { addresses = [], country = 'us' } = await req.json()

  if (!Array.isArray(addresses))
    return NextResponse.json({ error: 'addresses must be an array of strings' }, { status: 400 })

  const makeUrl = (q) => {
    const params = new URLSearchParams({
      key,
      q,
      limit: '1',
      no_annotations: '1',
      abbrv: '1',
      countrycode: country,
      language: 'en',
    })
    return `https://api.opencagedata.com/geocode/v1/json?${params}`
  }

  // For each address, fetch geocoded coordinates from OpenCage API.
  // Cleans the address, skips invalid ones, requests the API, and returns [lat, lng] or null.
  // Note: returns an array of Promises — use Promise.all() to resolve results.
  const tasks = addresses.map(async (address) => {
    const q = (address ?? '').toString().trim()
    if (!q) return null
    const res = await fetch(makeUrl(q))
    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    const { lat, lng } = data?.results?.[0]?.geometry || {}
    return typeof lat === 'number' && typeof lng === 'number' ? [lat, lng] : null
  })

  const results = await Promise.all(tasks)

  // no-store so results aren’t cached between users
  return NextResponse.json({ results }, { headers: { 'Cache-Control': 'no-store' } })
}
