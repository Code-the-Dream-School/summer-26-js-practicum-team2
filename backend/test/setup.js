const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
process.env.LESSON_IMPORT_SECRET = process.env.LESSON_IMPORT_SECRET || "test-import-secret";

let mongoServer;

const useTestDb = () => {
  beforeAll(async () => {
    if (!process.env.MONGO_URI) {
      mongoServer = await MongoMemoryServer.create();
      process.env.MONGO_URI = mongoServer.getUri();
    }

    // Require after MONGO_URI is set because db.mongo.js reads env at module load.
    const connectMongo = require("../src/config/db.mongo");

    if (mongoose.connection.readyState === 0) {
      await connectMongo();
    }
  });

  afterEach(async () => {
    const { collections } = mongoose.connection;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    if (mongoServer) {
      await mongoServer.stop();
    }
  });
};

module.exports = { useTestDb };
