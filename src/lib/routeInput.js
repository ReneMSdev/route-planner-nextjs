// Shared input checks for the ORS-backed API routes (/api/route, /api/optimize).
// Rejecting bad input here keeps it from reaching ORS with the server key.

// `profile` ends up in the ORS URL path, so only known values are allowed
export const ALLOWED_PROFILES = ['driving-car']

// Matches /api/geocode's limit
export const MAX_STOPS = 25

const isLatLng = (p) =>
  Array.isArray(p) &&
  p.length === 2 &&
  Number.isFinite(p[0]) &&
  Number.isFinite(p[1]) &&
  Math.abs(p[0]) <= 90 &&
  Math.abs(p[1]) <= 180

/**
 * Validates { coordinates: [[lat, lng], ...], profile? }.
 * Returns { coordinates, profile } or { error } (a message for a 400 response).
 */
export function parseRouteInput(payload) {
  const { coordinates, profile = 'driving-car' } = payload || {}

  if (!ALLOWED_PROFILES.includes(profile)) return { error: 'Unsupported profile' }
  if (!Array.isArray(coordinates) || coordinates.length < 2)
    return { error: 'Need at least 2 coordinates' }
  if (coordinates.length > MAX_STOPS) return { error: `Too many stops (max ${MAX_STOPS})` }
  if (!coordinates.every(isLatLng))
    return { error: 'Each coordinate must be [lat, lng] with valid numbers' }

  return { coordinates, profile }
}
