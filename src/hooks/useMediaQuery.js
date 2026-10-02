'use client'

import { useSyncExternalStore } from 'react'

// True while the CSS media query matches. The server and the first hydration
// render get `serverValue`; React then re-renders with the real value.
export function useMediaQuery(query, serverValue = false) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => serverValue
  )
}
