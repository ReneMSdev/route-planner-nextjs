// Returns a Google Maps directions URL for [[lat, lng], ...], or '' when there
// isn't a route (fewer than 2 points) so callers can skip the QR code and link.
// Uses Google's documented Maps URLs format (api=1), which opens the Google
// Maps app on phones that have it. Driving, to match the ORS route.
export function generateGoogleMapsUrl(coordinates = []) {
  if (coordinates.length < 2) return ''
  const point = ([lat, lng]) => `${lat},${lng}`
  const params = new URLSearchParams({
    api: '1',
    origin: point(coordinates[0]),
    destination: point(coordinates[coordinates.length - 1]),
    travelmode: 'driving',
  })
  const waypoints = coordinates.slice(1, -1).map(point)
  if (waypoints.length > 0) params.set('waypoints', waypoints.join('|'))
  return `https://www.google.com/maps/dir/?${params}`
}
