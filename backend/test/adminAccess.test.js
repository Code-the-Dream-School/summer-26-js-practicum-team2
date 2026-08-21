const jwt = require("jsonwebtoken");
const request = require("supertest");
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
const app = require("../src/app");
const User = require("../src/models/User.model");
const { useTestDb } = require("./setup");

useTestDb();

const tokenFor = (role) =>
  jwt.sign(
    { id: "507f1f77bcf86cd799439011", role, csrfToken: "test-csrf" },
    process.env.JWT_SECRET,
  );

describe("admin access boundary", () => {
  test("rejects unauthenticated admin requests", async () => {
    const response = await request(app).get("/api/v1/admin/status");

    expect(response.status).toBe(401);
  });

  test("rejects authenticated learners from admin requests", async () => {
    const response = await request(app)
      .get("/api/v1/admin/status")
      .set("Authorization", `Bearer ${tokenFor("learner")}`);

    expect(response.status).toBe(403);
  });

  test("allows admins to access the admin boundary", async () => {
    const response = await request(app)
      .get("/api/v1/admin/status")
      .set("Authorization", `Bearer ${tokenFor("admin")}`);

    expect(response.status).toBe(200);
    expect(response.body.isAdmin).toBe(true);
  });

  test("makes the first registered user an admin", async () => {
    const response = await request(app).post("/api/v1/users/register").send({
      name: "First Admin",
      email: "first-admin@example.com",
      password: "P@ssword123!",
      confirmPassword: "P@ssword123!",
      tos: true,
    });

    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe("admin");
    const user = await User.findOne({ email: "first-admin@example.com" });
    expect(user.role).toBe("admin");
  });
});
