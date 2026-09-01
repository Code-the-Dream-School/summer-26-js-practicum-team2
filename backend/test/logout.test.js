const mongoose = require("mongoose");
const request = require("supertest");
const { useTestDb } = require("./setup");
const app = require("../src/app");
const User = require("../src/models/User.model");
const { hashPassword } = require("../src/utils/password");

useTestDb();

const password = "P@ssword123!";

async function createCookieSession() {
  const email = `logout-${new mongoose.Types.ObjectId()}@example.com`;
  await User.create({
    name: "Logout User",
    email,
    password_hash: await hashPassword(password),
    email_verified_at: new Date(),
    tos_agreement: true,
  });

  const loginResponse = await request(app).post("/api/v1/users/login").send({
    email,
    password,
  });
  const sessionCookie = loginResponse.headers["set-cookie"]
    .find((cookie) => cookie.startsWith("session_token="))
    .split(";")[0];

  return { csrfToken: loginResponse.body.csrfToken, sessionCookie };
}

describe("cookie-authenticated logout", () => {
  test("logs out when the session cookie and CSRF token match", async () => {
    const { csrfToken, sessionCookie } = await createCookieSession();

    const response = await request(app)
      .post("/api/v1/users/logout")
      .set("Cookie", sessionCookie)
      .set("X-CSRF-TOKEN", csrfToken);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Logout successful." });
  });

  test("rejects a cookie session with a mismatched CSRF token", async () => {
    const { sessionCookie } = await createCookieSession();

    const response = await request(app)
      .post("/api/v1/users/logout")
      .set("Cookie", sessionCookie)
      .set("X-CSRF-TOKEN", "not-the-session-token");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: "Invalid CSRF token." });
  });
});
