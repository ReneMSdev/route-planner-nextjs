// utils/fetchRoute.js
export async function fetchRoadRoute(coords) {
  const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY
  const body = {
    coordinates: coords.map(([lat, lng]) => [lng, lat]), // ORS expects [lng, lat]
  }

  const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  const roadCoords = data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
  return roadCoords
}
