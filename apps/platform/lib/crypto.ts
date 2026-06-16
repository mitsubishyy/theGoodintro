import crypto from "node:crypto";

/**
 * Symmetric encryption for integration secrets at rest (XERO_INTEGRATION_CONTRACT
 * §2: OAuth tokens are stored encrypted). AES-256-GCM, authenticated. The
 * ciphertext layout is base64( iv[12] | authTag[16] | ciphertext ).
 *
 * The key is XERO_TOKEN_ENC_KEY: 32 raw bytes, base64-encoded in env. Server
 * only — never import into client code. We throw rather than fall back to
 * plaintext if the key is missing or malformed, so a misconfig fails loudly
 * instead of silently storing usable tokens.
 */
const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;

function encryptionKey(): Buffer {
  const raw = process.env.XERO_TOKEN_ENC_KEY;
  if (!raw) throw new Error("XERO_TOKEN_ENC_KEY is not set");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("XERO_TOKEN_ENC_KEY must decode to 32 bytes (base64 of a 256-bit key)");
  }
  return key;
}

export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

export function decryptSecret(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  if (buf.length < IV_LEN + TAG_LEN) throw new Error("ciphertext too short");
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ciphertext = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv(ALGO, encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

/** True if the encryption key is present and well-formed. */
export function isSecretEncryptionConfigured(): boolean {
  try {
    encryptionKey();
    return true;
  } catch {
    return false;
  }
}
