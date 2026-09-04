const { StatusCodes } = require("http-status-codes");
const rateLimiter = require("express-rate-limit"); //defend against dOS and brute-force
const { ipKeyGenerator } = require("express-rate-limit");

// user story 2.1 10 sign up rate limiter: 5 per IP per 10 minutes
const registerLimiter = rateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 5,
  standardHeaders: true, //return rate limit info in Ratelimit headers
  legacyHeaders: false,
  message: {
    message: "Too many registering attempts from this IP, please retry after 10 minutes.",
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
});
//user story 2.1 login rate limiter : 5 failed per email per 15 minutes
const loginLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    return email || ipKeyGenerator(req, res);
  },
  standardHeaders: true, //return rate limit info in Ratelimit headers
  legacyHeaders: false, //disable X-Rate limit
  message: {
    message: "Too many failed login attempts from this account. Please retry after 15 minutes.",
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
});

const GLOBAL_API_LIMIT = process.env.NODE_ENV === "production" ? 200 : 10000;

// Keep local development and integration tests from consuming a production-scale shared bucket.
const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: GLOBAL_API_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { registerLimiter, loginLimiter, apiLimiter, GLOBAL_API_LIMIT };
