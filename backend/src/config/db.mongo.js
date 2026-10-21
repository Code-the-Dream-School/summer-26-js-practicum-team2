const mongoose = require("mongoose");
const os = require("node:os");

const mongoUri =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/summer-26-js-practicum-team2";

const connectMongo = async () => {
  try {
    const options =
      process.env.NODE_ENV === "test"
        ? { runtimeAdapters: { os } }
        : {};

    const conn = await mongoose.connect(mongoUri, options);

    console.log(
      `MongoDB connected to: ${conn.connection.host}/${conn.connection.name}`,
    );

    return conn;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
};

module.exports = connectMongo;
