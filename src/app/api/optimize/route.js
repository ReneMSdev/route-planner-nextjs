import { NextResponse } from 'next/server'

export async function POST(req) {
  const key = process.env.ORS_API_KEY
  if (!key) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  const {
    coordinates = [],
    profile = 'driving-car',
    startAtFirst = true,
  } = (await req.json()) || {}

  // coordinates expected as [[lat, lng], ...]
  if (!Array.isArray(coordinates) || coordinates.length < 2)
    return NextResponse.json({ error: 'Need at least 2 coordinates' }, { status: 400 })

  // Build ORS Optimization payload
  const jobs = coordinates.map(([lat, lng], i) => ({
    id: i + 1,
    location: [lng, lat], // ORS expects [lng, lat]
  }))

  const vehicle = {
    id: 1,
    profile,
    ...(startAtFirst ? { start: jobs[0].location } : {}),
    // Optionally add: end: jobs[jobs.length - 1].location
  }

  const body = { jobs, vehicles: [vehicle] }

  const res = await fetch('https://api.openrouteservice.org/optimization', {
    method: 'POST',
    headers: {
      Authorization: key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    return NextResponse.json({ error: 'ORS upstream error', detail }, { status: 502 })
  }

  const data = await res.json()

  // Extract visit order as zero-based indices
  const stepIds =
    data?.routes?.[0]?.steps?.filter((s) => s.type === 'job')?.map((s) => s.job - 1) || null

  if (!Array.isArray(stepIds)) {
    return NextResponse.json({ error: 'Invalid ORS response' }, { status: 502 })
  }

  return NextResponse.json({ stepIds }, { headers: { 'Cache-Control': 'no-store' } })
}
