// Returns a Google Maps directions URL for [[lat, lng], ...], or '' when there
// isn't a route (fewer than 2 points) so callers can skip the QR code.
export function generateGoogleMapsUrl(coordinates = []) {
  if (coordinates.length < 2) return ''
  const base = 'https://www.google.com/maps/dir/'
  const path = coordinates.map(([lat, lng]) => `${lat},${lng}`).join('/')
  return `${base}${path}`
}
