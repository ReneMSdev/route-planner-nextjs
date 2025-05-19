export function generateGoogleMapsUrl(coordinates) {
  const base = 'https://www.google.com/maps/dir/'
  const path = coordinates.map((lat, lng) => `${lat},${lng}`).join('/')
  return `${base}${path}`
}
