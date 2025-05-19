// utils/optimizeRoute.js

export async function optimizeRoute(coordinates) {
  const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY

  if (!apiKey) {
    throw new Error('Missing ORS API key in NEXT_PUBLIC_ORS_API_KEY')
  }

  const jobs = coordinates.map(([lat, lng], index) => ({
    id: index + 1,
    location: [lng, lat], // ORS expects [lng, lat]
  }))

  const vehicle = {
    id: 1,
    profile: 'driving-car',
    start: jobs[0].location,
  }

  const body = {
    jobs,
    vehicles: [vehicle],
  }

  const res = await fetch('https://api.openrouteservice.org/optimization', {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  const stepIds = data.routes?.[0]?.steps
    ?.filter((step) => step.type === 'job')
    ?.map((step) => step.job - 1)

  if (!stepIds || !Array.isArray(stepIds)) {
    throw new Error('Invalid ORS response')
  }

  return stepIds
}
