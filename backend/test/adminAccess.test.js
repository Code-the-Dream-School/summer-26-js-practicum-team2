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

  test("manages modules and nested lessons through admin APIs", async () => {
    const admin = await createUser("admin");
    const auth = { Authorization: `Bearer ${tokenFor(admin._id, "admin")}` };
    const moduleBody = { id: "admin-module", title: "Admin module", lessons: [] };

    const created = await request(app).post("/api/v1/admin/modules").set(auth).send(moduleBody);
    expect(created.status).toBe(201);

    const duplicate = await request(app).post("/api/v1/admin/modules").set(auth).send(moduleBody);
    expect(duplicate.status).toBe(409);

    const lesson = { id: "1.1", title: "First lesson", microLessons: [] };
    const createdLesson = await request(app)
      .post("/api/v1/admin/modules/admin-module/lessons")
      .set(auth)
      .send(lesson);
    expect(createdLesson.status).toBe(201);

    const updatedLesson = await request(app)
      .patch("/api/v1/admin/modules/admin-module/lessons/1.1")
      .set(auth)
      .send({ id: "1.1", title: "Updated lesson", microLessons: [] });
    expect(updatedLesson.status).toBe(200);
    expect(updatedLesson.body.title).toBe("Updated lesson");

    const deletedLesson = await request(app)
      .delete("/api/v1/admin/modules/admin-module/lessons/1.1")
      .set(auth);
    expect(deletedLesson.status).toBe(200);
  });

  test("prevents duplicate budgeting seed imports", async () => {
    const admin = await createUser("admin");
    const response = await request(app)
      .post("/api/v1/admin/modules/seed-budgeting")
      .set("Authorization", `Bearer ${tokenFor(admin._id, "admin")}`);

    expect(response.status).toBe(201);

    const duplicate = await request(app)
      .post("/api/v1/admin/modules/seed-budgeting")
      .set("Authorization", `Bearer ${tokenFor(admin._id, "admin")}`);
    expect(duplicate.status).toBe(409);
  });

  test("supports verification, reversible deletion, and confirmed hard deletion", async () => {
    const admin = await createUser("admin");
    const target = await createUser();
    const auth = { Authorization: `Bearer ${tokenFor(admin._id, "admin")}` };

    const verified = await request(app)
      .patch(`/api/v1/admin/users/${target._id}/verify-email`)
      .set(auth)
      .send({ confirmation: "CONFIRM" });
    expect(verified.status).toBe(200);

    const deleted = await request(app)
      .patch(`/api/v1/admin/users/${target._id}/deleted`)
      .set(auth)
      .send({ confirmation: "CONFIRM", deleted: true });
    expect(deleted.status).toBe(200);
    expect(deleted.body.deleted_at).toBeTruthy();
    expect(new Date(deleted.body.deletion_scheduled_at).getTime()).toBeGreaterThan(Date.now());

    const restored = await request(app)
      .patch(`/api/v1/admin/users/${target._id}/deleted`)
      .set(auth)
      .send({ confirmation: "CONFIRM", deleted: false });
    expect(restored.status).toBe(200);
    expect(restored.body.deleted_at).toBeNull();

    const hardDeleted = await request(app)
      .delete(`/api/v1/admin/users/${target._id}`)
      .set(auth)
      .send({ confirmation: "CONFIRM", email: target.email });
    expect(hardDeleted.status).toBe(200);
  });

  test("rejects self-targeted account actions and repeated verification", async () => {
    const admin = await createUser("admin");
    const auth = { Authorization: `Bearer ${tokenFor(admin._id, "admin")}` };

    const disableSelf = await request(app)
      .patch(`/api/v1/admin/users/${admin._id}/disabled`)
      .set(auth)
      .send({ disabled: true, confirmation: "CONFIRM" });
    expect(disableSelf.status).toBe(409);

    const deleteSelf = await request(app)
      .patch(`/api/v1/admin/users/${admin._id}/deleted`)
      .set(auth)
      .send({ confirmation: "CONFIRM", deleted: true });
    expect(deleteSelf.status).toBe(409);

    admin.email_verified_at = new Date();
    await admin.save();
    const verifyAgain = await request(app)
      .patch(`/api/v1/admin/users/${admin._id}/verify-email`)
      .set(auth)
      .send({ confirmation: "CONFIRM" });
    expect(verifyAgain.status).toBe(409);
  });

  test("blocks banned users from authenticated routes", async () => {
    const user = await createUser("admin");
    user.is_disabled = true;
    await user.save();

    const response = await request(app)
      .get("/api/v1/admin/status")
      .set("Authorization", `Bearer ${tokenFor(user._id, "admin")}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("banned");
  });
});
