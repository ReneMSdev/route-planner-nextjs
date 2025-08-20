// src/app/api/optimize/route.js
import { NextResponse } from 'next/server'

export async function POST(req) {
  const ORS_KEY = process.env.ORS_API_KEY
  if (!ORS_KEY) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  let payload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { coordinates = [], profile = 'driving-car', startAtFirst = true } = payload || {}

  const isValid = (p) =>
    Array.isArray(p) && p.length === 2 && Number.isFinite(p[0]) && Number.isFinite(p[1])
  const clean = coordinates.map((p, i) => ({ p, i })).filter(({ p }) => isValid(p))

  if (clean.length < 2) {
    return NextResponse.json({ error: 'Need at least 2 valid coordinates' }, { status: 400 })
  }

  const jobs = clean.map(({ p: [lat, lng] }, idx) => ({ id: idx + 1, location: [lng, lat] }))
  const vehicle = { id: 1, profile }
  if (startAtFirst) vehicle.start = jobs[0].location

  const upstream = await fetch('https://api.openrouteservice.org/optimization', {
    method: 'POST',
    headers: { Authorization: ORS_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobs, vehicles: [vehicle] }),
    cache: 'no-store',
  })

  const detailText = await upstream.text().catch(() => '')
  let detailJson = null
  try {
    detailJson = detailText ? JSON.parse(detailText) : null
  } catch {}

  if (!upstream.ok) {
    // Forward the real status (401/403/429/400, etc.) and any detail
    return NextResponse.json(
      { error: 'ORS upstream error', detail: detailJson || detailText },
      { status: upstream.status, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const data = detailJson || {}
  const localOrder =
    data?.routes?.[0]?.steps?.filter((s) => s.type === 'job')?.map((s) => s.job - 1) || null
  if (!Array.isArray(localOrder)) {
    return NextResponse.json({ error: 'Invalid ORS response' }, { status: 502 })
  }

  const idxMap = clean.map(({ i }) => i)
  const stepIds = localOrder.map((k) => idxMap[k])
  return NextResponse.json({ stepIds }, { headers: { 'Cache-Control': 'no-store' } })
}
