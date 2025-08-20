// utils/optimizeRoute.js
export async function optimizeRoute(
  coordinates,
  { profile = 'driving-car', startAtFirst = true } = {}
) {
  const res = await fetch('/api/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coordinates, profile, startAtFirst }),
  })

  // Read body once; it might be JSON or text
  const text = await res.text().catch(() => '')
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {}

  if (!res.ok) {
    const msg = json?.error || json?.detail || text || 'Unknown error'
    throw new Error(`Optimization request failed (${res.status}) ${msg}`.trim())
  }

  const { stepIds } = json || {}
  if (!Array.isArray(stepIds)) throw new Error('Invalid ORS response')
  return stepIds
}
