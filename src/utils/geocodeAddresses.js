export async function geocodeAddresses(addresses) {
  const res = await fetch('/api/gecode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addresses, country: 'us' }),
  })

  if (!res.ok) {
    throw new Error('Geocoding request failed')
  }

  const { results } = await res.json()
  return (results || []).filter(Boolean)
}
