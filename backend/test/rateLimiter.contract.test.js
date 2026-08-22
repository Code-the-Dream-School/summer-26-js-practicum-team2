const request = require("supertest");
const app = require("../src/app");

describe("rate limiter contracts", () => {
  it("enforces the register limiter after repeated requests from the same IP", async () => {
    const ip = "203.0.113.10";

    // Send repeated requests from the same IP until the registration limit is reached.
    for (let attempt = 0; attempt < 5; attempt++) {
      const res = await request(app)
        .post("/api/v1/users/register")
        .set("X-Forwarded-For", ip)
        .send({});

      // Validation should fail first, but the limiter should still allow these initial attempts.
      expect(res.status).toBe(400);
    }

    // The next request from the same IP should now be blocked by the limiter.
    const limitedRes = await request(app)
      .post("/api/v1/users/register")
      .set("X-Forwarded-For", ip)
      .send({});

    expect(limitedRes.status).toBe(429);
    expect(limitedRes.body.message).toContain("Too many registering attempts");
  });

  it("enforces the login limiter after repeated failed attempts for the same email key", async () => {
    const email = "not-an-email";

    // Reuse the same email so each failed request counts toward the same limiter key.
    for (let attempt = 0; attempt < 5; attempt++) {
      const res = await request(app).post("/api/v1/users/login").send({ email, password: "bad" });

      // Invalid login payloads still count as failed attempts for this limiter key.
      expect(res.status).toBe(400);
    }

    // The next failed login for the same email should be blocked.
    const limitedRes = await request(app)
      .post("/api/v1/users/login")
      .send({ email, password: "bad" });

    expect(limitedRes.status).toBe(429);
    expect(limitedRes.body.message).toContain("Too many failed login attempts");
  });
});
