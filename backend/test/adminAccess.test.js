const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const request = require("supertest");
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
const app = require("../src/app");
const User = require("../src/models/User.model");
const { useTestDb } = require("./setup");

useTestDb();

const tokenFor = (userId, role) =>
  jwt.sign({ id: userId, role, csrfToken: "test-csrf" }, process.env.JWT_SECRET);

const createUser = (role = "learner") =>
  User.create({
    name: `${role} user`,
    email: `${role}-${new mongoose.Types.ObjectId()}@example.com`,
    password_hash: "hashed-password",
    role,
    tos_agreement: true,
  });

describe("admin access boundary", () => {
  test("rejects unauthenticated admin requests", async () => {
    const response = await request(app).get("/api/v1/admin/status");

    expect(response.status).toBe(401);
  });

  test("rejects authenticated learners from admin requests", async () => {
    const learner = await createUser();
    const response = await request(app)
      .get("/api/v1/admin/status")
      .set("Authorization", `Bearer ${tokenFor(learner._id, "learner")}`);

    expect(response.status).toBe(403);
  });

  test("allows admins to access the admin boundary", async () => {
    const admin = await createUser("admin");
    const response = await request(app)
      .get("/api/v1/admin/status")
      .set("Authorization", `Bearer ${tokenFor(admin._id, "admin")}`);

    expect(response.status).toBe(200);
    expect(response.body.isAdmin).toBe(true);
  });

  test("lists safe user fields for admins", async () => {
    const admin = await createUser("admin");
    await createUser();

    const response = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${tokenFor(admin._id, "admin")}`);

    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(2);
    expect(response.body.users[0]).not.toHaveProperty("password_hash");
  });

  test("requires confirmation and prevents the last admin from demotion", async () => {
    const admin = await createUser("admin");
    const response = await request(app)
      .patch(`/api/v1/admin/users/${admin._id}/role`)
      .set("Authorization", `Bearer ${tokenFor(admin._id, "admin")}`)
      .send({ role: "learner", confirmation: "CONFIRM" });

    expect(response.status).toBe(409);
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
