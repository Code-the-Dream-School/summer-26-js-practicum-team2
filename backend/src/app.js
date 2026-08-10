const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const helloRoutes = require("./routes/hello.routes");

const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const errorHandlerMiddleware = require("./middleware/errorHandlerMiddleware");
const app = express();

const parseAllowedOrigins = () => {
  const configuredOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const fallbackOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
  ].filter(Boolean);

  return [...new Set([...configuredOrigins, ...fallbackOrigins])];
};

const allowedOrigins = parseAllowedOrigins();
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
};

// Trust proxy for rate limiting and secure cookies
app.set("trust proxy", 1);
// Security & best‑practice middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

app.use(cookieParser());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
app.use("/api/hello", helloRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Backend API is running");
});
app.use(errorHandlerMiddleware);

module.exports = app;
