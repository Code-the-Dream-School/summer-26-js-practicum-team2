require("dotenv").config();
const { setServers } = require("node:dns/promises");
const app = require("./src/app");
const connectMongo = require("./src/config/db.mongo.js");

const PORT = process.env.PORT || 8080;

// Some developers cannot resolve a connection with MongoDB Atlas
// This is a workaround to set the DNS server to Cloudflare's public DNS
const setDNS = async (dns = "1.1.1.1") => {
  try {
    setServers([dns]);
  } catch (err) {
    console.error("Failed to set DNS servers:", err.message);
    process.exit(1);
  }
};

const startServer = async () => {
  await setDNS();
  await connectMongo().catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
  app.listen(PORT, () => {
    console.log(`Sprout API listening on http://localhost:${PORT}`);
  });
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

module.exports = { startServer };
