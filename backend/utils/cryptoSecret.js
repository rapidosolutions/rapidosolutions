import crypto from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;

function deriveKey(secret) {
  return crypto.createHash("sha256").update(String(secret || "rapido-cv-admin")).digest();
}

export function encryptSecret(plainText, secret) {
  if (!plainText) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, deriveKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecret(payload, secret) {
  if (!payload) return "";
  const [ivHex, tagHex, dataHex] = String(payload).split(":");
  if (!ivHex || !tagHex || !dataHex) return "";
  const decipher = crypto.createDecipheriv(ALGO, deriveKey(secret), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}
