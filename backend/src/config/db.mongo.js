// MongoDB (Mongoose) connection scaffold
const mongoose = require("mongoose");

const connectMongo = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGO_URI is not defined. Add it to backend/.env before starting the server.",
      );
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectMongo;
