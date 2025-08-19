export async function geocodeAddresses(addresses) {
  const res = await fetch('/api/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addresses, country: 'us' }),
  })

  if (!res.ok) {
    let detail = ''
    try {
      detail = await res.text()
    } catch {}
    throw new Error(`Geocoding request failed (${res.status}) ${detail || ''}`.trim())
  }

  const { results } = await res.json()
  return results
}
