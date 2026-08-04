const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt);

//hashing plain text password using Node's built in crypto scrypt
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

//compare input password versus stored hash string

async function comparePassword(inputPassword, storedHash) {
  if (!storedHash || !inputPassword) return false;

  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;

  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await scrypt(inputPassword, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

module.exports = {
  hashPassword,
  comparePassword,
};
