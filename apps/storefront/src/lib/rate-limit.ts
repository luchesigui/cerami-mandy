type RateLimitOptions = {
  windowMs: number
  max: number
}

const hits = new Map<string, number[]>()

export function isRateLimited(key: string, options: RateLimitOptions): boolean {
  const now = Date.now()
  const windowStart = now - options.windowMs

  const timestamps = (hits.get(key) || []).filter((time: number) => time > windowStart)

  if (timestamps.length >= options.max) {
    return true
  }

  timestamps.push(now)
  hits.set(key, timestamps)

  // Periodic cleanup if map grows
  if (hits.size > 1000) {
    hits.forEach((times: number[], k: string) => {
      const valid = times.filter((t: number) => t > windowStart)
      if (valid.length === 0) {
        hits.delete(k)
      } else {
        hits.set(k, valid)
      }
    })
  }

  return false
}
