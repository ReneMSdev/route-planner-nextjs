export async function geocodeAddresses(addresses) {
  const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY

  const fetches = addresses.map(async (address) => {
    const res = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`
    )
    const data = await res.json()
    const { lat, lng } = data.results?.[0]?.geometry || {}
    return lat && lng ? [lat, lng] : null
  })

  const results = await Promise.all(fetches)
  return results.filter(Boolean)
}
