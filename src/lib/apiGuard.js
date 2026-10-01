// Basic abuse protection for the API routes: a same-origin check and a
// per-IP rate limit. Limits live in memory, so they apply per server instance
// (parallel Vercel instances each keep their own counts). That stops casual
// looping, not a determined attacker. The client IP comes from
// x-forwarded-for, which Vercel overwrites; on other hosts it can be spoofed.
// See docs/TODO.md for a shared store.
import { NextResponse } from 'next/server'

const LIMITS = [
  { ms: 60 * 1000, max: 10, message: 'Too many requests. Please wait a minute and try again.' },
  {
    ms: 24 * 60 * 60 * 1000,
    max: 100,
    message: 'Daily limit reached for this demo. Please try again tomorrow.',
  },
]
const LONGEST_MS = Math.max(...LIMITS.map((l) => l.ms))
const MAX_KEYS = 5000

// "bucket|ip" -> request timestamps within the longest window
const hits = new Map()

const clientIp = (req) =>
  (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
  req.headers.get('x-real-ip') ||
  'unknown'

// The browser sends Origin on POST; it must match the host the request was sent to.
// Spoofable outside a browser, but it stops other sites from using this proxy.
function sameOrigin(req) {
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (!origin || !host) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

/**
 * Returns a NextResponse to send back (403 or 429) when the request should be
 * refused, or null when it may proceed. `bucket` separates limits per route.
 */
export function guardRequest(req, bucket) {
  if (!sameOrigin(req)) {
    // Browsers with strict referrer settings can send "Origin: null"
    return NextResponse.json(
      { error: 'This request was blocked. Please reload the page and try again.' },
      { status: 403 }
    )
  }

  const now = Date.now()
  const key = `${bucket}|${clientIp(req)}`
  const recent = (hits.get(key) || []).filter((t) => now - t < LONGEST_MS)

  for (const { ms, max, message } of LIMITS) {
    const inWindow = recent.filter((t) => now - t < ms)
    if (inWindow.length >= max) {
      const retryAfter = Math.max(1, Math.ceil((inWindow[0] + ms - now) / 1000))
      hits.delete(key) // keep refused clients most-recently-used so eviction can't reset them
      hits.set(key, recent)
      return NextResponse.json(
        { error: message },
        { status: 429, headers: { 'Retry-After': String(retryAfter), 'Cache-Control': 'no-store' } }
      )
    }
  }

  recent.push(now)
  hits.delete(key) // re-insert so Map order is least-recently-used first
  hits.set(key, recent)
  if (hits.size > MAX_KEYS) {
    // Drop keys with no recent requests, then the least recently used keys,
    // so the map can't grow without bound
    for (const [k, times] of hits) if (now - times[times.length - 1] >= LONGEST_MS) hits.delete(k)
    for (const k of hits.keys()) {
      if (hits.size <= MAX_KEYS) break
      hits.delete(k)
    }
  }
  return null
}

// ORS answers 403 (daily quota) or 429 (per-minute) when the free plan runs out.
// 403 can also mean a bad or expired key, so the message doesn't claim either;
// callers log the upstream body for the real reason.
export const ORS_QUOTA_MESSAGE =
  'The routing service is unavailable right now (the free demo quota may be used up). Please try again later.'
export const isOrsQuotaError = (status) => status === 403 || status === 429
