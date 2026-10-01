// src/app/api/optimize/route.js
import { NextResponse } from 'next/server'
import { parseRouteInput } from '@/lib/routeInput'
import { guardRequest, isOrsQuotaError, ORS_QUOTA_MESSAGE } from '@/lib/apiGuard'

export async function POST(req) {
  const refused = guardRequest(req, 'optimize')
  if (refused) return refused

  const ORS_KEY = process.env.ORS_API_KEY
  if (!ORS_KEY) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

  let payload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const input = parseRouteInput(payload)
  if (input.error) return NextResponse.json({ error: input.error }, { status: 400 })
  const { coordinates, profile } = input
  const startAtFirst = payload.startAtFirst !== false

  const clean = coordinates.map((p, i) => ({ p, i }))

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
    if (isOrsQuotaError(upstream.status)) {
      console.error('ORS optimization refused', upstream.status, detailText.slice(0, 500))
      return NextResponse.json(
        { error: ORS_QUOTA_MESSAGE },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      )
    }
    return NextResponse.json(
      { error: 'ORS upstream error', detail: detailJson || detailText },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
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
