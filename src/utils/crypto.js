import crypto from "crypto";

const normalizeKey = () => {
  const keyMaterial = process.env.TASK_ENCRYPTION_KEY || "";
  return crypto.createHash("sha256").update(keyMaterial).digest();
};

export const encryptField = (value) => {
  if (!value) {
    return "";
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", normalizeKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
};

export const decryptField = (value) => {
  if (!value) {
    return "";
  }

  const [ivHex, tagHex, encryptedHex] = value.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    normalizeKey(),
    Buffer.from(ivHex, "hex"),
  );

  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};
