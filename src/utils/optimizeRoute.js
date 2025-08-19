// utils/optimizeRoute.js
export async function optimizeRoute(
  coordinates,
  { profile = 'driving-car', startAtFirst = true } = {}
) {
  // coordinates: [[lat, lng], ...]
  const res = await fetch('/api/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinates, profile, startAtFirst }),
  })

  if (!res.ok) throw new Error('Optimization request failed')

  const { stepIds } = await res.json()
  if (!Array.isArray(stepIds)) throw new Error('Invalid ORS response')

  return stepIds
}
