import crypto from "crypto";
import baseX from "base-x";

const BASE62 = baseX(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
);

const ALGORITHM = "aes-256-cbc";

const KEY = Buffer.from("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", "hex");
const IV = Buffer.from("abcdef0123456789abcdef0123456789", "hex");

export function encrypt(text: string) {
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
  let encrypted = cipher.update(text, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Junta IV + encrypted e codifica tudo em base62
  const result = Buffer.concat([IV, encrypted]);
  return BASE62.encode(result); // <-- alfanumérica
}

export function decrypt(base62text: string) {
  const buffer = BASE62.decode(base62text);
  const iv = buffer.slice(0, 16); // extrai IV
  const encryptedText = buffer.slice(16);

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

