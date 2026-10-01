// utils/fetchRoute.js
export async function fetchRoadRoute(coords) {
  // coords: [[lat, lng], ...]
  const res = await fetch('/api/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinates: coords, profile: 'driving-car' }),
  })

  if (!res.ok) {
    const json = await res.json().catch(() => null)
    const err = new Error(json?.error || `Route request failed (${res.status})`)
    // Rate limit (429) and ORS quota (503) messages are written for the user
    if (res.status === 429 || res.status === 503) err.userMessage = json?.error
    throw err
  }

  const { roadCoords } = await res.json()
  return roadCoords || []
}
