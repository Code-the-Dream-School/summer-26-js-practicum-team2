const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

// Middleware imports
const errorHandlerMiddleware = require("./middleware/errorHandler");

// Route imports
const helloRoutes = require("./routes/hello.routes");
const userRoutes = require("./routes/user.routes");
const lessonRoutes = require("./routes/lesson.routes");

// Create Express app
const app = express();

// Utility Function to parse allowed origins from environment variables
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

// Rate Limiting Configuration
// Sets a limit of 100 requests per 15 minutes per IP address
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// CORS Configuration
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

// Configure Morgan based on environment
const morganConfig = process.env.NODE_ENV === "production" ? "combined" : "dev";

// Middleware
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(morgan(morganConfig));
app.use(limiter);
app.use(errorHandlerMiddleware);

// Routes
app.use("/api/hello", helloRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/lessons", lessonRoutes);
// TEMP disabled: app.use("/api/v1/dashboard", dashboardRoutes);
// TEMP disabled: app.use("/api/v1/quizzes", quizRoutes);
// Root route
app.get("/", (req, res) => {
  // Redirect to the frontend application
  res.redirect(process.env.CLIENT_URL);
});
app.use(errorHandlerMiddleware);

module.exports = app;
