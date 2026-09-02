const jwt = require("jsonwebtoken");
const request = require("supertest");
const { useTestDb } = require("./setup");

// setup.js sets JWT_SECRET before these modules are required, so the middleware/tokens match.
const app = require("../src/app");
const User = require("../src/models/User.model");

useTestDb();

async function createAuthedUser() {
  const user = await User.create({
    name: "Test Learner",
    email: "quiz-scoring@example.com",
    password_hash: "not-a-real-hash",
    tos_agreement: true,
  });

  // Bearer auth (no session cookie) skips the CSRF header check in jwtMiddleware.
  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, csrfToken: "test-csrf" },
    process.env.JWT_SECRET,
  );

  return `Bearer ${token}`;
}

describe("quiz submission grading (backend)", () => {
  it("grades each micro-lesson quiz independently, with no lesson-wide aggregate", async () => {
    const authHeader = await createAuthedUser();

    // Micro-lesson 1.1.2 has 3 knowledge checks; miss one so the score falls below the 70% pass threshold.
    const startA = await request(app)
      .post("/api/v1/quizzes/start")
      .set("Authorization", authHeader)
      .send({ microLessonId: "1.1.2", moduleId: "cashFlow" });
    expect(startA.status).toBe(201);

    const submitA = await request(app)
      .post("/api/v1/quizzes/1.1.2/submit")
      .set("Authorization", authHeader)
      .send({
        attemptId: startA.body.attemptId,
        moduleId: "cashFlow",
        answers: {
          "1.1.2-q2": ["d"],
          "1.1.2-q3": ["b"], // wrong; correct answer is "a"
          "1.1.2-q4": ["a"],
        },
      });

    expect(submitA.status).toBe(200);
    expect(submitA.body.score).toBe(67);
    expect(submitA.body.passed).toBe(false);

    // Micro-lesson 1.1.4 has 3 different knowledge checks; answer all of them correctly.
    const startB = await request(app)
      .post("/api/v1/quizzes/start")
      .set("Authorization", authHeader)
      .send({ microLessonId: "1.1.4", moduleId: "cashFlow" });
    expect(startB.status).toBe(201);

    const submitB = await request(app)
      .post("/api/v1/quizzes/1.1.4/submit")
      .set("Authorization", authHeader)
      .send({
        attemptId: startB.body.attemptId,
        moduleId: "cashFlow",
        answers: {
          "1.1.3-q1": ["c"],
          "1.1.3-q2": ["a"],
          "1.1.3-q3": ["b", "d"],
        },
      });

    // The second, perfect quiz is unaffected by the first quiz's failing score.
    expect(submitB.status).toBe(200);
    expect(submitB.body.score).toBe(100);
    expect(submitB.body.passed).toBe(true);

    // Confirm the backend never reports a combined/lesson-wide score in either response.
    expect(submitA.body).not.toHaveProperty("lessonScore");
    expect(submitB.body).not.toHaveProperty("lessonScore");

    const attempts = await request(app)
      .get("/api/v1/quizzes/attempts")
      .set("Authorization", authHeader);

    expect(attempts.status).toBe(200);
    expect(attempts.body).toHaveLength(2);
    // Each stored attempt keeps its own independent score/passed pair, proving aggregation
    // across a lesson's quizzes is not something the backend does at all.
    const scoresByMicroLesson = Object.fromEntries(
      attempts.body.map((attempt) => [attempt.micro_lesson_id, attempt.score]),
    );
    expect(scoresByMicroLesson["1.1.2"]).toBe(67);
    expect(scoresByMicroLesson["1.1.4"]).toBe(100);
  });
  async function createCookieSession() {
    const user = await User.create({
      name: "Cookie Learner",
      email: "cookie-quiz@example.com",
      password_hash: "not-a-real-hash",
      tos_agreement: true,
    });
    const csrfToken = "current-csrf-token";
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, csrfToken, token_version: user.token_version },
      process.env.JWT_SECRET,
    );

    return { csrfToken, sessionCookie: `session_token=${token}` };
  }

  it("returns the current CSRF token for a stale cookie-authenticated quiz start", async () => {
    const { csrfToken, sessionCookie } = await createCookieSession();

    const rejected = await request(app)
      .post("/api/v1/quizzes/start")
      .set("Cookie", sessionCookie)
      .set("X-CSRF-TOKEN", "stale-csrf-token")
      .send({ microLessonId: "1.1.2", moduleId: "cashFlow" });

    expect(rejected.status).toBe(403);
    expect(rejected.body).toEqual({ message: "Invalid CSRF token." });
    expect(rejected.headers["x-csrf-token"]).toBe(csrfToken);

    const retried = await request(app)
      .post("/api/v1/quizzes/start")
      .set("Cookie", sessionCookie)
      .set("X-CSRF-TOKEN", rejected.headers["x-csrf-token"])
      .send({ microLessonId: "1.1.2", moduleId: "cashFlow" });

    expect(retried.status).toBe(201);
  });
});
