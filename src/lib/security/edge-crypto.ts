// Web Crypto helpers. No Node APIs here so this file works in both the
// Edge middleware and Node route handlers.

const enc = new TextEncoder();
const dec = new TextDecoder();

export function b64urlEncode(bytes: Uint8Array | string): string {
  const arr = typeof bytes === "string" ? enc.encode(bytes) : bytes;
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64urlDecode(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const bin = atob(input.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function b64urlDecodeToString(input: string): string {
  return dec.decode(b64urlDecode(input));
}

const keyCache = new Map<string, Promise<CryptoKey>>();

function hmacKey(secret: string): Promise<CryptoKey> {
  let key = keyCache.get(secret);
  if (!key) {
    key = crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    keyCache.set(secret, key);
  }
  return key;
}

export async function hmacSha256(secret: string, data: string): Promise<string> {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64urlEncode(new Uint8Array(sig));
}

export async function sha256(data: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(data));
  return b64urlEncode(new Uint8Array(digest));
}

/** Constant time string compare (length leak only). */
export function safeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export function randomToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return b64urlEncode(arr);
}
