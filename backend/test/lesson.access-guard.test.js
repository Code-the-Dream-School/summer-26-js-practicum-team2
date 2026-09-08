const jwt = require("jsonwebtoken");
const request = require("supertest");
const { useTestDb } = require("./setup");

const app = require("../src/app");
const User = require("../src/models/User.model");
const UserProgress = require("../src/models/UserProgress.model");

useTestDb();

async function createAuthedUser(email) {
  const user = await User.create({
    name: "Guard Learner",
    email,
    password_hash: "not-a-real-hash",
    tos_agreement: true,
  });

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, csrfToken: "test-csrf" },
    process.env.JWT_SECRET,
  );

  return { authHeader: `Bearer ${token}`, userId: user._id };
}

describe("server-side lesson access guard", () => {
  it("allows the first lesson of the module with no progress record", async () => {
    const { authHeader } = await createAuthedUser("first-lesson@example.com");

    const response = await request(app)
      .get("/api/v1/lessons/cashFlow/1.1")
      .set("Authorization", authHeader);

    expect(response.status).toBe(200);
  });

  it("returns 403 for a lesson whose predecessor has not been completed", async () => {
    const { authHeader } = await createAuthedUser("locked-lesson@example.com");

    const response = await request(app)
      .get("/api/v1/lessons/cashFlow/1.2")
      .set("Authorization", authHeader);

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/complete the previous lesson/i);
  });

  it("allows a lesson once its predecessor is marked complete", async () => {
    const { authHeader, userId } = await createAuthedUser("unlocked-lesson@example.com");

    await UserProgress.create({
      user_id: userId,
      module_id: "cashFlow",
      completed_lessons: ["1.1"],
    });

    const response = await request(app)
      .get("/api/v1/lessons/cashFlow/1.2")
      .set("Authorization", authHeader);

    expect(response.status).toBe(200);
  });

  it("allows the learner's saved current lesson even if completion history is missing", async () => {
    const { authHeader, userId } = await createAuthedUser("current-position@example.com");

    await UserProgress.create({
      user_id: userId,
      module_id: "cashFlow",
      course_lesson_id: "1.2",
      completed_lessons: [],
    });

    const response = await request(app)
      .get("/api/v1/lessons/cashFlow/1.2")
      .set("Authorization", authHeader);

    expect(response.status).toBe(200);
  });
});

describe("GET /api/v1/lessons/last", () => {
  it("returns the first lesson path when the learner has no progress", async () => {
    const { authHeader } = await createAuthedUser("no-progress@example.com");

    const response = await request(app)
      .get("/api/v1/lessons/last")
      .set("Authorization", authHeader);

    expect(response.status).toBe(200);
    expect(response.body.lastLessonPath).toBe("/learn/cashFlow/1.1");
  });

  it("falls back to the furthest unlocked lesson when the saved position outran completion history", async () => {
    const { authHeader, userId } = await createAuthedUser("stale-position@example.com");

    await UserProgress.create({
      user_id: userId,
      module_id: "cashFlow",
      course_lesson_id: "1.6",
      completed_lessons: ["1.1"],
    });

    const response = await request(app)
      .get("/api/v1/lessons/last")
      .set("Authorization", authHeader);

    expect(response.status).toBe(200);
    expect(response.body.lastLessonPath).toBe("/learn/cashFlow/1.2");
  });
});
