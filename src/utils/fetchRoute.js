// utils/fetchRoute.js
export async function fetchRoadRoute(coords) {
  // coords: [[lat, lng], ...]
  const res = await fetch('/api/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinates: coords, profile: 'driving-car' }),
  })

  if (!res.ok) throw new Error('Route request failed')

  const { roadCoords } = await res.json()
  return roadCoords || []
}
