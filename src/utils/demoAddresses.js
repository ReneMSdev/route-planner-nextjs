export const demoAddresses = [
  // — San Francisco —
  'Golden Gate Bridge, San Francisco, CA',
  'Pier 39, San Francisco, CA',
  "Fisherman's Wharf, San Francisco, CA",
  'Alcatraz Landing (Pier 33), San Francisco, CA',
  'Coit Tower, San Francisco, CA',
  'Lombard Street, San Francisco, CA',
  'Palace of Fine Arts, San Francisco, CA',
  'Oracle Park, San Francisco, CA',
  'Chase Center, San Francisco, CA',
  'Ferry Building, San Francisco, CA',
  'Twin Peaks, San Francisco, CA',
  'Alamo Square, San Francisco, CA',
  'Painted Ladies, San Francisco, CA',
  'Union Square, San Francisco, CA',
  'Japantown Peace Plaza, San Francisco, CA',
  'de Young Museum, San Francisco, CA',
  'California Academy of Sciences, San Francisco, CA',
  'Ocean Beach, San Francisco, CA',
  'Lands End Lookout, 680 Point Lobos Avenue, San Francisco, CA',
  'Baker Beach, San Francisco, CA',

  // — Marin / North Bay —
  'Muir Woods National Monument, CA',
  'Sausalito Ferry Terminal, Sausalito, CA',
  'Marin Headlands Visitor Center, CA',
  'Point Bonita Lighthouse, CA',

  // — East Bay —
  'Lake Merritt, Oakland, CA',
  'Jack London Square, Oakland, CA',
  'Oakland Museum of California, Oakland, CA',
  'Fox Theater, Oakland, CA',
  'Paramount Theatre, 2025 Broadway, Oakland, CA',
  'Oakland City Hall, Oakland, CA',
  "Children's Fairyland, Oakland, CA",
  'Oakland Zoo, Oakland, CA',
  'Chabot Space and Science Center, Oakland, CA',
  'Joaquin Miller Park, Oakland, CA',
  'Morcom Rose Garden, Oakland, CA',
  'Berkeley Marina, Berkeley, CA',
  'Tilden Regional Park, Berkeley, CA',
  'Campanile, Berkeley, CA',
  'Greek Theatre, Berkeley, CA',
  'Lawrence Hall of Science, Berkeley, CA',
  'Indian Rock Park, Berkeley, CA',
  'Cesar Chavez Park, Berkeley, CA',
  'Berkeley Rose Garden, Berkeley, CA',
]

// Helper: pick N unique random addresses
export function getRandomDemoRoute(count = 5) {
  const pool = [...demoAddresses]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count)
}
