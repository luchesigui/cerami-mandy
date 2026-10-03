import "server-only"

import crypto from "node:crypto"

const SCRYPT_KEYLEN = 64
const SCRYPT_OPTIONS: crypto.ScryptOptions = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 32 * 1024 * 1024,
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const derivedKey = crypto
    .scryptSync(password.normalize("NFKC"), salt, SCRYPT_KEYLEN, SCRYPT_OPTIONS)
    .toString("hex")
  return `${salt}:${derivedKey}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":")
    if (!salt || !key) return false
    const derivedKey = crypto.scryptSync(
      password.normalize("NFKC"),
      salt,
      SCRYPT_KEYLEN,
      SCRYPT_OPTIONS
    )
    const keyBuffer = Buffer.from(key, "hex")
    if (keyBuffer.length !== derivedKey.length) return false
    return crypto.timingSafeEqual(new Uint8Array(keyBuffer), new Uint8Array(derivedKey))
  } catch {
    return false
  }
}

export function isValidPassword(password: string): boolean {
  return typeof password === "string" && password.trim().length >= 6
}
