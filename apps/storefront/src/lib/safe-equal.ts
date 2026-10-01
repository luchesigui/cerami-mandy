import "server-only"

import crypto from "node:crypto"

const bytes = (value: string) => new Uint8Array(Buffer.from(value, "utf8"))

// Constant-time string comparison for secrets and signatures.
export function safeEqual(a: string, b: string) {
  const A = bytes(a)
  const B = bytes(b)
  return A.length === B.length && crypto.timingSafeEqual(A, B)
}
