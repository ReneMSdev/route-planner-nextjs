import { NextResponse } from 'next/server'

const SNAP_RADIUS_M = 1000 // how far from each stop to look for a drivable road

export async function POST(req) {
  const key = process.env.ORS_API_KEY
  if (!key) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  const { coordinates = [], profile = 'driving-car' } = (await req.json()) || {}

  if (!Array.isArray(coordinates) || coordinates.length < 2)
    return NextResponse.json({ error: 'Need at least 2 coordinates' }, { status: 400 })

  // ORS expects [lng,lat]
  const orsCoords = coordinates.map(([lat, lng]) => [lng, lat])

  const res = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}/geojson`, {
    method: 'POST',
    headers: {
      Authorization: key,
      'Content-Type': 'application/json',
    },
    // ORS only looks 350 m from each point for a road by default; parks and
    // campuses (e.g. Muir Woods) geocode farther than that from a drivable road
    body: JSON.stringify({
      coordinates: orsCoords,
      radiuses: orsCoords.map(() => SNAP_RADIUS_M),
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return NextResponse.json({ error: 'ORS upstream error', detail: text }, { status: 502 })
  }

  const data = await res.json()

  // Normalize data: return road polyline as [[lat, lng], ...]
  const coords = data?.features?.[0]?.geometry?.coordinates || []
  const roadCoords = coords.map(([lng, lat]) => [lat, lng])

  return NextResponse.json({ roadCoords }, { headers: { 'Cache-Control': 'no-store' } })
}
