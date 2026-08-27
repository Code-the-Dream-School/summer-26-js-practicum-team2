const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

// Middleware imports
const jwtMiddleware = require("./middleware/jsonWebToken");
const errorHandlerMiddleware = require("./middleware/errorHandler");
const notFoundMiddleware = require("./middleware/notFound");

// Route imports
const helloRoutes = require("./routes/hello.routes");
const userRoutes = require("./routes/user.routes");
const lessonRoutes = require("./routes/lesson.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const quizRoutes = require("./routes/quiz.routes");
const onboardingRoutes = require("./routes/onboarding.routes");
// Create Express app
const app = express();

// Utility Function to parse allowed origins from environment variables
const parseAllowedOrigins = () => {
  const configuredOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const fallbackOrigins = [process.env.CLIENT_URL, "http://localhost:5173"].filter(Boolean);

  return [...new Set([...configuredOrigins, ...fallbackOrigins])];
};

// Rate Limiting Configuration for Production But Not Development
// Sets a limit of 200 requests per 15 minutes per IP address
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: process.env.NODE_ENV === "production" ? 200 : 1000000,
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

// Top-level middleware
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(morgan(morganConfig));
app.use(limiter);

// Routes
app.use("/api/hello", helloRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/lessons", jwtMiddleware, lessonRoutes);
app.use("/api/v1/dashboard", jwtMiddleware, dashboardRoutes);
app.use("/api/v1/quizzes", jwtMiddleware, quizRoutes);
app.use("/api/v1/onboarding", onboardingRoutes);
// Root route
app.get("/", (req, res) => {
  // Redirect to the frontend application
  res.redirect(process.env.CLIENT_URL);
});

// Error Handling Middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
