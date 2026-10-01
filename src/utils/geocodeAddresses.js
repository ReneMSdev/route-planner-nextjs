export async function geocodeAddresses(addresses) {
  const res = await fetch('/api/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addresses, country: 'us' }),
  })

  if (!res.ok) {
    const json = await res.json().catch(() => null)
    const err = new Error(json?.error || `Geocoding request failed (${res.status})`)
    err.userMessage = json?.error
    throw err
  }

  const { results } = await res.json()
  return results
}
