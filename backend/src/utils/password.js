const { randomBytes, scrypt, timingSafeEqual } = require("node:crypto");
const { promisify } = require("node:util");

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

//hashing plain text password using Node's built in crypto scrypt
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString("hex")}`;
}

//compare input password versus stored hash string

async function comparePassword(inputPassword, storedHash) {
  if (!inputPassword || typeof storedHash !== "string") return false;

  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;

  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scryptAsync(inputPassword, salt, KEY_LENGTH);
  if (keyBuffer.length !== derivedKey.length) return false;
  return timingSafeEqual(keyBuffer, derivedKey);
}

module.exports = {
  hashPassword,
  comparePassword,
};
