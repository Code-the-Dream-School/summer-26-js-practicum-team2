const jwt = require("jsonwebtoken");
const request = require("supertest");

process.env.JWT_SECRET = "oauth-test-secret";
process.env.CLIENT_URL = "http://localhost:5173";

jest.mock("../src/config/passport.js", () => ({
  initialize: jest.fn(() => (_req, _res, next) => next()),
  authenticate: jest.fn((provider) => (_req, res) => res.redirect(`/mock-oauth/${provider}`)),
}));

const passport = require("../src/config/passport.js");
const app = require("../src/app");
const {
  completeOAuthLogin,
  oauthFailureRedirect,
} = require("../src/controllers/oauth.controller.js");

describe("OAuth authentication", () => {
  it.each([
    ["google", ["profile", "email"]],
    ["github", ["user:email"]],
  ])("starts the %s provider flow", async (provider, scope) => {
    const response = await request(app).get(`/api/v1/auth/${provider}`).redirects(0);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(`/mock-oauth/${provider}`);
    expect(passport.authenticate).toHaveBeenCalledWith(provider, { scope, session: false });
  });

  it("creates a session and redirects a successful OAuth callback to the SPA", () => {
    const user = {
      _id: "oauth-user-id",
      role: "learner",
      email: "oauth-user@example.com",
    };
    const result = {};
    const response = {
      cookie: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnValue(result),
    };
    const request = {
      user,
      ip: "127.0.0.1",
      app: { emit: jest.fn() },
    };

    expect(completeOAuthLogin(request, response)).toBe(result);
    expect(response.redirect).toHaveBeenCalledWith("http://localhost:5173/oauth/callback");
    expect(response.cookie).toHaveBeenCalledWith(
      "session_token",
      expect.any(String),
      expect.objectContaining({ httpOnly: true, maxAge: 14 * 24 * 60 * 60 * 1000 }),
    );
    expect(jwt.verify(response.cookie.mock.calls[0][1], process.env.JWT_SECRET)).toMatchObject({
      id: user._id,
      role: user.role,
      csrfToken: expect.any(String),
    });
    expect(request.app.emit).toHaveBeenCalledWith("login_success", {
      userId: user._id,
      email: user.email,
      ip: request.ip,
    });
    expect(oauthFailureRedirect).toBe("http://localhost:5173/login?error=oauth_failed");
  });
});
