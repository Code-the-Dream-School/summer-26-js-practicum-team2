const jwt = require("jsonwebtoken");
const request = require("supertest");
const { useTestDb } = require("./setup");

const app = require("../src/app");
const User = require("../src/models/User.model");

useTestDb();

// Create a learner and return the auth header needed for protected progress routes.
async function createAuthedUser(email) {
  const user = await User.create({
    name: "Validation Learner",
    email,
    password_hash: "not-a-real-hash",
    tos_agreement: true,
  });

  // Create a valid token so these tests can focus on progress validation behavior.
  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, csrfToken: "test-csrf" },
    process.env.JWT_SECRET,
  );

  return `Bearer ${token}`;
}

describe("lesson progress validation branches (backend)", () => {
  it("returns 404 for unknown module on GET /lessons/progress", async () => {
    const authHeader = await createAuthedUser("progress-invalid-module-get@example.com");

    // Request progress for a module that does not exist.
    const response = await request(app)
      .get("/api/v1/lessons/progress?moduleId=unknownModule")
      .set("Authorization", authHeader);

    expect(response.status).toBe(404);
    expect(response.body.message).toContain("Module");
  });

  it("returns 400 when PATCH /lessons/progress has neither lessonId nor microLessonId", async () => {
    const authHeader = await createAuthedUser("progress-missing-fields@example.com");

    // Leave out both lesson IDs so the API cannot determine which progress position to update.
    const response = await request(app)
      .patch("/api/v1/lessons/progress")
      .set("Authorization", authHeader)
      .send({ moduleId: "cashFlow", currentChunkIndex: 1 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("lessonId or microLessonId is required.");
  });

  it("returns 404 for unknown module on PATCH /lessons/progress", async () => {
    const authHeader = await createAuthedUser("progress-invalid-module-patch@example.com");

    // Send an otherwise valid progress update against a module that does not exist.
    const response = await request(app)
      .patch("/api/v1/lessons/progress")
      .set("Authorization", authHeader)
      .send({
        moduleId: "unknownModule",
        lessonId: "1.1",
        microLessonId: "1.1.1",
        currentChunkIndex: 0,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toContain("Module");
  });

  it("returns 404 for unknown module on PATCH /lessons/progress/restart", async () => {
    const authHeader = await createAuthedUser("restart-invalid-module@example.com");

    // Try to restart progress for a module that does not exist.
    const response = await request(app)
      .patch("/api/v1/lessons/progress/restart")
      .set("Authorization", authHeader)
      .send({ moduleId: "unknownModule" });

    expect(response.status).toBe(404);
    expect(response.body.message).toContain("Module");
  });
});
