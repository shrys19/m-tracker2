/**
 * SHA-256 hex digest of the given string. Used to avoid storing PINs in plaintext.
 * Note: this is a deterrent against casual snooping of localStorage, not real
 * cryptography — a determined attacker with local access can still brute-force
 * a 4-6 digit PIN trivially.
 */
export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
