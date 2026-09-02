const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// Middleware imports
const { authenticateUser: jwtMiddleware } = require("./middleware/jsonWebToken");
const errorHandlerMiddleware = require("./middleware/errorHandler");
const notFoundMiddleware = require("./middleware/notFound");
const { apiLimiter } = require("./middleware/rateLimiter");
const requireAdmin = require("./middleware/requireAdmin");

// Route imports
const healthRoutes = require("./routes/health.routes");
const userRoutes = require("./routes/user.routes");
const lessonRoutes = require("./routes/lesson.routes");
const lessonPublicRoutes = require("./routes/lessonPublic.routes");
const lessonImportRoutes = require("./routes/lessonImport.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const profileRoutes = require("./routes/profile.routes");
const quizRoutes = require("./routes/quiz.routes");
const quizPublicRoutes = require("./routes/quizPublic.routes");
const adminRoutes = require("./routes/admin.routes");

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
  exposedHeaders: ["X-CSRF-TOKEN"],
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
app.use("/health", healthRoutes);
app.use(apiLimiter);

// Routes
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/lessons", lessonImportRoutes);
app.use("/api/v1/lessons", lessonPublicRoutes);
app.use("/api/v1/lessons", jwtMiddleware, lessonRoutes);
app.use("/api/v1/dashboard", jwtMiddleware, dashboardRoutes);
app.use("/api/v1/profile", jwtMiddleware, profileRoutes);
app.use("/api/v1/quizzes", quizPublicRoutes);
app.use("/api/v1/quizzes", jwtMiddleware, quizRoutes);
app.use("/api/v1/admin", jwtMiddleware, requireAdmin, adminRoutes);
// Root route
app.get("/", (req, res) => {
  // Redirect to the frontend application
  res.redirect(process.env.CLIENT_URL);
});

// Error Handling Middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
