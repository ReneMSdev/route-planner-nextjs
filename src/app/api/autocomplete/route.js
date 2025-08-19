import { NextResponse } from 'next/server'

export async function GET(req) {
  const key = process.env.OPENCAGE_API_KEY
  if (!key) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const country = (searchParams.get('country') || 'us').toLowerCase()
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const limitParam = Number(searchParams.get('limit') || '8')
  const limit = Math.min(Math.max(1, limitParam), 10) // clamp 1..10

  if (q.length < 3) {
    return NextResponse.json({ suggestions: [] }, { headers: { 'Cache-Control': 'no-store' } })
  }

  const params = new URLSearchParams({
    key,
    q,
    limit: String(limit),
    no_annotations: '1',
    abbrv: '1',
    countrycode: country, // bias results to a country
    language: 'en', // or derive from headers if you prefer
  })
  if (lat && lng) params.set('proximity', `${lat},${lng}`) // optional proximity bias

  const url = `https://api.opencagedata.com/geocode/v1/json?${params}`

  const upstream = await fetch(url, { cache: 'no-store' })
  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '')
    return NextResponse.json(
      { error: 'OpenCage upstream error', detail },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const data = await upstream.json().catch(() => null)
  const results = data?.results || []

  // Normalize into a UI-friendly shape
  const suggestions = results.map((r, idx) => {
    const { components = {}, geometry = {}, formatted } = r

    const houseRoad =
      components.house_number && components.road
        ? `${components.house_number} ${components.road}`
        : null

    const primary =
      houseRoad ||
      components.road ||
      components.neighbourhood ||
      components.suburb ||
      components.hamlet ||
      components.building ||
      components.commercial ||
      formatted

    const locality =
      components.city ||
      components.town ||
      components.village ||
      components.municipality ||
      components.county

    const secondary = [locality, components.state, components.country].filter(Boolean).join(', ')

    return {
      id: r?.annotations?.geohash || `${formatted}-${idx}`, // stable-ish id for UI
      primary: primary || formatted,
      secondary,
      formatted, // full formatted string if you want to write this into the field
      coords: {
        lat: typeof geometry.lat === 'number' ? geometry.lat : null,
        lng: typeof geometry.lng === 'number' ? geometry.lng : null,
      },
    }
  })

  return NextResponse.json({ suggestions }, { headers: { 'Cache-Control': 'no-store' } })
}
