require("dotenv").config();
const app = require("./src/app");
const connectMongo = require("./src/config/db.mongo");
const { setServers } = require("node:dns/promises");

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  setServers(["1.1.1.1"]);
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
