const request = require("supertest");
const { useTestDb } = require("./setup");
const app = require("../src/app");
const User = require("../src/models/User.model");

useTestDb();

describe("user API integration", () => {
  it("registers a user, verifies the email, and logs in successfully", async () => {
    const payload = {
      name: "Test Learner",
      email: "verify-flow@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
      tos: true,
    };

    const registerRes = await request(app).post("/api/v1/users/register").send(payload);

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.message).toContain("Registration successful");
    expect(registerRes.body.devVerification).toMatchObject({
      token: expect.any(String),
      verifyUrl: expect.stringContaining("/verify?token="),
    });

    const createdUser = await User.findOne({ email: payload.email });
    expect(createdUser).not.toBeNull();
    expect(createdUser.email_verified_at).toBeNull();

    const verifyRes = await request(app)
      .get("/api/v1/users/verify")
      .query({ token: registerRes.body.devVerification.token });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.message).toContain("Email verified successfully");
    expect(verifyRes.body.user.email).toBe(payload.email);

    const loginRes = await request(app).post("/api/v1/users/login").send({
      email: payload.email,
      password: payload.password,
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.csrfToken).toBeTruthy();
    expect(loginRes.body.user.email).toBe(payload.email);
    expect(loginRes.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringContaining("session_token=")]),
    );
  });

  it("rejects duplicate registration and invalid payloads", async () => {
    const firstPayload = {
      name: "User One",
      email: "duplicate@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
      tos: true,
    };

    const firstRes = await request(app).post("/api/v1/users/register").send(firstPayload);
    expect(firstRes.status).toBe(201);

    const duplicateRes = await request(app).post("/api/v1/users/register").send(firstPayload);
    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.message).toMatch(/Email already registered/i);

    const invalidRes = await request(app).post("/api/v1/users/register").send({
      name: "A",
      email: "not-an-email",
      password: "short",
      confirmPassword: "different",
      tos: false,
    });

    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.errors).toEqual(expect.arrayContaining([expect.any(String)]));
  });

  it("blocks login until the user verifies their email", async () => {
    const payload = {
      name: "Pending User",
      email: "pending@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
      tos: true,
    };

    await request(app).post("/api/v1/users/register").send(payload);

    const loginRes = await request(app).post("/api/v1/users/login").send({
      email: payload.email,
      password: payload.password,
    });

    expect(loginRes.status).toBe(403);
    expect(loginRes.body.message).toContain("verify your email");
  });

  it("supports the forgot-password and reset-password flow", async () => {
    const email = "reset-user@example.com";

    await User.create({
      name: "Reset User",
      email,
      password_hash: "not-a-real-hash",
      role: "learner",
      tos_agreement: true,
      email_verified_at: new Date(),
    });

    const forgotRes = await request(app).post("/api/v1/users/forgot-password").send({ email });
    expect(forgotRes.status).toBe(200);
    expect(forgotRes.body.message).toContain("If an account with the email exists");

    const user = await User.findOne({ email }).select("+password_reset_token");
    expect(user.password_reset_token).toBeTruthy();

    const resetRes = await request(app).post("/api/v1/users/reset-password").send({
      token: user.password_reset_token,
      newPassword: "NewPassword1!",
    });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.message).toContain("Password reset successful");

    const loginRes = await request(app).post("/api/v1/users/login").send({
      email,
      password: "NewPassword1!",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.email).toBe(email);
  });

  it("returns a generic message for forgotten-password requests for unknown emails", async () => {
    const res = await request(app).post("/api/v1/users/forgot-password").send({
      email: "missing-user@example.com",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("If an account with the email exists");
  });
});
